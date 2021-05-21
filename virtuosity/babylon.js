var BABYLON = require('babylonjs');
require('babylonjs-loaders');
var debug = require('./debug.js');
var ocs = require('ocs');


canvases = new Map();
var get_canvas = function(canvas){
	if(canvases.has(canvas)){
		return canvases.get(canvas);
	}else{
		throw new ReferenceError(`engine3d canvas (${canvas}) is not defined`);
	}
}

var new_canvas = function(name, config){
	var new_ctx = {
		ctx: document.createElement("canvas")
	}
	new_ctx.ctx.style.width = screen.width + 'px';
	new_ctx.ctx.style.height = (screen.height) + 'px';
	new_ctx.ctx.style.top = "0px";
	new_ctx.ctx.style.outline = "none";
	new_ctx.ctx.id = "ctx";
	new_ctx.ctx.style.zIndex = 0;
	Object.defineProperty(new_ctx, "zIndex", {
	    get: ()=>{
	        return new_ctx.ctx.style.zIndex;
	    }, set: (val)=>{
	        new_ctx.ctx.style.zIndex = val;
	    }
	});
	

	new_ctx.hasMouse = false;

	if(config.pointerLock == true){
		document.getElementsByTagName('body')[0].onclick = (e)=>{
			new_ctx.hasMouse = true;
			document.getElementsByTagName('body')[0].requestPointerLock()
		}

		new_ctx.releasePointerLock = function(e){
			document.exitPointerLock();
		}

		document.addEventListener('pointerlockchange', ()=>{
			if(document.pointerLockElement != new_ctx.ctx){
				new_ctx.hasMouse = false;
			}
		}, false);
	}
	document.getElementsByTagName('body')[0].appendChild(new_ctx.ctx);



	if(config.antialias == null){
		config.antialias = true;
	}

	if(config.resolution == null){
		config.resolution = 1;
	}else{
		config.resolution /= screen.height;
	}

	var scale = 1;
	if(config.defaultResolution != null){
	    scale = screen.height / config.defaultResolution;
	}


	new_ctx.engine = new BABYLON.Engine(new_ctx.ctx, config.antialias, {preserveDrawingBuffer: true, stencil: true});
	new_ctx.engine.setHardwareScalingLevel(1 / (config.resolution * scale));
	new_ctx.scene = new BABYLON.Scene(new_ctx.engine);
	new_ctx.scene.clearColor = new BABYLON.Color3(0,0.75,1);
	
	new_ctx.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), new_ctx.scene);
	new_ctx.camera.setTarget(BABYLON.Vector3.Zero());





	canvases.set(name, new_ctx);

	loader.setup_assetsManager(new_ctx, config, ()=>{
		if(config.create != null){
		    config.create();
		}

		if(config.update == null){
		    config.update = ()=>{};
		}
		if(config.render == null){
		    config.render = ()=>{};
		}

		new_ctx.update_events = new Map();
		new_ctx.render_events = new Map();

		if(config.update != null){
		    new_ctx.update_events.set('config', config.update);
		}

		if(config.render != null){
		    new_ctx.render_events.set('config', config.render);
		}


	    


	    new_ctx.fpsTimer = process.hrtime();
	    new_ctx.fpsMax = -Infinity;
	    new_ctx.fpsMin = Infinity;
	    new_ctx.fpsBoundsWaitCounter = 120;
	    new_ctx.fps = 0;


	    var MAXSAMPLES = config.fpsBuffer ?? 1000;

	    new_ctx.tickindex = 0;
	    new_ctx.ticksum = 0;
	    new_ctx.ticklist = [MAXSAMPLES];
	    new_ctx.ticklist_size = 0;
	    new_ctx.fpsAvg = 0;

	    new_ctx.calcAverageTick = function(newtick){
	        if(new_ctx.ticklist_size == MAXSAMPLES){
	            new_ctx.ticksum -= new_ctx.ticklist[new_ctx.tickindex];  /* subtract value falling off */
	        }else{
	            new_ctx.ticklist_size += 1;
	        }
	        new_ctx.ticksum += newtick;              /* add new value */
	        new_ctx.ticklist[new_ctx.tickindex] = newtick;   /* save new value so it can be subtracted later */
	        new_ctx.tickindex += 1;
	        if(new_ctx.tickindex == MAXSAMPLES){/* inc buffer index */
	            new_ctx.tickindex = 0;
	        }    

	        /* return average */
	        if(new_ctx.ticklist_size == MAXSAMPLES){
	            return Math.floor(new_ctx.ticksum/MAXSAMPLES);
	        }else{
	            return Math.floor(new_ctx.ticksum/new_ctx.ticklist_size);
	        }
	    }


	    new_ctx.update = setInterval(()=>{
	        new_ctx.update_events.forEach((event)=>{
	            event();
	        });
	    }, 1000/(config.poll ?? 64));


		// run the render loop
		new_ctx.engine.runRenderLoop(function(){
			var diff = process.hrtime(new_ctx.fpsTimer);
			new_ctx.fps = Math.floor(1e9 / (diff[0] * 1e9 + diff[1]));
			new_ctx.fpsAvg = new_ctx.calcAverageTick(new_ctx.fps);
			if(new_ctx.fpsBoundsWaitCounter == 0){
			    if(new_ctx.fps > new_ctx.fpsMax){
			        new_ctx.fpsMax = new_ctx.fps;
			    }
			    if(new_ctx.fps < new_ctx.fpsMin){
			        new_ctx.fpsMin = new_ctx.fps;
			    }
			}else{
			    new_ctx.fpsBoundsWaitCounter -= 1;
			}
			new_ctx.fpsTimer = process.hrtime();
		    new_ctx.scene.render();

		    new_ctx.render_events.forEach((event)=>{
		    	event();
		    });
		});
		// the canvas/window resize event handler
		window.addEventListener('resize', function(){
		    new_ctx.engine.resize();
		});
	});

	
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
* @name engine3d
* @type environment
*/
var env = new ocs.Environment('engine3d');

/*
* @name babylon
* @type component
* @description reference to the render object
* @env engine3d
* @param {babylon}{Babylonjs object}{reference to the babylon render object (internal)}
*/
new ocs.Component('engine3d', 'babylon', (babylon)=>{
    return{
        babylon: babylon
    }
});



/*
* @name position
* @type component
* @description position of the render object
* @env engine3d
* @param {x}{Number}{x coordinate of the render object}{0}
* @param {y}{Number}{y coordinate of the render object}{0}
* @param {z}{Number}{z coordinate of the render object}{0}
*/
var position = new ocs.Component('engine3d', "position", (x, y, z)=>{
    return new ocs.EEO({
        x: x ?? 0,
        y: y ?? 0,
        z: z ?? 0
    }, (entity, key, val)=>{
    	entity.babylon.position[key] = val;
    });
});



/*
* @name rotation
* @type component
* @description rotation of the render object
* @env engine3d
* @param {x}{Number}{x rotation of the render object}{0}
* @param {y}{Number}{y rotation of the render object}{0}
* @param {z}{Number}{z rotation of the render object}{0}
*/
var rotation = new ocs.Component('engine3d', "rotation", (x, y, z)=>{
    return {
    	rotation: new ocs.EEO({
		        x: x ?? 0,
		        y: y ?? 0,
		        z: z ?? 0
		    }, (entity, key, val)=>{
		    	entity.babylon.rotation[key] = val;
		    })
    };
});

/*
* @name scale
* @type component
* @description scale of the render object
* @env engine3d
* @param {width}{Number}{width of the render object}{1}
* @param {lenght}{Number}{lenght of the render object}{1}
* @param {height}{Number}{height of the render object}{1}
*/
var scale = new ocs.Component('engine3d', "scale", (width, lenght, height)=>{
    return new ocs.EEO({
        width: width ?? 1,
        length: length ?? 1,
        height: height ?? 1
    }, (entity, key, val)=>{
		if(key == "width"){
	    	entity.babylon.scaling.x = val;
		}else if(key == "height"){
			entity.babylon.scaling.z = val;
		}else if(key == "length"){
			entity.babylon.scaling.y = val;
		}
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
* @name Box
* @type entity
* @description  A procedurally generated engine3d box
* @env engine3d
* @component babylon
* @component position
* @component rotation
* @component scale
*/
new ocs.Tag('box');
var boxes = new Map();
var add_box = function(canvas, name, x, y, z, onComplete){
	var ctx = get_canvas(canvas);
	var new_box = new BABYLON.Mesh.CreateBox(name, 1, ctx.scene);
	new_box.position.set(x, z, y);

	var new_entity = new ocs.Entity('engine3d', name);
	new_entity.addComponent('babylon', new_box)
			  .addComponent('position', x, y, z)
			  .addComponent('rotation')
			  .addComponent('scale')
			  .addTag('box')


	boxes.set(name, new_entity);

	if(onComplete != null){
		onComplete(new_entity);
	}
}

/*
* @name Sphere
* @type entity
* @description  A procedurally generated engine3d sphere
* @env engine3d
* @component babylon
* @component position
* @component rotation
* @component scale
*/
new ocs.Tag('sphere');
var spheres = new Map();
var add_sphere = function(canvas, name, x, y, z, indicies, onComplete){
	var ctx = get_canvas(canvas);
	var new_sphere = new BABYLON.Mesh.CreateSphere(name, indicies, 1, ctx.scene);
	new_sphere.position.set(x, z, y);

	var new_entity = new ocs.Entity('engine3d', name);
	new_entity.addComponent('babylon', new_sphere)
			  .addComponent('position', x, y, z)
			  .addComponent('rotation')
			  .addComponent('scale')
			  .addTag('sphere')


	spheres.set(name, new_entity);

	if(onComplete != null){
		onComplete(new_entity);
	}
}

/*
* @name Plane
* @type entity
* @description  A procedurally generated engine3d plane
* @env engine3d
* @component babylon
* @component position
* @component rotation
* @component scale
*/
new ocs.Tag('plane');
var planes = new Map();
var add_plane = function(canvas, name, x, y, z, onComplete){
	var ctx = get_canvas(canvas);
	var new_plane = new BABYLON.Mesh.CreatePlane(name, 1, ctx.scene);
	new_plane.position.set(x, z, y);

	var new_entity = new ocs.Entity(name, 'engine3d');
	new_entity.addComponent('babylon', new_plane)
			  .addComponent('position', x, y, z)
			  .addComponent('rotation')
			  .addComponent('scale')
			  .addTag('plane')


	planes.set(name, new_entity);

	if(onComplete != null){
		onComplete(new_entity);
	}
}




/*
* @name Mesh
* @type entity
* @description  A procedurally generated engine3d plane
* @env engine3d
* @component babylon
* @component position
* @component rotation
* @component scale
*/
new ocs.Tag('mesh');
var meshes = new Map();
var add_mesh = function(canvas, name, x, y, z, key, onComplete){
	var ctx = get_canvas(canvas);
	var new_mesh = ctx.mesh_cache.get(key).clone();
	new_mesh.setEnabled(true);
	new_mesh.position.set(x, z, y);

	var new_entity = new ocs.Entity(name, 'engine3d')
	new_entity.addComponent('babylon', new_mesh)
			  .addComponent('position', x, y, z)
			  .addComponent('rotation')
			  .addComponent('scale')
			  .addTag('mesh')


	meshes.set(name, new_entity);

	if(onComplete != null){
		onComplete(new_entity);
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////

var materials = require("./babylon/materials.js");
var loader = require('./babylon/loader.js');
var lights = require('./babylon/lights.js');
/*
* @name Light
* @type return
* @description engine3d point light source
* @path ./babylon/lights.js
*/

module.exports = {
	/*
	* @name load
	* @type obj
	* @description load assets into engine3d cache
	*/
	load: {
		/*
		* @name addToLoadQueue
		* @type method
		* @description add an asset to the load queue
		* @parent load
		* @param {canvas}{String}{name of the canvas to add to cache}
		* @param {name}{String}{unique name of the mesh asset}
		* @param {path}{String}{path to the mesh (supports relative path)}
		*/
		addToLoadQueue: loader.add_task,

		/*
		* @name loadQueueSize
		* @type method
		* @description get the size of the load queue of an engine3d canvas
		* @parent load
		* @param {canvas}{String}{name of the canvas}
		*/
		loadQueueSize: (canvas)=>{
			return canvases.get(canvas).load_queue.size;
		}
	},
	/*
	* @name add
	* @type obj
	* @description add engine3d entities
	*/
	add: {
		/*
		* @name box
		* @type method
		* @description add a box
		* @parent add
		* @param {canvas}{String}{Name of the canvas to add to}
		* @param {name}{String}{unique name of the box}
		* @param {x}{Number}{x position of the box}
		* @param {y}{Number}{y position of the box}
		* @param {z}{Number}{z position of the box}
		* @param {onComplete}{Function}{function to run after adding the canvas (takes the newly create canvas as a parameter)}
		*/
		box: (...params)=>{
			add_box(...params);
		},

		/*
		* @name sphere
		* @type method
		* @description add a sphere
		* @parent add
		* @param {canvas}{String}{Name of the canvas to add to}
		* @param {name}{String}{unique name of the sphere}
		* @param {x}{Number}{x position of the sphere}
		* @param {y}{Number}{y position of the sphere}
		* @param {z}{Number}{z position of the sphere}
		* @param {indicies}{Int}{Number of indicies the sphere has}
		* @param {onComplete}{Function}{function to run after adding the sphere (takes the newly create sphere as a parameter)}
		*/
		sphere: (...params)=>{
			add_sphere(...params);
		},

		/*
		* @name plane
		* @type method
		* @description add a plane
		* @parent add
		* @param {canvas}{String}{Name of the canvas to add to}
		* @param {name}{String}{unique name of the plane}
		* @param {x}{Number}{x position of the plane}
		* @param {y}{Number}{y position of the plane}
		* @param {z}{Number}{z position of the plane}
		* @param {onComplete}{Function}{function to run after adding the plane (takes the newly create plane as a parameter)}
		*/
		plane: (...params)=>{
			add_plane(...params);
		},

		/*
		* @name material
		* @type obj
		* @description create a material to add to visibile engine3d entities
		* @parent add
		* @path ./babylon/materials.js
		*/
		material: {
			/*
			* @name basic
			* @type method
			* @description add basic material
			* @parent add.material
			* @param {canvas}{String}{Name of the canvas to add to}
			* @param {name}{String}{unique name of the material}
			* @param {onComplete}{Function}{function to run after adding the image (takes the newly create image as a parameter)}
			*/
			basic: (...params)=>{
				new materials.MaterialBasic(...params);
			},

			/*
			* @name metalic
			* @type method
			* @description add metalic material
			* @parent add.material
			* @param {canvas}{String}{Name of the canvas to add to}
			* @param {name}{String}{unique name of the material}
			* @param {onComplete}{Function}{function to run after adding the image (takes the newly create image as a parameter)}
			*/
			metallic: (...params)=>{
				new materials.MaterialMetallic(...params);
			},

			/*
			* @name glossy
			* @type method
			* @description add glossy material
			* @parent add.material
			* @param {canvas}{String}{Name of the canvas to add to}
			* @param {name}{String}{unique name of the material}
			* @param {onComplete}{Function}{function to run after adding the image (takes the newly create image as a parameter)}
			*/
			glossy: (...params)=>{
				new materials.MaterialGlossy(...params);
			},

			canvas: (...params)=>{
				new materials.MaterialCanvas(...params);
			}
		},


		/*
		* @name light
		* @type method
		* @description add a light
		* @parent add
		* @param {canvas}{String}{Name of the canvas to add to}
		* @param {name}{String}{unique name of the light}
		* @param {x}{Number}{x position of the light}
		* @param {y}{Number}{y position of the light}
		* @param {z}{Number}{z position of the light}
		* @param {onComplete}{Function}{function to run after adding the light (takes the newly create light as a parameter)}
		*/
		light: (...params)=>{
			new lights.Light(...params);
		},

		/*
		* @name mesh
		* @type method
		* @description add a mesh 
		* @parent add
		* @param {canvas}{String}{Name of the canvas to add to}
		* @param {name}{String}{unique name of the mesh}
		* @param {x}{Number}{x position of the mesh}
		* @param {y}{Number}{y position of the mesh}
		* @param {z}{Number}{z position of the mesh}
		* @param {key}{String}{key of the loaded mesh asset}
		* @param {onComplete}{Function}{function to run after adding the mesh (takes the newly create mesh as a parameter)}
		*/
		mesh: (...params)=>{
			add_mesh(...params);
		}
	},

	/*
	* @name get
	* @type obj
	* @description get engine2d entites
	*/
	get: {
		/*
		* @name camera
		* @type method
		* @description get the camera of a canvas
		* @parent get
		* @param {canvas}{String}{name of the canvas}
		*/
		camera: (canvas)=>{
			return canvases.get(canvas).camera;
		},
		
		/*
		* @name box
		* @type method
		* @description get a specific box
		* @parent get
		* @param {name}{String}{name of the box}
		*/			
		box: (name)=>{
			return boxes.get(name);
		},
		
		/*
		* @name sphere
		* @type method
		* @description get a specific sphere
		* @parent get
		* @param {name}{String}{name of the sphere}
		*/	
		sphere: (name)=>{
			return spheres.get(name);
		},
		
		/*
		* @name plane
		* @type method
		* @description get a specific plane
		* @parent get
		* @param {name}{String}{name of the plane}
		*/	
		plane: (name)=>{
			return planes.get(name);
		},
		
		/*
		* @name material
		* @type method
		* @description get a specific material
		* @parent get
		* @param {name}{String}{name of the material}
		*/	
		material: (name)=>{
			return materials.get(name);
		},

	},
	/*
	* @name performance
	* @type obj
	* @description get statistics on the performance
	*/
	performance: {
	    /*
	    * @name fps
	    * @type method
	    * @description frames per second
	    * @parent performance
	    * @param {canvas}{String}{name of the canvas to get fps from}
	    */
	    fps: (canvas)=>{
	        return canvases.get(canvas).fps;
	    },

	    /*
	    * @name fpsMin
	    * @type method
	    * @description minimum frames per second so far
	    * @parent performance
	    * @param {canvas}{String}{name of the canvas to get fpsMin from}
	    */
	    fpsMin: (canvas)=>{
	        return canvases.get(canvas).fpsMin;
	    },

	    /*
	    * @name fpsMax
	    * @type method
	    * @description maximum frames per second so far
	    * @parent performance
	    * @param {canvas}{String}{name of the canvas to get fpsMax from}
	    */
	    fpsMax: (canvas)=>{
	        return canvases.get(canvas).fpsMax;
	    },

	    /*
	    * @name fpsAvg
	    * @type method
	    * @description average frames per second over the canvas fpsBuffer
	    * @parent performance
	    * @param {canvas}{String}{name of the canvas to get fpsAvg from}
	    */
	    fpsAvg: (canvas)=>{
	        return canvases.get(canvas).fpsAvg;
	    }
	},
	/*
	* @name update
	* @type obj
	* @description update function
	*/
	update: {
	    /*
	    * @name add
	    * @type method
	    * @description add an event to the update function
	    * @parent update
	    * @param {canvas}{String}{name of canvas to add event to update function}
	    * @param {name}{String}{unique name of the update event}
	    * @param {event}{Function}{event to add to update function}
	    */
	    add: function(canvas, name, event){
	        canvases.get(canvas).update_events.set(name, event);
	    },

	    /*
	    * @name remove
	    * @type method
	    * @description remove an event from the update function
	    * @parent update
	    * @param {canvas}{String}{name of canvas to remove event from update function}
	    * @param {name}{String}{name of the update event}
	    */
	    remove: function(canvas, name){
	        canvases.get(canvas).update_events.delete(name);
	    }
	},

	/*
	* @name render
	* @type obj
	* @description render function
	*/
	render: {
	    /*
	    * @name add
	    * @type method
	    * @description add an event to the render function
	    * @parent render
	    * @param {canvas}{String}{name of canvas to add event to render function}
	    * @param {name}{String}{unique name of the render event}
	    * @param {event}{Function}{event to add to render function}
	    */
	    add: function(canvas, name, event){
	        canvases.get(canvas).render_events.set(name, event);
	    },

	    /*
	    * @name remove
	    * @type method
	    * @description remove an event from the render function
	    * @parent render
	    * @param {canvas}{String}{name of canvas to remove event from render function}
	    * @param {name}{String}{name of the render event}
	    */
	    remove: function(canvas, name){
	        canvases.get(canvas).render_events.delete(name);
	    }
	},
	/*
	* @name newCanvas
	* @type method
	* @description creates a new engine 2d canvas
	* @param {name}{String}{unique name of the canvas}
	* @param {config}{Object}{options to configure the canvas}
	*/
	/*
	* @name config
	* @type config
	* @description Properties to configure the canvas. All properties are optional.
	* @parent newCanvas
	* @param {resolution}{Int}{height resolution of the canvas}{actual client screen resolution}
	* @param {defaultResolution}{Int}{sets the resolution for auto scaling. Common practise is to use the screen resolution used in development}{actual client screen resolution}
	* @param {antialias}{Boolean}{whether to use antialiasing}{true}
	* @param {poll}{Int}{Polling rate of the update function. The update function will run this many times per second}{64}
	* @param {fpsBuffer}{Int}{sets the maximum samples used to calculate average FPS}{1000}
	* @param {preload}{Function}{function to run when loading assets. Assets can be loaded and unloaded later if you want, but main assets should be loaded here.}
	* @param {create}{Function}{function to run while creating the scene}
	* @param {update}{Function}{update function which runs at a constant polling rate set by the poll property}
	* @param {render}{Function}{render function which runs as fast as possible and is tied to framerate}
	*
	*/
	newCanvas: function(name, config){
		return new_canvas(name, config);
	},

	/*
	* @name zIndex
	* @type method
	* @description get / set the zIndex of a canvas
	* @param {canvas}{String}{name of the canvas}
	* @param {zIndex}{Int}{<b>(Optional)</b> the value to set the z index}
	*/
	zIndex: function(canvas, zIndex){
	    var ctx = get_canvas(canvas);
	    if(zIndex != null){
	        ctx.zIndex = zIndex;
	    }
	    return ctx.zIndex;
	},

	/*
	* @name expose
	* @type method
	* @description interact with the Babylonjs render engine directly
	*/
	expose: BABYLON
}