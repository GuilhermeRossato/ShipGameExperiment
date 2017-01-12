function Player(scene, id) {
	/* Variables Setup */
	this.box = new GuiBox(id * 90 - 40,-100,80,200);
	this.life = 0;
	this.x = 0;
	this.y = 25;
	this.z = 0;
	this.vx = 0;
	this.vy = 0;
	this.vz = 0;
	this.mx = 5;
	this.my = 5;
	this.mz = 5;
	this.ax = 0;
	this.ay = 0;
	this.az = 0;
	this.lastChunk = 0;
	this.movingRight = 0;
	this.movingLeft = 0;
	this.speed = 0;
	this.shooting = false;
	this.lastShot = 0;
	this.shots = new ShootingHandler(this.group);
	
	/* Groups Setup Setup */
	this.group = new THREE.Group();
	this.group.position.x = id * 140;
	scene.add(this.group);
	this.add = function(obj) {
		this.group.add(obj);
	};
	/* Setup Base to Follow */
	var groundGeo = new THREE.PlaneBufferGeometry( 125, 500 );
	var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
	this.base = new THREE.Mesh(groundGeo, groundMat);
	this.base.rotation.x = -Math.PI/2;
	this.base.position.set(this.group.position.x, -2, 0);
	scene.add(this.base);
	this.enemies = new THREE.Group({name:"enemies"});
	this.add(this.enemies);
	this.world = new THREE.Group({name:"world"});
	this.group.add(this.world);
	/* Setup World */
	this.chunkSize = 22;
	for (var i = -9; i <= 9; i++)
		this.generateWorld(i*this.chunkSize);
	
	var shipGeo = new THREE.Geometry();
	[[0,0,5],[4,0,-5],[-4,0,-5]].forEach((obj,i) => {
		shipGeo.vertices.push(new THREE.Vector3(obj[0], obj[1], obj[2]));
		if ((i+1)%3 === 0)
			shipGeo.faces.push(new THREE.Face3(i-2, i-1, i, new THREE.Vector3(0,-1,0)));
	});
	this.ship = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial( { color: 0x336033, specular: 0x050505 } ));
	this.shipShadow = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial( { color: 0x484848, specular: 0x050505 } ));
	
	this.ship.rotation.y = this.shipShadow.rotation.y = Math.PI;
	
	this.add(this.ship);
	this.add(this.shipShadow);
	this.enemyCount = 10;
	this.chunkSteps = 0;
	//this.addShot(0,0,0);
	/* Shot Setup */
}
Player.prototype = {
	constructor: Player,
	randomizeCube: function(cube) {
		var angle = Math.PI*Math.random();
		if (Math.abs(angle - Math.PI/4) < 0.1)
			angle = Math.PI*Math.random();
		if (Math.abs(angle - Math.PI/4) < 0.1)
			angle = Math.PI*Math.random();
		cube.rotation.set(0, angle, 0);
	},
	generateWorld: function(z, color) {
		[55, -55].forEach((x) => {
			var size = b(15,25,Math.random());
			var geometry = new THREE.BoxGeometry(size,40,size);
			var material = new THREE.MeshPhongMaterial({
				color: color || 0x666666
			});
			var cube = new THREE.Mesh(geometry,material);
			cube.position.set(x,20,-z);
			this.randomizeCube(cube);
			this.world.add(cube);
		});
	},
	addEnemy: function() {
		var geometry = new THREE.SphereGeometry(15,9,9);
		var top = Math.random()*2|0;
		var material = new THREE.MeshPhongMaterial({color: 0x773333});
		var cube = new THREE.Mesh(geometry,material);
		cube.alpha = 0.5;
		cube.position.set(Math.random()*80-40,15+(top)*30,-this.z-130);
		this.enemies.add(cube);
		if (this.enemies.children.length > 18) {
			this.enemies.remove(this.enemies.children[0]);
			this.enemies.remove(this.enemies.children[0]);
		}
		var groundGeo = createShapeGeometry(12,15);
		var groundMat = new THREE.MeshPhongMaterial( { color: 0x979797, specular: 0x050505 } );
		var mesh = new THREE.Mesh(groundGeo, groundMat);
		mesh.scale.set(0.7,0.7,0.7);
		mesh.rotation.x = -Math.PI/2;
		mesh.position.set(cube.position.x, 0.5, -this.z-130);
		this.enemies.add(mesh);
	},
	gamepadChange: function(event) {
		let btn = gamepadData["xbox 360"].buttons[event.key];
		if (btn === "RT") {
			this.az = interpolate([0,0],[0.5,0.05],[1,0.25]).at(event.value);
		} else if (event.type == "axis-change") {
			if (event.key === 0) {
				this.ax = event.value/5;
			} else if (event.key === 1) {
				this.ay = -event.value/3;
			}
		} else if (btn === "A" && event.type === "button-push") {
			this.shots.startShooting();
		} else if (btn === "A" && event.type === "button-release") {
			this.shots.stopShooting();
		}
	},
	update: function() {
		this.life++;
		["x", "y", "z"].forEach((axis)=>{
			this[axis] = (this[axis] + (this["v" + axis] = Math.max(-this["m" + axis],Math.min((this["v" + axis] + this["a" + axis]) * 0.9, this["m" + axis]))));
		}
		);
		this.shots.updateShooting();
		this.world.position.z = this.z;
		this.enemies.position.z = this.z;
		this.x = Math.max(Math.min(this.x, 30),-30);
		this.y = Math.max(Math.min(this.y, 50),0);
		this.ship.position.set(this.x,this.y+0.5,100);
		let shadowScale = interpolate([0,1],[50,0.2]).at(this.y);
		this.shipShadow.scale.set(shadowScale,1,shadowScale);
		this.shipShadow.position.set(this.ship.position.x, 0, this.ship.position.z);
		
		/* Update World */
		let newChunk = (this.z/this.chunkSize)|0;
		if (this.lastChunk != newChunk && this.world.children.length > 3) {
			if (this.enemyCount > 0) {
			this.enemyCount--;
			} else if (this.enemyCount === 0) {
				this.addEnemy();
				this.enemyCount = 5;
			}
			this.chunkSteps ++;
			let children = this.world.children;
			let pre = [];
			pre[0] = children.shift();
			pre[1] = children.shift();
			children.push(pre[1]);
			children.push(pre[0]);
			pre[0].position.z -= this.chunkSize*19;
			pre[1].position.z -= this.chunkSize*19;
			this.randomizeCube(pre[0]);
			this.randomizeCube(pre[1]);
			this.lastChunk = newChunk;
		}
	},
	reset: function() {
		this.x = 0;
		this.y = 25;
		while (this.enemies.children[0])
			this.enemies.remove(this.enemies.children[0]);
	}
}

function createShapeGeometry (n, circumradius) {

    var shape = new THREE.Shape(),
        vertices = [],
        x;

    // Calculate the vertices of the n-gon.                 
    for (x = 1; x <= n; x++) {
        vertices.push([
            circumradius * Math.sin((Math.PI / n) + (x * ((2 * Math.PI)/ n))),
            circumradius * Math.cos((Math.PI / n) + (x * ((2 * Math.PI)/ n)))
        ]);
    }

    // Start at the last vertex.                
    shape.moveTo.apply(shape, vertices[n - 1]);

    // Connect each vertex to the next in sequential order.
    for (x = 0; x < n; x++) {
        shape.lineTo.apply(shape, vertices[x]);
    }

    // It's shape and bake... and I helped!         
    return new THREE.ShapeGeometry(shape);
}