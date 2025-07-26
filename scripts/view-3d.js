/* class to do things export quality */

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

export class View3DElement extends HTMLElement {
	#url = "";
	#isAxis = false;
	#isGrid = false;
	#snap = false;
	meta = {}; //bounding box, name, volume, filament length

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		
		const styles = document.createElement('style');
		styles.textContent = `
		:host {
			display: block;
		}
		`;
		this.shadowRoot.appendChild(styles);

		this.#url = this.getAttribute("src");
		this.width = this.clientWidth == 0 ? 100 : this.clientWidth;
		this.height = this.clientHeight == 0 ? 100 : this.clientHeight;

		this.mesh = new THREE.Mesh();

		// global camera, cameraTarget, scene, renderer
		this.camera = new THREE.PerspectiveCamera(
			35,
			this.width / this.height,
			0.01,
			100
		);
		this.camera.position.set(3, 3, 3);
		this.camera.up.set(0, 0, 1);
		this.cameraTarget = new THREE.Vector3(0, 0, 0);

		this.scene = new THREE.Scene();

		this.axesHelper = new THREE.AxesHelper(this.width);

		const size = Math.min(this.width, this.height);
		const divisions = parseInt((this.width + this.height) / 2);
		this.gridHelper = new THREE.GridHelper(size, divisions);
		this.gridHelper.rotateX(Math.PI / 2);

		this.scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 10));
		//this.scene.add(new THREE.AmbientLight(0xffffff));
		this.scene.add(new THREE.AmbientLight(0xffd500));
		//this.addShadowedLight(1, 1, 1, 0xffffff, 3.5);
		this.addShadowedLight(0.5, 1, 1, 0xffd500, 3);

		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setPixelRatio(this.width / this.height);
		this.renderer.setSize(this.width, this.height);
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.shadowMap.enabled = true;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;

		this.shadowRoot.appendChild(this.renderer.domElement);

		this.load(this.#url);
		const observer = new ResizeObserver((entries) => {
			if (this.clientWidth != this.width || this.clientHeight != this.height) {
				this.resize(this.clientWidth, this.clientHeight);
			}

			if (this.getAttribute("src") != this.#url) {
				this.src = this.getAttribute("src");
			}
		});
		observer.observe(this);

		this.addEventListener("mousemove", (event) => {
			const { x, y, z } = this.camera.position;
			if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
				return;
			}

			const sensitivity = 0.001;

			const deltaX = sensitivity * (0.5 - event.offsetX / this.clientWidth);
			const deltaY = sensitivity * (0.5 - event.offsetY / this.clientHeight);

			let [r, theta, phi] = cartesianToSpherical([x, y, z]);
			theta += deltaY;
			phi += deltaX;

			const [X, Y, Z] = sphericalToCartesian([r, theta, phi]);

			this.camera.position.set(X, Y, Z);
		});

		this.animate();
	}

	set src(url) {
		this.#url = url;
		this.load(this.#url);
	}

	get src() {
		return this.#url;
	}

	animate() {
		const animate = () => {
			this.animate();
		};
		window.requestAnimationFrame(animate);
		this.render();
		this.controls.update();
	}

	render() {
		this.camera.lookAt(this.cameraTarget);
		this.renderer.render(this.scene, this.camera);

		if (this.#snap) {
			this.dispatchEvent(
				new Event("capture", { bubbles: true, composed: true })
			);
			this.#snap = false;
		}
	}

	capture() {
		this.#snap = true;

		// return the base 64 data uri to download
		const canvas = this.shadowRoot.querySelector("canvas");
		const orginalURL = canvas.toDataURL("image/png");

		const img = new Image(canvas.width, canvas.height);

		const stats = getInfo(["name", "geo-info", "fab-info"], this);

		return new Promise((resolve) => {
			img.onload = () => {
				const newCanvas = document.createElement("canvas");
				newCanvas.width = img.width;
				newCanvas.height = img.height;
				const ctx = newCanvas.getContext("2d");
				ctx.fillStyle = "rgb(248, 246, 248)";
				ctx.fillRect(0, 0, img.width, img.height);
				ctx.drawImage(img, 0, 0);
				ctx.fillStyle = "rgb(36, 36, 36)";
				ctx.font = "Inter";
				ctx.textBaseline = "bottom";
				ctx.textAlign = "center";
				ctx.fillText("⚡ by fabify.co", img.width / 2, img.height - 10);

				stats.forEach((stat, index) => {
					ctx.font = "200 16px Inter";
					ctx.textAlign = "right";
					ctx.textBaseline = "top";
					ctx.fillText(stat, img.width - 20, img.height * 0.1 + index * 16);
				});

				const url = newCanvas.toDataURL("image/png");
				resolve(url);
			};

			img.src = orginalURL;
		});
	}

	addShadowedLight(x, y, z, color, intensity) {
		const directionalLight = new THREE.DirectionalLight(color, intensity);
		directionalLight.position.set(x, y, z);
		this.scene.add(directionalLight);

		directionalLight.castShadow = true;

		const d = 1;
		directionalLight.shadow.camera.left = -d;
		directionalLight.shadow.camera.right = d;
		directionalLight.shadow.camera.top = d;
		directionalLight.shadow.camera.bottom = -d;

		directionalLight.shadow.camera.near = 1;
		directionalLight.shadow.camera.far = 4;

		directionalLight.shadow.bias = -0.002;
	}

	resize(width, height) {
		this.width = width;
		this.height = height;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(width, height);
	}

	load(url) {
		// clear the scene
		this.removeAllGeometries();
		// load the stl
		const loader = new STLLoader();
		const materialColor = new THREE.Color(1, 199 / 255, 0);

		const material = new THREE.MeshNormalMaterial({ color: materialColor });

		let scene = this.scene;
		let camera = this.camera;

		const instance = () => this;

		loader.load(url, function (geometry) {
			const mesh = new THREE.Mesh(geometry, material);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.position.set(0, 0, 0);

			let scale = 1;
			mesh.scale.set(scale, scale, scale);

			instance().mesh = mesh;

			geometry.computeBoundingBox();

			let x = {
				max: geometry.boundingBox.max.x,
				min: geometry.boundingBox.min.x,
				center: (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2,
			};

			let y = {
				max: geometry.boundingBox.max.y,
				min: geometry.boundingBox.min.y,
				center: (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2,
			};

			let z = {
				max: geometry.boundingBox.max.z,
				min: geometry.boundingBox.min.z,
				center: (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2,
			};

			instance().meta["boundingBox"] = { x, y, z };

			const [geometryArea, geometryVolume] = getAreaVolume(geometry);
			instance().meta["volume"] = geometryVolume;
			instance().meta["surfaceArea"] = geometryArea;

			let r =
				Math.sqrt(
					(x.max - x.min) ** 2 + (y.max - y.min) ** 2 + (z.max - z.min) ** 2
				) *
				5 *
				scale;

			mesh.position.set(
				-x.center * scale,
				-y.center * scale,
				-z.center * scale
			);

			camera.position.set(
				x.max * 2 * scale,
				y.max * 2 * scale,
				z.max * 2 * scale
			);

			//console.log(x, y, z, r);
			camera.far = r;
			camera.updateProjectionMatrix();
			scene.add(mesh);

			instance().dispatchEvent(
				new Event("loaded", { bubbles: true, composed: true })
			);
		});
	}

	getInfo(includes) {
		return getInfo(includes, this);
	}

	toggleAxis() {
		if (!this.#isAxis) {
			this.#isAxis = true;
			this.scene.add(this.axesHelper);
		} else {
			this.scene.remove(this.axesHelper);
		}
	}

	toggleGrid() {
		if (!this.#isGrid) {
			this.#isGrid = true;
			this.scene.add(this.gridHelper);
		} else {
			this.scene.remove(this.gridHelper);
		}
	}

	removeAllGeometries() {
		this.scene.traverse((object) => {
			if (object.isMesh) {
				this.scene.remove(object);
			}
		});
	}
}

function getAreaVolume(geometry) {
	if (!geometry.isBufferGeometry) {
		console.log("'geometry' must be an indexed or non-indexed buffer geometry");
		return 0;
	}
	var isIndexed = geometry.index !== null;
	let position = geometry.attributes.position;
	let volume = 0;
	let area = 0;
	let p1 = new THREE.Vector3(),
		p2 = new THREE.Vector3(),
		p3 = new THREE.Vector3();
	if (!isIndexed) {
		let faces = position.count / 3;
		for (let i = 0; i < faces; i++) {
			p1.fromBufferAttribute(position, i * 3 + 0);
			p2.fromBufferAttribute(position, i * 3 + 1);
			p3.fromBufferAttribute(position, i * 3 + 2);
			volume += signedVolumeOfTriangle(p1, p2, p3);
			area += signedAreaOfTriangle(p1, p2, p3);
		}
	} else {
		let index = geometry.index;
		let faces = index.count / 3;
		for (let i = 0; i < faces; i++) {
			p1.fromBufferAttribute(position, index.array[i * 3 + 0]);
			p2.fromBufferAttribute(position, index.array[i * 3 + 1]);
			p3.fromBufferAttribute(position, index.array[i * 3 + 2]);
			volume += signedVolumeOfTriangle(p1, p2, p3);
			area += signedAreaOfTriangle(p1, p2, p3);
		}
	}
	return [area, volume];
}

function signedVolumeOfTriangle(p1, p2, p3) {
	return p1.dot(p2.cross(p3)) / 6.0;
}

function signedAreaOfTriangle(vertex1, vertex2, vertex3) {
	const v1 = new THREE.Vector3().copy(vertex2).sub(vertex1);
	const v2 = new THREE.Vector3().copy(vertex3).sub(vertex1);
	const normal = new THREE.Vector3().crossVectors(v1, v2);
	return normal.length() / 2;
}

function getInfo(includes, engine) {
	const allInfo = {
		name: [engine.meta.name],
		"geo-info": [
			`${Math.round(
				engine.meta["boundingBox"].x.max - engine.meta["boundingBox"].x.min
			)}mm × ${Math.round(
				engine.meta["boundingBox"].y.max - engine.meta["boundingBox"].y.min
			)}mm × ${Math.round(
				engine.meta["boundingBox"].z.max - engine.meta["boundingBox"].z.min
			)}mm`,
			`${Math.round(engine.meta["volume"])} mm³`,
		],
		"fab-info": [
			`~ ${Math.round(
				((0.34 * engine.meta["volume"] + 185.12) * 1.2) / 1000
			)} m`,
		],
	};

	const info = [];
	includes.forEach((include) => {
		try {
			info.push(...allInfo[include]);
		} catch {}
	});

	return info;
}

function sphericalToCartesian([r, theta, phi]) {
	const x = r * Math.sin(theta) * Math.cos(phi);
	const y = r * Math.sin(theta) * Math.sin(phi);
	const z = r * Math.cos(theta);
	return [x, y, z];
}

function cartesianToSpherical([x, y, z]) {
	const r = Math.sqrt(x * x + y * y + z * z);
	const theta = Math.acos(z / r);
	const phi = Math.atan2(y, x);
	return [r, theta, phi];
}


customElements.define("view-3d", View3DElement);