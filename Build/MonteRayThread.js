/*
 * MonteRay Alpha 3 Copyright (c) 2022 Tech Labs, Inc.
 * 
 * This renderer has been created as an alternative to the default Three.js
 * WebGL renderer, and will (at some future time) support most if not all
 * Three.js scenes and materials.
 * 
 * https://techlabsinc.github.io/MonteRay/LICENSE
 * 
 * @author TechLabsInc / http://github.com/TechLabsInc
 */


var camera, scene, loader, texturesThatExist, px, rtexid;

importScripts("../Lib/Three.js", "../Lib/MeshBVHLib.js", "../Lib/MeshSurfaceSampler.js", "../Build/MonteRayEngine.js");


MonteRayEngine.validateImage = function (texture) {
	/*console.log(texturesThatExist);
	console.log(texturesThatExist[texture.uuid]);
	if (texturesThatExist[texture.uuid]) {
		console.log("TRUE");
		return true;
	} else {
		console.log("FALSE: " + texture.uuid);
		return false;
	}*/
	return true;
};


MonteRayEngine.requestTexture = function (texture) {
	if (texture.image.data) {
		if (texture.image.data[0]) {
			var texdrows = [];
			if (texture.image.data) {
				if (texture.image.data instanceof Float32Array) {
					var texd = texture.image.data;
					for (var i = 0; i < texd.length; i += 3) {
						//texdrows.push([texd[i] * Math.pow(2, texd[i + 3] - 128), texd[i + 1] * Math.pow(2, texd[i + 3] - 128), texd[i + 2] * Math.pow(2, texd[i + 3] - 128), 255]);
						texdrows.push([Math.pow(texd[i], 1 / 2.2), Math.pow(texd[i + 1], 1 / 2.2), Math.pow(texd[i + 2], 1 / 2.2), 1]);
					}
				} else if (texture.image.data instanceof Uint8ClampedArray) {
					var texd = texture.image.data;
					for (var i = 0; i < texd.length; i += 4) {
						//texdrows.push([texd[i] * Math.pow(2, texd[i + 3] - 128), texd[i + 1] * Math.pow(2, texd[i + 3] - 128), texd[i + 2] * Math.pow(2, texd[i + 3] - 128), 255]);
						texdrows.push([texd[i] / 255, texd[i + 1] / 255, texd[i + 2] / 255, texd[i + 3] / 255]);
					}
				}
			}
			if (texdrows.length > 0) {
				var res = [];
				for (var i = 0; i < texdrows.length; i += texture.image.width) {
					res.push(texdrows.slice(i, i + texture.image.width));
				}
				//console.log(res);
				//throw "ERROR";
				return res;
			}
		} else {
			//console.log(texture);
			//throw "ERROR";
			console.log("NOPE1");
			rtexid = texture.uuid;
			self.postMessage({
				response: "TEXTURE",
				texture: texture.uuid,
				pixels: JSON.stringify(px.pixels),
			});
			return "KILL";
		}
	} else {
		//console.log(texture);
		//throw "ERROR";
		//console.log("NOPE2");
	}
};



self.onmessage = function (e) {

	switch (e.data.task) {
		case "INIT":
			try {
				if (MeshBVHLib) {
					if (!e.data.parameters.BVHAcceleration || e.data.parameters.BVHAcceleration && e.data.parameters.BVHAcceleration != false) {
						THREE.BufferGeometry.prototype.computeBoundsTree = MeshBVHLib.computeBoundsTree;
						THREE.BufferGeometry.prototype.disposeBoundsTree = MeshBVHLib.disposeBoundsTree;
						THREE.Mesh.prototype.raycast = MeshBVHLib.acceleratedRaycast;
					}
				}
			} catch (e) {}


			if (!loader) {
				loader = new THREE.ObjectLoader();
			}
			if (e.data.scene) {
				if (e.data.scene.MRImages) {
					texturesThatExist = e.data.scene.MRImages;
					console.log(texturesThatExist);
				}
				scene = loader.parse(e.data.scene);
			}
			if (e.data.background) {
				switch (e.data.background.itype) {
					case "THREE.DataTexture":
						scene.background = new THREE.DataTexture(e.data.background.data, e.data.background.width, e.data.background.height);
						scene.background.repeat = e.data.background.repeat;
						scene.background.flipY = e.data.background.flipY;
						scene.background.type = e.data.background.type;
						//scene.background = e.data.background;
						//console.log(scene.background);
						break;
				}
			}
			if (e.data.camera) {
				camera = loader.parse(e.data.camera);
			}
			if (e.data.parameters) {
				MonteRayEngine.parameters = e.data.parameters;
			}
			if (e.data.pixSize) {
				MonteRayEngine.pixSize.copy(e.data.pixSize);
			}
			if (e.data.scene) {
				MonteRayEngine.processScene(scene, camera);
			}
			break;
		case "RNDR":
			scene.updateMatrixWorld();
			camera.updateMatrixWorld();
			camera.updateProjectionMatrix();

			MonteRayEngine.randomOffset.set(e.data.randomOffsetX, e.data.randomOffsetY);

			var pxls = JSON.parse(e.data.pixels);
			for (var p = 0; p < pxls.length; p++) {
				pxls[p][0] = new THREE.Vector2(pxls[p][0].x, pxls[p][0].y);
				pxls[p][3] = new MonteRay.Color(pxls[p][3].r, pxls[p][3].g, pxls[p][3].b, pxls[p][3].a);
			}
			px = MonteRayEngine.renderBatch(pxls, scene, camera);
			if (!px.KILLED) {
				self.postMessage({
					response: "DONE",
					pixels: JSON.stringify(px),
				});
			}
			break;
		case "TEXTURE":
			MonteRayEngine.textureCache[rtexid] = e.data.texture;

			break;
	}

};