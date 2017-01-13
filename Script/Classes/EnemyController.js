function EnemyController(scene) {
	this.group = new THREE.Group();
	this.group.name = "enemies";
	scene.add(this.group);
}

EnemyController.prototype = {
	constructor: EnemyController,
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
	chunkTranverse: function() {
		if (this.enemyCount > 0) {
			this.enemyCount--;
		} else if (this.enemyCount === 0) {
			this.addEnemy();
			this.enemyCount = 5;
		}
	},
	update: function() {
		
	}
}