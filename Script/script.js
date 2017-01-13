var camera, scene, renderer;
var mesh;
var controls, gameSpeed;
var velocity;
var gameState = "loading";
var players = [];
var light;

function onMouseMove(event) {
	if (camera&&event.shiftKey) {
		let x = event.clientX/window.innerWidth;
		let y = event.clientY/window.innerHeight;
		camera.position.x = interpolate([0,-100],[1,100]).at(x);
		camera.position.y = interpolate([0,100],[1,-100]).at(y);
		//camera.position.z= 60;
		camera.lookAt(new THREE.Vector3(0,0,0));
		//camera.position.set()
	}
}
function pauseGame() {
	if (gameState === "playing") {
		gameState = "paused";
	}
}
function resumeGame() {
	if (gameState === "paused") {
		gameState = "playing";
	}
}
function gamepadChange(event) {
	//console.log(event.key, event.type);
	if (gameState == "menu" && event.type === "button-push" && event.id === 0) {
		if (event.key === 13)
			menu.decreaseState();
		else if (event.key === 12)
			menu.increaseState();
		else if ((event.key === 0 || event.key === 9) ) {
			if (menu.getState() === 0) {
				menu.free();
				gameState = "playing";
				setupThreeJS();
			}
		}
	} else if (gameState == "playing" || gameState == "starting") {
		if (players[event.id]instanceof Player) {
			players[event.id].gamepadChange(event);
		} else if (event.key === 9 && event.type === "button-push") {
			if (event.id === 0)
				scene.remove(mesh);
			players[event.id] = new Player(scene,event.id);
			AdjustCameraToFitPlayers();
		}
	}
}
function AdjustCameraToFitPlayers() {
	if (camera) {
		if (players[0] && players[3])
			camera.position.set(70 * 3, 150 + 40 * 3, 200);
		else if (players[0] && players[2])
			camera.position.set(70 * 2, 150 + 40 * 1, 200);
		else if (players[0] && players[1])
			camera.position.set(70, 150 + 40, 200);
		else if (players[0])
			camera.position.set(0, 150, 200);
		else
			camera.position.set(0, 100, 200);
		camera.rotation.set(-0.97079, 0, 0);
	}
}
function startGame() {
	menu.free();
	gameState = "starting";
	setupThreeJS();
}
function addLights() {
	hemiLight = new THREE.HemisphereLight(0xffffff,0xffffff,0.7);
	hemiLight.color.setRGB(0.4, 0.4, 0.4);
	hemiLight.position.set(300, 500, 100);
	scene.add(hemiLight);
}
function setupThreeJS() {
	velocity = new THREE.Vector3()
	/* Render Setup */
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.setClearColor(0xCCCCCC, 1);
	renderer.gammaOutput = true;
	/* Camera Setup*/
	camera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,1,1000);
	camera.position.z = 500;
	document.body.appendChild(renderer.domElement);
	resize();
	/* Scene Setup */
	scene = new THREE.Scene();
	addLights();
	/* Setup Blocks */
	geometry = new THREE.BoxGeometry(100,100,100);
	material = new THREE.MeshPhongMaterial({
		color: 0x333333
	});
	mesh = new THREE.Mesh(geometry,material);
	mesh.rotation.x = 0.78539816;
	mesh.rotation.y = 0.78539816;
	scene.add(mesh);
	camera.position.set(0, 0, 400);
}
function update(finalize) {
	controls.update();
	if (gameState == "menu")
		menu.update();
	else if (gameState == "starting" || gameState == "playing") {
		if (finalize) {
			if (players[0])
				players[0].update();
			if (players[1])
				players[1].update();
			if (players[2])
				players[2].update();
			if (players[3])
				players[3].update();
			renderer.render(scene, camera);
		}
	}
}
function resize() {
	if (camera) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}
	if (renderer) {
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
stats.begin();
controls = new GamepadControls(scene,camera,gamepadChange);
gameState = "menu";
var menu = new Menu(domInterface);
mainUpdateLoop();
window.addEventListener('resize', resize, false);
window.addEventListener('mousemove', onMouseMove, false);
function mainUpdateLoop() {
	stats.update();
	var delta = stats.delta;
	if (delta >= 16 * 1) {
		if (delta < 16 * 2) {
			stats.normalStep();
			stats.delta -= 16;
			update(true);
		} else if (delta < 16 * 3) {
			stats.normalStep();
			stats.delta -= 16 * 2;
			update();
			update(true);
		} else if (delta < 16 * 4) {
			stats.normalStep();
			stats.delta -= 16 * 3;
			update();
			update();
			update(true);
		} else if (delta < 16 * 8) {
			stats.lagStep();
		} else {
			stats.lagStep();
		}
	}
	requestAnimationFrame(mainUpdateLoop);
}
/* Fake Input */

startGame();
gamepadChange({
	key: 9, // Start
	type: "button-push",
	id: 0
});
gamepadChange({
	key: 9, // Start
	type: "button-push",
	id: 1
});
gamepadChange({
	key: 7, // Forward
	type: "button-dial",
	value: 1,
	id: 1
});
// Shoot
setInterval(function() {
	gamepadChange({
		key: 0,
		type: "button-push",
		value: 1,
		id: 0
	});
}, 1500);
var s = true;
setInterval(function() {
	gamepadChange({
		key: 0,
		type: "axis-change",
		value: s ? -0.9 : 0.9,
		id: 0
	});
	s = !s
}, 3000);

//gamepadChange({key:7, type:"button-dial", value:0.8, id:1});
