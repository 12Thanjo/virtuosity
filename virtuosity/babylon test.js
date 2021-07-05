var BABYLON = require('babylonjs');
require('babylonjs-loaders');
var debug = require('./debug.js');
var ocs = require('ocs');



var new_ctx = {
	ctx: document.createElement("canvas")
}
new_ctx.ctx.style.width = screen.width + 'px';
new_ctx.ctx.style.height = (screen.height) + 'px';
new_ctx.ctx.style.top = "0px";
new_ctx.ctx.style.outline = "none";

// console.log(document.getElementsByTagName('body')[0]);
document.getElementsByTagName('body')[0].appendChild(new_ctx.ctx);

var engine = new BABYLON.Engine(new_ctx.ctx);
var scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -10), scene);
var light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);

////////////////////////////////////////////////////////////////////////////////////////////
shadowGenerator = new BABYLON.ShadowGenerator(1024, light);

////////////////////////////////////////////////////////////////////////////////////////////


var square = BABYLON.Mesh.CreateBox("square", 2, scene);
square.rotation.x = -0.2;
square.rotation.y = -0.4;
shadowGenerator.getShadowMap().renderList.push(square);

var boxMaterial = new BABYLON.StandardMaterial("material", scene);
boxMaterial.emissiveColor = new BABYLON.Color3(0, 0.58, 0.86);
square.material = boxMaterial;

var torus = BABYLON.Mesh.CreateTorus("torus", 2, 0.5, 15, scene);
torus.position.x = -5;
torus.rotation.x = 1.5;

var torusMaterial = new BABYLON.StandardMaterial("material", scene);
torusMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.4);
torus.material = torusMaterial;

var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 2, 2, 2, 12, 1, scene);
cylinder.position.x = 5;
cylinder.rotation.x = -0.2;

var cylinderMaterial = new BABYLON.StandardMaterial("material", scene);
cylinderMaterial.emissiveColor = new BABYLON.Color3(1, 0.58, 0);
cylinder.material = cylinderMaterial;


var i = 0;
module.exports = function(x, y, z, w, l, h){
	var box = BABYLON.Mesh.CreateBox(i, 2, scene);
	box.material = boxMaterial;
	box.position.set(x, y, z);
	box.scaling.set(w,l,h);
	i += 1;
	return box;
}

foo = module.exports(0,-3,0,5,1,5);


var t = 0;
var renderLoop = function () {
    scene.render();
    t -= 0.01;
    square.rotation.y = t*2;
    torus.scaling.z = Math.abs(Math.sin(t*2))+0.5;
    cylinder.position.y = Math.sin(t*3);
};
engine.runRenderLoop(renderLoop);