var phaser;
var window_location = window.location.pathname.substr(1, window.location.pathname.length-12);
var engine2d;


var update_funcs = new Map();
var addToUpdate = function(name, func){
	update_funcs.set(name, func);
}

var removeFromUpdate = function(name){
	update_funcs.delete(name);
}

internal_update_funcs = new Map();
var add_to_internal_update = function(name, func){
	internal_update_funcs.set(name, func);
}

var remove_from_internal_update = function(name){
	internal_update_funcs.delete(name);
}
var update = function(){
	update_funcs.forEach((func)=>{
		func();
	});

	internal_update_funcs.forEach((func)=>{
		func();
	});


	// textboxes
	if(inputManager.mouse.left.release()){
		var focussed_tb = false;
		textboxes.forEach((textbox)=>{
			var ctx = canvases.get(textbox.DATA.canvas);
			if(collisionManager.collision.boxPoint(textbox.BOX.collision, collisionManager.shape.Point(inputManager.mouse.x - ctx.x, inputManager.mouse.y - ctx.y))){
				textbox.focused = true;
				inputManager.keyboard.textInput.set(textbox.text);
				inputManager.keyboard.textInput.focus((val)=>{
	                textbox.text = val;
	                var temp_text = textbox.TEXT.TEXT.text;
	                if(temp_text.substr(temp_text.length-3, temp_text.length-1) == "..." && temp_text.substr(0, 3) == "..."){
	                	textbox.TEXT.TEXT.text = temp_text.substr(0, temp_text.length-3);
	                	textbox.CURSOR.x = textbox.x + 5 + (textbox.TEXT.TEXT.width);

		                textbox.SELECTED.x = textbox.x + 5 + (textbox.TEXT.TEXT.width);
		                textbox.SELECTED.width = textbox.CURSOR.x - textbox.SELECTED.x;
		                textbox.TEXT.TEXT.text = temp_text;
	                }else{
	                	textbox.TEXT.TEXT.text = temp_text.substr(0, inputManager.keyboard.textInput.cursorEnd);
	                	textbox.CURSOR.x = textbox.x + 5 + (textbox.TEXT.TEXT.width);

		                textbox.TEXT.TEXT.text = temp_text.substr(0, inputManager.keyboard.textInput.cursorStart);
		                textbox.SELECTED.x = textbox.x + 5 + (textbox.TEXT.TEXT.width);
		                textbox.SELECTED.width = textbox.CURSOR.x - textbox.SELECTED.x;
		                textbox.TEXT.TEXT.text = temp_text;
	                }
	            });
	            focussed_tb = true;
			}else{
				textbox.focused = false;
				if(!focussed_tb){
					inputManager.keyboard.textInput.blur();
					inputManager.keyboard.textInput.clear();
				}
			}
		});
	}
}


var scaling = 1;





var on_finish_loading = [];
var add_to_on_finish_loading = function(func){
	on_finish_loading.push(func);
}


var inputManager;
var import_inputManager = function(im){
	inputManager = im;
}

var collisionManager;
var import_collisionManager = function(cm){
	collisionManager = cm;
}

var graphics;
var loaded = false;
var load_count = 0;
var engine2d_started = false;

var canvases = new Map();
var addToRender = function(name, func){
	canvases.get(canvas).render.set(name, func);
}

var removeFromRender = function(name){
	canvases.get(canvas).render.delete(name);
}
var created_canvas = false;
var create_canvas = function(name, options){
	window.PIXI = require('phaser-ce/build/custom/pixi');
	window.p2 = require('phaser-ce/build/custom/p2');
	window.Phaser = require('phaser-ce/build/custom/phaser-split');
	phaser = require('phaser-ce');

	graphics = require('./engine2d graphics.js');

	if(options.width == null){
		options.width = screen.width;
	}

	if(options.height == null){
		options.height = screen.height;
	}

	var dom;

	engine2d = new phaser.Game(options.width, options.height, Phaser.WEBGL, 'phaser', {
		preload: ()=>{
			graphics.import_libs({
				inputManager: inputManager,
				engine2d: engine2d,
				collisionManager: collisionManager
			});
			if(options.load != null){
				options.load();
			}
		    engine2d.load.onFileComplete.add(()=>{
		        load_count -= 1;
		        if(load_count == 0){
		        	loaded = true;
		        	on_finish_loading.forEach((func)=>{
		        		func();
		        	});
		        	on_finish_loading = [];
		        }
		    });
		},
		create: ()=>{
			engine2d_started = true;
			engine2d.raf.start();
			engine2d.time.desiredFps = 1000;
			var dom_canvases = document.getElementsByTagName('canvas');
			dom = dom_canvases[dom_canvases.length - 1];
			dom.style.position = "absolute";
			dom.style.left = options.x + "px";
			dom.style.top = options.y + "px";
			canvases.get(name).dom = dom;

			if(!created_canvas){
				created_canvas = true;
				if(options.poll != null){
					setInterval(update,1000/options.poll);
				}else{
					setInterval(update,1000/64);
				}
			}

			if(options.create != null){
				options.create();
			}
		},
		update: ()=>{
			var ctx = canvases.get(name);
			if(ctx.visible){
				ctx.render.forEach((func)=>{
					func();
				});
			}
		},
		render: ()=>{

		}
	});

	if(options.x == null){
		options.x = 0;
	}

	if(options.y == null){
		options.y = 0;
	}	

	canvases.set(name, {
		canvas: engine2d,
		name: name,
		render: new Map(),
		visible: true,
		x: options.x,
		y: options.y
	});

	canvas = name;
}

var canvas;
var set_canvas = function(cnvs){
	var ctx = canvases.get(cnvs);
	if(ctx != null){
		engine2d = canvases.get(cnvs).canvas;
		canvas = cnvs;
		graphics.import_libs({
			inputManager: inputManager,
			engine2d: engine2d,
			collisionManager: collisionManager
		});
	}else{
		console.error("Canvas (" + cnvs + ") does not exist");
		process.end();
	}
}

var addToLoadQueue = function(type, key, path, width, height){
	if(type == "image"){
		engine2d.load.image(key, path);
	}else if(type == "spritesheet"){
		engine2d.load.spritesheet(key, path, width, height);
	}else if(type == "audio"){
		engine2d.load.audio(key, path);
	}
	load_count += 1;
}

var load = function(){
	if(engine2d_started && loaded){
		loaded = false;
		engine2d.load.start();
	}
}


var uncache_image = function(key){
	engine2d.cache.removeImage(key);	
}


var uncache_audio = function(key){
	phaser.cache.removeSound(key);
}



// state
var load_state = function(path){
	// load the state
}


/*
* @name Image
* @type return
* @description Creates an image that uses a <a href="virtuosity.engine2d.addToLoadQueue.html">loaded</a> texture of either an image or spritesheet.
* @param {y}{Int}{y position of the image}
* @param {key}{String}{image key of the loaded texture}
*/
var Image = function(name, x, y, key){
	/*
	* @name name
	* @type property
	* @description unique name of the image
	* @parent Image
	*/
	Object.defineProperty(this, 'name', {
		get: ()=>{
			return name;
		}
	});

	/*
	* @name key
	* @type property
	* @description loaded image texture key
	* @parent Image
	*/
	Object.defineProperty(this, 'key', {
		get: ()=>{
			return key;
		}
	});
	this.IMAGE = engine2d.add.image(x*scaling, y*scaling, key);
	this.IMAGE.width *= scaling;
	this.IMAGE.height *= scaling;


	/*
	* @name x
	* @type property
	* @description x position of the image
	* @parent Image
	*/
	Object.defineProperty(this, 'x', {
        get: (x)=>{
            return this.IMAGE.x / scaling;
        },
        set: (x)=>{
            this.IMAGE.x = x*scaling;
        }
    });


    /*
	* @name y
	* @type property
	* @description y position of the image
	* @parent Image
	*/
	Object.defineProperty(this, 'y', {
        get: (y)=>{
            return this.IMAGE.y/scaling;
        },
        set: (y)=>{
            this.IMAGE.y = y*scaling;
        }
    });



	/*
	* @name width
	* @type property
	* @description width of the image
	* @parent Image
	*/
	Object.defineProperty(this, 'width', {
        get: (width)=>{
            return this.IMAGE.width/scaling;
        },
        set: (width)=>{
            this.IMAGE.width = width*scaling;
        }
    });

    /*
	* @name height
	* @type property
	* @description height of the image
	* @parent Image
	*/
	Object.defineProperty(this, 'height', {
        get: (height)=>{
            return this.IMAGE.height/scaling;
        },
        set: (height)=>{
            this.IMAGE.height = height*scaling;
        }
    });



	/*
	* @name rotation
	* @type property
	* @description rotation of the image
	* @parent Image
	*/
	Object.defineProperty(this, 'rotation', {
        get: (rotation)=>{
            return this.IMAGE.rotation;
        },
        set: (rotation)=>{
            this.IMAGE.rotation = rotation;
        }
    });


	/*
	* @name alpha
	* @type property
	* @description alpha of the image
	* @parent Image
	*/
	Object.defineProperty(this, 'alpha', {
        get: (alpha)=>{
            return this.IMAGE.alpha;
        },
        set: (alpha)=>{
            this.IMAGE.alpha = alpha;
        }
    });

	/*
	* @name frame
	* @type property
	* @description frame of the image (only applies if the image uses a spritesheet texture)
	* @parent Image
	*/
	Object.defineProperty(this, 'frame', {
        get: (frame)=>{
            return this.IMAGE.frame;
        },
        set: (frame)=>{
            this.IMAGE.frame = frame;
        }
    });


    /*
	* @name anchor
	* @type obj
	* @description anchor point of the image
	* @parent Image
	*/
	this.anchor = {};

	/*
	* @name x
	* @type property
	* @description x value of the anchor point [0, 1]
	* @parent Image.anchor
	*/
	Object.defineProperty(this.anchor, 'x', {
        get: ()=>{
            return this.IMAGE.anchor.x;
        },
        set: (x)=>{
            this.IMAGE.anchor.x = x;
        }
    });


	/*
	* @name y
	* @type property
	* @description y value of the anchor point [0, 1]
	* @parent Image.anchor
	*/
	Object.defineProperty(this.anchor, 'y', {
        get: ()=>{
            return this.IMAGE.anchor.y;
        },
        set: (y)=>{
            this.IMAGE.anchor.y = y;
        }
    });



	this.destroy = function(){
		this.IMAGE.destroy();
	}
}


/*
* @name Text
* @type return
* @description Creates an text object
* @param {y}{Int}{y position of the text}
* @param {text}{String}{text to display}
* @param {fontSize}{Int}{font size of the text}
*/
var Text = function(name, x, y, text, fontSize){
	Object.defineProperty(this, 'name', {
		get: ()=>{
			return name;
		}
	});
	this.TEXT = engine2d.add.text(x*scaling, y*scaling, text, {font: "Trebuchet MS", fontSize: fontSize, fill: '#FFFFFF'});

	/////////////////////////////////////////////////
	/*
	* @name x
	* @type property
	* @description x position of the text
	* @parent Text
	*/
	Object.defineProperty(this, 'x', {
        get: ()=>{
            return this.TEXT.x*scaling;
        },
        set: (x)=>{
            this.TEXT.x = x/scaling;
        }
    });


    /*
	* @name y
	* @type property
	* @description y position of the text
	* @parent Text
	*/
	Object.defineProperty(this, 'y', {
        get: ()=>{
            return this.TEXT.y*scaling;
        },
        set: (y)=>{
            this.TEXT.y = y/scaling;
        }
    });



    /*
	* @name rotation
	* @type property
	* @description rotation of the text
	* @parent Text
	*/
	Object.defineProperty(this, 'rotation', {
        get: ()=>{
            return this.TEXT.rotation*scaling;
        },
        set: (rotation)=>{
            this.TEXT.rotation = rotation/scaling;
        }
    });



    /*
	* @name fontSize
	* @type property
	* @description y position of the text
	* @parent Text
	*/
	Object.defineProperty(this, 'fontSize', {
        get: ()=>{
            return this.TEXT.fontSize*scaling;
        },
        set: (fontSize)=>{
            this.TEXT.fontSize = fontSize/scaling;
        }
    });

	/*
	* @name color
	* @type property
	* @description color of the text
	* @parent Text
	*/
	Object.defineProperty(this, 'color', {
        get: ()=>{
            return this.TEXT.fill;
        },
        set: (color)=>{
            this.TEXT.fill = color;
        }
    });

    /*
	* @name alpha
	* @type property
	* @description alpha of the text
	* @parent Text
	*/
	Object.defineProperty(this, 'alpha', {
        get: ()=>{
            return this.TEXT.alpha;
        },
        set: (alpha)=>{
            this.TEXT.alpha = alpha;
        }
    });

	/*
	* @name outlineColor
	* @type property
	* @description outline color of the text
	* @parent Text
	*/
	Object.defineProperty(this, 'outlineColor', {
        get: ()=>{
            return this.TEXT.stroke;
        },
        set: (outlineColor)=>{
            this.TEXT.stroke = outlineColor;
        }
    });

    /*
	* @name outlineThickness
	* @type property
	* @description outline thickness of the text
	* @parent Text
	*/
	Object.defineProperty(this, 'outlineThickness', {
        get: ()=>{
            return this.TEXT.strokeThickness;
        },
        set: (outlineThickness)=>{
            this.TEXT.strokeThickness = outlineThickness;
        }
    });

	/*
	* @name text
	* @type property
	* @description The string of text of the Text
	* @parent Text
	*/
    Object.defineProperty(this, 'text', {
    	get: ()=>{
    		return this.TEXT.text;
    	},
    	set: (text)=>{
    		this.TEXT.text = text;
    	}
    });


    /*
	* @name anchor
	* @type obj
	* @description anchor point of the TEXT
	* @parent Text
	*/
	this.anchor = {};

	/*
	* @name x
	* @type property
	* @description x value of the anchor point [0, 1]
	* @parent Text.anchor
	*/
	Object.defineProperty(this.anchor, 'x', {
        get: (x)=>{
            return this.TEXT.anchor.x;
        },
        set: (x)=>{
            this.TEXT.anchor.x = x;
        }
    });


	/*
	* @name y
	* @type property
	* @description y value of the anchor point [0, 1]
	* @parent Text.anchor
	*/
	Object.defineProperty(this.anchor, 'y', {
        get: (y)=>{
            return this.TEXT.anchor.y;
        },
        set: (y)=>{
            this.TEXT.anchor.y = y;
        }
    });


	/*
	* @name alignment
	* @type property
	* @description alignment of text ('left', 'center', 'right')
	* @parent Text
	*/
    Object.defineProperty(this, 'alignment', {
    	get: ()=>{
    		return this.TEXT.align;
    	}, set: (val)=>{
    		this.TEXT.align = val;
    	}
    })


    this.destroy = function(){
		this.TEXT.destroy();
	}
}


/*
* @name Audio
* @type return
* @description Creates an audio object
*/
var Audio = function(name, key){
    Object.defineProperty(this, 'name', {
    	get: ()=>{
    		return name;
    	}
    });

    Object.defineProperty(this, 'key', {
    	get: ()=>{
    		return key;
    	}
    });

    this.audio = engine2d.add.audio(key);
    engine2d.sound.setDecodedCallback([this.audio], ()=>{
    	console.log("completed decoding of audio (" + name + ")");
    }, this);
    this.audio.allowMultiple = false;

    /*
    * @name play
    * @type method
    * @description playes the audio
    * @parent Audio
    */
    this.play = function(){
		this.audio.play();
    }

    /*
    * @name stop
    * @type method
    * @description stops playing the audio
    * @parent Audio
    */
    this.stop = function(){
        this.audio.stop();
    }

    /*
    * @name pause
    * @type method
    * @description pauses the playing of the audio
    * @parent Audio
    */
    this.pause = function(){
        this.audio.pause();
    }

    /*
    * @name paused
    * @type property
    * @description returns if the audio is currently paused
    * @parent Audio
    */
    Object.defineProperty(this, 'paused', {
    	get: ()=>{
    		return this.audio.paused;
    	}
    });

    /*
    * @name playing
    * @type property
    * @description returns if the audio is currently paused
    * @parent Audio
    */
    Object.defineProperty(this, 'playing', {
    	get: ()=>{
    		return this.audio.isPlaying;
    	}
    });


    this.destroy = function(){
        this.audio.stop();
        this.audio.destroy();
    }
}

/*
* @name Textbox
* @type return
* @description Creates a textbox
* @param {y}{Float}{Y position of the Textbox}
*/
var Textbox = function(name, x, y){
	Object.defineProperty(this, 'name', {
		get: ()=>{
			return name;
		}
	});

	this.DATA = {
		focused: false,
		text: "",
		canvas: canvas
	}


	this.BOX = new graphics.Box(x*scaling, y*scaling, 100, 24, 0x666666, 4);
	this.BOX.borderThickness = 3;
	this.BOX.borderColor = 0x333333;
	
	/*
	* @name focused
	* @type property
	* @description the focused value of the Textbox
	* @parent Textbox
	*/
	Object.defineProperty(this, 'focused', {
		get: ()=>{
			return this.DATA.focused;
		}, set: (val)=>{
			if(this.DATA.focused != val){
				this.DATA.focused = val;
				if(val){
					this.CURSOR.color = 0xffffff;
					add_to_internal_update("textboxCursor", ()=>{
						this.CURSOR.count -= 1;
						if(this.CURSOR.count == 0){
							this.CURSOR.count = 32;
							if(this.CURSOR.color == 0xffffff){
								this.CURSOR.color = 0x888888;
							}else{
								this.CURSOR.color = 0xffffff;
							}
						}
					});
					this.BOX.color = 0x888888;
				}else{
					this.BOX.color = 0x666666;
					this.CURSOR.color = 0x666666;
					this.SELECTED.width = 0;
					remove_from_internal_update('textboxCursor');
				}
			}
		}
	});

	this.SELECTED = new graphics.Rectangle((x+5)*scaling, (y+4)*scaling, 0, 16, 0x55999);



	this.BOX.collision = collisionManager.shape.Box(x*scaling, y*scaling, 100, 24);



	this.CURSOR = new graphics.Rectangle((x + 5)*scaling, (y+3)*scaling, 2, 18, 0x666666);
	this.CURSOR.count = 32;

	this.TEXT = new Text("INTERNAL-" + name, x+5, y+1, "", 19);

	/*
	* @name x
	* @type property
	* @description The X position of the Textbox
	* @parent Textbox
	*/
	Object.defineProperty(this, 'x', {
		get: ()=>{
			return this.BOX.x*scaling;
		},
		set: (val)=>{
			this.BOX.x = val/scaling;
			this.BOX.collision.x = val/scaling;
			this.TEXT.x = (val+5)/scaling;
			this.CURSOR.x = (val+5)/scaling;
		}
	});

	/*
	* @name y
	* @type property
	* @description The Y position of the Textbox
	* @parent Textbox
	*/
	Object.defineProperty(this, 'y', {
		get: ()=>{
			return this.BOX.y*scaling;
		},
		set: (val)=>{
			this.BOX.y = val/scaling;
			this.BOX.collision.y = val/scaling;
			this.TEXT.y = (val+1)/scaling;
			this.CURSOR.y = (val+3)/scaling;
		}
	});


	Object.defineProperty(this, 'color', {
		get: ()=>{
			return this.BOX.color;
		},
		set: (val)=>{
			this.BOX.color = val;
		}
	});



	/*
	* @name width
	* @type property
	* @description Width of the Textbox
	* @parent Textbox
	*/
	Object.defineProperty(this, 'width', {
		get: ()=>{
			return this.BOX.width;
		}, set: (val)=>{
			this.BOX.width = val;
			this.BOX.collision.w = val;
		}
	});

	/*
	* @name height
	* @type property
	* @description Height of the Textbox
	* @parent Textbox
	*/
	Object.defineProperty(this, 'height', {
		get: ()=>{
			return this.BOX.height
		}, set: (val)=>{
			this.BOX.height = val;
			this.CURSOR.height = val - 6;
			this.TEXT.fontSize = val - 5;
			this.SELECTED.height = val - 8;
		}
	});




	/*
	* @name text
	* @type property
	* @description The value of the text currently in the textbox
	* @parent Textbox
	*/
	Object.defineProperty(this, 'text', {
		get: ()=>{
			return this.DATA.text;
		},
		set: (val)=>{
			this.DATA.text = val;
			this.TEXT.text = val;

			this.TEXT.text = this.TEXT.text.substr(0, inputManager.keyboard.textInput.cursorEnd);
			if(this.TEXT.TEXT.width + 9 > this.BOX.width){
				var temp_text = this.TEXT.text.substr(0, inputManager.keyboard.textInput.cursorEnd);
				if(inputManager.keyboard.textInput.cursorEnd > val.length - 3){
					while(this.TEXT.TEXT.width + 9 > this.BOX.width){
						temp_text = temp_text.substr(1, temp_text.length-1);
						this.TEXT.text = '...' + temp_text;
					}
				}else{
					while(this.TEXT.TEXT.width + 9 > this.BOX.width){
						temp_text = temp_text.substr(1, temp_text.length-1);
						this.TEXT.text = '...' + temp_text + '...';
					}
				}
			}else{
				this.TEXT.text = val;
				var temp_text = val;
				while(this.TEXT.TEXT.width + 9 > this.BOX.width){
					temp_text = temp_text.substr(0, temp_text.length-2);
					this.TEXT.text = temp_text + '...';
				}
			}

		}
	});

	this.destroy = function(){
		this.BOX.destroy();
		this.TEXT.destroy();
	}
}



var images = new Map();
var add_image = function(name, x, y, key, onComplete, cnvs){
	if(images.get(name) == null){
		if(load_count == 0){
			var remember_canvas = canvas;
			set_canvas(cnvs);
			var new_img = new Image(name, x, y, key);
			images.set(name, new_img);
			if(onComplete != null){
				onComplete(new_img);
			}
			set_canvas(remember_canvas);
		}else{
			add_to_on_finish_loading(()=>{add_image(name, x, y, key, onComplete, cnvs);});
		}
	}else{
		console.error('Already used unique ID: "' + name + '" for Image');
	}
}

var destroy_image = function(name){
	var img = images.get(name);
	img.destroy();
	images.delete(name);
}

var texts = new Map();
var add_text = function(name, x, y, text, fontSize, onComplete){
	if(texts.get(name) == null){
		var new_text = new Text(name, x, y, text, fontSize);
		texts.set(name, new_text);
		if(onComplete != null){
			onComplete(new_text);
		}
	}else{
		console.error('Already used unique ID: "' + name + '" for Text');
	}
}

var destroy_text = function(name){
	var txt = texts.get(name);
	txt.destroy();
	texts.delete(name);
}


var audios = new Map();
var add_audio = function(name, key, onComplete){
	if(audios.get(name) == null){
		if(load_count == 0){
			var new_audio = new Audio(name, key);
			audios.set(name, new_audio);
			if(onComplete != null){
				onComplete(new_audio);
			}
		}else{
			add_to_on_finish_loading(()=>{add_audio(name, key,);});
		}
	}else{
		console.error('Already used unique ID: "' + name + '" for Audio');
	}
}
var destroy_audio = function(name){
	var audio = audios.get(name);
	audio.destroy();
	audios.delete(name);
}


var textboxes = new Map();
var add_textbox = function(name, x, y, onComplete){
	if(audios.get(name) == null){
		var new_textbox = new Textbox(name, x, y);
		textboxes.set(name, new_textbox);
		if(onComplete != null){
			onComplete(new_textbox);
		}
	}else{
		console.error('Already used unique ID: "' + name + '" for Textbox');
	}
}

var destroy_textbox = function(name){
	var textbox = textboxes.get(name);
	textbox.destroy();
	textboxes.delete(name);
	remove_from_internal_update(name + 'textbox');
}



returnObj = {
	/*
	* @name canvas
	* @type obj
	* @description Create, modify, etc. engine2d canvases.
	*/
	canvas: {
		/*
		* @name create
		* @type method
		* @description Creates a <a href="virtuosity.engine2d.html">engine2d</a> canvas
		* @param {name}{String}{name of the canvas}
		* @param {options}{Object}{options}
		* @parent canvas
		*/

		/*
		* @name options
		* @type config
		* @parent canvas.create
		* @param {poll}{Int}{(OPTIONAL) polling rate of the update function for <a href="virtuosity.engine2d.html">engine2d</a> (times per second). This must be set with the first canvas created. <b>[default: 64]</b>}
		* @param {load}{Function}{(OPTIONAL) function to complete while <a href="virtuosity.engine2d.html">engine2d</a> is automatically loading assets}
		* @param {create}{Function}{(OPTIONAL) function to complete while <a href="virtuosity.engine2d.html">engine2d</a> has finisished automatically loading assets}
		* @param {x}{Int}{(OPTIONAL) X position of the canvas <b>[default: 0]</b>}
		* @param {y}{Int}{(OPTIONAL) Y position of the canvas <b>[default: 0]</b>}
		* @param {width}{Int}{(OPTIONAL) Width of the canvas <b>[default: screen width]</b>}
		* @param {height}{Int}{(OPTIONAL) Height of the canvas <b>[default: screen height]</b>}
		*/

		create: function(name, options){
			create_canvas(name, options);
		},

		/*
		* @name set
		* @type method
		* @description Sets which canvas engine2d interacts with.
		* @parent canvas
		*/
		set: function(canvas){
			set_canvas(canvas);
		}
	},

	/*
	* @name addToLoadQueue
	* @type obj
	* @description Adds a load task to the loading queue for <a href="virtuosity.engine2d.html">engine2d</a>. <a href="virtuosity.engine2d.html">engine2d</a> loading must be <a href="#start">started</a>.
	*/
	addToLoadQueue: {
		/*
		* @name image
		* @type method
		* @description Adds a image load task to the loading queue for <a href="virtuosity.engine2d.html">engine2d</a>. <a href="virtuosity.engine2d.html">engine2d</a> loading must be <a href="#start">started</a>.
		* @parent addToLoadQueue
		* @param {key}{String}{key to access the loaded asset later}
		* @param {path}{String}{path to the asset}
		*/
		image: function(key, path){
			addToLoadQueue("image", key, path);
		},
		/*
		* @name spritesheet
		* @type method
		* @description Adds a spritesheet load task to the loading queue for <a href="virtuosity.engine2d.html">engine2d</a>. <a href="virtuosity.engine2d.html">engine2d</a> loading must be <a href="#start">started</a>.
		* @parent addToLoadQueue
		* @param {key}{String}{key to access the loaded asset later}
		* @param {path}{String}{path to the asset}
		* @param {width}{Int}{width of each frame of the spritesheet}
		* @param {height}{Int}{height of each frame of the spritesheet}
		*/
		spritesheet: function(key, path, width, height){
			addToLoadQueue("spritesheet", key, path, width, height);
		},

		/*
		* @name audio
		* @type method
		* @description Adds a audio load task to the loading queue for <a href="virtuosity.engine2d.html">engine2d</a>. <a href="virtuosity.engine2d.html">engine2d</a> loading must be <a href="#start">started</a>.
		* @parent addToLoadQueue
		* @param {key}{String}{key to access the loaded asset later}
		* @param {path}{String}{path to the asset}
		*/
		audio: function(key, path){
			addToLoadQueue('audio', key, path);
		}
	},


	/*
	* @name uncache
	* @type obj
	* @description Unchaces loaded assets.
	*/
	uncache: {
		/*
		* @name image
		* @type method
		* @description Uncaches a loaded image or spritesheet asset.
		* @parent uncache
		*/
		image: function(key){
			uncache_image(key);
		},

		/*
		* @name audio
		* @type method
		* @description Uncaches a loaded audio asset.
		* @parent uncache
		*/
		audio: function(key){
			uncache_audio(key);	
		}
	},



	state: {
		load: function(path){
			load_state(path);	
		}


	},

	/*
	* @name onFinishLoading
	* @type method
	* @description Adds a function to run when <a href="virtuosity.engine2d.html">engine2d</a> has finished <a href="#load">loading</a>.
	* @param {func}{Function}{function to run after finished loading}
	*/
	onFinishLoading: function(func){
		add_to_on_finish_loading(func);
	},

	/*
	* @name load
	* @type method
	* @description Makes <a href="virtuosity.engine2d.html">engine2d</a> start loading.
	*/
	load: function(){
		load();
	},

	/*
	* @name addToUpdate
	* @type method
	* @description Adds an event to the update function of <a href="virtuosity.engine2d.html">engine2d</a>.
	* @param {name}{String}{name of update event}
	* @param {func}{Function}{function to run after in update function}
	*/
	addToUpdate: function(name, func){
		addToUpdate(name, func);
	},
	add_to_internal_update: function(name, func){
		add_to_internal_update(name, func);
	},

	/*
	* @name removeFromUpdate
	* @type method
	* @description remove an event to the update function of <a href="virtuosity.engine2d.html">engine2d</a>.
	* @param {name}{String}{name of update event}
	*/
	removeFromUpdate: function(name){
		removeFromUpdate(name);
	},
	remove_from_internal_update: function(name, func){
		remove_from_internal_update(name, func);
	},

	/*
	* @name addToRender
	* @type method
	* @description Adds an event to the render function of <a href="virtuosity.engine2d.html">engine2d</a>.
	* @param {name}{String}{name of render event}
	* @param {func}{Function}{function to run after in render function}
	*/
	addToRender: function(name, func){
		addToRender(name, func);
	},

	/*
	* @name removeFromRender
	* @type method
	* @description remove an event to the render function of <a href="virtuosity.engine2d.html">engine2d</a>.
	* @param {name}{String}{name of render event}
	*/
	removeFromRender: function(name){
		removeFromRender(name);
	},

	/*
	* @name add
	* @type obj
	* @description adds assets
	*/
	add: { 	
		/*
		* @name image
		* @type method
		* @description Adds an instance of loaded image or spritesheet to <a href="virtuosity.engine2d.html">engine2d</a>.
		* @parent add
		* @param {name}{String, Float}{name of the image}
		* @param {x}{Int}{x position of the image}
		* @param {y}{Int}{y position of the image}
		* @param {key}{String}{image key of the loaded texture}
		* @param {onComplete}{Function}{<b>(Optional)</b> function to complete after completes (takes created image as a parameter)}
		*/
		image: function(name, x, y, key, onComplete){
			add_image(name, x, y, key, onComplete, canvas);
		},

		/*
		* @name text
		* @type method
		* @description Adds some text to <a href="virtuosity.engine2d.html">engine2d</a>.
		* @parent add
		* @param {name}{String, Float}{name of the text}
		* @param {x}{Int}{x position of the text}
		* @param {y}{Int}{y position of the text}
		* @param {text}{String}{the string of text that the text shows}
		* @param {fontSize}{String}{font size of the text}
		* @param {onComplete}{Function}{<b>(Optional)</b> function to complete after completes (takes created text as a parameter)}
		*/
		text: function(name, x, y, text, fontSize, onComplete){
			add_text(name, x, y, text, fontSize, onComplete);
		},

		/*
		* @name audio
		* @type method
		* @description Adds an instance of loaded audio or spritesheet to <a href="virtuosity.engine2d.html">engine2d</a>.
		* @parent add
		* @param {name}{String, Float}{name of the audio}
		* @param {key}{String}{audio key of the loaded texture}
		* @param {onComplete}{Function}{<b>(Optional)</b> function to complete after completes (takes created audio as a parameter)}
		*/
		audio: function(name, key, onComplete){
			add_audio(name, key, onComplete);
		},

		/*
		* @name textbox
		* @type method
		* @description Adds a Textbox to <a href="virtuosity.engine2d.html">engine2d</a>.
		* @parent add
		* @param {name}{String, Float}{name of the text}
		* @param {x}{Int}{x position of the text}
		* @param {y}{Int}{y position of the text}
		* @param {onComplete}{Function}{<b>(Optional)</b> function to complete after completes (takes created Textbox as a parameter)}
		*/
		textbox: function(name, x, y, onComplete){
			add_textbox(name, x, y, onComplete);
		}
	},

	/*
	* @name destroy
	* @type obj
	* @description destroys assets
	*/
	destroy: {
		/*
		* @name image
		* @type method
		* @parent destroy
		* @description destroys image assets
		* @param {name}{String, Float}{name of the image}
		*/
		image: function(name){
			destroy_image(name);
		},

		/*
		* @name text
		* @type method
		* @parent destroy
		* @description destroys text assets
		* @param {name}{String, Float}{name of the text}
		*/
		text: function(name){
			destroy_text(name);
		},

		/*
		* @name audio
		* @type method
		* @parent destroy
		* @description destroys audio assets
		* @param {name}{String, Float}{name of the audio}
		*/
		audio: function(name){
			destroy_audio(name);
		},

		/*
		* @name textbox
		* @type method
		* @parent destroy
		* @description destroys textbox assets
		* @param {name}{String, Float}{name of the textbox}
		*/
		textbox: function(name){
			destroy_textbox(name);
		}
	},

	/*
	* @name get
	* @type obj
	* @description Gets objects from <a href="virtuosity.engine2d.html">engine2d</a>.
	*/
	get: {

		/*
		* @name image
		* @type method
		* @parent get
		* @description gets image assets
		* @param {name}{String, Float}{name of the image}
		*/
		image: function(name){
			return images.get(name);
		},

		/*
		* @name text
		* @type method
		* @parent get
		* @description gets text assets
		* @param {name}{String, Float}{name of the text}
		*/
		text: function(name){
			return texts.get(name);
		},

		/*
		* @name audio
		* @type method
		* @parent get
		* @description gets audio assets
		* @param {name}{String, Float}{name of the audio}
		*/
		audio: function(name){
			return audios.get(name);
		},

		/*
		* @name textbox
		* @type method
		* @parent get
		* @description gets textbox assets
		* @param {name}{String, Float}{name of the textbox}
		*/
		textbox: function(name){
			return textboxes.get(name);
		}
	},
	/*
	* @name expose
	* @type method
	* @description WARNING, USE WITH CAUTION. USING EXPOSE COULD BREAK SOMETHING, SO ONLY USE IF YOU UNDERSTAND <a href="https://www.npmjs.com/package/phaser-ce">Phaser-CE 2.15.1</a> AND WANT TO USE A SPECIFIC FEATURE THAT <a href="virtuosity.engine2d.html">engine2d</a> DOESN'T SUPPORT YET. Exposes <a href="virtuosity.engine2d.html">engine2d</a>.
	*/
	expose: function(){
		return engine2d;
	},
	/*
	* @name phaser
	* @type method
	* @description DO NOT USE UNLESS THERE IS A SPECIFIC FEATURE THAT <a href="https://www.npmjs.com/package/phaser-ce">Phaser-CE 2.15.1</a> HAS AND THAT <a href="virtuosity.engine2d.html">engine2d</a> DOESN'T SUPPORT YET. Exposes engine2d's renderer (phaser).
	*/
	phaser: function(){
		return phaser;
	},
	import_inputManager: (im)=>{
		import_inputManager(im);
	},
	import_collisionManager: (im)=>{
		import_collisionManager(im);
	}
}

/*
* @name graphics
* @type obj
* @description Draw engine2d generated graphics.
* @path engine2d graphics.js
*/
Object.defineProperty(returnObj, 'graphics', {
	get: ()=>{
		return graphics;
	}
});

Object.defineProperty(returnObj, 'scaling', {
	get: ()=>{
		return scaling;
	}, set: (val)=>{
		images.forEach((img)=>{
			img.x *= val/scaling;
			img.y *= val/scaling;
			img.width *= val/scaling;
			img.height *= val/scaling;
		});
		texts.forEach((txt)=>{
			txt.x *= val/scaling;
			txt.y *= val/scaling;
			txt.fontSize *= val/scaling;
		});
		graphics.set_scaling(val);
		scaling = val;
		graphics.boxes.forEach((box)=>{
			box.x *= 1;
			box.y *= 1;
			box.width *= 1;
			box.height *= 1;
			box.borderThickness *= 1;
			box.radius *= 1;
		});

		graphics.rectangles.forEach((rect)=>{
			rect.x *= 1;
			rect.y *= 1;
			rect.width *= 1;
			rect.height *= 1;
		});

		graphics.lines.forEach((line)=>{
			line.x1 *= 1;
			line.y1 *= 1;
			line.x2 *= 1;
			line.y2 *= 1;
		});


		graphics.circles.forEach((crcl)=>{
			crcl.x *= 1;
			crcl.y *= 1;
			crcl.radius *= 1;
		});


		graphics.ellipses.forEach((ellipse)=>{
			ellipse.x *= 1;
			ellipse.y *= 1;
			ellipse.xRadius *= 1;
			ellipse.yRadius *= 1;
		});

	}
});


/*
* @name x
* @type property
* @description X position of the canvas
* @parent canvas
*/
Object.defineProperty(returnObj.canvas, 'x', {
	get: ()=>{
		var val = canvases.get(canvas).dom.style.left;
		return parseInt(val.substr(0, val.length-2));
	}, set: (val)=>{
		var ctx = canvases.get(canvas);
		ctx.dom.style.left = val + "px";
		ctx.x = val;
	}
});

/*
* @name y
* @type property
* @description Y position of the canvas
* @parent canvas
*/
Object.defineProperty(returnObj.canvas, 'y', {
	get: ()=>{
		var val = canvases.get(canvas).dom.style.top;
		return parseInt(val.substr(0, val.length-2));
	}, set: (val)=>{
		var ctx = canvases.get(canvas);
		ctx.dom.style.top = val + "px";
		ctx.y = val;
	}
});

/*
* @name visible
* @type property
* @description Visiblity of the engine2d canvas. If not visible, the associated render functions are not run.
* @parent canvas
*/
Object.defineProperty(returnObj.canvas, 'visible', {
	get: ()=>{
		return canvases.get(canvas).visible;
	}, set: (val)=>{
		var ctx = canvases.get(canvas);
		ctx.visible = val;
		if(val){
			ctx.dom.style.visibility = "visible";
		}else{
			ctx.dom.style.visibility = "hidden";
		}
	}
})


module.exports = returnObj;