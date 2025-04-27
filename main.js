import WindowManager from './WindowManager.js'

const t = window.THREE;
let camera, scene, renderer, world;
let near, far;
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1;
let spheres = [];
let glittles = [];
let sceneOffsetTarget = {x: 0, y: 0};
let sceneOffset = {x: 0, y: 0};

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

let internalTime = getTime();
let windowManager;
let initialized = false;

// get time in seconds since beginning of the day (so that all windows use the same time)
function getTime ()
{
	return (new Date().getTime() - today) / 1000.0;
}

if (new URLSearchParams(window.location.search).get("clear"))
{
	localStorage.clear();
}
else
{	
	document.addEventListener("visibilitychange", () => 
	{
		if (document.visibilityState != 'hidden' && !initialized)
		{
			init();
		}
	});

	window.onload = () => {
		if (document.visibilityState != 'hidden')
		{
			init();
		}
	};

	function init ()
	{
		try {
			console.log("Init called");
			initialized = true;

			setTimeout(() => {
				try {
					setupScene();
					setupWindowManager();
					resize();
					updateWindowShape(false);
					render();
					window.addEventListener('resize', resize);
				} catch (e) {
					console.error("Error during setup and render:", e);
				}
			}, 500);
		} catch (e) {
			console.error("Error during init:", e);
		}
	}

	function setupScene ()
	{
		camera = new t.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -10000, 10000);
		
		camera.position.z = 2.5;
		near = camera.position.z - .5;
		far = camera.position.z + 0.5;

		scene = new t.Scene();
		scene.background = new t.Color(0.0);
		// Remove adding camera to scene, as it's not needed and may cause issues
		// scene.add( camera );

		renderer = new t.WebGLRenderer({antialias: true, depthBuffer: true});
		renderer.setPixelRatio(pixR);
	    
	  	world = new t.Object3D();
		scene.add(world);

		renderer.domElement.setAttribute("id", "scene");
		document.body.appendChild( renderer.domElement );
	}

	function setupWindowManager ()
	{
		windowManager = new WindowManager();
		windowManager.setWinShapeChangeCallback(updateWindowShape);
		windowManager.setWinChangeCallback(windowsUpdated);

		let metaData = {foo: "bar"};

		windowManager.init(metaData);

		windowsUpdated();
	}

	function windowsUpdated ()
	{
		updateNumberOfSpheres();
	}

	// Glittle class representing small particles around each sphere
	class Glittle {
		constructor(parentSphere, angle, radius) {
			this.parentSphere = parentSphere;
			this.angle = angle;
			this.radius = radius;
			this.position = new t.Vector3();
			this.mesh = new t.Mesh(
				new t.SphereGeometry(5, 8, 8),
				new t.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
			);
			world.add(this.mesh);
		}

		update(targetPos) {
			// Slowly follow the target position with some lag
			this.position.x += (targetPos.x - this.position.x) * 0.05;
			this.position.y += (targetPos.y - this.position.y) * 0.05;

			// Calculate position around the parent sphere in a circular orbit
			this.angle += 0.01;
			this.position.x += Math.cos(this.angle) * this.radius;
			this.position.y += Math.sin(this.angle) * this.radius;

			this.mesh.position.set(this.position.x, this.position.y, 0);
		}

		remove() {
			world.remove(this.mesh);
		}
	}

	function updateNumberOfSpheres ()
	{
		let wins = windowManager.getWindows();

		// Remove all spheres and glittles
		spheres.forEach((s) => {
			world.remove(s.mesh);
			s.glittles.forEach(g => g.remove());
		});
		spheres = [];
		glittles = [];

		// Add new spheres based on the current window setup
		for (let i = 0; i < wins.length; i++)
		{
			let win = wins[i];

			let color = new t.Color();
			color.setHSL(i * .1, 1.0, .5);

			let size = 50 + i * 20;
			let sphereMesh = new t.Mesh(
				new t.SphereGeometry(size, 32, 32),
				new t.MeshBasicMaterial({color: color, wireframe: true})
			);

			sphereMesh.position.x = win.shape.x + (win.shape.w * .5);
			sphereMesh.position.y = win.shape.y + (win.shape.h * .5);

			world.add(sphereMesh);

			// Create glittles around the sphere
			let sphere = {
				mesh: sphereMesh,
				glittles: []
			};

			let glittleCount = 10;
			for (let j = 0; j < glittleCount; j++) {
				let angle = (j / glittleCount) * Math.PI * 2;
				let radius = size + 20 + Math.random() * 10;
				let glittle = new Glittle(sphere, angle, radius);
				glittle.position.x = sphereMesh.position.x + Math.cos(angle) * radius;
				glittle.position.y = sphereMesh.position.y + Math.sin(angle) * radius;
				sphere.glittles.push(glittle);
				glittles.push(glittle);
			}

			spheres.push(sphere);
		}
	}

	function updateWindowShape (easing = true)
	{
		sceneOffsetTarget = {x: -window.screenX, y: -window.screenY};
		if (!easing) sceneOffset = sceneOffsetTarget;
	}

	function render ()
	{
		try {
			console.log("Render called");
			let t = getTime();

			windowManager.update();

			let falloff = .05;
			sceneOffset.x = sceneOffset.x + ((sceneOffsetTarget.x - sceneOffset.x) * falloff);
			sceneOffset.y = sceneOffset.y + ((sceneOffsetTarget.y - sceneOffset.y) * falloff);

			world.position.x = sceneOffset.x;
			world.position.y = sceneOffset.y;

			let wins = windowManager.getWindows();

			// Update spheres positions and rotations
			for (let i = 0; i < spheres.length; i++)
			{
				let sphere = spheres[i];
				let win = wins[i];
				let _t = t;

				let posTarget = {x: win.shape.x + (win.shape.w * .5), y: win.shape.y + (win.shape.h * .5)};

				sphere.mesh.position.x += (posTarget.x - sphere.mesh.position.x) * falloff;
				sphere.mesh.position.y += (posTarget.y - sphere.mesh.position.y) * falloff;
				sphere.mesh.rotation.x = _t * .5;
				sphere.mesh.rotation.y = _t * .3;

				// Update glittles around the sphere
				sphere.glittles.forEach(glittle => {
					// Glittle target position is around the sphere center with some orbit
			let orbitCenter = new THREE.Vector3(sphere.mesh.position.x, sphere.mesh.position.y, 0);
			glittle.update(orbitCenter);
				});
			}

			// Interaction between glittles of different spheres (simple attraction if close)
			for (let i = 0; i < spheres.length; i++) {
				for (let j = i + 1; j < spheres.length; j++) {
					let sphereA = spheres[i];
					let sphereB = spheres[j];

					sphereA.glittles.forEach(glittleA => {
						sphereB.glittles.forEach(glittleB => {
			let dist = glittleA.position.distanceTo(glittleB.position);
							if (dist < 30) {
								// Simple attraction: move glittles slightly towards each other
							let dir = new THREE.Vector3().subVectors(glittleB.position, glittleA.position).normalize();
								glittleA.position.addScaledVector(dir, 0.5);
								glittleB.position.addScaledVector(dir.negate(), 0.5);

								glittleA.mesh.position.copy(glittleA.position);
								glittleB.mesh.position.copy(glittleB.position);
							}
						});
					});
				}
			}

			renderer.render(scene, camera);
			requestAnimationFrame(render);
		} catch (e) {
			console.error("Error during render:", e);
		}
	}

	function resize ()
	{
		let width = window.innerWidth;
		let height = window.innerHeight;
		
		camera = new t.OrthographicCamera(0, width, height, 0, -10000, 10000);
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
	}
}
