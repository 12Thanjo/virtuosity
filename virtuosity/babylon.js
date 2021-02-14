var BABYLON = require('babylonjs');
var escs = require("../virtuosity-server/node_modules/escs/index.js");
var debug = require('./debug.js');


canvases = new Map();
var new_canvas = function(name, config){
	var new_ctx = {
		ctx: document.createElement("canvas")
	}
	new_ctx.ctx.style.width = window.innerWidth + 'px';
	new_ctx.ctx.style.height = (window.innerHeight - 30) + 'px';
	new_ctx.ctx.style.top = '30px';
	new_ctx.ctx.style.outline = "none";
	document.getElementsByTagName('html')[0].appendChild(new_ctx.ctx);


	new_ctx.engine = new BABYLON.Engine(new_ctx.ctx, true, {preserveDrawingBuffer: true, stencil: true});

    // Create a basic BJS Scene object
    new_ctx.scene = new BABYLON.Scene(new_ctx.engine);
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    new_ctx.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), new_ctx.scene);
    // Target the camera to scene origin
    new_ctx.camera.setTarget(BABYLON.Vector3.Zero());

    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    new_ctx.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), new_ctx.scene);
    // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    new_ctx.sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, new_ctx.scene, false, BABYLON.Mesh.FRONTSIDE);
    // Move the sphere upward 1/2 of its height
    new_ctx.sphere.position.y = 1;
    // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
    new_ctx.ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, new_ctx.scene, false);
    // Return the created scene

	// run the render loop
	new_ctx.engine.runRenderLoop(function(){
	    new_ctx.scene.render();
	});
	// the canvas/window resize event handler
	window.addEventListener('resize', function(){
	    new_ctx.engine.resize();
	});


	canvases.set(name, new_ctx);
}







module.exports = {
	newCanvas: function(name, config){
		new_canvas(name, config);
	},
	expose: BABYLON
}