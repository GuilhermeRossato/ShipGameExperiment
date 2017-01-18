function EnemyController(scene) {
	this.group = new THREE.Group();
	this.group.name = "enemies";
	scene.add(this.group);
	this.enemyCount = 0;
}

EnemyController.prototype = {
	constructor: EnemyController,
	addEnemy: function() {
		var geometry = new THREE.SphereGeometry(15,9,9);
		var top = Math.random()*2|0;
		var material = new THREE.MeshPhongMaterial({color: 0x773333});
		var cube = new THREE.Mesh(geometry,material);
		cube.alpha = 0.5;
		cube.position.set(Math.random()*80-40,15+(top)*30,-this.group.position.z-200);
		this.group.add(cube);
		var groundGeo = createShapeGeometry(12,15);
		var groundMat = new THREE.MeshPhongMaterial( { color: 0x979797, specular: 0x050505 } );
		var mesh = new THREE.Mesh(groundGeo, groundMat);
		mesh.scale.set(0.7,0.7,0.7);
		mesh.rotation.x = -Math.PI/2;
		mesh.position.set(cube.position.x, 0.5, cube.position.z);
		this.group.add(mesh);
		if (this.group.children.length > 18) {
			this.group.remove(this.group.children[0]);
			this.group.remove(this.group.children[0]);
		}
	},
	chunkTranverse: function() {
		if (this.enemyCount > 0) {
			this.enemyCount--;
		} else if (this.enemyCount === 0) {
			this.addEnemy();
			this.enemyCount = 5;
		}
	},
	checkCollision: function(playerPosition) {
		var origin = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
		var vec = new THREE.Vector3();
		var collision = false;
		let group = this.group;
		let m = group.children.length;
		let selected = Math.max(0, group.children.length-6);
		let obj = group.children[selected];
		let dist = 100;
		if (obj !== undefined) {
			vec.set(obj.position.x+group.position.x, obj.position.y+group.position.y, -obj.position.z+100);
			dist = vec.distanceTo(origin);
		}
		return (dist < 15.5);
	},
	update: function(z) {
		this.group.position.z = z;
	},
	reset: function() {
		while (this.group.children[0])
			this.group.remove(this.group.children[0]);
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