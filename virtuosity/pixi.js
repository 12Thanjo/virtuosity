var PIXI = require('pixi.js');
var escs = require("../virtuosity-server/node_modules/escs/index.js");
var debug = require('./debug.js');


var canvases = new Map();
var new_canvas = function(name, config){
    if(config.resolution == null){
        config.resolution = 1;
    }else{
        config.resolution /= screen.height;
    }

    if(config.antialias == null){
        config.antialias = true;
    }

    if(config.powerPreference == null){
        config.powerPreference = 'low-power';
    }

    var scale = 1;

    if(config.defaultResolution){
        scale = screen.height / config.defaultResolution;
    }

    var new_ctx = new PIXI.Application({
        width: screen.width / scale,
        height: screen.height / scale, 
        backgroundAlpha: 0,
        powerPreference: config.powerPreference,
        antialias: config.antialias,
        transparent: true,
        resolution: config.resolution
    });
    document.body.appendChild(new_ctx.view);
    new_ctx.view.style.width = screen.width + "px";
    new_ctx.view.style.height = screen.height + 'px';
    canvases.set(name, new_ctx);

    new_ctx.started = false;

    if(config.preload != null){
        config.preload();
    }
    if(config.create != null){
        config.create();
    }

    if(config.render == null){
        config.render = ()=>{};
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


    new_ctx.update_events = new Map();
    new_ctx.render_events = new Map();

    if(config.update != null){
        new_ctx.update_events.set('config', config.update);
    }

    if(config.render != null){
        new_ctx.render_events.set('config', config.render);
    }


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
    }, 1000/(config.poll || 64))


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
load_image = function(key, path, onComplete){
    load_queue += 1;
    var ctx = canvases.entries().next().value[1];
    loading_textures.set(key, []);
    ctx.loader.add(key, path).load((loader, resources)=>{
        textures.set(key, resources[key].texture)
        loading_textures.get(key).forEach((action)=>{
            action();
        });
        loading_textures.delete(key);
        load_queue -= 1;
        if(onComplete){
            onComplete(loader, resources);
        }
    });
}




// escs ///////////////////////////////////////////////////
/*
* @name engine2d
* @type environment
*/
var env = escs.add.environment('engine2d');

/*
* @name pixi
* @type component
* @description reference to the render object
* @env engine2d
* @param {pixi}{Pixi.js object}{reference to the pixi render object (internal)}
*/
escs.add.component('pixi', 'engine2d', (pixi)=>{
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
var position = escs.add.component("position", 'engine2d', (x, y)=>{
    return{
        x: x || 0,
        y: y || 0
    }
});
position.setOnChange((entity, key, val)=>{
    entity.getComponent('pixi').pixi[key] = val;
});


/*
* @name rotation
* @type component
* @description rotation of the render object
* @env engine2d
* @param {rotation}{Number}{rotation of the render object}
*/
var rotation = escs.add.component("rotation", 'engine2d', (r)=>{
    return{
        rotation: r || 0
    }
});
rotation.setOnChange((entity, key, val)=>{
    entity.getComponent('pixi').pixi.rotation = val;
});

/*
* @name anchor
* @type component
* @description the position and rotation point of the render object
* @env engine2d
* @param {x}{Number}{x coordinate of the anchor point}
* @param {y}{Number}{y coordinate of the anchor point}
*/
var anchor = escs.add.component("anchor", 'engine2d', (x, y)=>{
    return{
        x: x || 0,
        y: y || 0
    }
});
anchor.setOnChange((entity, key, val)=>{
    entity.getComponent('pixi').pixi.anchor[key] = val;
});


/*
* @name alpha
* @type component
* @description alpha of the render object
* @env engine2d
* @param {alpha}{Number}{alpha of the render object}
*/
var alpha = escs.add.component("alpha", 'engine2d', (alpha)=>{
    return{
        alpha: 1 || alpha
    }
});
alpha.setOnChange((entity, key, val)=>{
    entity.getComponent('pixi').pixi.alpha = val;
});

/*
* @name scale
* @type component
* @description the scale of the render object
* @env engine2d
* @param {width}{Number}{width of the render object}
* @param {height}{Number}{height of the render object}
*/
var scale = escs.add.component("scale", 'engine2d', (width, height)=>{
    return{
        width: width,
        height: height
    }
});
scale.setOnChange((entity, key, val)=>{
    entity.getComponent('pixi').pixi[key] = val;
});



/*
* @name image
* @type entity
* @description An image using a loaded texture created by <a href="./virtuosity.engine2d.add.html#method-image">add.image</a>
* @env engine2d
* @component pixi
* @component position
* @component rotation
* @component anchor
* @component alpha
* @component scale
*/
var images = new Map();
var add_image = function(canvas, name, x, y, key, onComplete){
    if(textures.has(key)){
        var ctx = canvases.get(canvas);
        var new_img = new PIXI.Sprite(ctx.loader.resources[key].texture);

        var new_entity = escs.add.entity(name, 'engine2d')
            .addComponent('pixi', new_img)
            .addComponent('position', x, y)
            .addComponent('rotation')
            .addComponent('anchor')
            .addComponent('alpha')
            .addComponent('scale', new_img.width, new_img.height)

        var pos = new_entity.getComponent('position');
        pos.x = x;
        pos.y = y;

        ctx.stage.addChild(new_img);
        if(onComplete!=null){
            onComplete(new_entity);
        }
        images.set(name, new_entity)
    }else if(loading_textures.has(key)){
        console.log(`waiting for texture (${key}) to load`);
        loading_textures.get(key).push(()=>{add_image(canvas, name, x, y, key, onComplete);});
    }else{
        debug.warn("ReferenceError", `texture (${key}) is not loaded or in load queue`);
    }
}


var get_image = function(name){
    if(images.has(name)){
        return images.get(name);
    }else{
        debug.warn('ReferenceError', `image (${name}) does not exist`);
        return null;
    }
}


var delete_image = function(name){
    if(images.has(name)){
        images.get(name).getComponent('pixi').pixi.destroy();
        images.delete(name);
    }else{
        debug.warn('ReferenceError', `image (${name}) does not exist`);
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
var text = escs.add.component("text", 'engine2d', (text)=>{
    return{
        text: text
    }
});
text.setOnChange((entity, key, val)=>{
    entity.getComponent('pixi').pixi.text = val;
});

/*
* @name style
* @type component
* @description stylization of the text
* @env engine2d
* @param {fontSize}{Int}{size of the font in pixels}
* @param {fontFamily}{String}{font type of the text}{"Trebuchet"}
* @param {fill}{Hex}{color of the text}{0xffffff}
* @param {align}{String}{alignment of the text}{'left'}
* @param {stroke}{Hex}{color of the text outline}{"black"}
* @param {strokeThickness}{Int}{thickness of the text outline}{0}
* @param {letterSpacing}{Int}{spacing between the letters}{0}
* @param {lineHeight}{Int}{line height of the text}{fontSize + 2}
*/
var style = escs.add.component("style", 'engine2d', (fontSize, color)=>{
    return{
        fontSize: fontSize,
        fontFamily: "Trebuchet",
        fill: 0xffffff,
        align: 'left',
        stroke: color || "black",
        strokeThickness: 0,
        letterSpacing: 0,
        lineHeight: fontSize + 2
    }
});
style.setOnChange((entity, key, val)=>{
    entity.getComponent('pixi').pixi.style[key] = val;
});


/*
* @name text
* @type entity
* @description A text entity created by <a href="./virtuosity.engine2d.add.html#method-text">add.text</a>
* @env engine2d
* @component pixi
* @component position
* @component rotation
* @component anchor
* @component alpha
* @component style
* @component text
*/
var texts = new Map();
var add_text = function(canvas, name, x, y, text, fontSize, onComplete){
    var ctx = canvases.get(canvas);
    var new_txt = new PIXI.Text(text, {
        fontSize: fontSize,
        fill: 0xffffff,
        fontFamily: "Trebuchet"
    });

    var new_entity = escs.add.entity(name, 'engine2d')
        .addComponent('pixi', new_txt)
        .addComponent('position', x, y)
        .addComponent('rotation')
        .addComponent('anchor')
        .addComponent('alpha')
        .addComponent('style', fontSize)
        .addComponent('text', text)


    ctx.stage.addChild(new_txt);
    if(onComplete!=null){
        onComplete(new_entity);
    }
    texts.set(name, new_entity);
}

var get_text = function(name){
    if(texts.has(name)){
        return texts.get(name);
    }else{
        debug.warn('ReferenceError', `text (${name}) does not exist`);
        return null;
    }
}

var delete_text = function(name){
    if(texts.has(name)){
        texts.get(name).getComponent('pixi').pixi.destroy();
        texts.delete(name);
    }else{
        debug.warn('ReferenceError', `text (${name}) does not exist`);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
* @name engine2d-textbox
* @type environment
*/
var textbox_env = escs.add.environment('engine2d-textbox');


/*
* @name textbox
* @type component
* @description reference to the DOM textbox entity
* @env engine2d-textbox
* @param {textbox}{DOM}{reference to the DOM textbox entity}
*/
escs.add.component('textbox', 'engine2d-textbox', (textbox)=>{
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
var textbox_position = escs.add.component('position', 'engine2d-textbox', (x, y)=>{
    return {
        x: x,
        y: y
    }
});
textbox_position.setOnChange((entity, key, val)=>{
    if(key == "x"){
        entity.getComponent('style').style.left = val + "px";
    }else{
        entity.getComponent('style').style.top = val + "px";
    }
});

/*
* @name fontSize
* @type component
* @description fontSize of the textbox
* @env engine2d-textbox
* @param {fontSize}{Int}{fontSize of the textbox}{19}
*/
var textbox_fontSize = escs.add.component('fontSize', 'engine2d-textbox', (fontSize)=>{
    return {
        fontSize: fontSize
    }
});
textbox_fontSize.setOnChange((entity, key, val)=>{
    entity.getComponent('style').style.fontSize = val + "px";
});

/*
* @name width
* @type component
* @description width of the textbox
* @env engine2d-textbox
* @param {width}{Int}{width of the textbox}{100}
*/
var textbox_width = escs.add.component('width', 'engine2d-textbox', (width)=>{
    return {
        width: width
    }
});
textbox_width.setOnChange((entity, key, val)=>{
    entity.getComponent('style').style.width = val + "px";
});

/*
* @name value
* @type component
* @description value of the textbox
* @env engine2d-textbox
* @param {value}{Int}{value of the textbox}
*/
var textbox_value = escs.add.component('value', 'engine2d-textbox', (value)=>{
    return {
        value: value
    }
});
textbox_value.setOnChange((entity, key, val)=>{
    entity.getComponent('textbox').textbox.value = val;
});

/*
* @name style
* @type component
* @description reference to the style property DOM textbox entity
* @env engine2d-textbox
* @param {textbox}{DOM}{reference to the style property DOM textbox entity}
*/
var textbox_style = escs.add.component('style', 'engine2d-textbox', (textbox)=>{
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
var textbox_events = escs.add.component('events', 'engine2d-textbox', ()=>{
    return {
        onkeypress: ()=>{},
        onfocus: ()=>{},
        onblur: ()=>{}
    }
});


/*
* @name textbox
* @type entity
* @description A textbox entity created by <a href="./virtuosity.engine2d.add.html#method-textbox">add.textbox</a>
* @env engine2d-textbox
* @component textbox
* @component position
* @component fontSize
* @component width
* @component value
* @component style
* @component events
*/
var textboxes = new Map();
var add_textbox = function(canvas, name, x, y, onComplete){
    var input = document.createElement("input");
    var style = input.style;
    style.position = 'absolute';
    style.top = y + "px";
    style.left = x + "px";
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
            return JSON.parse(left.substr(0, left.lengt-3));
        },
        set: (val)=>{
            input.style.left = val + "px";
        }
    });

    Object.defineProperty(input, "y", {
        get: ()=>{
            var top = input.style.top;
            return JSON.parse(top.substr(0, top.lengt-3));
        },
        set: (val)=>{
            input.style.top = val + "px";
        }
    });


    var new_textbox = escs.add.entity(name, 'engine2d-textbox')
        .addComponent('textbox', input)
        .addComponent('style', input.style)
        .addComponent('position', x, y)
        .addComponent('fontSize', 19)
        .addComponent('width', 100)
        .addComponent('value', input.value)
        .addComponent('events')

    input.starting_value = "";
    input.onkeydown = (e)=>{
        new_textbox.getComponent('value').value = input.value;
        new_textbox.getComponent('events').onkeypress();
        if(e.key == "Enter"){
            input.starting_value = input.value;
            input.blur();
        }else if(e.key == "Escape"){
            input.value = input.starting_value;
            new_textbox.getComponent('value').value = input.value;
            input.blur();
        }
    }
    input.onfocus = ()=>{
        new_textbox.getComponent('events').onfocus();
    }
    input.onblur = ()=>{
        new_textbox.getComponent('value').value = input.value;
        console.log("value:", new_textbox.getComponent('value').value);
        new_textbox.getComponent('events').onblur();
    }

    textboxes.set(name, new_textbox);

    onComplete(new_textbox);
}

var get_textbox = function(name){
    if(textboxes.has(name)){
        return textboxes.get(name);
    }else{
        debug.warn('ReferenceError', `textbox (${name}) does not exist`);
        return null;
    }
}

var delete_textbox = function(name){
    if(textboxes.has(name)){
        textboxes.get(name).getComponent('pixi').pixi.destroy();
        textboxes.delete(name);
    }else{
        debug.warn('ReferenceError', `textbox (${name}) does not exist`);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
var graphics = require('./graphics.js')(PIXI, canvases);

module.exports = {
    /*
    * @name newCanvas
    * @type method
    * @description creates a new canvas
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
    * @name addToLoadQueue
    * @type obj
    * @description adds an asset to the load queue
    */
    addToLoadQueue: {
        /*
        * @name image
        * @type method
        * @description adds an immage to the load queue
        * @parent addToLoadQueue
        * @param {key}{String}{unique name of the image asset}
        * @param {path}{String}{path of the image asset}
        * @param {onComplete}{Function}{function to complete when the image asset is loaded}
        */
        image: function(key, path, onComplete){
            load_image(key, path, onComplete);
        }
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
        * @description adds an image to the scene
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
        * @name text
        * @type method
        * @description adds text to the scene
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
        * @description adds a textbox to the scene
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
        * @description gets an image
        * @parent get
        * @param {name}{String}{name of the image}
        */
        image: function(name){
            return get_image(name);
        },

        /*
        * @name text
        * @type method
        * @description gets text
        * @parent get
        * @param {name}{String}{name of the text}
        */
        text: function(name){
            return get_text(name);
        },

        /*
        * @name textbox
        * @type method
        * @description gets a textbox
        * @parent get
        * @param {name}{String}{name of the textbox}
        */
        textbox: function(name){
            return get_textbox(name);
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
        * @description deletes an image
        * @parent delete
        * @param {name}{String}{name of the image}
        */
        image: function(name){
            return delete_image(name);
        },

        /*
        * @name text
        * @type method
        * @description deletes text
        * @parent delete
        * @param {name}{String}{name of the text}
        */
        text: function(name){
            return delete_text(name);
        },

        /*
        * @name textbox
        * @type method
        * @description deletes a textbox
        * @parent delete
        * @param {name}{String}{name of the textbox}
        */
        textbox: function(name){
            return delete_textbox(name);
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
    * @name expose
    * @type method
    * @description interact with the Pixi.js render engine directly
    */
    expose: function(){
        return PIXI;
    }
}