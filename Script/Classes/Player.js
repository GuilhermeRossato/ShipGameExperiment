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
	
	/* Group Setup */
	this.group = new THREE.Group();
	this.group.name = "player"+id;
	this.group.position.x = id * 140;
	scene.add(this.group);
	this.add = function(obj) {
		this.group.add(obj);
	};
	/* Setup Subparts */
	this.shots = new ShootingHandler(this);
	this.enemies = new EnemyController(this);
	/* Setup World */
	this.world = new WorldHandler(this);
	this.world.assignPlaneBaseTo(scene, this.group.position);
	this.world.generateWorld();
	this.world.chunkCallback = function() {
		this.enemies.chunkTranverse();
	}
	/* Setup Ship */
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
	/* Shot Setup */
}
Player.prototype = {
	constructor: Player,
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
	updatePosition: function() {
		["x", "y", "z"].forEach((axis)=>{
			this[axis] = (this[axis] + (this["v" + axis] = Math.max(-this["m" + axis],Math.min((this["v" + axis] + this["a" + axis]) * 0.9, this["m" + axis]))));
		}
		);
	},
	updateLimits: function() {
		this.x = THREE.Math.clamp(this.x, -30, 30);
		this.y = THREE.Math.clamp(this.y, 0, 50);
	},
	update: function() {
		this.life++;
		this.updatePosition();
		this.updateLimits();
		this.shots.update();
		this.world.update();
		this.ship.position.set(this.x,this.y+0.5,100);
		let shadowScale = interpolate([0,1],[50,0.2]).at(this.y);
		this.shipShadow.scale.set(shadowScale,1,shadowScale);
		this.shipShadow.position.set(this.ship.position.x, 0.5, this.ship.position.z);
		
	},
	reset: function() {
		this.x = 0;
		this.y = 25;
		while (this.enemies.children[0])
			this.enemies.remove(this.enemies.children[0]);
	}
}

function createShapeGeometry (n, rad) {
    var shape = new THREE.Shape(),
        vertices = [],
        i;              
    for (i = 1; i <= n; i++) {
        vertices.push([
            rad * Math.sin((Math.PI / n) + (i * ((2 * Math.PI)/ n))),
            rad * Math.cos((Math.PI / n) + (i * ((2 * Math.PI)/ n)))
        ]);
    }              
    shape.moveTo.apply(shape, vertices[n - 1]);
    for (i = 0; i < n; i++) {
        shape.lineTo.apply(shape, vertices[i]);
    }       
    return new THREE.ShapeGeometry(shape);
}