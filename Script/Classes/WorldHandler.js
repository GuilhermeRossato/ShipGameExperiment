function WorldHandler(scene, chunkCallback) {
	this.chunkCallback  = chunkCallback
	this.group = new THREE.Group();
	this.group.name = "world";
	scene.add(this.group);
	this.parent = scene;
	this.chunkSize = 20;
	this.lastChunk = 0;
	this.chunkSteps = 0;
	this.chunkSteps2 = 0;
}
WorldHandler.prototype = {
	constructor: WorldHandler,
	assignPlaneBaseTo: function(scene, position) {
		var groundGeo = new THREE.PlaneBufferGeometry(125,500);
		var groundMat = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			specular: 0x050505
		});
		this.base = new THREE.Mesh(groundGeo,groundMat);
		this.base.rotation.x = -Math.PI / 2;
		this.base.position.copy(position);
		scene.add(this.base);
	},
	computeNormal: function(geometry, face, invert) {
		var cb = new THREE.Vector3()
		  , ab = new THREE.Vector3();
		var vB = geometry.vertices[face.b];
		cb.subVectors(geometry.vertices[face.c], vB);
		ab.subVectors(geometry.vertices[face.a], vB);
		cb.cross(ab);
		cb.normalize();
		if (invert)
			cb.multiplyScalar(-1);
		face.normal.copy(cb);
	},
	generateWorld: function() {
		var totalGeom = new THREE.Geometry();
		var material = new THREE.MeshPhongMaterial({color: 0x666666});
		var rots = [];
		var pos = [];
		[-55, 55].forEach((x,i)=>{
			for (var j = -10; j <= 35; j++) {
				var cube = new THREE.Mesh(new THREE.BoxGeometry(15,40,15),material);
				cube.position.set(x, 20, -j*this.chunkSize);
				if (j < -5) {
					rots.push(new THREE.Vector3(0, b(-0.8, 0.8, Math.random()), 0));
					cube.rotation.y = rots[rots.length-1].y;
				} else {
					let r = rots[(j+15)%rots.length];
					cube.rotation.x = r.x;
					cube.rotation.y = r.y;
					cube.rotation.z = r.z;
				}
				cube.updateMatrix();
				totalGeom.merge(cube.geometry, cube.matrix);
			}
		}
		);
		var mesh = new THREE.Mesh(totalGeom, material);
		this.group.add(mesh);
	},
	chunkTranverse: function() {
		if (this.chunkCallback instanceof Function)
			this.chunkCallback.call(this.parent);
		this.chunkSteps++;
		if (this.chunkSteps > 10) {
			this.group.children[0].position.z -= 10*this.chunkSize;
			this.chunkSteps = 0;
			this.chunkSteps2++;
			if (this.chunkSteps2 > 10) {
				this.group.children[0].position.z -= 10*this.chunkSize;
				this.chunkSteps2 = 0;
			}
		}
	},
	update: function(z) {
		/* Update World */
		this.group.position.z = z;
		let newChunk = (z / this.chunkSize) | 0;
		if (this.lastChunk != newChunk && this.group.children.length > 0) {
			let distance = Math.abs(this.lastChunk - newChunk);
			if (distance > 1)
				console.warn("Super");
			while (distance > 0) {
				this.chunkTranverse();
				distance -= 1;
			}
			this.lastChunk = newChunk;
		}
	}
}
