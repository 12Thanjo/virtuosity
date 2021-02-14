var debug = require('./debug.js');

var Howl = require('howler').Howl;

/*
* @name Audio
* @type class
* @description An audio entity created with: <div class="code"><span class="red">new</span> <span class="green">virtuosity</span>.<span class="green">audioManager</span>.<span class="blue">Audio</span>(<span class="orange">name</span>, <span class="orange">path</span>);</div>
*/
var audios = new Map();
var Audio = function(name, path){
	if(audios.has(name)){
		debug.error('Overwrite', `Audio ${name} already exists`);
	}

	audios.set(name, this);


	this.name = name;
	this.path = path;
	this.DATA = {
		x: 0,
		y: 0,
		z: 0,
		loaded: false,
	}
	
	this.DATA.howl = new Howl({
		src: [path],
		onload: ()=>{
			this.DATA.loaded = true;
		}
	});

	/*
	* @name play
	* @type method
	* @description plays the audio
	* @parent Audio
	*/
	this.play = function(){
		this.DATA.howl.play();
		if(!this.DATA.loaded){
			console.log(`waiting for Audio (${this.name}) to load`);		
		}
	}

	/*
	* @name pause
	* @type method
	* @description pauses the audio
	* @parent Audio
	*/
	this.pause = function(){
		this.DATA.howl.pause();
	}

	/*
	* @name stop
	* @type method
	* @description stops the audio
	* @parent Audio
	*/
	this.stop = function(){
		this.DATA.howl.stop();
	}

	/*
	* @name fade
	* @type method
	* @description fades the audio
	* @parent Audio
	* @param {from}{Number}{starting point, value between 0-1 (1 being the loudest).}
	* @param {to}{Number}{ending point, value between 0-1 (1 being the loudest).}
	* @param {duration}{Number}{length of time the fade takes (in miliseconds)}
	*/
	this.fade = function(from, to, duration){
		this.DATA.howl.fade(from, to, duration);
	}


	/*
	* @name x
	* @type property
	* @proto Int
	* @description x position of the audio
	* @parent Audio
	*/
	Object.defineProperty(this, "x", {
		get: ()=>{
			return this.DATA.x;
		},
		set: (val)=>{
			this.DATA.x = val;
			this.DATA.howl.pos(this.DATA.x, this.DATA.y, this.DATA.z);
		}
	});

	/*
	* @name y
	* @type property
	* @proto Int
	* @description y position of the audio
	* @parent Audio
	*/
	Object.defineProperty(this, "y", {
		get: ()=>{
			return this.DATA.y;
		},
		set: (val)=>{
			this.DATA.y = val;
			this.DATA.howl.pos(this.DATA.x, this.DATA.y, this.DATA.z);
		}
	});

	/*
	* @name z
	* @type property
	* @proto Int
	* @description z position of the audio
	* @parent Audio
	*/
	Object.defineProperty(this, "z", {
		get: ()=>{
			return this.DATA.z;
		},
		set: (val)=>{
			this.DATA.z = val;
			this.DATA.howl.pos(this.DATA.x, this.DATA.y, this.DATA.z);
		}
	});

	/*
	* @name volume
	* @type property
	* @proto Number
	* @description volume of the audio
	* @parent Audio
	*/
	Object.defineProperty(this, "volume", {
		get: ()=>{
			return this.DATA.howl.volume();
		},
		set: (val)=>{
			this.DATA.volume = val;
			this.DATA.howl.volume(val);
		}
	});

	/*
	* @name length
	* @type property
	* @proto Int
	* @description length of the audio
	* @parent Audio
	*/
	Object.defineProperty(this, "length", {
		get: ()=>{
			return this.DATA.howl.duration();
		}
	});

	/*
	* @name time
	* @type property
	* @proto Int
	* @description current time of the audio
	* @parent Audio
	*/
	Object.defineProperty(this, "time", {
		get: ()=>{
			return this.DATA.howl.seek();
		},
		set: (val)=>{
			this.DATA.howl.seek(val);
		}
	});

	/*
	* @name speed
	* @type property
	* @proto Number
	* @description speed of the audio (between 0.5 and 4)
	* @parent Audio
	*/
	Object.defineProperty(this, "speed", {
		get: ()=>{
			return this.DATA.howl.rate();
		},
		set: (val)=>{
			this.DATA.howl.rate(val);
		}
	});

	/*
	* @name loaded
	* @type property
	* @proto Boolean
	* @description boolean value of if the audio has loaded
	* @parent Audio
	*/
	Object.defineProperty(this, "loaded", {
		get: ()=>{
			return this.DATA.loaded;
		}
	});

	/*
	* @name loop
	* @type property
	* @proto Boolean
	* @description boolean value of if the audio will loop
	* @parent Audio
	*/
	Object.defineProperty(this, "loop", {
		get: ()=>{
			return this.DATA.howl.loop();
		},
		set: (val)=>{
			this.DATA.howl.loop(val);
		}
	});
}

// set global volume
var set_volume = function(volume){
	Howler.volume(volume);
}



module.exports = {
	Audio: Audio,
	/*
	* @name setGlobalVolume
	* @type method
	* @description sets the global maximum volume
	* @param {volume}{Number}{the global maximum value between 0-1 (1 being the loudest).}
	*/
	setGlobalVolume: (volume)=>{
		set_volume(volume);
	},

	/*
	* @name get
	* @type method
	* @description get an audio entity
	* @param {name}{String}{name of the audio entity}
	*/
	get: (name)=>{
		if(!audios.has(name)){
			return audios.get(name);
		}else{
			debug.error('ReferenceError', `Audio ${name} doesn't exists`);
		}
	},

	/*
	* @name delete
	* @type method
	* @description deletes an audio entity
	* @param {name}{String}{name of the audio entity}
	*/
	delete: (name)=>{
		if(audios.has(name)){
			var audio_target = audios.get(name);
			var index = Howler._howls.indexOf(audio_target);
			if(index){
				Howler._howls.splice(index, 1);
			}
			audios.delete(name);
		}else{
			debug.error('ReferenceError', `Audio ${name} doesn't exists`);
		}
	}
};