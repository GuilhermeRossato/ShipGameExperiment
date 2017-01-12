function CollisionController(scene) {
	this.raycaster = new THREE.Raycaster(undefined,new THREE.Vector3(0,1,0),0,1);
	this.raycaster.near = 0;
	this.sceneChildren = scene.children;
}
CollisionController.prototype = {
	constructor: CollisionController
}