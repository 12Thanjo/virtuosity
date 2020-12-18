var DOWN = [140]; //make an array to cover all the keypresses you should need with a normal keyboard
var DOWN_MAP = new Map([["A",65],["B",66],["C",67],["D",68],["E",69],["F",70],["G",71],["H",72],["I",73],["J",74],["K",75],["L",76],["M",77],["N",78],["O",79],["P",80],["Q",81],["R",82],["S",83],["T",84],["U",85],["V",86],["W",87],["X",88],["Y",89],["Z",90],["ZERO",48],["ONE",49],["TWO",50],["THREE",51],["FOUR",52],["FIVE",53],["SIX",54],["SEVEN",55],["EIGHT",56],["NINE",57],["NUMPAD_0",96],["NUMPAD_1",97],["NUMPAD_2",98],["NUMPAD_3",99],["NUMPAD_4",100],["NUMPAD_5",101],["NUMPAD_6",102],["NUMPAD_7",103],["NUMPAD_8",104],["NUMPAD_9",105],["NUMPAD_MULTIPLY",106],["NUMPAD_ADD",107],["NUMPAD_ENTER",108],["NUMPAD_SUBTRACT",109],["NUMPAD_DECIMAL",110],["NUMPAD_DIVIDE",111],["F1",112],["F2",113],["F3",114],["F4",115],["F5",116],["F6",117],["F7",118],["F8",119],["F9",120],["F10",121],["F11",122],["F12",123],["F13",124],["F14",125],["F15",126],["COLON",186],["EQUALS",187],["COMMA",188],["UNDERSCORE",189],["PERIOD",190],["QUESTION_MARK",191],["TILDE",192],["OPEN_BRACKET",219],["BACKWARD_SLASH",220],["CLOSED_BRACKET",221],["QUOTES",222],["BACKSPACE",8],["TAB",9],["CLEAR",12],["ENTER",13],["SHIFT",16],["CONTROL",17],["ALT",18],["CAPS_LOCK",20],["ESC",27],["SPACEBAR",32],["PAGE_UP",33],["PAGE_DOWN",34],["END",35],["HOME",36],["LEFT",37],["UP",38],["RIGHT",39],["DOWN",40],["PLUS",43],["MINUS",44],["INSERT",45],["DELETE",46],["HELP",47],["NUM_LOCK",144]]);//used for key strings
var mouse_x = 0;
var mouse_y = 0;
var left_down = false;
var right_down = false;
var middle_down = false;
var scroll_x = 0;
var scroll_y = 0;

var keydown_event = function(event){
	if(!DOWN[event.keyCode]){
  		DOWN[event.keyCode] = true;
  	}
}

var keyup_event = function(event){
	DOWN[event.keyCode] = false;
}

var onmousedown_event = function(event){
	if(event.button == 0){
		left_down = true;
	}else if(event.button == 2){
		right_down = true;
	}else if(event.button == 1){
		middle_down = true;
		event.preventDefault();
	}
}

var onmouseup_event = function(event){
	if(event.button == 0){
		left_down = false;
	}else if(event.button == 2){
		right_down = false;
	}else if(event.button == 1){
		middle_down = false;
	}
}

var onmousemove_event = function(event){
	mouse_x = event.clientX;
	mouse_y = event.clientY;
}

var onwheel_event = function(event){
	scroll_x += event.deltax;
	scroll_y += event.deltaY;
}


var input_div = document.createElement('div');
input_div.style.width = '0';
input_div.style.overflowX = "hidden";
input_div.style.overflowY = "hidden";
input_div.style.top = "0px";
input_div.style.left = "0px";
input_div.style.position = 'absolute';
input = document.createElement("input");
input.type = "text";
input.focused = false;
input_div.appendChild(input);
document.getElementsByTagName('html')[0].appendChild(input_div);

focusInput = {
	focus: (func)=>{
		focusTextInput(func);
	},
	blur: ()=>{
		blurTextInput();
	},
	clear: ()=>{
		clearTextInput();
	},
	set: (val)=>{
		setTextInput(val);
	}
};

Object.defineProperty(focusInput, 'isFocused', {
	get: ()=>{
		return input.focused;
	}
});

Object.defineProperty(focusInput, 'cursorStart', {
	get: ()=>{
		return input.selectionStart;
	}
});

Object.defineProperty(focusInput, 'cursorEnd', {
	get: ()=>{
		return input.selectionEnd;
	}
});


var text_input_func = ()=>{};


var focusTextInput = function(func){
	text_input_func = func;
	input.focused = true;
	input.oninput = function(){
		if(func != null){
			func(input.value);
		}
	}
	input.focus();
}




var blurTextInput = function(){
	input.focused = false;
	input.blur();
	input.oninput = ()=>{};
}


var clearTextInput = function(){
	input.value = "";
}

var setTextInput = function(val){
	input.value = val;
}



var events_working = true;
document.addEventListener('keydown', keydown_event);
document.addEventListener('keyup', keyup_event);
document.addEventListener('mousedown', onmousedown_event);
document.addEventListener('mouseup', onmouseup_event);
document.addEventListener('mousemove', onmousemove_event);
document.addEventListener('wheel', onwheel_event);

var key_presses = new Map();
var Key_Press = function(keys){
	this.keys = keys;
	this.down = false;

	this.triggered = function(){
		if(this.down){
			this.keys.forEach((key)=>{
				if(!DOWN[DOWN_MAP.get(key)]){
					this.down = false;
				}
			});
			return false;
		}else{
			this.down = true;
			this.keys.forEach((key)=>{
				if(!DOWN[DOWN_MAP.get(key)]){
					this.down = false;
				}
			});
			return this.down;
		}
	}
}

var code_key_presses = new Map();
var Code_Key_Press = function(keys){
	this.keys = keys;
	this.down = false;

	this.triggered = function(){
		if(this.down){
			this.keys.forEach((key)=>{
				if(!DOWN[key]){
					this.down = false;
				}
			});
			return false;
		}else{
			this.down = true;
			this.keys.forEach((key)=>{
				if(!DOWN[key]){
					this.down = false;
				}
			});
			return this.down;
		}
	}
}


var key_releases = new Map();
var Key_Release = function(keys){
	this.keys = keys;
	this.all_down = false;
	this._triggered = false;

	this.triggered = function(){
		if(!this.all_down){
			if(this._triggered){
				this._triggered = false;
				return true;
			}else{
				this.all_down = true;
				this.keys.forEach((key)=>{
					if(!DOWN[DOWN_MAP.get(key)]){
						this.all_down = false;
					}
				});
				return false;
			}
		}else if(this._triggered){
			this.all_down = false;
			this.keys.forEach((key)=>{
				if(DOWN[DOWN_MAP.get(key)]){
					this.all_down = true;
				}
			});
			return false;
		}else if(!this._triggered){
			this._triggered = true;
			return false;
		}
	}
}


var code_key_releases = new Map();
var Code_Key_Release = function(keys){
	this.keys = keys;
	this.all_down = false;
	this._triggered = false;

	this.triggered = function(){
		if(!this.all_down){
			if(this._triggered){
				this._triggered = false;
				return true;
			}else{
				this.all_down = true;
				this.keys.forEach((key)=>{
					if(!DOWN[0]){
						this.all_down = false;
					}
				});
				return false;
			}
		}else if(this._triggered){
			this.all_down = false;
			this.keys.forEach((key)=>{
				if(DOWN[0]){
					this.all_down = true;
				}
			});
			return false;
		}else if(!this._triggered){
			this._triggered = true;
			return false;
		}
	}
}

var left_pressed = false;
var triggered_left_press = false;
var left_press = function(){
	if(!triggered_left_press){
		if(left_down){
			triggered_left_press = true;
			left_pressed = true;
		}else{
			left_pressed = false;
		}
	}else{
		if(!left_down){
			triggered_left_press = false;
		}
		left_pressed = false;
	}
}

var left_released = false;
var triggered_left_release = false;
var left_release = function(){
	if(!triggered_left_release){
		if(left_down){
			triggered_left_release = true;
		}
		left_released = false;
	}else{
		if(!left_down){
			triggered_left_release = false;
			left_released = true;
		}else{
			left_released = false;
		}
	}
}


var right_pressed = false;
var triggered_right_press = false;
var right_press = function(){
	if(!triggered_right_press){
		if(right_down){
			triggered_right_press = true;
			right_pressed = true;
		}else{
			right_pressed = false;
		}
	}else{
		if(!right_down){
			triggered_right_press = false;
		}
		right_pressed = false;
	}
}

var right_released = false;
var triggered_right_release = false;
var right_release = function(){
	if(!triggered_right_release){
		if(right_down){
			triggered_right_release = true;
		}
		right_released = false;
	}else{
		if(!right_down){
			triggered_right_release = false;
			right_released = true;
		}else{
			right_released = false;
		}
	}
}


var middle_pressed = false;
var triggered_middle_press = false;
var middle_press = function(){
	if(!triggered_middle_press){
		if(middle_down){
			triggered_middle_press = true;
			middle_pressed = true;
		}else{
			middle_pressed = false;
		}
	}else{
		if(!middle_down){
			triggered_middle_press = false;
		}
		middle_pressed = false;
	}
}

var middle_released = false;
var triggered_middle_release = false;
var middle_release = function(){
	if(!triggered_middle_release){
		if(middle_down){
			triggered_middle_release = true;
		}
		middle_released = false;
	}else{
		if(!middle_down){
			triggered_middle_release = false;
			middle_released = true;
		}else{
			middle_released = false;
		}
	}
}

var scroll_deltaX = function(){
	var output = scroll_x;
	scroll_x = 0;
	return output;
}

var scroll_deltaY = function(){
	var output = scroll_y;
	scroll_y = 0;
	return output;
}

var clear_scroll_x = function(){
	scroll_x = 0;
}

var clear_scroll_y = function(){
	scroll_y = 0;
}


/////////////////////////////////////////////////////////////////////////////////////////////////



var controllerMap = new Map();
controllerMap.set('A', 0);
controllerMap.set('B', 1);
controllerMap.set('X', 2);
controllerMap.set('Y', 3);
controllerMap.set('LB', 4);
controllerMap.set('RB', 5);
controllerMap.set('LT', 6);
controllerMap.set('RT', 7);
controllerMap.set('Back', 8);
controllerMap.set('Start', 9);
controllerMap.set('LS', 10);
controllerMap.set('RS', 11);
controllerMap.set('Up', 12);
controllerMap.set('Down', 13);
controllerMap.set('Left', 14);
controllerMap.set('Right', 15);
controllerMap.set('Home', 16);

var controller = {
	connected: false,
	connect: (evt)=>{
		console.log("connected controller");
		controller.connected = true;
	},
	disconnect: (evt)=>{
		console.log("disconnected controller");
		controller.connected = false;
	},
	buttonPressed: (btn)=>{
		if(controller.connected){
			return navigator.getGamepads()[0].buttons[controllerMap.get(btn)].value;
		}
	},
	joystick: {
		leftX: ()=>{
			if(controller.connected){
				return navigator.getGamepads()[0].axes[0];	
			}
		},
		leftY: ()=>{
			if(controller.connected){
				return navigator.getGamepads()[0].axes[1];	
			}
		},
		rightX: ()=>{
			if(controller.connected){
				return navigator.getGamepads()[0].axes[2];
			}
		},
		rightY: ()=>{
			if(controller.connected){
				return navigator.getGamepads()[0].axes[3];	
			}
		},
	}
}

window.addEventListener("gamepadconnected", controller.connect);
window.addEventListener("gamepaddisconnected", controller.disconnect);


/////////////////////////////////////////////////////////////////////////////////////////////////

// prevents bugs where the lib tries to access values from the actual engine2d before it has been imported
var engine2d = {
	scaling: 0
};
var import_engine2d = function(e2d){
	engine2d = e2d;
	e2d.add_to_internal_update('input', ()=>{
		if(input.focused){
			text_input_func(input.value);
		}

		left_press();
		left_release();
		right_press();
		right_release();
		middle_press();
		middle_release();
		
	});
}

/////////////////////////////////////////////////////////////////////////////////////////////////


var exporter = {
	/*
	* @name keyboard
	* @type obj
	* @description Manages inputs from keyboard
	*/

	/*
	* @name supported keys
	* @type options
	* @parent keyboard
	* @description These are all the keys that are supported.
	* @option {"A"}{A Button}
	* @option {"A"}{65}
	* @option {"B"}{66}
	* @option {"C"}{67}
	* @option {"D"}{68}
	* @option {"E"}{69}
	* @option {"F"}{70}
	* @option {"G"}{71}
	* @option {"H"}{72}
	* @option {"I"}{73}
	* @option {"J"}{74}
	* @option {"K"}{75}
	* @option {"L"}{76}
	* @option {"M"}{77}
	* @option {"N"}{78}
	* @option {"O"}{79}
	* @option {"P"}{80}
	* @option {"Q"}{81}
	* @option {"R"}{82}
	* @option {"S"}{83}
	* @option {"T"}{84}
	* @option {"U"}{85}
	* @option {"V"}{86}
	* @option {"W"}{87}
	* @option {"X"}{88}
	* @option {"Y"}{89}
	* @option {"Z"}{90}
	* @option {"ZERO"}{48}
	* @option {"ONE"}{49}
	* @option {"TWO"}{50}
	* @option {"THREE"}{51}
	* @option {"FOUR"}{52}
	* @option {"FIVE"}{53}
	* @option {"SIX"}{54}
	* @option {"SEVEN"}{55}
	* @option {"EIGHT"}{56}
	* @option {"NINE"}{57}
	* @option {"NUMPAD_0"}{96}
	* @option {"NUMPAD_1"}{97}
	* @option {"NUMPAD_2"}{98}
	* @option {"NUMPAD_3"}{99}
	* @option {"NUMPAD_4"}{100}
	* @option {"NUMPAD_5"}{101}
	* @option {"NUMPAD_6"}{102}
	* @option {"NUMPAD_7"}{103}
	* @option {"NUMPAD_8"}{104}
	* @option {"NUMPAD_9"}{105}
	* @option {"NUMPAD_MULTIPLY"}{106}
	* @option {"NUMPAD_ADD"}{107}
	* @option {"NUMPAD_ENTER"}{108}
	* @option {"NUMPAD_SUBTRACT"}{109}
	* @option {"NUMPAD_DECIMAL"}{110}
	* @option {"NUMPAD_DIVIDE"}{111}
	* @option {"F1"}{112}
	* @option {"F2"}{113}
	* @option {"F3"}{114}
	* @option {"F4"}{115}
	* @option {"F5"}{116}
	* @option {"F6"}{117}
	* @option {"F7"}{118}
	* @option {"F8"}{119}
	* @option {"F9"}{120}
	* @option {"F10"}{121}
	* @option {"F11"}{122}
	* @option {"F12"}{123}
	* @option {"F13"}{124}
	* @option {"F14"}{125}
	* @option {"F15"}{126}
	* @option {"COLON"}{186}
	* @option {"EQUALS"}{187}
	* @option {"COMMA"}{188}
	* @option {"UNDERSCORE"}{189}
	* @option {"PERIOD"}{190}
	* @option {"QUESTION_MARK"}{191}
	* @option {"TILDE"}{192}
	* @option {"OPEN_BRACKET"}{219}
	* @option {"BACKWARD_SLASH"}{220}
	* @option {"CLOSED_BRACKET"}{221}
	* @option {"QUOTES"}{222}
	* @option {"BACKSPACE"}{8}
	* @option {"TAB"}{9}
	* @option {"CLEAR"}{12}
	* @option {"ENTER"}{13}
	* @option {"SHIFT"}{16}
	* @option {"CONTROL"}{17}
	* @option {"ALT"}{18}
	* @option {"CAPS_LOCK"}{20}
	* @option {"ESC"}{27}
	* @option {"SPACEBAR"}{32}
	* @option {"PAGE_UP"}{33}
	* @option {"PAGE_DOWN"}{34}
	* @option {"END"}{35}
	* @option {"HOME"}{36}
	* @option {"LEFT"}{37}
	* @option {"UP"}{38}
	* @option {"RIGHT"}{39}
	* @option {"DOWN"}{40}
	* @option {"PLUS"}{43}
	* @option {"MINUS"}{44}
	* @option {"INSERT"}{45}
	* @option {"DELETE"}{46}
	* @option {"HELP"}{47}
	* @option {"NUM_LOCK"}{144}

	*/
	keyboard: {
		/*
		* @name down
		* @type method
		* @parent keyboard
		* @description Returns true if given key on keyboard is down.
		* @param {key}{String}{the key which you want to check is down}
		*/
		down: function(key){
			var key = DOWN[DOWN_MAP.get(key)];
			return key == true;
		},

		/*
		* @name codeDown
		* @type method
		* @parent keyboard
		* @description Returns true if given key on keyboard is down.
		* @param {key}{Int}{the ascii code which you want to check is down}
		*/
		codeDown: function(code){
			return DOWN[code];
		},

		/*
		* @name add
		* @type obj
		* @parent keyboard
		* @description Adds keyboard input events.
		*/
		add: {

			/*
			* @name press
			* @type method
			* @parent keyboard.add
			* @description Adds key press event.
			* @param {name}{String}{the name of the event}
			* @param {keys}{[String]}{list of keys to be checked for press event}
			*/
			press: function(name, keys){
				key_presses.set(name, new Key_Press(keys));
			},

			/*
			* @name codePress
			* @type method
			* @parent keyboard.add
			* @description Adds code press event.
			* @param {name}{String}{the name of the event}
			* @param {keys}{[Int]}{list of ascii codes to be checked for codePress event}
			*/
			codePress: function(name, keys){
				code_key_presses.set(name, new Code_Key_Press(keys));
			},

			/*
			* @name release
			* @type method
			* @parent keyboard.add
			* @description Adds key release event.
			* @param {name}{String}{the name of the event}
			* @param {keys}{[String]}{list of keys to be checked for release event}
			*/
			release: function(name, keys){
				key_releases.set(name, new Key_Release(keys));
			},

			/*
			* @name codeRelease
			* @type method
			* @parent keyboard.add
			* @description Adds code release event.
			* @param {name}{String}{the name of the event}
			* @param {keys}{[Int]}{list of ascii codes to be checked for codeRelease event}
			*/
			codeRelease: function(name, keys){
				key_releases.set(name, new Key_Release(keys));
			}
		},

		/*
		* @name check
		* @type obj
		* @description Checks keyboard input events set with the <a href="virtuosity.inputManager.keyboard.add.html">add</a> function. To be intended to use in an update or render function (runs multiple times a second).
		* @parent keyboard
		*/
		check: {

			/*
			* @name press
			* @type method
			* @parent keyboard.check
			* @description Checks keyboard press events set with the add function. To be intended to use in an update or render function (runs multiple times a second). Returns true when the keys are first pressed down.
			* @param {name}{String}{the name of the event}
			*/
			press: function(name){
				try{
					return key_presses.get(name).triggered();
				}catch(e){
					if(key_presses.get(name) == null){
						e.name = "InputManager";
						e.message = "'" + name + "' is not a valid {press} event name (InputManager)";
					}
					throw e;
				}
			},

			/*
			* @name codePress
			* @type method
			* @parent keyboard.check
			* @description Checks keyboard codePress events set with the add function. To be intended to use in an update or render function (runs multiple times a second). Returns true when the keys are first pressed down.
			* @param {name}{String}{the name of the event}
			*/
			codePress: function(name){
				try{
					return code_key_presses.get(name).triggered();
				}catch(e){
					if(code_key_presses.get(name) == null){
						e.name = "ReferenceError";
						e.message = "'" + name + "' is not a valid {codePress} event name (InputManager)";
					}
					throw e;
				}
			},

			/*
			* @name release
			* @type method
			* @parent keyboard.check
			* @description Checks keyboard release events set with the add function. To be intended to use in an update or render function (runs multiple times a second). Returns true when the keys are first pressed down.
			* @param {name}{String}{the name of the event}
			*/
			release: function(name){
				try{
					return key_releases.get(name).triggered();
				}catch(e){
					if(key_releases.get(name) == null){
						e.name = "InputManager";
						e.message = "'" + name + "' is not a valid {release} event name (InputManager)";
					}
					throw e;
				}
			},

			/*
			* @name codeRelease
			* @type method
			* @parent keyboard.check
			* @description Checks keyboard codeRelease events set with the add function. To be intended to use in an update or render function (runs multiple times a second). Returns true when the keys are first pressed down.
			* @param {name}{String}{the name of the event}
			*/
			codeRelease: function(name){
				try{
					return key_releases.get(name).triggered();
				}catch(e){
					if(key_releases.get(name) == null){
						e.name = "InputManager";
						e.message = "'" + name + "' is not a valid {codeRelease} event name (InputManager)";
					}
					throw e;
				}
			}
		},

		/*
		* @name delete
		* @type obj
		* @description Deletes keyboard input events. See <a href="virtuosity.inputManager.keyboard.check.html">check</a>.
		* @parent keyboard
		*/
		delete: {

			/*
			* @name press
			* @type method
			* @parent keyboard.delete
			* @description Deletes key press event. See <a href="virtuosity.inputManager.keyboard.check.html#press">check.press</a>.
			* @param {name}{String}{the name of the event}
			*/
			press: function(name){
				if(key_releases.get(name) == null){
					throw ReferenceError("'" + name + "' is not a valid {press} event name (InputManager)");
				}
				key_presses.delete(name);
			},

			/*
			* @name codePress
			* @type method
			* @parent keyboard.delete
			* @description Deletes key codePress event. See <a href="virtuosity.inputManager.keyboard.check.html#codePress">check.codePress</a>.
			* @param {name}{String}{the name of the event}
			*/
			codePress: function(name){
				if(key_releases.get(name) == null){
					throw ReferenceError("'" + name + "' is not a valid {codePress} event name (InputManager)");
				}
				code_key_presses.delete(name);
			},

			/*
			* @name release
			* @type method
			* @parent keyboard.delete
			* @description Deletes key release event. See <a href="virtuosity.inputManager.keyboard.check.html#release">check.release</a>.
			* @param {name}{String}{the name of the event}
			*/
			release: function(name){
				if(key_releases.get(name) == null){
					throw ReferenceError("'" + name + "' is not a valid {release} event name (InputManager)");
				}
				key_releases.delete(name);
			},

			/*
			* @name codeRelease
			* @type method
			* @parent keyboard.delete
			* @description Deletes key codeRelease event. See <a href="virtuosity.inputManager.keyboard.check.html#codeRelease">check.codeRelease</a>.
			* @param {name}{String}{the name of the event}
			*/
			codeRelease: function(name){
				if(key_releases.get(name) == null){
					throw ReferenceError("'" + name + "' is not a valid {codeRelease} event name (InputManager)");
				}
				key_releases.delete(name);
			}
		},

		/*
		* @name textInput
		* @type obj
		* @description Manages keyboard input for use in text boxes.
		* @parent keyboard
		*/

		/*
		* @name focus
		* @type method
		* @description Starts getting input from textInput
		* @parent keyboard.textInput
		* @param {func}{Function}{function to complete when there is a change in the text (takes curent text as input)}
		*/

		/*
		* @name blur
		* @type method
		* @description Stops getting input from textInput
		* @parent keyboard.textInput
		*/

		/*
		* @name clear
		* @type method
		* @description Clears the input from textInput
		* @parent keyboard.textInput
		*/

		/*
		* @name set
		* @type method
		* @description sets the input from textInput
		* @parent keyboard.textInput
		*/

		/*
		* @name isFocused
		* @type property
		* @description returns if textInput is focused
		* @parent keyboard.textInput
		*/

		/*
		* @name cursorStart
		* @type property
		* @description Gets the starting position of the cursor
		* @parent keyboard.textInput
		*/

		/*
		* @name cursorEnd
		* @type property
		* @description Gets the end position of the cursor
		* @parent keyboard.textInput
		*/
		textInput: focusInput
	},

	/*
	* @name mouse
	* @type obj
	* @description Manages inputs from mouse
	*/
	mouse:{
		/*
		* @name left
		* @type obj
		* @parent mouse
		* @description Manages inputs from the left mouse button
		*/
		left: {

			/*
			* @name down
			* @type method
			* @parent mouse.left
			* @description Returns true if left mouse button is down
			*/
			down: function(){
				return left_down;
			},

			/*
			* @name press
			* @type method
			* @parent mouse.left
			* @description Returns true when left mouse button is first down
			*/
			press: function(){
				return left_pressed;
			},

			/*
			* @name release
			* @type method
			* @parent mouse.left
			* @description Returns true when left mouse button is first released
			*/
			release: function(){
				return left_released;
			}
		},

		/*
		* @name right
		* @type obj
		* @parent mouse
		* @description Manages inputs from the right mouse button
		*/
		right: {

			/*
			* @name down
			* @type method
			* @parent mouse.right
			* @description Returns true if right mouse button is down
			*/
			down: function(){
				return right_down;
			},

			/*
			* @name press
			* @type method
			* @parent mouse.right
			* @description Returns true when right mouse button is first down
			*/
			press: function(){
				return right_pressed;
			},

			/*
			* @name release
			* @type method
			* @parent mouse.right
			* @description Returns true when right mouse button is first released
			*/
			release: function(){
				return right_released;
			}
		},

		/*
		* @name middle
		* @type obj
		* @parent mouse
		* @description Manages inputs from the right mouse button
		*/
		middle: {

			/*
			* @name down
			* @type method
			* @parent mouse.middle
			* @description Returns true if middle mouse button is down
			*/
			down: function(){
				return middle_down;
			},

			/*
			* @name press
			* @type method
			* @parent mouse.middle
			* @description Returns true when middle mouse button is first down
			*/
			press: function(){
				return middle_pressed;
			},

			/*
			* @name release
			* @type method
			* @parent mouse.middle
			* @description Returns true when middle mouse button is first released
			*/
			release: function(){
				return middle_released;
			}
		},

		/*
		* @name scroll
		* @type obj
		* @parent mouse
		* @description Manages inputs from the mouse scroll wheel
		*/
		scroll: {
			/*
			* @name deltaX
			* @type method
			* @parent mouse.scroll
			* @description Gets the scroll deltaX since last polled.
			*/
			deltaX: function(){
				return scroll_deltaX();
			},

			/*
			* @name deltaY
			* @type method
			* @parent mouse.scroll
			* @description Gets the scroll deltaY since last polled.
			*/
			deltaY: function(){
				return scroll_deltaY();	
			},

			/*
			* @name reset
			* @type method
			* @parent mouse.scroll
			* @description Resets the scroll deltaX and deltaY.
			*/
			reset: function(){
				clear_scroll_x();
				clear_scroll_y();
			}
		}
	},

	/*
	* @name gamepad
	* @type obj
	* @description Manages inputs from a gamepad
	*/
	gamepad: {
		/*
		* @name connected
		* @type method
		* @parent gamepad
		* @description Returns true if a controller is connected
		*/
		connected: ()=>{
			return controller.connected;
		},

		/*
		* @name buttonPressed
		* @type method
		* @parent gamepad
		* @description Returns down value of given gamepad button (between 0 - 1).
		* @param {btn}{String}{button to check}
		*/

		/*
		* @name btn
		* @type options
		* @parent gamepad.buttonPressed
		* @description Available button types
		* @option {"A"}{A Button}
    	* @option {"B"}{B Button}
    	* @option {"X"}{X Button}
    	* @option {"Y"}{Y Button}
    	* @option {"LB"}{Left Bumper}
    	* @option {"RB"}{Right Bumper}
    	* @option {"LT"}{Left Trigger}
    	* @option {"RT"}{Right Trigger}
    	* @option {"Back"}{Back Button}
    	* @option {"Start"}{Start Button}
    	* @option {"LS"}{Left Stick Button}
    	* @option {"RS"}{Right Stick Button}
    	* @option {"Up"}{D-pad Up Button}
    	* @option {"Down"}{D-pad Down Button}
    	* @option {"Left"}{D-pad Left Button}
    	* @option {"Right"}{D-pad Right Button}
    	* @option {"Home"}{Home Button (Xbox button)}
		*/

		buttonPressed: (btn)=>{
			return controller.buttonPressed(btn);
		},

		/*
		* @name joystick
		* @type obj
		* @description Manages inputs from the joysticks
		* @parent gamepad
		*/
		joystick: {

			/*
			* @name leftX
			* @type method
			* @description Returns the X value of the left joystick on the gamepad (bewteen [-1,1])
			* @parent gamepad.joystick
			*/
			leftX: ()=>{
				return controller.joystick.leftX();
			},

			/*
			* @name leftY
			* @type method
			* @description Returns the Y value of the left joystick on the gamepad (bewteen [-1,1])
			* @parent gamepad.joystick
			*/
			leftY: ()=>{
				return controller.joystick.leftY();
			},

			/*
			* @name rightX
			* @type method
			* @description Returns the X value of the right joystick on the gamepad (bewteen [-1,1])
			* @parent gamepad.joystick
			*/
			rightX: ()=>{
				return controller.joystick.rightX();
			},

			/*
			* @name rightY
			* @type method
			* @description Returns the Y value of the right joystick on the gamepad (bewteen [-1,1])
			* @parent gamepad.joystick
			*/
			rightY: ()=>{
				return controller.joystick.rightY();
			},
		}
	},
	/*
	* @name addEvents
	* @type method
	* @description Adds the events that the inputManager uses to run (they are automatically started)
	*/
	addEvents: function(){
		if(!events_working){
			document.addEventListener('keydown', keydown_event);
			document.addEventListener('keyup', keyup_event);
			document.addEventListener('onmousedown', onmousedown_event);
			document.addEventListener('onmouseup', onmouseup_event);
			document.addEventListener('onmousemove', onmousemove_event);
			document.addEventListener('wheel', onwheel_event);
			window.addEventListener("gamepadconnected", controller.connect);
			window.addEventListener("gamepaddisconnected", controller.disconnect);
		}else{
			throw Error("InputManager events already added");
		}
	},

	/*
	* @name removeEvents
	* @type method
	* @description Ends the events that the inputManager uses to run
	*/
	removeEvents: function(){
		if(events_working){
			document.removeEventListener('keydown', keydown_event);
			document.removeEventListener('keyup', keyup_event);
			document.removeEventListener('onmousedown', onmousedown_event);
			document.removeEventListener('onmouseup', onmouseup_event);
			document.removeEventListener('onmousemove', onmousemove_event);
			document.removeEventListener('wheel', onwheel_event);
			window.removeEventListener("gamepadconnected", controller.connect);
			window.removeEventListener("gamepaddisconnected", controller.disconnect);
		}else{
			throw Error("InputManager events already removed");
		}
	},

	import_engine2d: function(e2d){
		import_engine2d(e2d);
	}
};

var offset_x = 0;
var offset_y = 0;


/*
* @name offsetX
* @type property
* @description X offset of the mouse position
* @parent mouse
*/
Object.defineProperty(exporter.mouse, 'offsetX', {
	get: ()=>{
		return offset_x;
	}, set: (val)=>{
		offset_x = val;
	}
});


/*
* @name offsetY
* @type property
* @description Y offset of the mouse position
* @parent mouse
*/
Object.defineProperty(exporter.mouse, 'offsetY', {
	get: ()=>{
		return offset_y;
	}, set: (val)=>{
		offset_y = val;
	}
});


/*
* @name x
* @type property
* @parent mouse
* @description Returns the x psoition of the mouse cursor.
*/
Object.defineProperty(exporter.mouse, "x", {
	get: ()=>{
		return (mouse_x - offset_x) / engine2d.scaling;
	}
});

/*
* @name y
* @type property
* @parent mouse
* @description Returns the y psoition of the mouse cursor.
*/
Object.defineProperty(exporter.mouse, "y", {
	get: ()=>{
		return (mouse_y - offset_y) / engine2d.scaling;
	}
});


module.exports = exporter;