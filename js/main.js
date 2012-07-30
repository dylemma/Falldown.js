var $container = $("#container");
var gameWidth = 400,
	gameHeight = 600;

var renderer,
	camera,
	scene,
	stats,
	light;

var box,
	particles,
	obstacles,
	player;
	
function init(){
	//init the renderer
	renderer = new THREE.WebGLRenderer({
		clearColor: 0x606060,
		clearAlpha: 1
	});
	renderer.setSize(gameWidth, gameHeight);
	
	//init the canvas
	$container
		.append(renderer.domElement)
		.css("max-width", gameWidth + "px");
	
	//init the camera
//	camera = new THREE.OrthographicCamera(-gameWidth/2, gameWidth/2, gameHeight/2, -gameHeight/2, 1, 1000);
	camera = new THREE.PerspectiveCamera(45, gameWidth/gameHeight, 1, 10000);
	camera.position.z = 300;
	
	//init the scene
	scene = new THREE.Scene();
	scene.add(camera);
//	demoInitScene(scene);
	
	//init the stats
	stats = new Stats();
	$(stats.domElement)
		.attr("class", "stats")
		.appendTo("#stats");
	
	//init the light
	light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.z = 300;
	scene.add(light);
	
	//init the projector
	projector = new THREE.Projector();
	
	player = new Falldown.Player(550, scene, renderer.domElement);
	obstacles = new Falldown.ObstacleSystem(scene, player);
	
	renderer.render(scene, camera);
}

function demoInitScene(scene){
	var boxGeom = new THREE.CubeGeometry(gameWidth - 2, 100, 1);
	var boxMat = new THREE.MeshLambertMaterial({color: 0x00ffff, wireframe: true});
	var box = new THREE.Mesh(boxGeom, boxMat);
	scene.add(box);
}

function loop() {
	requestAnimationFrame(loop, renderer.domElement);
	stats.update();
	
	obstacles.update();
	renderer.render(scene, camera);
}

init();
loop();