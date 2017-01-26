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
	this.score = 0;
	this.id = id;
	this.paused = false;
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
	this.shots.id = id;
	this.enemies = new EnemyController(this);
	this.enemies.id = id;
	/* Setup World */
	this.world = new WorldHandler(this);
	this.world.assignPlaneBaseTo(scene, this.group.position);
	this.world.generateWorld();
	this.world.chunkCallback = function() {
		this.enemies.chunkTranverse();
		this.score += 0.5;
	}
	this.world.id = id;
	/* Setup Ship */
	var shipGeo = new THREE.Geometry();
	[[0,0,5],[4,0,-5],[-4,0,-5]].forEach((obj,i) => {
		shipGeo.vertices.push(new THREE.Vector3(obj[0], obj[1], obj[2]));
		if ((i+1)%3 === 0)
			shipGeo.faces.push(new THREE.Face3(i-2, i-1, i, new THREE.Vector3(0,-1,0)));
	});
	this.ship = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial( { color: 0x467546, specular: 0x050505 } ));
	this.shipLayer = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial( { color: 0x337033, specular: 0x050505 } ));
	this.shipShadow = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial( { color: 0x484848, specular: 0x050505 } ));
	this.shipLayer.rotation.y = this.ship.rotation.y = this.shipShadow.rotation.y = Math.PI;
	this.add(this.ship);
	this.add(this.shipLayer);
	this.add(this.shipShadow);
}
Player.prototype = {
	constructor: Player,
	gamepadChange: function(event) {
		let btn = gamepadData["xbox 360"].buttons[event.key];
		//console.log("waht",btn, event.type);
		if (btn === "START" && event.type === "button-push") {
			this.paused = !this.paused;
		} else if (btn === "RT") {
			this.az = interpolate([0,0],[0.5,0.05],[1,0.25]).at(event.value);
		} else if (event.type === "axis-change") {
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
		});
	},
	clampXY: function() {
		this.x = THREE.Math.clamp(this.x, -40, 40);
		this.y = THREE.Math.clamp(this.y, 2, 48);
	},
	setSpeedBasedOnScore: function() {
		if (this.score > 400)
			this.az = 4;
		this.az = interpolate([0, 0.25], [200, 1], [400, 4]).at(this.score);
	},
	showScore: function() {
		if (this.id === 0) {
			logger.reset();
			logger.log(this.score/2|0);
		}
	},
	update: function() {
		if (this.paused) {
			this.ship.visible = this.shipLayer.visible = this.shipShadow.visible = false;
			return;
		}
		this.ship.visible = this.shipLayer.visible = this.shipShadow.visible = true;
		this.life++;
		this.setSpeedBasedOnScore();
		this.updatePosition();
		this.showScore();
		this.clampXY();
		/* Ship Positioning */
		this.ship.position.set(this.x,this.y+0.5,100);
		this.shipLayer.position.set(this.x, this.y+2.5, 100);
		let shadowScale = interpolate([0,1],[55,0.2]).at(this.y);
		this.shipShadow.scale.set(shadowScale,1,shadowScale);
		this.shipShadow.position.set(this.ship.position.x, 0.5, this.ship.position.z);
		this.shots.update();
		this.world.update(this.z);
		this.enemies.update(this.z);
		if (this.enemies.checkCollision(this)) {
			this.reset();
		}
	},
	reset: function() {
		this.x = 0;
		this.y = 25;
		this.enemies.reset();
		this.score = 0;
		this.world.reset();
	}
}
