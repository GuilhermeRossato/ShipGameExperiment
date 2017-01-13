function ShootingHandler(scene) {
	this.parent = scene;
	this.shooting = false;
	let shots = new THREE.Geometry();
	
	var shotMaterial = new THREE.PointsMaterial({
      color: 0x000000,
      size: 2
    });
    
    for (var i = 0 ; i < 20; i++) {
		shots.vertices.push(new THREE.Vector3(0,0,0));
    }
    let shotRound = 0;
	this.addShot = function(x, y, z) {
		shots.vertices[shotRound].set(x, y, z-this.group.position.z-this.enemies.position.z);
		shotRound++;
		if (shotRound === shots.vertices.length)
			shotRound = 0;
		shots.verticesNeedUpdate = true;
	}
	let shotsPoints = new THREE.Points(shots, shotMaterial);
	this.group = new THREE.Group();
	this.group.name = "shots";
	this.group.add(shotsPoints);
	scene.add(this.group);
	this.lastShot = false;
}

ShootingHandler.prototype = {
	constructor: ShootingHandler,
	shoot: function() {
		this.addShot(this.ship.position.x,this.ship.position.y,0);
	},
	update: function() {
		if (this.lastShot == 0 && this.shooting) {
			this.executeShot();
			this.lastShot = 10;
		}
		if (this.lastShot > 0)
			this.lastShot--;
	},
	executeShot: function() {
		
	},
	startShooting: function() {
		this.shooting = true;
	},
	stopShooting: function() {
		this.shooting = false;
	}
}