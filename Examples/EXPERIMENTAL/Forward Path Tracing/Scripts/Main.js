var tau = 6.28318530717958637392528;
var EPSILON = 0.00001;


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);







var scene = new THREE.Scene();
scene.overrideMaterial = new THREE.MeshDepthMaterial();
scene.overrideMaterial.depthPacking = THREE.RGBADepthPacking;


var db = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
	depth: true
});




var camera = new THREE.PerspectiveCamera(31, window.innerWidth / window.innerHeight, 0.1, 10000);

var renderer = new THREE.WebGLRenderer({
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);








// materials

var red = new THREE.Color(Math.pow(0.7, 1 / 2.2), Math.pow(0.12, 1 / 2.2), Math.pow(0.05, 1 / 2.2));
var white = new THREE.Color(Math.pow(1, 1 / 2.2), Math.pow(1, 1 / 2.2), Math.pow(1, 1 / 2.2));
var green = new THREE.Color(Math.pow(0.2, 1 / 2.2), Math.pow(0.4, 1 / 2.2), Math.pow(0.36, 1 / 2.2));

var phongMaterial = new THREE.MeshPhongMaterial({
	color: white,
	shininess: 1,
	flatShading: false
});

var lightMaterial = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	emissive: new THREE.Color(Math.pow(1, 1 / 2.2), Math.pow(0.7, 1 / 2.2), Math.pow(0.38, 1 / 2.2)),
	emissiveIntensity: 2
});

//

group = new THREE.Group();
scene.add(group);

// geometries

var planeGeometry = new THREE.PlaneBufferGeometry(1, 1);
var boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
//boxGeometry = new THREE.SphereBufferGeometry(0.5, 64, 32);

// top
var plane = new THREE.Mesh(planeGeometry, phongMaterial);
plane.position.set(0, 2, 0);
plane.scale.set(2, 2, 1);
plane.rotation.x = Math.PI / 2;
group.add(plane);

// bottom
var plane = new THREE.Mesh(planeGeometry, phongMaterial);
plane.rotation.x = -Math.PI / 2;
plane.scale.set(2, 2, 1);
group.add(plane);

// back
var plane = new THREE.Mesh(planeGeometry, phongMaterial);
plane.position.set(0, 1, -1);
plane.scale.set(2, 2, 1);
plane.rotation.x = 0;
group.add(plane);

// left
var plane = new THREE.Mesh(planeGeometry, phongMaterial.clone());
plane.material.color = red;
plane.position.set(-1, 1, 0);
plane.scale.set(2, 2, 1);
plane.rotation.y = Math.PI / 2;
group.add(plane);

// right
var plane = new THREE.Mesh(planeGeometry, phongMaterial.clone());
plane.material.color = green;
plane.position.set(1, 1, 0);
plane.scale.set(2, 2, 1);
plane.rotation.y = -Math.PI / 2;
group.add(plane);

// light
var light = new THREE.Mesh(planeGeometry, lightMaterial);
light.position.set(0, 1.99, 0);
light.scale.set(0.5, 0.5, 1);
light.rotation.x = Math.PI / 2;
group.add(light);



// short box
var plane = new THREE.Mesh(boxGeometry, phongMaterial);
plane.position.set(0.32631, 0.3, 0.374592);
plane.rotation.set(0, (163.36 / 180) * Math.PI, 0);
plane.scale.set(0.6, 0.6, 0.6);
group.add(plane);

// tall box
var plane = new THREE.Mesh(boxGeometry, new THREE.MeshPhysicalMaterial({
	roughness: 0,
	metalness: 1
}));
plane.position.set(-0.335439, 0.6, -0.291415);
plane.rotation.set(0, (-160.812 / 180) * Math.PI, 0);
plane.scale.set(0.6, 1.2, 0.6);
group.add(plane);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
scene.children[scene.children.length - 1].position.set(-0.5, 1, 0.25);







camera.position.set(0, 1, 4.82);
camera.lookAt(0, 1, 0);


var animate = function () {
	//requestAnimationFrame(animate);

	renderer.setRenderTarget(db);
	renderer.render(scene, camera);

	//renderer.setRenderTarget(null);
	//renderer.render(scene, camera);
};

animate();








var ctx = document.createElement("canvas").getContext("2d", {
	alpha: false
});
THREE.Quaternion.prototype.invert = THREE.Quaternion.prototype.inverse;
var oc = new THREE.OrbitControls(camera, ctx.canvas);
oc.addEventListener("change", function () {
	camera.updateMatrixWorld();
	samples.fill(0);
	c.fill(0);
	data.data.fill(0);
	renderer.setRenderTarget(db);
	renderer.render(scene, camera);
	renderer.readRenderTargetPixels(db, 0, 0, ctx.canvas.width, ctx.canvas.height, dbp, 0);
});
oc.target.set(0, 1, 0);
var raycaster = new THREE.Raycaster();
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

document.body.appendChild(renderer.domElement);
document.body.appendChild(ctx.canvas);

var data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
var dbp = new Uint8Array(ctx.canvas.width * ctx.canvas.height * 4);
renderer.readRenderTargetPixels(db, 0, 0, ctx.canvas.width, ctx.canvas.height, dbp, 0);
console.log(dbp);

function XYtoI(x, y, width) {
	return ((Math.floor(y) * width) + Math.floor(x)) * 4;
}

var sampler = new MeshSurfaceSampler(light).build();

var lt = 0;

function randDir(cosineWeighted, fullSphere) {
	var rd = new THREE.Vector3((Math.random() * 2) - 1, (Math.random() * 2) - 1, 0);
	if (cosineWeighted) {
		while (rd.distanceTo(new THREE.Vector3(0, 0, 0)) >= 1) {
			rd.set((Math.random() * 2) - 1, (Math.random() * 2) - 1, 0);
		}
		rd.z = Math.sqrt(Math.max(0, 1 - rd.x * rd.x - rd.y * rd.y));
	} else {
		if (fullSphere) {
			rd.z = (Math.random() * 2) - 1;
			rd.applyAxisAngle(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), Math.random() * tau);
		} else {
			rd.z = Math.random();
			rd.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.random() * tau);
		}
	}
	rd.normalize();
	return rd;
};




var PackFactors = new THREE.Vector3(256 * 256 * 256, 256 * 256, 256);
var UnpackDownscale = 255 / 256;
var UnpackFactors = new THREE.Vector4(UnpackDownscale / PackFactors.x, UnpackDownscale / PackFactors.y, UnpackDownscale / PackFactors.z, UnpackDownscale / 1);

function unpackRGBAToDepth(v) {
	return v.dot(UnpackFactors);
}



var hemisphere = new THREE.Object3D();

var samples = new Array(ctx.canvas.width * ctx.canvas.height);
samples.fill(0);
var c = new Array(ctx.canvas.width * ctx.canvas.height * 4);
c.fill(0);

function render() {
	requestAnimationFrame(render);

	while (performance.now() < lt + (1000 / 10)) {
		var samplePos = new THREE.Vector3();
		var sampleNorm = new THREE.Vector3();
		sampler.sample(samplePos, sampleNorm)
		light.localToWorld(samplePos);
		light.localToWorld(sampleNorm);
		sampleNorm.negate();

		var fcolor = new THREE.Color(Math.pow(light.material.emissive.r, 2.2), Math.pow(light.material.emissive.g, 2.2), Math.pow(light.material.emissive.b, 2.2));

		for (var j = 0; j < 6; j++) {

			var rd = randDir(true, true);
			hemisphere.lookAt(sampleNorm);
			hemisphere.rotateZ(Math.random() * tau);
			hemisphere.localToWorld(rd);
			rd.normalize();

			raycaster.set(samplePos.addScaledVector(rd, EPSILON), rd);

			var intersect = raycaster.intersectObjects(scene.children, true)[0];
			if (intersect) {
				var point = intersect.point.clone();
				point.applyMatrix4(camera.matrixWorldInverse);
				point.applyMatrix4(camera.projectionMatrix);
				point.z = THREE.MathUtils.mapLinear(point.z, 1, -1, 1, 0);
				point.x = THREE.MathUtils.mapLinear(point.x, -1, 1, 0, 1) * ctx.canvas.width;
				point.y = THREE.MathUtils.mapLinear(point.y, 1, -1, 0, 1) * ctx.canvas.height;

				var i = XYtoI(point.x, ctx.canvas.height - point.y, ctx.canvas.width);
				var rgba = new THREE.Vector4(dbp[i + 0] / 255, dbp[i + 1] / 255, dbp[i + 2] / 255, dbp[i + 3] / 255);
				var d = unpackRGBAToDepth(rgba);
				//d = Infinity;

				i = XYtoI(point.x, point.y, ctx.canvas.width);



				if (point.z < d + EPSILON) {
					samplePos = intersect.point;
					sampleNorm = intersect.object.localToWorld(intersect.face.normal).negate();

					c[i + 0] *= samples[i / 4];
					c[i + 1] *= samples[i / 4];
					c[i + 2] *= samples[i / 4];

					var f = sampleNorm.dot(rd);
					if (j != 0) {
						f *= 0.5;
					}
					fcolor.r *= Math.pow(intersect.object.material.color.r, 2.2) * f;
					fcolor.g *= Math.pow(intersect.object.material.color.g, 2.2) * f;
					fcolor.b *= Math.pow(intersect.object.material.color.b, 2.2) * f;


					c[i + 0] += fcolor.r;
					c[i + 1] += fcolor.g;
					c[i + 2] += fcolor.b;

					/*if (j == 0) {
						c[i + 0] += 1;
						c[i + 1] += 1;
						c[i + 2] += 0;
					} else if (j == 1) {
						c[i + 0] += 0;
						c[i + 1] += 1;
						c[i + 2] += 1;
					} else if (j == 2) {
						c[i + 0] += 1;
						c[i + 1] += 0;
						c[i + 2] += 1;
					} else if (j == 3) {
						c[i + 0] += 1;
						c[i + 1] += 0;
						c[i + 2] += 0;
					} else if (j == 4) {
						c[i + 0] += 0;
						c[i + 1] += 1;
						c[i + 2] += 0;
					} else if (j == 5) {
						c[i + 0] += 0;
						c[i + 1] += 0;
						c[i + 2] += 1;
					}*/

					samples[i / 4]++;

					c[i + 0] /= samples[i / 4];
					c[i + 1] /= samples[i / 4];
					c[i + 2] /= samples[i / 4];

					data.data[i + 0] = Math.pow(c[i + 0], 1 / 2.2) * 255;
					data.data[i + 1] = Math.pow(c[i + 1], 1 / 2.2) * 255;
					data.data[i + 2] = Math.pow(c[i + 2], 1 / 2.2) * 255;
					data.data[i + 3] = 255;
				}
			}
		}
	}
	lt = performance.now();

	ctx.putImageData(data, 0, 0);
}
render();