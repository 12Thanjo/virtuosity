/*
* @name virtuosity
* @type head
* @description Virtuosity is a free, open source game engine that is puts all of the systems that I have built / found together in one easy place. It is designed to make game development faster and easer by automatically doing all of the annoying stuff. Virtuosity is designed for the intended use in <a href="https://www.electronjs.org/">Electron</a>.<h4>Rendering</h4>Virtuosity uses <a href="https://www.npmjs.com/package/babylonjs">Babylonjs 4.1</a> for 3d rendering and <a href="https://www.npmjs.com/package/phaser-ce">Phaser-CE 2.15.1</a> for 2d rendering. Phaser 3.x is more feature rich and suposedly performs better, however it is not equiped for some features that are neccesary for Virtuosity. Phaser-CE is still getting support as well. 
*/




var inputManager = require('./inputManager.js');
var virtuosity_server = require('../virtuosity-server/index.js');
var engine2d = require('./engine2d.js');
var babylon = require('babylonjs');

engine2d.import_inputManager(inputManager);
engine2d.import_collisionManager(virtuosity_server.collisionManager);
inputManager.import_engine2d(engine2d);


var setup_css = function(){
	var body = document.getElementsByTagName('body')[0].style;
	body.background = "#000000";
	body.margin = 0;
	body.backgroundColor = "#000000";
	body.overflowX = "hidden";
	body.overflowY = "hidden";
	body.position = 'relative';
	var canvas = document.getElementsByTagName('canvas');
	for(var i = canvas.length - 1; i>=0; i--){
		var ctx = canvas[i].style;
		ctx.position = "absolute";
		// ctx.top = "0px";
		// ctx.left = "0px";
	}
	
	var html = document.getElementsByTagName('*');
	for(var i = html.length - 1; i>=0; i--){
		var tag = html[i].style;
		tag.webkitTapHighlightColor = "rgba(255, 255, 255, 0) !important;";
		tag.outline = "none !important";
	}
	
}

module.exports = {
	/*
	* @name engine2d
	* @type obj
	* @description engine2d manages all of the graphics rendered in 2D. It uses <a href="https://www.npmjs.com/package/phaser-ce">Phaser-CE 2.15.1</a> for rendering. engine2d uses Phaser as a base and builds off of it to automatically interact with the rest of the engine, as well as adding custom functions for added features and ease of use for the already existing ones. Phaser can be accessed <a href="virtuosity.engine2d.html#expose">directly</a>, but it is only recommended if there is a specific feature that Phaser has that is not currently implemented into engine2d.
	* @path engine2d.js
	*/
	engine2d: engine2d,

	/*
	* @name engine3d
	* @type obj
	* @description 3d engine (coming soon...)
	*/
	engine3d: babylon,

	/*
	* @name inputManager
	* @type obj
	* @description Manages inputs for keyboard, mouse, and gamepad
	* @path InputManager.js
	*/
	inputManager: inputManager,

	/*
	* @name collisionManager
	* @type obj
	* @description Manages collisions
	* @path ../virtuosity-server/collisionManager.js
	*/
	collisionManager: virtuosity_server.collisionManager,


	/*
	* @name time
	* @type obj
	* @description Time
	* @path ../virtuosity-server/time.js
	*/
	time: virtuosity_server.time,


	/*
	* @name files
	* @type obj
	* @description files (work in progress)
	* @path ../virtuosity-server/files.js
	*/
	files: virtuosity_server.files,

	/*
	* @name multiThreading
	* @type obj
	* @description Runs another NodeJS program in a seperate thread.
	* @path ../virtuosity-server/multiThreading.js
	*/
	multiThreading: virtuosity_server.multiThreading,

	/*
	* @name setupCSS
	* @type method
	* @description Automatically sets up CSS to make sure everything works as intended.
	*/
	setupCSS: function(){
		setup_css();
	}
}
