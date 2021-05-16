var PIXI = require('pixi.js');
var ocs = require("ocs");
var debug = require('./debug.js');
var {time} = require('../virtuosity-server/index.js');

var load_canvas = null;
var canvases = new Map();
var new_canvas = function(name, config){
    if(config.resolution == null){
        config.resolution = 1;
    }else{
        config.resolution /= window.outerHeight;
    }

    if(config.antialias == null){
        config.antialias = true;
    }

    if(config.powerPreference == null){
        config.powerPreference = 'low-power';
    }

    var scale = 1;

    if(config.defaultResolution){
        scale = window.outerHeight / config.defaultResolution;
    }

    if(config.width == null){
        config.width = window.outerWidth;
    }

    if(config.height == null){
        config.height = window.outerHeight;
    }

    var new_ctx = new PIXI.Application({
        width: config.width / scale,
        height: config.height / scale, 
        backgroundAlpha: 0,
        powerPreference: config.powerPreference,
        antialias: config.antialias,
        transparent: true,
        resolution: config.resolution
    });
    document.body.appendChild(new_ctx.view);
    new_ctx.view.style.width = config.width + "px";
    new_ctx.view.style.height = config.height + 'px';
    new_ctx.view.style.position = "absolute";
    if(config.y != null){
        new_ctx.view.style.top = config.y+"px";
    }else{
        new_ctx.view.style.top = "0px";
    }

    if(config.x != null){
        new_ctx.view.style.left = config.x+"px";
    }else{
        new_ctx.view.style.left = "0px";
    }

    canvases.set(name, new_ctx);
    load_canvas = new_ctx;

    new_ctx.started = false;

    if(config.preload != null){
        config.preload();
        start_load(name);
    }

    ///////////////////////////////////////////
    new_ctx.images = new Map();
    new_ctx.texts = new Map();
    new_ctx.textboxes = new Map();
    new_ctx.containers = new Set();
    //////////////////////////////////////////

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


    new_ctx.view.style.zIndex = 0;
    Object.defineProperty(new_ctx, "zIndex", {
        get: ()=>{
            return new_ctx.view.style.zIndex;
        }, set: (val)=>{
            new_ctx.view.style.zIndex = val;
        }
    })


    new_ctx.fpsTimer = process.hrtime();
    new_ctx.fpsMax = -Infinity;
    new_ctx.fpsMin = Infinity;
    new_ctx.fpsBoundsWaitCounter = 120;
    new_ctx.fps = 0;

    var MAXSAMPLES = config.fpsBuffer || 1000;

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
    }, 1000/(config.poll || 64));


    new_ctx.ticker.add(()=>{
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

        if(load_queue == 0){
            new_ctx.started = true;
        }

        new_ctx.render_events.forEach((event)=>{
            event();
        });
    });
}


var load_queue = 0;
var textures = new Map();
var loading_textures = new Map();
var load_image = function(key, path){
    if(!textures.has(key)){
        load_queue += 1;
        loading_textures.set(key, []);
        load_canvas.loader.add(key, path);
    }else{
        debug.warn("SyntaxError", `engine2d already loaded: ${key}`);
    }
}

var spritesheet_textures = new Map();
var load_spritesheet = function(key, path, frameWidth, frameHeight){
    if(!textures.has(key)){
        // load image
        loading_textures.set(key, []);

        // deal with it being a spritesheet
        loading_textures.get(key).push((resources)=>{
            var texture = resources[key].texture;
            var frames = [];
            var frames_wide = Math.floor(texture.width / frameWidth);
            var frames_tall = Math.floor(texture.height / frameHeight);
            for(var i=0; i<frames_tall; i += 1){
                for(var j=0; j<frames_wide;j += 1){
                    frames.push(
                        new PIXI.Texture(texture, new PIXI.Rectangle(j * frameWidth, i * frameHeight, frameWidth, frameHeight))
                    )
                }
            }


            spritesheet_textures.set(key, frames);
            textures.set(key, texture);
        });

        // add to loadqueue
        load_canvas.loader.add(key, path);
    }else{
        debug.warn("SyntaxError", `engine2d already loaded: ${key}`);
    }
}

var start_load = function(canvas){
    load_canvas.loader.load((loader, resources)=>{
        for(var prop in resources){
            var key = prop;//just for my better understanding
            if(resources[key].error == null){
                textures.set(key, resources[key].texture);
                loading_textures.get(key).forEach((action)=>{
                    action(resources);
                });
                loading_textures.delete(key);
                load_queue -= 1;
                console.log(`engine2d succesfully loaded: ${key}`);
                delete loader.resources[key];
            }else{
                console.error(`error while loading: ${key}\n\n`, resources[key].error);
            }
        }
    });
}

var unload_image = function(key){
    if(textures.has(key)){
        textures.get(key).baseTexture.destroy();
        textures.delete(key);
        console.log(`engine2d succesfully unloaded: ${key}`);
    }else{
        debug.error("SyntaxError", `engine2d has not loaded: ${key}`);
    }
}



// ocs ///////////////////////////////////////////////////
/*
* @name engine2d
* @type environment
*/
var env = new ocs.Environment('engine2d');

/*
* @name pixi
* @type component
* @description reference to the render object
* @env engine2d
* @param {pixi}{Pixi.js object}{reference to the pixi render object (internal)}
*/
new ocs.Component('engine2d', 'pixi', (pixi)=>{
    return{
        pixi: pixi
    }
});


/*
* @name position
* @type component
* @description position of the render object
* @env engine2d
* @param {x}{Number}{x coordinate of the render object}
* @param {y}{Number}{y coordinate of the render object}
*/
var position = new ocs.Component('engine2d', "position", (x, y)=>{
    return new ocs.EEO({
        x: x || 0,
        y: y || 0
    }, (entity, key, val)=>{
        entity.pixi[key] = val;
    });
});


/*
* @name rotation
* @type component
* @description rotation of the render object
* @env engine2d
* @param {rotation}{Number}{rotation of the render object}
*/
var rotation = new ocs.Component('engine2d', "rotation", (r)=>{
    return new ocs.EEO({
        rotation: r || 0
    }, (entity, key, val)=>{
        entity.pixi.rotation = val;
    });
});

/*
* @name anchor
* @type component
* @description the position and rotation point of the render object
* @env engine2d
* @param {x}{Number}{x coordinate of the anchor point}
* @param {y}{Number}{y coordinate of the anchor point}
*/
var anchor = new ocs.Component('engine2d', "anchor", (x, y)=>{
    return {
        anchor: new ocs.EEO({
                x: x || 0,
                y: y || 0
            }, (entity, key, val)=>{
                entity.pixi.anchor[key] = val;
            })
    }
});


/*
* @name alpha
* @type component
* @description alpha of the render object
* @env engine2d
* @param {alpha}{Number}{alpha of the render object}
*/
var alpha = new ocs.Component('engine2d', "alpha", (alpha)=>{
    return new ocs.EEO({
        alpha: 1 || alpha
    }, (entity, key, val)=>{
        entity.pixi.alpha = val;
    });
});

/*
* @name scale
* @type component
* @description the scale of the render object
* @env engine2d
* @param {width}{Number}{width of the render object}
* @param {height}{Number}{height of the render object}
*/
var scale = new ocs.Component('engine2d', "scale", (width, height)=>{
    return new ocs.EEO({
        width: width,
        height: height
    }, (entity, key, val)=>{
        entity.pixi[key] = val;
    });
});


/*
* @name tint
* @type component
* @description tint of the render object
* @env engine2d
* @param {tint}{Hex}{tint of the render object}{0xffffff}
*/
var tint = new ocs.Component('engine2d', 'tint', (tint)=>{
    return new ocs.EEO({
        tint: 16777215
    }, (entity, key, val)=>{
        entity.pixi.tint = val;
    });
});



/*
* @name Image
* @type entity
* @description An image using a loaded texture created by <a href="./virtuosity.engine2d.add.html#image">add.image</a>
* @env engine2d
* @component pixi
* @component position
* @component rotation
* @component anchor
* @component alpha
* @component scale
* @component tint
*/
var add_image = function(canvas, name, x, y, key, onComplete){
    if(textures.has(key)){
        var ctx = canvases.get(canvas);
        // var new_img = new PIXI.Sprite(ctx.loader.resources[key].texture);
        var new_img = new PIXI.Sprite(textures.get(key));

        var new_entity = new ocs.Entity('engine2d', `${name}╎${canvas}╎image`)
        new_entity.addComponent('pixi', new_img)
                  .addComponent('position', x, y)
                  .addComponent('rotation')
                  .addComponent('anchor')
                  .addComponent('alpha')
                  .addComponent('tint')
                  .addComponent('scale', new_img.width, new_img.height);

        new_entity.pixi.x = x;
        new_entity.pixi.y = y;

        ctx.stage.addChild(new_img);
        if(onComplete!=null){
            onComplete(new_entity);
        }
        ctx.images.set(name, new_entity)
    }else if(loading_textures.has(key)){
        console.log(`waiting for texture (${key}) to load`);
        loading_textures.get(key).push(()=>{add_image(canvas, name, x, y, key, onComplete);});
    }else{
        debug.error("ReferenceError", `texture (${key}) is not loaded or in load queue`);
    }
}


class Animation{
    #i;
    #timer;
    #frameTime;

    constructor(entity, name, frames, frameTime){
        this.name = name;
        this.frames = frames;

        this.#frameTime = frameTime;
        Object.defineProperty(this, "frameTime", {
            get: ()=>{
                return this.#frameTime;
            },
            set: (val)=>{
                this.#frameTime = val;
                this.#timer.duration = frameTime;
            }
        });

        this.#i = 0;
        this.#timer = new time.AdvancedInterval(frameTime, ()=>{
            if(this.#i < this.length - 1){
                this.#i += 1;
            }else{
                this.#i = 0;
            }
            entity.frame = this.frames[this.#i];
        });

        Object.defineProperty(this, "running", {
            get: ()=>{
                return this.#timer.running;
            }
        });

        Object.defineProperty(this, "paused", {
            get: ()=>{
                return this.#timer.paused;
            }
        });

        Object.defineProperty(this, "length", {
            get: ()=>{
                return this.frames.length;
            }
        });
    }

    start(){
        this.#i = 0;
        if(!this.#timer.running){
            this.#timer.start();
        }else{
            this.#timer.restart();
        }
    }

    stop(){
        this.#timer.stop();
    }

    pause(){
        this.#timer.pause();
    }
}

/*
* @name sprite
* @type component
* @description frame management of a sprite
* @env engine2d
* @param {frame}{Number}{frame the sprite is using}
* @param {totalFrames}{Number}{totalFrames the sprite has}
* @param {addAnimation}{Function}{add an animation <var><span class="white">(</span>name<span class="white">,</span> frames<span class="white">,</span> frameTime<span class="white">)</span></var>}
* @param {deleteAnimation}{Function}{delete an animation <var><span class="white">(</span>name<span class="white">)</span></var>}
* @param {getAnimation}{Function}{get an animation <var><span class="white">(</span>name<span class="white">)</span></var>}
*/

new ocs.Component('engine2d', 'sprite', (self, pixi)=>{
    return new ocs.EEO({
        frame: 0,
        totalFrames: pixi.totalFrames,
        animations: new Map(),
        addAnimation: (name, frames, frameTime)=>{
            self.animations.set(name, new Animation(self, name, frames, frameTime));
        },
        deleteAnimation: (name)=>{
            self.animations.delete(name);
        },
        getAnimation: (name)=>{
            return self.animations.get(name);
        }
    }, (entity, key, val)=>{
        if(key == "frame"){
            entity.pixi.gotoAndStop(val);
        }else if(key == "totalFrames"){
            if(entity.totalFrames != pixi.totalFrames){
                entity.totalFrames = pixi.totalFrames;
            }
        }
    });
});

/*
* @name Sprite
* @type entity
* @description An sprite using a loaded srpite texture created by <a href="./virtuosity.engine2d.add.html#sprite">add.sprite</a>
* @env engine2d
* @component pixi
* @component position
* @component rotation
* @component anchor
* @component alpha
* @component scale
* @component tint
* @component sprite
*/
var add_sprite = function(canvas, name, x, y, key, onComplete){
    if(spritesheet_textures.has(key)){
        var ctx = canvases.get(canvas);
        // var new_img = new PIXI.Sprite(ctx.loader.resources[key].texture);
        var new_img = new PIXI.AnimatedSprite(spritesheet_textures.get(key));
        new_img.updateAnchor = true;

        var new_entity = new ocs.Entity('engine2d', `${name}╎${canvas}╎image`)
        new_entity.addComponent('pixi', new_img)
                  .addComponent('position', x, y)
                  .addComponent('rotation')
                  .addComponent('anchor')
                  .addComponent('alpha')
                  .addComponent('tint')
                  .addComponent('scale', new_img.width, new_img.height)
                  .addComponent('sprite', new_entity, new_img);

        new_entity.pixi.x = x;
        new_entity.pixi.y = y;


        ctx.stage.addChild(new_img);
        if(onComplete!=null){
            onComplete(new_entity);
        }
        ctx.images.set(name, new_entity)
    }else if(loading_textures.has(key)){
        console.log(`waiting for texture (${key}) to load`);
        loading_textures.get(key).push(()=>{add_sprite(canvas, name, x, y, key, onComplete);});
    }else{
        debug.error("ReferenceError", `texture (${key}) is not loaded or in load queue`);
    }
}


var get_image = function(canvas, name){
    var ctx = canvases.get(canvas);
    if(ctx.images.has(name)){
        return ctx.images.get(name);
    }else{
        debug.error('ReferenceError', `image (${name}) in canvas (${canvas}) does not exist`);
        return null;
    }
}


var delete_image = function(canvas, name){
    var ctx = canvases.get(canvas);
    if(ctx.images.has(name)){
        ocs.getEntity('engine2d', `${name}╎${canvas}╎image`).destroy();
        ctx.images.get(name).pixi.destroy();
        ctx.images.delete(name);
    }else{
        debug.error('ReferenceError', `image (${name}) does not exist`);
    }
}




/////////////////////////////////////////////////////////////////////////////////////////////////////
/*
* @name text
* @type component
* @description value of the text shown
* @env engine2d
* @param {text}{String}{value of the text shown}
*/
var text = new ocs.Component('engine2d', "text", (text)=>{
    return new ocs.EEO({
        text: text
    }, (entity, key, val)=>{
        entity.pixi.text = val;
    });
});

/*
* @name style
* @type component
* @description stylization of the text
* @env engine2d
* @param {fontSize}{Int}{size of the font in pixels}
* @param {fontFamily}{String}{font type of the text}{"Trebuchet"}
* @param {fill}{Hex}{color of the text}{0xffffff}
* @param {align}{String}{alignment of the text}{"left"}
* @param {stroke}{Hex}{color of the text outline}{"black"}
* @param {strokeThickness}{Int}{thickness of the text outline}{0}
* @param {letterSpacing}{Int}{spacing between the letters}{0}
* @param {lineHeight}{Int}{line height of the text}{fontSize + 2}
* @param {fontWeight}{Int}{thickness of the text (increments of 100, 100-900)}{400}
* @param {fontStyle}{String}{style of the text, (normal|italic|oblique)}{"normal"}
*/
var style = new ocs.Component('engine2d', "style", (fontSize, color)=>{
    return new ocs.EEO({
        fontSize: fontSize,
        fontFamily: "Trebuchet",
        fill: 0xffffff,
        align: 'left',
        stroke: color || "black",
        strokeThickness: 0,
        letterSpacing: 0,
        lineHeight: fontSize + 2,
        fontWeight: 400,
        fontStyle: "normal"
    }, (entity, key, val)=>{
        entity.pixi.style[key] = val;
    });
});


/*
* @name Text
* @type entity
* @description A text entity created by <a href="./virtuosity.engine2d.add.html#text">add.text</a>
* @env engine2d
* @component pixi
* @component position
* @component scale
* @component rotation
* @component anchor
* @component alpha
* @component style
* @component text
*/
var add_text = function(canvas, name, x, y, text, fontSize, onComplete){
    var ctx = canvases.get(canvas);
    var new_txt = new PIXI.Text(text, {
        fontSize: fontSize,
        fill: 0xffffff,
        fontFamily: "Trebuchet"
    });

    new_txt.x = x;
    new_txt.y = y;

    var new_entity = new ocs.Entity('engine2d', `${name}╎${canvas}╎text`)
    new_entity.addComponent('pixi', new_txt)
              .addComponent('position', x, y)
              .addComponent('rotation')
              .addComponent('anchor')
              .addComponent('alpha')
              .addComponent('style', fontSize)
              .addComponent('text', text);


    Object.defineProperty(new_entity, "width", {
        get: ()=>{
            return new_entity.pixi.width;
        }
    });

    Object.defineProperty(new_entity, "height", {
        get: ()=>{
            return new_entity.pixi.height;
        }
    });


    ctx.stage.addChild(new_txt);
    if(onComplete!=null){
        onComplete(new_entity);
    }
    ctx.texts.set(name, new_entity);
}

var get_text = function(canvas, name){
    var ctx = canvases.get(canvas);
    if(ctx.texts.has(name)){
        return ctx.texts.get(name);
    }else{
        debug.warn('ReferenceError', `text (${name}) in canvas (${canvas}) does not exist`);
        return null;
    }
}

var delete_text = function(canvas, name){
    var ctx = canvases.get(canvas);
    if(ctx.texts.has(name)){
        ocs.getEntity('engine2d', `${name}╎${canvas}╎text`).destroy();
        ctx.texts.get(name).pixi.destroy();
        ctx.texts.delete(name);
    }else{
        debug.warn('ReferenceError', `text (${name}) in canvas (${canvas}) does not exist`);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
* @name engine2d-textbox
* @type environment
*/
var textbox_env = new ocs.Environment('engine2d-textbox');


/*
* @name textbox
* @type component
* @description reference to the DOM textbox entity
* @env engine2d-textbox
* @param {textbox}{DOM}{reference to the DOM textbox entity}
*/
new ocs.Component('engine2d-textbox', 'textbox', (textbox)=>{
    return {
        textbox: textbox
    }
});

/*
* @name position
* @type component
* @description position of the textbox
* @env engine2d-textbox
* @param {x}{Int}{x position of the textbox}
* @param {y}{Int}{y position of the textbox}
*/
var textbox_position = new ocs.Component('engine2d-textbox', 'position', (x, y)=>{
    return new ocs.EEO({
        x: x,
        y: y
    }, (entity, key, val)=>{
        if(key == "x"){
            entity.style.left = val + "px";
        }else{
            entity.style.top = val + "px";
        }
    });
});


/*
* @name fontSize
* @type component
* @description fontSize of the textbox
* @env engine2d-textbox
* @param {fontSize}{Int}{fontSize of the textbox}{19}
*/
var textbox_fontSize = new ocs.Component('engine2d-textbox', 'fontSize', (fontSize)=>{
    return new ocs.EEO({
        fontSize: fontSize
    }, (entity, key, val)=>{
        entity.style.fontSize = val + "px";
    });
});

/*
* @name width
* @type component
* @description width of the textbox
* @env engine2d-textbox
* @param {width}{Int}{width of the textbox}{100}
*/
var textbox_width = new ocs.Component('engine2d-textbox', 'width', (width)=>{
    return new ocs.EEO({
        width: width
    }, (entity, key, val)=>{
        entity.style.width = val + "px";
    });
});

/*
* @name value
* @type component
* @description value of the textbox
* @env engine2d-textbox
* @param {value}{String}{value of the textbox}
*/
var textbox_value = new ocs.Component('engine2d-textbox', 'value', (value)=>{
    return new ocs.EEO({
        value: value
    }, (entity, key, val)=>{
        entity.textbox.value = val;
    });
});

/*
* @name style
* @type component
* @description reference to the style property DOM textbox entity
* @env engine2d-textbox
* @param {textbox}{DOM}{reference to the style property DOM textbox entity}
*/
var textbox_style = new ocs.Component('engine2d-textbox', 'style', (textbox)=>{
    return {
        style: textbox
    }
});


/*
* @name events
* @type component
* @description events of the textbox
* @env engine2d-textbox
* @param {onfocus}{Function}{event to run the textbox is focused (clicked on)}
* @param {onblur}{Function}{event to run the textbox is blurred (clicked out of / press ENTER or ESC)}
* @param {onkeypress}{Function}{event to run when a key is pressed while the textbox is focused}
*/
var textbox_events = new ocs.Component('engine2d-textbox', 'events', ()=>{
    return {
        onkeypress: ()=>{},
        onfocus: ()=>{},
        onblur: ()=>{}
    }
});


/*
* @name Textbox
* @type entity
* @description A textbox entity created by <a href="./virtuosity.engine2d.add.html#textbox">add.textbox</a>
* @env engine2d-textbox
* @component textbox
* @component position
* @component fontSize
* @component width
* @component value
* @component style
* @component events
*/
var add_textbox = function(canvas, name, x, y, onComplete){
    new_ctx = canvases.get(canvas);
    var new_ctx_x = engine2d.canvas.xPos(canvas);
    var new_ctx_y = engine2d.canvas.yPos(canvas);

    var input = document.createElement("input");
    var style = input.style;
    style.position = 'absolute';
    style.top = (y + new_ctx_y) + "px";
    style.left = (x + new_ctx_x) + "px";
    style.border = "3px solid #666666";
    style.backgroundColor = "#333333";
    style.color = "#ffffff";
    style.borderRadius = "4px";
    style.fontSize = "20px";
    style.outline = "none";
    style.padding = "3px";
    style.width = "100px";
    style.fontFamily = "Trebuchet";
    document.getElementsByTagName('html')[0].appendChild(input);

    Object.defineProperty(input, "x", {
        get: ()=>{
            var left = input.style.left;
            return JSON.parse(left.substring(0, left.lengt-3) - new_ctx_x);
        },
        set: (val)=>{
            input.style.left = (val + new_ctx_x) + "px";
        }
    });

    Object.defineProperty(input, "y", {
        get: ()=>{
            var top = input.style.top;
            return JSON.parse(top.substring(0, top.lengt-3) - new_ctx_y);
        },
        set: (val)=>{
            input.style.top = (val + new_ctx_y) + "px";
        }
    });


    var new_textbox = new ocs.Entity('engine2d-textbox', `${name}╎${canvas}╎textbox`)
    new_textbox.addComponent('textbox', input)
               .addComponent('style', input.style)
               .addComponent('position', x + new_ctx_x, y + new_ctx_y)
               .addComponent('fontSize', 19)
               .addComponent('width', 100)
               .addComponent('events');

    Object.defineProperty(new_textbox, "value", {
        get: ()=>{
            return input.value;
        },
        set: (val)=>{
            input.value = val;
        }
    });


    input.starting_value = "";
    input.onkeydown = (e)=>{
        new_textbox.value = input.value;
        new_textbox.onkeypress();
        if(e.key == "Enter"){
            input.starting_value = input.value;
            input.blur();
        }else if(e.key == "Escape"){
            input.value = input.starting_value;
            new_textbox.value = input.value;
            input.blur();
        }
    }
    input.onfocus = ()=>{
        new_textbox.onfocus();
    }
    input.onblur = ()=>{
        new_textbox.onblur();
    }


    new_ctx.textboxes.set(name, new_textbox);

    if(onComplete != null){
        onComplete(new_textbox);
    }
}

var get_textbox = function(canvas, name){
    var ctx = canvases.get(canvas);
    if(ctx.textboxes.has(name)){
        return ctx.textboxes.get(name);
    }else{
        debug.warn('ReferenceError', `textbox (${name}) in canvas (${canvas}) does not exist`);
        return null;
    }
}

var delete_textbox = function(canvas, name){
    var ctx = canvases.get(canvas);
    if(ctx.textboxes.has(name)){
        ocs.getEntity('engine2d textbox', `${name}╎${canvas}╎textbox`).destroy();
        ctx.textboxes.get(name).pixi.destroy();
        ctx.textboxes.delete(name);
    }else{
        debug.warn('ReferenceError', `textbox (${name}) in canvas (${canvas}) does not exist`);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
var graphics = require('./graphics.js')(PIXI, canvases);

module.exports = {
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
    * @param {x}{Int}{x position of the canvas}{0}
    * @param {y}{Int}{y position of the canvas}{0}
    * @param {width}{Int}{width of the canvas}{window actual width}
    * @param {height}{Int}{height of the canvas}{window actual height}
    * @param {powerPreference}{String}{chooses which GPU to run on if client has multiple. 'low-power' for dedicated GPU or 'high-performance' for Discrete GPU}{'low-power'}
    * @param {antialias}{Boolean}{whether to use antialiasing}{true}
    * @param {poll}{Int}{Polling rate of the update function. The update function will run this many times per second}{64}
    * @param {fpsBuffer}{Int}{sets the maximum samples used to calculate average FPS}{1000}
    * @param {preload}{Function}{function to run when loading assets. Assets can be loaded and unloaded later if you want, but main assets should be loaded here.}
    * @param {create}{Function}{function to run while creating the scene}
    * @param {update}{Function}{update function which runs at a constant polling rate set by the poll property}
    * @param {render}{Function}{render function which runs as fast as possible and is tied to framerate}
    *
    */
    newCanvas: (name, config)=>{
        new_canvas(name, config);
    },

    /*
    * @name load
    * @type obj
    * @description adds an asset to the load queue
    */
    load: {
        /*
        * @name image
        * @type method
        * @description adds an image to the load queue
        * @parent load
        * @param {key}{String}{unique name of the image asset}
        * @param {path}{String}{path of the image asset}
        */
        image: function(key, path){
            load_image(key, path);
        },

        /*
        * @name spritesheet
        * @type method
        * @description adds a spritesheet to the load queue
        * @parent load
        * @param {key}{String}{unique name of the spritesheet asset}
        * @param {path}{String}{path of the spritesheet asset}
        * @param {frameWidth}{Int}{width of the frames in the spritesheet}
        * @param {frameHeight}{Int}{height of the frames in the spritesheet}
        */
        spritesheet: function(key, path, frameWidth, frameHeight){
            load_spritesheet(key, path, frameWidth, frameHeight);
        }
    },

    /*
    * @name unload
    * @type method
    * @description unload an image asset from cache
    * @param {key}{String}{unique name of the image asset}
    */
    unload: function(key){
        unload_image(key);
    },


    /*
    * @name beginLoading
    * @type method
    * @description begin loading (automatiacally run at the end of the the canvas's preload function)
    */
    beginLoading: (canvas)=>{
        start_load(canvas);
    },

    /*
    * @name add
    * @type obj
    * @description add engine2d assets to the scene
    */
    add:{
        /*
        * @name image
        * @type method
        * @description adds an <a href="virtuosity.engine2d.Image.html">image</a> to the scene
        * @parent add
        * @param {canvas}{String}{Name of the canvas to add to}
        * @param {name}{String}{unique name of the image}
        * @param {x}{Number}{x position of the image}
        * @param {y}{Number}{y position of the image}
        * @param {key}{String}{name of the image asset to use}
        * @param {onComplete}{Function}{function to run after adding the image (takes the newly create image as a parameter)}
        */
        image: function(canvas, name, x, y, key, onComplete){
            add_image(canvas, name, x, y, key, onComplete);
        },

        /*
        * @name sprite
        * @type method
        * @description adds a <a href="virtuosity.engine2d.Sprite.html">sprite</a> to the scene
        * @parent add
        * @param {canvas}{String}{Name of the canvas to add to}
        * @param {name}{String}{unique name of the sprite}
        * @param {x}{Number}{x position of the sprite}
        * @param {y}{Number}{y position of the sprite}
        * @param {key}{String}{name of the sprite asset to use}
        * @param {onComplete}{Function}{function to run after adding the sprite (takes the newly create sprite as a parameter)}
        */
        sprite: function(canvas, name, x, y, key, onComplete){
            add_sprite(canvas, name, x, y, key, onComplete);
        },

        /*
        * @name text
        * @type method
        * @description adds <a href="virtuosity.engine2d.Text.html">text</a> to the scene
        * @parent add
        * @param {canvas}{String}{Name of the canvas to add to}
        * @param {name}{String}{unique name of the text}
        * @param {x}{Number}{x position of the text}
        * @param {y}{Number}{y position of the text}
        * @param {text}{String}{the text for the text object to show}
        * @param {fontSize}{Int}{font size of the text}
        * @param {onComplete}{Function}{function to run after adding the text (takes the newly create text as a parameter)}
        */
        text: function(canvas, name, x, y, text, fontSize, onComplete){
            add_text(canvas, name, x, y, text, fontSize, onComplete);
        },

        /*
        * @name textbox
        * @type method
        * @description adds a <a href="virtuosity.engine2d.Textbox.html">textbox</a> to the scene
        * @parent add
        * @param {canvas}{String}{Name of the canvas to add to}
        * @param {name}{String}{unique name of the textbox}
        * @param {x}{Number}{x position of the textbox}
        * @param {y}{Number}{y position of the textbox}
        * @param {onComplete}{Function}{function to run after adding the textbox (takes the newly create textbox as a parameter)}
        */
        textbox: function(canvas, name, x, y, onComplete){
            add_textbox(canvas, name, x, y, onComplete);
        }
    },

    /*
    * @name get
    * @type obj
    * @description get engine2d assets
    */
    get: {
        /*
        * @name image
        * @type method
        * @description gets an <a href="virtuosity.engine2d.Image.html">image</a> or <a href="virtuosity.engine2d.Sprite.html">sprite</a>
        * @parent get
        * @param {canvas}{String}{name of the canvas}
        * @param {name}{String}{name of the <a href="virtuosity.engine2d.Image.html">image</a> or <a href="virtuosity.engine2d.Sprite.html">sprite</a>}
        */
        image: function(canvas, name){
            return get_image(canvas, name);
        },

        /*
        * @name text
        * @type method
        * @description gets <a href="virtuosity.engine2d.Text.html">text</a>
        * @parent get
        * @param {canvas}{String}{name of the canvas}
        * @param {name}{String}{name of the <a href="virtuosity.engine2d.Text.html">text</a>}
        */
        text: function(canvas, name){
            return get_text(canvas, name);
        },

        /*
        * @name textbox
        * @type method
        * @description gets a <a href="virtuosity.engine2d.Textbox.html">textbox</a>
        * @parent get
        * @param {canvas}{String}{name of the canvas}
        * @param {name}{String}{name of the <a href="virtuosity.engine2d.Textbox.html">textbox</a>}
        */
        textbox: function(canvas, name){
            return get_textbox(canvas, name);
        },

        /*
        * @name canvas
        * @type method
        * @description get the DOM canvas
        * @parent get
        * @param {name}{String}{name of the canvas}
        */
        canvas: function(name){
            return canvases.get(name).view;
        }
    },

    /*
    * @name delete
    * @type obj
    * @description delete engine2d assets
    */
    delete: {
        /*
        * @name image
        * @type method
        * @description deletes an <a href="virtuosity.engine2d.Image.html">image</a> or <a href="virtuosity.engine2d.Sprite.html">sprite</a>
        * @parent delete
        * @param {canvas}{String}{name of the canvas}
        * @param {name}{String}{name of the <a href="virtuosity.engine2d.Image.html">image</a> or <a href="virtuosity.engine2d.Sprite.html">sprite</a>}
        */
        image: function(canvas, name){
            return delete_image(canvas, name);
        },

        /*
        * @name text
        * @type method
        * @description deletes <a href="virtuosity.engine2d.Text.html">text</a>
        * @parent delete
        * @param {canvas}{String}{name of the canvas}
        * @param {name}{String}{name of the <a href="virtuosity.engine2d.Text.html">text</a>}
        */
        text: function(canvas, name){
            return delete_text(canvas, name);
        },

        /*
        * @name textbox
        * @type method
        * @description deletes a <a href="virtuosity.engine2d.Textbox.html">textbox</a>
        * @parent delete
        * @param {canvas}{String}{name of the canvas}
        * @param {name}{String}{name of the <a href="virtuosity.engine2d.Textbox.html">textbox</a>}
        */
        textbox: function(canvas, name){
            return delete_textbox(canvas, name);
        }
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
    * @name graphics
    * @type obj
    * @description procedural graphics
    * @path graphics.js
    */
    graphics: {
        add: {
            container: (name, canvas)=>{
                graphics.add.container(name, canvases.get(canvas));
            },
            circle: (...params)=>{
                graphics.add.circle(...params);
            },
            rectangle: (...params)=>{
                graphics.add.rectangle(...params);
            },
            box: (...params)=>{
                graphics.add.box(...params);
            },
            line: (...params)=>{
                graphics.add.line(...params);
            },
            ellipse: (...params)=>{
                graphics.add.ellipse(...params);
            },
            torus: (...params)=>{
                graphics.add.torus(...params);
            },
            polygon: (...params)=>{
                graphics.add.polygon(...params);
            },
        },
        get: graphics.get,
        delete: graphics.delete,
        containerClear: graphics.containerClear
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
    * @name canvas
    * @type obj
    * @description properties of a canvas
    */
    canvas: {
        /*
        * @name xPos
        * @type method
        * @description get / set the x position of a canvas
        * @parent canvas
        * @param {canvas}{String}{name of the canvas}
        * @param {x}{Int}{x position of the canvas}
        */
        xPos: function(canvas, x){
            var ctx = canvases.get(canvas);
            if(x != null){
                ctx.view.style.left = x + "px";
                return x;
            }else{
                var str = ctx.view.style.left;
                return JSON.parse(str.substring(0, str.length-2))
            }
        },

        /*
        * @name yPos
        * @type method
        * @description get / set the y position of a canvas
        * @parent canvas
        * @param {canvas}{String}{name of the canvas}
        * @param {y}{Int}{y position of the canvas}
        */
        yPos: function(canvas, y){
            var ctx = canvases.get(canvas);
            if(y != null){
                ctx.view.style.top = y + "px";
                return y;
            }else{
                var str = ctx.view.style.top;
                return JSON.parse(str.substring(0, str.length-2))
            }
        },

        /*
        * @name width
        * @type method
        * @description get / set the width of a canvas
        * @parent canvas
        * @param {canvas}{String}{name of the canvas}
        * @param {width}{Int}{width of the canvas}
        */
        width: function(canvas, width){
            var ctx = canvases.get(canvas);
            if(width != null){
                ctx.view.style.width = width + "px";
                var height_str = ctx.view.style.height;
                ctx.renderer.resize(width, JSON.parse(height_str.substring(0, height_str.length-2)));
                return width;
            }else{
                var str = ctx.view.style.width;
                return JSON.parse(str.substring(0, str.length-2))
            }
        },

        /*
        * @name height
        * @type method
        * @description get / set the height of a canvas
        * @parent canvas
        * @param {canvas}{String}{name of the canvas}
        * @param {height}{Int}{height of the canvas}
        */
        height: function(canvas, height){
            var ctx = canvases.get(canvas);
            if(height != null){
                ctx.view.style.height = height + "px";
                var width_str = ctx.view.style.width;
                ctx.renderer.resize(JSON.parse(width_str.substring(0, width_str.length-2)), height);
                return height;
            }else{
                var str = ctx.view.style.height;
                return JSON.parse(str.substring(0, str.length-2))
            }
        },


        /*
        * @name zIndex
        * @type method
        * @description get / set the zIndex of a canvas
        * @parent canvas
        * @param {canvas}{String}{name of the canvas}
        * @param {zIndex}{Int}{<b>(Optional)</b> the value to set the z index}
        */
        zIndex: function(canvas, zIndex){
            var ctx = canvases.get(canvas);
            if(zIndex != null){
                ctx.zIndex = zIndex;
            }
            return ctx.zIndex;
        },

        get: function(canvas){
            return canvases.get(canvas);
        },

        destroy: function(canvas){
            var ctx = canvases.get(canvas);
            clearInterval(ctx.update);
            ctx.images.forEach((image)=>{
                delete_image(canvas, image.name.substring(0, image.name.indexOf("╎")));
            });
            ctx.texts.forEach((text)=>{
                delete_text(canvas, text.name.substring(0, text.name.indexOf("╎")));
            });
            ctx.textboxes.forEach((textbox)=>{
                delete_textbox(canvas, textbox.name.substring(0, textbox.name.indexOf("╎")));
            })
            ctx.containers.forEach((container)=>{
                graphics.delete.container(container);
            });

            canvases.delete(canvas);
            ctx.destroy(true, {stageOptions: true});
        }
    },

    /*
    * @name expose
    * @type method
    * @description interact with the Pixi.js render engine directly
    */
    expose: function(){
        return PIXI;
    }
}