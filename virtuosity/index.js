/*
* @name virtuosity
* @type head
* @description Virtuosity is a free, open source game engine that is puts all of the systems that I have built / found together in one easy place. It is designed to make game development faster and easer by automatically doing all of the annoying stuff. Virtuosity is designed for the intended use in <a href="https://www.electronjs.org/">Electron</a>.<h4>Rendering</h4><p>Virtuosity uses <a href="https://www.npmjs.com/package/babylonjs">Babylonjs 4.1</a> for 3d rendering and <a href="https://www.npmjs.com/package/pixi.js">Pixi 5.3.7</a> for 2d rendering. Virtuosity also uses <a href=https://www.npmjs.com/package/howler>howler.js 2.2.1</a> for audio.</p>
*/


const pixi = require("./pixi.js");
const inputManager = require("./inputManager.js");
const virtuosity_server = require('../virtuosity-server/index.js');
const audioManager = require("./audioManager.js");
const babylon = require('./babylon.js');


module.exports = {
	/*
	* @name engine2d
	* @type obj
	* @description engine2d manages all of the graphics rendered in 2D. It uses <a href="https://www.npmjs.com/package/pixi.js">Pixi 5.3.7</a> for rendering. engine2d uses Pixi.js as a base and builds off of it to automatically interact with the rest of the engine, as well as adding custom functions for added features and ease of use for the already existing ones.
	* @path pixi.js
	*/
	engine2d: pixi,

	
	engine3d: babylon,

	/*
	* @name audioManager
	* @type obj
	* @description audioManager manages all of the audio. <a href=https://www.npmjs.com/package/howler>howler.js 2.2.1</a>. audioManager uses hower.js as a base and builds off of it to automatically interact with the rest of the engine,
	* @path audioManager.js
	*/
	audioManager:audioManager,

	/*
	* @name inputManager
	* @type obj
	* @description Manages inputs for keyboard, mouse, and gamepad
	* @path InputManager.js
	*/
	inputManager: inputManager,

	/*
	* @name escs
	* @type obj
	* @description <a href="https://www.npmjs.com/package/escs">escs</a> is a custom implimentation of an entity component system.
	* @path ../../escs/index.js
	*/
	escs: virtuosity_server.escs,

	/*
	* @name collisionManager
	* @type obj
	* @description Manages collisions
	* @path ../virtuosity-server/collisionManager.js
	*/
	collisionManager: virtuosity_server.collisionManager,

	/*
	* @name files
	* @type obj
	* @description files (documentation is a work in progress)
	* @path ../virtuosity-server/files.js
	*/
	files: virtuosity_server.files,

	/*
	* @name time
	* @type obj
	* @description Time
	* @path ../virtuosity-server/time.js
	*/
	time: virtuosity_server.time,

	/*
	* @name multiThreading
	* @type obj
	* @description Runs another NodeJS program in a seperate thread.
	* @path ../virtuosity-server/multiThreading.js
	*/
	multiThreading: virtuosity_server.multiThreading,

	/*
	* @name string
	* @type obj
	* @description methods for manipulating strings
	* @path ../virtuosity-server/string.js
	*/
	string: virtuosity_server.string,
	
	/*
	* @name cmd
	* @type obj
	* @description helper functions for stylized printing to the console
	* @path ../virtuosity-server/cmd.js
	*/
	cmd: virtuosity_server.cmd
}