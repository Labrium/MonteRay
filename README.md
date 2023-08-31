# MonteRay - A [Three.js](https://threejs.org/) pathtracing renderer

[![Licensed under CC BY-NC-SA 4.0](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-lightgrey.svg?logo=creativecommons&logoColor=white)](LICENSE)
[![Minified file size](https://img.shields.io/github/size/Labrium/MonteRay/Build/MonteRay.min.js?label=minified%20size)](https://raw.githubusercontent.com/Labrium/MonteRay/master/Build/MonteRay.min.js)
![GitHub branch checks state](https://img.shields.io/github/checks-status/Labrium/MonteRay/master?logo=github)
![GitHub all releases](https://img.shields.io/github/downloads/Labrium/MonteRay/total?color=success&logo=docusign&logoColor=white)


[![three.js r123](https://img.shields.io/badge/three.js-r123-blue?logo=threedotjs)](https://github.com/mrdoob/three.js/releases/tag/r123)
[![three-mesh-bvh v0.4.0](https://img.shields.io/badge/three--mesh--bvh-v0.4.0-blue)](https://github.com/gkjohnson/three-mesh-bvh/releases/tag/v0.4.0)
[![MeshSurfaceSampler.js r123](https://img.shields.io/badge/MeshSurfaceSampler.js-r123-blue)](https://github.com/mrdoob/three.js/blob/r123/examples/jsm/math/MeshSurfaceSampler.js)

Written in 100% ES5 JavaScript using native Three.js classes and objects. This renderer has been created as an alternative to the default Three.js WebGL renderer, and will (at some future time) support most if not all Three.js scenes and materials.

[Examples](#examples) — [API Reference](https://github.com/Labrium/MonteRay/wiki/API-Reference)

![Cornell Box rendered with MonteRay](Images/MonteRay%20-%20A%20Three.js%20pathtracing%20renderer%20-%20CornellBox_1.png)

*Tested on:
  Three.js:
    r112
    r113
    r120dev
    r123
    r126
    r128*

*Tested on Safari Technology Preview, Firefox Nightly, and Google Chrome Canary*

**NOTE: MeshBVH accelerated raycasting is only supported on Three.js r123 and later.**

### Features include:

 * 100% ES5 Vanilla JavaScript
 * Progressive rendering
 * Physically accurate rendering using Monte Carlo methods
 * Russian roulette path termination
 * Soft shadows
 * Global Illumination
 * Lighting using emissive meshes instead of abstract lights
 * Background environment lighting
 * BVH Accelerated raycasting via [gkjohnson](https://github.com/gkjohnson)'s [MeshBVHLib](https://github.com/gkjohnson/three-mesh-bvh)
 * Explicit light sampling
 * ... More features coming soon!

&nbsp;

| |Examples| |
|---|---|---|
|![Luxo Jr rendered with MonteRay](Images/MonteRay%20-%20A%20Three.js%20pathtracing%20renderer%20-%20Luxo_f1_67spp.png) [Luxo Jr (single thread)](https://labrium.github.io/MonteRay/Examples/Luxo.html) <br/> [Luxo Jr (4 threads)](https://labrium.github.io/MonteRay/Examples/Luxo.html?threads=4) | [Lighting McQueen (single thread)](https://labrium.github.io/MonteRay/Examples/McQueen.html) <br/> [Lighting McQueen (4 threads)](https://labrium.github.io/MonteRay/Examples/McQueen.html?threads=4) | ![Cornell Box rendered with MonteRay](Images/MonteRay%20-%20A%20Three.js%20pathtracing%20renderer%20-%20CornellBox_1.png) [Cornell Box (single thread)](https://labrium.github.io/MonteRay/Examples/CornellBox.html) <br/> [Cornell Box (4 threads)](https://labrium.github.io/MonteRay/Examples/CornellBox.html?threads=4)|
| [Textures (single thread)](https://labrium.github.io/MonteRay/Examples/Textures.html) <br/> [Textures (4 threads)](https://labrium.github.io/MonteRay/Examples/Textures.html?threads=4) | ![Environment maps in MonteRay](Images/MonteRay%20-%20A%20Three.js%20pathtracing%20renderer%20-%20HDRI%20Environment%20Map%20Demo_f1_102spp.png) [Environments (single thread)](https://labrium.github.io/MonteRay/Examples/HDRI.html) <br/> [Environments (4 threads)](https://labrium.github.io/MonteRay/Examples/HDRI.html?threads=4) | ![Classic Cornell Box rendered with MonteRay](Images/MonteRay%20-%20A%20Three.js%20pathtracing%20renderer%20-%20Multithread%20Demo_f2_1205spp.png) [Classic Cornell Box (single thread)](https://labrium.github.io/MonteRay/Examples/CornellBoxClassicMultithread.html) <br/> [Classic Cornell Box (4 threads)](https://labrium.github.io/MonteRay/Examples/CornellBoxClassicMultithread.html?threads=4)|
|[Lego (single thread)](https://labrium.github.io/MonteRay/Examples/Lego.html) <br/> [Lego (4 threads !WARNING! High RAM usage!)](https://labrium.github.io/MonteRay/Examples/Lego.html?threads=4) | ![Spheres rendered with MonteRay](Images/MonteRay%20-%20A%20Three.js%20pathtracing%20renderer%20-%20Light_380spp.png) [Light (single thread)](https://labrium.github.io/MonteRay/Examples/Light.html) <br/> [Light (4 threads)](https://labrium.github.io/MonteRay/Examples/Light.html?threads=4) | [Renderman Look Development Studio (single thread)](https://labrium.github.io/MonteRay/Examples/Studio.html) <br/> [Renderman Look Development Studio (4 threads)](https://labrium.github.io/MonteRay/Examples/Studio.html?threads=4)|


&nbsp;

# Usage

**NOTE: MonteRay is in the beta development stage right now. Rendering quality will vary from version to version, and I will do my best to keep the API documentation up to date.**

## Installation

Make sure you include the following dependencies:
 - [three.js](https://github.com/mrdoob/three.js)
 - [three.js MeshSurfaceSampler](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/math/MeshSurfaceSampler.js)
 - [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) **optional*

Download the [latest build of the MonteRay Client](https://raw.githubusercontent.com/Labrium/MonteRay/master/Build/MonteRay.js), [the MonteRay Engine](https://raw.githubusercontent.com/Labrium/MonteRay/master/Build/MonteRayEngine.js), and optionally [the MonteRay Thread Client](https://raw.githubusercontent.com/Labrium/MonteRay/master/Build/MonteRayThread.js), and include them as an HTML script:

```html
<script src="MonteRayEngine.js"></script>
<script src="MonteRay.js"></script>
```

And MonteRay is ready to use in your Three.js project:

```javascript
var renderer = new MonteRay.PathtracingRenderer(options);
```

Or import as a module:

```javascript
import { PathtracingRenderer } from "./MonteRay.module.js";

var renderer = new PathtracingRenderer(options);
```

## Renderer options
see [API Reference](https://github.com/Labrium/MonteRay/wiki/API-Reference)


&nbsp;

**NOTE: Make sure to include emissive materials in your scene as regular Three.js lights (AmbientLight, HemisphereLight, DirectionalLight, PointLight and SpotLight) don't work.**

### Supported material types

 * Diffuse
 * Mirror
 * Refractive **experimental*
 * Glossy **experimental*
 * ... Other materials coming soon!

`MonteRay.CustomMaterial` (allowing for volumetric meshes like water, fog and clouds) coming soon!

**NOTE: `THREE.ShaderMaterial` and `THREE.RawShaderMaterial` might not be implemented for the sake of not using WebGL.**

&nbsp;

# Introduction

In early 2021, I was looking for a photorealistic renderer for Three.js (I decided to use Three.js because of the extensive work done to support many 3D model file formats). I came across many different options including [erichlof](https://github.com/erichlof)'s [THREE.js-PathTracing-Renderer](https://github.com/erichlof/THREE.js-PathTracing-Renderer) and [hoverinc](https://github.com/hoverinc)'s [Ray Tracing Renderer](https://github.com/hoverinc/ray-tracing-renderer). Having no (real) experience in computer graphics, I decided to try to implement them in my projects. After reading through the code (and trying to understand as much as I could from GLSL) I realized that none of these were going to give me the compatibility and integration with Three.js I was looking for.

Needless to say, I decided to take it upon myself to create a fully-functional Three.js path-tracing renderer that uses:

 1. Monte Carlo path tracing methods for most accurate results
 2. Native Three.js Meshes
 3. Emissive meshes as lights instead of default Three.js lights for soft shadows and projectors
 4. Native Three.js raycasters to allow much easier BVH acceleration (and mainly to make it easier for myself since this is my first try at path tracing)
 5. Native Three.js colors for automatic clamping and color equations

(basically as integrated with Three.js as possible)

I spent weeks learning path tracing and the best practices for path tracing, and finally–after no less than 467 failed test renders, reading through the source code of every path tracer and pdf I could find on the internet (including [montelight-cpp](https://github.com/Smerity/montelight-cpp) by [Smerity](https://github.com/Smerity))–I came up with something acceptable to publish on github.

&nbsp;

# How it Works

In this project, I use a variety of methods to improve accuracy and speed of traditional Monte Carlo path tracing.

MonteRay divides the rendering process into two phases:

 1. Pre-rendering
 2. Rendering

## Pre-rendering Phase

During the pre-rendering phase MonteRay analyzes the scene computing the BVH trees of all meshes and registering meshes with emissive materials for explicit lighting, ~~then writes the depth data to the screen as a placeholder~~

![Cornell Box depth map](Images/CornellBoxDepthMap.png)

~~and orders the pixels by depth to allow for closest-first rendering.~~

![Cornell Box closest-first rendering](Images/CornellBoxClosestFirst.png)

## Rendering Phase

During the rendering phase MonteRay backward traces each path and averages the samples as a typical path tracer would, and displays the data to the screen after a specified interval of rendered pixels, and stops after a specified number of samples per pixel.

![Cornell Box progressive rendering](Images/CornellBoxProgressive.png)

&nbsp;

# TODO
 - [x] Texture maps
   - [x] Diffuse
   - [ ] Emissive
   - [ ] Roughness
   - [x] Normal
     - [x] Tangent Space
     - [ ] Object Space
   - [ ] Bump
   - [ ] Displacement
     - [ ] Per-vertex
     - [ ] Per-pixel
 - [x] Texture wrapping/repeat
   - [x] `THREE.RepeatWrapping`
   - [x] `THREE.ClampToEdgeWrapping`
   - [x] `THREE.MirroredRepeatWrapping`
   - [x] `THREE.Texture.repeat`
   - [x] `THREE.Texture.rotation`
   - [x] `THREE.Texture.center`
   - [x] `THREE.Texture.offset`
 - [x] Texture filtering
   - [x] `THREE.NearestFilter`
   - [ ] `THREE.LinearFilter`
 - [x] Environment maps
   - [x] All standard images supported by browser (PNG/JPEG/etc.)
   - [ ] EXR
   - [x] HDR
 - [ ] WebGLRenderTarget/WebGLCubeRenderTarget support
 - [ ] CubeTexture environment maps
 - [ ] Background emissive maps and environment intensity (for non-EXR/HDR images)
 - [ ] Per-material environment maps
 - [x] Standard materials
   - [x] Diffuse
   - [x] Specular (Mirror)
   - [x] Clearcoat (Glossy) **experimental*
   - [x] Refractive **experimental*
 - [ ] Tonemapping
   - [x] Linear **currently disabled as sRGB is the default*
   - [x] sRGB
   - [ ] Reinhard
   - [ ] Extended Reinhard
   - [ ] Extended Luminance Reinhard
   - [ ] ACES Filmic
   - [ ] Uncharted 2 Filmic
   - [ ] Cineon
 - [x] Fix double-sided surface normal calculation to avoid randomly inverted normals
 - [ ] Support for raytraced primitives with a triangulated counterpart for visibility in WebGL
 - [ ] Vertex colors support
 - [x] Antialiasing  **background optional*
 - [ ] Noise reduction (through variance reduction or denoising)
 - [ ] Possible support for native Three.js lights???
 - [ ] Instancing support/testing (`THREE.InstancedMesh`)
 - [ ] Skinned mesh support/testing (`THREE.SkinnedMesh`)
 - [ ] Testing and support for:
   - [ ] `THREE.OrthographicCamera`
   - [ ] `THREE.CinematicCamera`
   - [ ] `THREE.ArrayCamera`
   - [ ] `THREE.CubeCamera`
   - [ ] `THREE.StereoCamera`
   - [ ] Possibly `MonteRay.PanoramicCamera` ???
 - [ ] Global space partitioning system for accelerated raycasting across multiple meshes
 - [x] Multi-thread support via Web Worker API **Textures (except `THREE.DataTexture`) are not supported*
   - [ ] Include support for `SharedArrayBuffer` to decrease redundant memory and increase performance
 - [ ] Read directly from `THREE.DataTexture` to avoid redundant data
 - [x] Smooth shading
 - [x] Quadratic light decay/falloff
 - [ ] Fog support
 - [ ] Multi-material mesh support (geometry groups)
 - [ ] Support for `TypedArray` (possibly interlaced) texture cache and output image internal storage format to save memory
 - [ ] Multiple Importance Sampling for HDRIs and smarter explicit light sampling

&nbsp;

# License
[MonteRay](https://github.com/Labrium/MonteRay) © 2021-2022 by [Labrium](https://github.com/Labrium) is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0).

[![licensebuttons by-nc-sa](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/4.0)
