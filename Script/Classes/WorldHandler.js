function WorldHandler(scene) {
	this.group = new THREE.Group();
	this.group.name = "world";
	scene.add(this.group);
	this.parent = scene;
	this.chunkSize = 20;
	this.lastChunk = 0;
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
	splitDoubleFace: function(geometry, f0, f1, z) {
		//Gets two faces and create vertices in the middle at specific Z
		//(better than the script below for loops)
	},
	splitFaceRight: function(geometry, positions) {
		if (geometry.vertices.length/2 === 4) {
			let v0 = geometry.vertices[0]
			  , v1 = geometry.vertices[1]
			  , vertices = positions.map(function(pos, i) {
				let vertice = new THREE.Vector3(pos.x, pos.y, (v0.z + v1.z) / 2);
				geometry.vertices.push(vertice);
				return vertice;
			}), faces = [[1,0,8],[2,3,9],[2,9,8],[1,8,9]].map((abc, i) => {
				let face = new THREE.Face3(abc[0], abc[1], abc[2]);
				if (i === 0)
					face.normal.set(0,1,0);
				else if (i === 1)
					face.normal.set(0,-1,0);
				else
					this.computeNormal(geometry, face, false);
				geometry.faces.push(face);
				geometry.faceVertexUvs[0].push([new THREE.Vector2(0,0), new THREE.Vector2(0,0), new THREE.Vector2(0,0)]);
			});
			geometry.faces[0].c = 8;
			geometry.faces[1].a = 9;
		} else if (geometry.vertices.length/2 === 5) {
			let v0 = geometry.vertices[0]
			  , v1 = geometry.vertices[8]
			  , vertices = positions.map(function(pos, i) {
				let vertice = new THREE.Vector3(pos.x, pos.y, (v0.z + v1.z) / 2);
				geometry.vertices.push(vertice);
				return vertice;
			}), faces = [[8,0,10],[2,9,11],[2,11,10],[8,10,11]].map((abc, i) => {
				let face = new THREE.Face3(abc[0], abc[1], abc[2]);
				if (i === 0)
					face.normal.set(0,1,0);
				else if (i === 1)
					face.normal.set(0,-1,0);
				else
					this.computeNormal(geometry, face, false);
				geometry.faces.push(face);
				geometry.faceVertexUvs[0].push([new THREE.Vector2(0,0), new THREE.Vector2(0,0), new THREE.Vector2(0,0)]);
				return face;
			});
			geometry.faces[0].c = 10;
			geometry.faces[14].a = 11;
		} else if (geometry.vertices.length/2 === 6) {
			let v0 = geometry.vertices[8]
			  , v1 = geometry.vertices[1]
			  , vertices = positions.map(function(pos, i) {
				let vertice = new THREE.Vector3(pos.x, pos.y, (v0.z + v1.z) / 2);
				geometry.vertices.push(vertice);
				return vertice;
			}), faces = [[1,8,12],[9,3,13],[9,13,12],[1,12,13]].map((abc, i) => {
				let face = new THREE.Face3(abc[0], abc[1], abc[2]);
				if (i === 0)
					face.normal.set(0,1,0);
				else if (i === 1)
					face.normal.set(0,-1,0);
				else
					this.computeNormal(geometry, face, false);
				geometry.faces.push(face);
				geometry.faceVertexUvs[0].push([new THREE.Vector2(0,0), new THREE.Vector2(0,0), new THREE.Vector2(0,0)]);
				return face;
			});
			geometry.faces[15].a = 12;
			geometry.faces[1].a = 13;
		}
	},
	generateWorld: function() {
		[-55, 55].forEach((x,i)=>{
			var geometry = new THREE.BoxGeometry(15,40,300);
			if (i === 0) {
				let xPositions = [b(7,20,Math.random()), b(10,30,Math.random()), b(10,30,Math.random())]
				let yPositions = [b(0,20,Math.random()), b(0,20,Math.random()), b(0,20,Math.random())]
				this.splitFaceRight(geometry, [new THREE.Vector3(xPositions[0],yPositions[0],0), new THREE.Vector3(xPositions[0],-20,0)]);
				this.splitFaceRight(geometry, [new THREE.Vector3(xPositions[1],yPositions[1],0), new THREE.Vector3(xPositions[1],-20,0)]);
				this.splitFaceRight(geometry, [new THREE.Vector3(xPositions[2],yPositions[2],0), new THREE.Vector3(xPositions[2],-20,0)]);
				geometry.verticesNeedUpdate = true;
			}
			var material = new THREE.MeshPhongMaterial({
				color: 0x666666
			});
			var cube = new THREE.Mesh(geometry,material);
			cube.position.set(x, 20, 0);
			this.group.add(cube);
		}
		);
		this.left = this.group.children[0];
		this.right = this.group.children[1];
	},
	update: function(z) {
		/* Update World */
		let newChunk = (z / this.chunkSize) | 0;
		if (this.lastChunk != newChunk && this.group.children.length > 2) {
			if (this.chunkCallback instanceof Function)
				this.chunkCallback.call(this.parent);
			this.chunkSteps++;
		}
	}
}
