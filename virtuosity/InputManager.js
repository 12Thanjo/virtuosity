var debug = require('./debug.js');


var DOWN = [255]; //make an array to cover all the keypresses you should need with a normal keyboard
var DOWN_MAP = new Map([["A",65],["B",66],["C",67],["D",68],["E",69],["F",70],["G",71],["H",72],["I",73],["J",74],["K",75],["L",76],["M",77],["N",78],["O",79],["P",80],["Q",81],["R",82],["S",83],["T",84],["U",85],["V",86],["W",87],["X",88],["Y",89],["Z",90],["ZERO",48],["ONE",49],["TWO",50],["THREE",51],["FOUR",52],["FIVE",53],["SIX",54],["SEVEN",55],["EIGHT",56],["NINE",57],["NUMPAD_0",96],["NUMPAD_1",97],["NUMPAD_2",98],["NUMPAD_3",99],["NUMPAD_4",100],["NUMPAD_5",101],["NUMPAD_6",102],["NUMPAD_7",103],["NUMPAD_8",104],["NUMPAD_9",105],["NUMPAD_MULTIPLY",106],["NUMPAD_ADD",107],["NUMPAD_ENTER",108],["NUMPAD_SUBTRACT",109],["NUMPAD_DECIMAL",110],["NUMPAD_DIVIDE",111],["F1",112],["F2",113],["F3",114],["F4",115],["F5",116],["F6",117],["F7",118],["F8",119],["F9",120],["F10",121],["F11",122],["F12",123],["F13",124],["F14",125],["F15",126],["COLON",186],["EQUALS",187],["COMMA",188],["UNDERSCORE",189],["PERIOD",190],["QUESTION_MARK",191],["TILDE",192],["OPEN_BRACKET",219],["BACKWARD_SLASH",220],["CLOSED_BRACKET",221],["QUOTES",222],["BACKSPACE",8],["TAB",9],["CLEAR",12],["ENTER",13],["SHIFT",16],["CONTROL",17],["ALT",18],["CAPS_LOCK",20],["ESC",27],["SPACE",32],["PAGE_UP",33],["PAGE_DOWN",34],["END",35],["HOME",36],["LEFT",37],["UP",38],["RIGHT",39],["DOWN",40],["PLUS",43],["MINUS",44],["INSERT",45],["DELETE",46],["HELP",47],["NUM_LOCK",144]]);//used for key strings

var check_down = function(arr){
	var down = true;
	for(var i = arr.length - 1; i>=0; i--){
		if(!DOWN[arr[i]]){
			down = false;
			break;
		}
	}
	return down;
}

var keydown_listener = function(event){
	if(!DOWN[event.keyCode]){
  		DOWN[event.keyCode] = true;

  		var keydown_lookup_events = keydown_lookup[event.keyCode];
  		if(keydown_lookup_events != null){
	  		keydown_lookup_events.forEach((event)=>{
	  			if(check_down(event.keys)){
	  				event.event(event);
	  			}
	  		});
  		}
  	}
}

var keyup_listener = function(event){
	var keyup_lookup_events = keyup_lookup[event.keyCode];
	if(keyup_lookup_events != null){
		keyup_lookup_events.forEach((event)=>{
			if(check_down(event.keys)){
				event.event(event);
			}
		});
	}

	DOWN[event.keyCode] = false;
}

var keydown_events = new Map();
var keydown_lookup = [255];
var Keydown_Event = function(name, keys, event){
	this.name = name;
	
	if(typeof keys == "string"){
		keys = [keys];
	}
	keys = [...keys];

	this.keys = keys;
	this.event = event;

	for(var i = this.keys.length - 1; i>=0; i--){
		this.keys[i] = DOWN_MAP.get(this.keys[i]);
	}

	keys.forEach((key)=>{
		var lookup_location = keydown_lookup[key];
		if(lookup_location == null){
			lookup_location = keydown_lookup[key] = new Map();
		}
		lookup_location.set(name, this);
	});


	keydown_events.set(name, this);
}

delete_keydown = function(name){
	// get event
	var event_target = keydown_events.get(name);

	if(event_target != null){// check if exists
		// delete event from lookup
		event_target.keys.forEach((key)=>{
			var lookup_location = keydown_lookup[key];
			if(lookup_location == null){
				lookup_location = keydown_lookup[key] = new Map();
			}
			lookup_location.delete(name);
		});
	}else{
		debug.error("ReferenceError", `keyDown event "${name}" doesn't exist`);
	}
}


var keyup_events = new Map();
var keyup_lookup = [255];
var Keyup_Event = function(name, keys, event){
	this.name = name;

	if(typeof keys == "string"){
		keys = [keys];
	}

	this.keys = keys;
	this.event = event;

	for(var i = this.keys.length - 1; i>=0; i--){
		this.keys[i] = DOWN_MAP.get(this.keys[i]);
	}

	keys.forEach((key)=>{
		var lookup_location = keyup_lookup[key];
		if(lookup_location == null){
			lookup_location = keyup_lookup[key] = new Map();
		}
		lookup_location.set(name, this);
	});


	keyup_events.set(name, this);
}

delete_keyup = function(name){
	// get event
	var event_target = keyup_events.get(name);

	if(event_target != null){// check if exists
		// delete event from lookup
		event_target.keys.forEach((key)=>{
			var lookup_location = keyup_lookup[key];
			if(lookup_location == null){
				lookup_location = keyup_lookup[key] = new Map();
			}
			lookup_location.delete(name);
		});
	}else{
		debug.error("ReferenceError", `keyUp event "${name}" doesn't exist`);
	}
}


// mouse //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var mouse_x = 0;
var mouse_y = 0;
var dx = 0;
var dy = 0;
var screen_x = 0;
var screen_y = 0;

var mouse_position_offset_x = 0;
var mouse_position_offset_y = 0;

var left_down = false;
var middle_down = false;
var right_down = false;
var back_down = false;
var forward_down = false;

var scroll_x = 0;
var scroll_y = 0;


// left down
var leftDown_events = new Map();
var add_LeftDown_Event = function(name, event){
	if(!leftDown_events.has(name)){
		leftDown_events.set(name, event);
	}else{
		debug.warn("Overwrite", `leftDown event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_LeftDown_Event = function(name){
	if(leftDown_events.has(name)){
		leftDown_events.delete(name);
	}else{
		debug.error("ReferenceError", `leftDown event "${name}" doesn't exist`);
	}
}

// middle
var middleDown_events = new Map();
var add_MiddleDown_Event = function(name, event){
	if(!middleDown_events.has(name)){
		middleDown_events.set(name, event);
	}else{
		debug.warn("Overwrite", `middleDown event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_MiddleDown_Event = function(name){
	if(middleDown_events.has(name)){
		middleDown_events.delete(name);
	}else{
		debug.error("ReferenceError", `middleDown event "${name}" doesn't exist`);
	}
}

// right down
var rightDown_events = new Map();
var add_RightDown_Event = function(name, event){
	if(!rightDown_events.has(name)){
		rightDown_events.set(name, event);
	}else{
		debug.warn("Overwrite", `rightDown event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_RightDown_Event = function(name){
	if(rightDown_events.has(name)){
		rightDown_events.delete(name);
	}else{
		debug.error("ReferenceError", `rightDown event "${name}" doesn't exist`);
	}
}

// back
var backDown_events = new Map();
var add_BackDown_Event = function(name, event){
	if(!backDown_events.has(name)){
		backDown_events.set(name, event);
	}else{
		debug.warn("Overwrite", `backDown event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_BackDown_Event = function(name){
	if(backDown_events.has(name)){
		backDown_events.delete(name);
	}else{
		debug.error("ReferenceError", `backDown event "${name}" doesn't exist`);
	}
}

// forward
var forwardDown_events = new Map();
var add_ForwardDown_Event = function(name, event){
	if(!forwardDown_events.has(name)){
		forwardDown_events.set(name, event);
	}else{
		debug.warn("Overwrite", `forwardDown event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_ForwardDown_Event = function(name){
	if(forwardDown_events.has(name)){
		forwardDown_events.delete(name);
	}else{
		debug.error("ReferenceError", `forwardDown event "${name}" doesn't exist`);
	}
}

var mousedown_listener = function(e){
	switch(e.button){
		case 0:
			left_down = true;
			leftDown_events.forEach((event)=>{
				event();
			});
			break;
		case 1:
			middle_down = true;
			middleDown_events.forEach((event)=>{
				event();
			});
			event.preventDefault();
			break;
		case 2:
			right_down = true;
			rightDown_events.forEach((event)=>{
				event();
			});
			break;
		case 3:
			back_down = true;
			backDown_events.forEach((event)=>{
				event();
			});
			break;
		case 4:
			forward_down = true;
			forwardDown_events.forEach((event)=>{
				event();
			});
			break;
	}
}


// left down
var leftUp_events = new Map();
var add_LeftUp_Event = function(name, event){
	if(!leftUp_events.has(name)){
		leftUp_events.set(name, event);
	}else{
		debug.warn("Overwrite", `leftUp event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_LeftUp_Event = function(name){
	if(leftUp_events.has(name)){
		leftUp_events.delete(name);
	}else{
		debug.error("ReferenceError", `leftUp event "${name}" doesn't exist`);
	}
}

// middle
var middleUp_events = new Map();
var add_MiddleUp_Event = function(name, event){
	if(!middleUp_events.has(name)){
		middleUp_events.set(name, event);
	}else{
		debug.warn("Overwrite", `middleUp event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_MiddleUp_Event = function(name){
	if(middleUp_events.has(name)){
		middleUp_events.delete(name);
	}else{
		debug.error("ReferenceError", `middleUp event "${name}" doesn't exist`);
	}
}

// right down
var rightUp_events = new Map();
var add_RightUp_Event = function(name, event){
	if(!rightUp_events.has(name)){
		rightUp_events.set(name, event);
	}else{
		debug.warn("Overwrite", `rightUp event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_RightUp_Event = function(name){
	if(rightUp_events.has(name)){
		rightUp_events.delete(name);
	}else{
		debug.error("ReferenceError", `rightUp event "${name}" doesn't exist`);
	}
}

// back
var backUp_events = new Map();
var add_BackUp_Event = function(name, event){
	if(!backUp_events.has(name)){
		backUp_events.set(name, event);
	}else{
		debug.warn("Overwrite", `backUp event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_BackUp_Event = function(name){
	if(backUp_events.has(name)){
		backUp_events.delete(name);
	}else{
		debug.error("ReferenceError", `backUp event "${name}" doesn't exist`);
	}
}

// forward
var forwardUp_events = new Map();
var add_ForwardUp_Event = function(name, event){
	if(!forwardUp_events.has(name)){
		forwardUp_events.set(name, event);
	}else{
		debug.warn("Overwrite", `forwardUp event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_ForwardUp_Event = function(name){
	if(forwardUp_events.has(name)){
		forwardUp_events.delete(name);
	}else{
		debug.error("ReferenceError", `forwardUp event "${name}" doesn't exist`);
	}
}

// move
var mouseMove_events = new Map();
var add_mouseMove_event = function(name, event){
	if(!mouseMove_events.has(name)){
		mouseMove_events.set(name, event);
	}else{
		debug.warn("Overwrite", `mouseMove event "${name}" already exists
	"${name}" has now been overwritten`);
	}
}
var delete_mouseMove_event = function(name){
	if(mouseMove_events.has(name)){
		mouseMove_events.delete(name);
	}else{
		debug.error("ReferenceError", `mouseMove event "${name}" doesn't exist`);
	}
}


var mouseup_listener = function(e){
	switch(e.button){
		case 0:
			left_down = false;
			leftUp_events.forEach((event)=>{
				event();
			});
			break;
		case 1:
			middle_down = false;
			middleUp_events.forEach((event)=>{
				event();
			});
			event.preventDefault();
			break;
		case 2:
			right_down = false;
			rightUp_events.forEach((event)=>{
				event();
			});
			break;
		case 3:
			back_down = false;
			backUp_events.forEach((event)=>{
				event();
			});
			break;
		case 4:
			forward_down = false;
			forwardUp_events.forEach((event)=>{
				event();
			});
			break;
	}
}


var mousemove_listener = function(e){
	mouse_x = e.clientX;
	mouse_y = e.clientY;
	dx = e.movementX;
	dy = e.movementY;
	screen_x = e.screenX;
	screen_y = e.screenY;
	mouseMove_events.forEach((event)=>{
		event();
	});
}

var clear_deltas = function(){
	dx = 0;
	dy = 0;
}

var scroll_events = new Map();
var add_scroll_event = function(name, event){
	scroll_events.set(name, event);
}
var delete_scroll_event = function(name){
	scroll_events.delete(name);
}

var wheel_listener = function(e){
	scroll_events.forEach((event)=>{
		event(e.wheelDeltaX, e.wheelDeltaY);
	});
}


// controller ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

var get_connected_controllers = function(){
	var connected = [];
	for(var i=0; i<4;i++){
		connected.push( navigator.getGamepads()[i] != null);
	}
	return connected;
}


var controller_connect = function(evt){
	console.log("connected controller " + evt.gamepad.index);
}
var controller_disconnect = function(evt){
	console.log("disconnected controller " + evt.gamepad.index);
}
var controller_buttonPressed = function(id, btn){
	var cntrlr =  navigator.getGamepads()[id];
	if(cntrlr){
		return cntrlr.buttons[controllerMap.get(btn)].value;
	}
}
	
var joystick_leftX = function(id){
	var cntrlr =  navigator.getGamepads()[id];
	if(cntrlr){
		return cntrlr.axes[0];	
	}
}
var joystick_leftY = function(id){
	var cntrlr =  navigator.getGamepads()[id];
	if(cntrlr){
		return cntrlr.axes[1];	
	}
}
var joystick_rightX = function(id){
	var cntrlr =  navigator.getGamepads()[id];
	if(cntrlr){
		return cntrlr.axes[2];
	}
}
var joystick_rightY = function(id){
	var cntrlr =  navigator.getGamepads()[id];
	if(cntrlr){
		return cntrlr.axes[3];	
	}
}





//  listeners ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
add_listeners = function(){
	document.addEventListener('keydown', keydown_listener);
	document.addEventListener('keyup', keyup_listener);
	document.addEventListener('mousedown', mousedown_listener);
	document.addEventListener('mouseup', mouseup_listener);
	document.addEventListener('mousemove', mousemove_listener);
	document.addEventListener('wheel', wheel_listener);
	window.addEventListener("gamepadconnected", controller_connect);
	window.addEventListener("gamepaddisconnected", controller_disconnect);
}

remove_listeners = function(){
	document.removeEventListener('keydown', keydown_listener);
	document.removeEventListener('keyup', keyup_listener);
	document.removeEventListener('mousedown', mousedown_listener);
	document.removeEventListener('mouseup', mouseup_listener);
	document.removeEventListener('mousemove', mousemove_listener);
	document.removeEventListener('wheel', onwheel_listener);
	window.removeEventListener("gamepadconnected", controller_connect);
	window.removeEventListener("gamepaddisconnected", controller_disconnect);
}

var pointerLocked = false;
exports = {
	/*
	* @name keyboard
	* @type obj
	* @description manages input from the keyboard. Supported keys are:<br> <div class="code yellow">"A"</div><div class="code yellow">"B"</div><div class="code yellow">"C"</div><div class="code yellow">"D"</div><div class="code yellow">"E"</div><div class="code yellow">"F"</div><div class="code yellow">"G"</div><div class="code yellow">"H"</div><div class="code yellow">"I"</div><div class="code yellow">"J"</div><div class="code yellow">"K"</div><div class="code yellow">"L"</div><div class="code yellow">"M"</div><div class="code yellow">"N"</div><div class="code yellow">"O"</div><div class="code yellow">"P"</div><div class="code yellow">"Q"</div><div class="code yellow">"R"</div><div class="code yellow">"S"</div><div class="code yellow">"T"</div><div class="code yellow">"U"</div><div class="code yellow">"V"</div><div class="code yellow">"W"</div><div class="code yellow">"X"</div><div class="code yellow">"Y"</div><div class="code yellow">"Z"</div><div class="code yellow">"ZERO"</div><div class="code yellow">"ONE"</div><div class="code yellow">"TWO"</div><div class="code yellow">"THREE"</div><div class="code yellow">"FOUR"</div><div class="code yellow">"FIVE"</div><div class="code yellow">"SIX"</div><div class="code yellow">"SEVEN"</div><div class="code yellow">"EIGHT"</div><div class="code yellow">"NINE"</div><div class="code yellow">"NUMPAD_0"</div><div class="code yellow">"NUMPAD_1"</div><div class="code yellow">"NUMPAD_2"</div><div class="code yellow">"NUMPAD_3"</div><div class="code yellow">"NUMPAD_4"</div><div class="code yellow">"NUMPAD_5"</div><div class="code yellow">"NUMPAD_6"</div><div class="code yellow">"NUMPAD_7"</div><div class="code yellow">"NUMPAD_8"</div><div class="code yellow">"NUMPAD_9"</div><div class="code yellow">"NUMPAD_MULTIPLY"</div><div class="code yellow">"NUMPAD_ADD"</div><div class="code yellow">"NUMPAD_ENTER"</div><div class="code yellow">"NUMPAD_SUBTRACT"</div><div class="code yellow">"NUMPAD_DECIMAL"</div><div class="code yellow">"NUMPAD_DIVIDE"</div><div class="code yellow">"F1"</div><div class="code yellow">"F2"</div><div class="code yellow">"F3"</div><div class="code yellow">"F4"</div><div class="code yellow">"F5"</div><div class="code yellow">"F6"</div><div class="code yellow">"F7"</div><div class="code yellow">"F8"</div><div class="code yellow">"F9"</div><div class="code yellow">"F10"</div><div class="code yellow">"F11"</div><div class="code yellow">"F12"</div><div class="code yellow">"F13"</div><div class="code yellow">"F14"</div><div class="code yellow">"F15"</div><div class="code yellow">"COLON"</div><div class="code yellow">"EQUALS"</div><div class="code yellow">"COMMA"</div><div class="code yellow">"UNDERSCORE"</div><div class="code yellow">"PERIOD"</div><div class="code yellow">"QUESTION_MARK"</div><div class="code yellow">"TILDE"</div><div class="code yellow">"OPEN_BRACKET"</div><div class="code yellow">"BACKWARD_SLASH"</div><div class="code yellow">"CLOSED_BRACKET"</div><div class="code yellow">"QUOTES"</div><div class="code yellow">"BACKSPACE"</div><div class="code yellow">"TAB"</div><div class="code yellow">"CLEAR"</div><div class="code yellow">"ENTER"</div><div class="code yellow">"SHIFT"</div><div class="code yellow">"CONTROL"</div><div class="code yellow">"ALT"</div><div class="code yellow">"CAPS_LOCK"</div><div class="code yellow">"ESC"</div><div class="code yellow">"SPACE"</div><div class="code yellow">"PAGE_UP"</div><div class="code yellow">"PAGE_DOWN"</div><div class="code yellow">"END"</div><div class="code yellow">"HOME"</div><div class="code yellow">"LEFT"</div><div class="code yellow">"UP"</div><div class="code yellow">"RIGHT"</div><div class="code yellow">"DOWN"</div><div class="code yellow">"PLUS"</div><div class="code yellow">"MINUS"</div><div class="code yellow">"INSERT"</div><div class="code yellow">"DELETE"</div><div class="code yellow">"HELP"</div><div class="code yellow">"NUM_LOCK"</div>
	*/
	keyboard: {
		/*
		* @name add
		* @type obj
		* @description add keyboard events
		* @parent keyboard
		*/
		add: {
			/*
			* @name keyDown
			* @type method
			* @description key down event (non-repeated)
			* @parent keyboard.add
			* @param {name}{String}{unique name of the event}
			* @param {keys}{String,[String]}{array of keys that need to be down for the event to run}
			* @param {event}{Function}{event to run}
			*/
			keyDown: (name, keys, event)=>{
				new Keydown_Event(name, keys, event);
			},

			/*
			* @name keyUp
			* @type method
			* @description key up event (non-repeated)
			* @parent keyboard.add
			* @param {name}{String}{unique name of the event}
			* @param {keys}{String,[String]}{array of keys that need to be down for the event to fire}
			* @param {event}{Function}{event to run}
			*/
			keyUp: (name, keys, event)=>{
				new Keyup_Event(name, keys, event);	
			}
		},

		/*
		* @name delete
		* @type obj
		* @description delete keyboard events
		* @parent keyboard
		*/
		delete: {
			/*
			* @name keyDown
			* @type method
			* @description delete keyDown event
			* @parent keyboard.delete
			* @param {name}{String}{name of keyDown event to delete}
			*/
			keyDown: (name)=>{
				delete_keydown(name);
			},

			/*
			* @name keyUp
			* @type method
			* @description delete keyUp event
			* @parent keyboard.delete
			* @param {name}{String}{name of keyUp event to delete}
			*/
			keyUp: (name)=>{
				delete_keyup(name);
			}
		},

		/*
		* @name down
		* @type method
		* @description returns <span class="code purple">Boolean</span> if given keys is down
		* @parent keyboard
		* @param {keys}{String,[String]}{keys to check if down (all must be down to return <span class="code purple">True</span>)}
		*/
		down: (keys)=>{
			if(typeof keys == "string"){
				keys = [keys];
			}

			for(var i = keys.length - 1; i>=0; i--){
				keys[i] = DOWN_MAP.get(keys[i]);
			}

			return check_down(keys);
		}
	},

	/*
	* @name mouse
	* @type obj
	* @description manages input from the mouse
	*/
	mouse: {
		/*
		* @name add
		* @type obj
		* @description add mouse events
		* @parent mouse
		*/
		add: {

			/*
			* @name leftDown
			* @type method
			* @description add a left mouse button down event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			leftDown: (name, event)=>{
				add_LeftDown_Event(name, event);
			},

			/*
			* @name middleDown
			* @type method
			* @description add a middle mouse button down event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			middleDown: (name, event)=>{
				add_MiddleDown_Event(name, event);
			},

			/*
			* @name rightDown
			* @type method
			* @description add a right mouse button down event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			rightDown: (name, event)=>{
				add_RightDown_Event(name, event);
			},

			/*
			* @name backDown
			* @type method
			* @description add a back mouse button down event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			backDown: (name, event)=>{
				add_BackDown_Event(name, event);
			},

			/*
			* @name forwardDown
			* @type method
			* @description add a forward mouse button down event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			forwardDown: (name, event)=>{
				add_ForwardDown_Event(name, event);
			},

			/*
			* @name leftUp
			* @type method
			* @description add a left mouse button up event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			leftUp: (name, event)=>{
				add_LeftUp_Event(name, event);
			},

			/*
			* @name middleUp
			* @type method
			* @description add a middle mouse button up event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			middleUp: (name, event)=>{
				add_MiddleUp_Event(name, event);
			},

			/*
			* @name rightUp
			* @type method
			* @description add a right mouse button up event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			rightUp: (name, event)=>{
				add_RightUp_Event(name, event);
			},

			/*
			* @name backUp
			* @type method
			* @description add a back mouse button up event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			backUp: (name, event)=>{
				add_BackUp_Event(name, event);
			},

			/*
			* @name forwardUp
			* @type method
			* @description add a forward mouse button up event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			forwardUp: (name, event)=>{
				add_ForwardUp_Event(name, event);
			},

			/*
			* @name scroll
			* @type method
			* @description add a scroll event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			scroll: (name, event)=>{
				add_scroll_event(name, event);
			},

			/*
			* @name mouseMove
			* @type method
			* @description add a mouse move event 
			* @parent mouse.add
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			mouseMove: (name, event)=>{
				add_mouseMove_event(name, event);
			}
		},
		/*
		* @name delete
		* @type obj
		* @description delete mouse events
		* @parent mouse
		*/
		delete: {

			/*
			* @name leftDown
			* @type method
			* @description deletes a left mouse button down event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			leftDown: (name)=>{
				delete_LeftDown_Event(name);
			},

			/*
			* @name middleDown
			* @type method
			* @description deletes a middle mouse button down event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			middleDown: (name)=>{
				delete_MiddleDown_Event(name);
			},

			/*
			* @name rightDown
			* @type method
			* @description deletes a right mouse button down event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			rightDown: (name)=>{
				delete_RightDown_Event(name);
			},

			/*
			* @name backDown
			* @type method
			* @description deletes a back mouse button down event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			backDown: (name)=>{
				delete_BackDown_Event(name);
			},

			/*
			* @name forwardDown
			* @type method
			* @description deletes a forward mouse button down event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			forwardDown: (name)=>{
				delete_ForwardDown_Event(name);
			},

			/*
			* @name leftUp
			* @type method
			* @description deletes a left button up event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			leftUp: (name)=>{
				delete_LeftUp_Event(name);
			},

			/*
			* @name middleUp
			* @type method
			* @description deletes a middle button up event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			middleUp: (name)=>{
				delete_MiddleUp_Event(name);
			},

			/*
			* @name rightUp
			* @type method
			* @description deletes a right button up event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			rightUp: (name)=>{
				delete_RightUp_Event(name);
			},

			/*
			* @name backUp
			* @type method
			* @description deletes a back button up event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			backUp: (name)=>{
				delete_BackUp_Event(name);
			},

			/*
			* @name forwardUp
			* @type method
			* @description deletes a forward button up event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			forwardUp: (name)=>{
				delete_ForwardUp_Event(name);
			},

			/*
			* @name scroll
			* @type method
			* @description deletes a scroll event
			* @parent mouse.delete
			* @param {name}{String}{name of the event to delete}
			*/
			scroll: (name)=>{
				delete_scroll_event(name);
			},

			/*
			* @name mouseMove
			* @type method
			* @description add a mouse move event 
			* @parent mouse.delete
			* @param {name}{String}{unique name of the event}
			* @param {event}{Function}{event to run}
			*/
			mouseMove: (name, event)=>{
				delete_mouseMove_event(name, event);
			}
		},

		/*
		* @name clearDeltas
		* @type method
		* @description clear mouse deltas
		* @parent mouse
		*/
		clearDeltas: ()=>{
			clear_deltas();
		},

		/*
		* @name pointerLock
		* @type method
		* @description hide the cursor for infinite movement (like in an FPS game)
		* @parent mouse
		*/
		pointerLock: ()=>{
			pointerLocked = true;
			document.getElementsByTagName('body')[0].requestPointerLock();
		},

		/*
		* @name releasePointerLock
		* @type method
		* @description unhide the cursor that was hidden from pointerLock
		* @parent mouse
		*/
		releasePointerLock: ()=>{
			pointerLocked = false;
			document.exitPointerLock();
		}
	},

	/*
	* @name gamepad
	* @type obj
	* @description manages input from up to gamepad 4
	*/
	gamepad: {
		/*
		* @name leftX
		* @type method
		* @description get the left joystick current X position
		* @parent gamepad
		* @param {id}{Int}{id of the gamepad (0-3)}
		*/
		leftX: (id)=>{
			return joystick_leftX(id);
		},
		
		/*
		* @name leftY
		* @type method
		* @description get the left joystick current Y position
		* @parent gamepad
		* @param {id}{Int}{id of the gamepad (0-3)}
		*/
		leftY: (id)=>{
			return joystick_leftY(id);
		},
		
		/*
		* @name rightX
		* @type method
		* @description get the right joystick current X position
		* @parent gamepad
		* @param {id}{Int}{id of the gamepad (0-3)}
		*/
		rightX: (id)=>{
			return joystick_rightX(id);
		},
		
		/*
		* @name rightY
		* @type method
		* @description get the right joystick current Y position
		* @parent gamepad
		* @param {id}{Int}{id of the gamepad (0-3)}
		*/
		rightY: (id)=>{
			return joystick_rightY(id);
		},

		/*
		* @name button
		* @type method
		* @description return value of a controller button
		* @parent gamepad
		* @param {id}{Int}{id of the gamepad (0-3)}
		* @param {btn}{String}{which button to check}
		*/
		/*
		* @name btn
		* @type options
		* @description button types
		* @parent gamepad.button
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
		button: (id, btn)=>{
			return controller_buttonPressed(id, btn);
		},

		/*
		* @name getConnected
		* @type method
		* @description returns <span class="code">[<span class="purple">Boolean</span>]</span> of which controllers are connected
		* @parent gamepad
		*/
		getConnected: ()=>{
			return get_connected_controllers();
		}
	},
	/*
	* @name enable
	* @type method
	* @description enables inputManager
	*/
	enable: ()=>{
		add_listeners();
	},

	/*
	* @name disable
	* @type method
	* @description disables inputManager
	*/
	disable: ()=>{
		remove_listeners();
	}
}

// mouse x constants

/*
* @name x
* @type property
* @description current mouse x position
* @parent mouse
* @proto Int
*/
Object.defineProperty(exports.mouse, "x", {
	get: ()=>{
		return mouse_x;
	}
});

/*
* @name dx
* @type property
* @description change in mouse x position
* @parent mouse
* @proto Int
*/
Object.defineProperty(exports.mouse, "dx", {
	get: ()=>{
		return dx;
	}
});

/*
* @name screenX
* @type property
* @description current relative mouse x position
* @parent mouse
* @proto Int
*/
Object.defineProperty(exports.mouse, "screenX", {
	get: ()=>{
		return screen_x;
	}
});


// mouse y constants

/*
* @name y
* @type property
* @description current mouse y position
* @parent mouse
* @proto Int
*/
Object.defineProperty(exports.mouse, "y", {
	get: ()=>{
		return mouse_y;
	}
});

/*
* @name dy
* @type property
* @description change in mouse y position
* @parent mouse
* @proto Int
*/
Object.defineProperty(exports.mouse, "dy", {
	get: ()=>{
		return dy;
	}
});

/*
* @name screenY
* @type property
* @description current relative mouse y position
* @parent mouse
* @proto 
*/
Object.defineProperty(exports.mouse, "screenY", {
	get: ()=>{
		return screen_y;
	}
});


// mouse button constants

/*
* @name left
* @type property
* @description left mouse button currently down
* @parent mouse
* @proto Boolean
*/
Object.defineProperty(exports.mouse, "left", {
	get: ()=>{
		return left_down;
	}
});

/*
* @name middle
* @type property
* @description middle mouse button currently down
* @parent mouse
* @proto Boolean
*/
Object.defineProperty(exports.mouse, "middle", {
	get: ()=>{
		return middle_down;
	}
});

/*
* @name right
* @type property
* @description right mouse button currently down
* @parent mouse
* @proto Boolean
*/
Object.defineProperty(exports.mouse, "right", {
	get: ()=>{
		return right_down;
	}
});

/*
* @name back
* @type property
* @description back mouse button currently down
* @parent mouse
* @proto Boolean
*/
Object.defineProperty(exports.mouse, "back", {
	get: ()=>{
		return back_down;
	}
})


/*
* @name forward
* @type property
* @description forward mouse button currently down
* @parent mouse
* @proto Boolean
*/
Object.defineProperty(exports.mouse, "forward", {
	get: ()=>{
		return forward_down;
	}
});


// mouse position offset

/*
* @name offsetX
* @type property
* @description mouse x offset
* @parent mouse
* @proto Number
*/
Object.defineProperty(exports.mouse, "offsetX", {
	get: ()=>{
		return mouse_position_offset_x;
	},
	set: (val)=>{
		mouse_position_offset_x = val;
	}
});


/*
* @name offsetY
* @type property
* @description mouse y offset
* @parent mouse
* @proto Number
*/
Object.defineProperty(exports.mouse, "offsetY", {
	get: ()=>{
		return mouse_position_offset_y;
	},
	set: (val)=>{
		mouse_position_offset_y = val;
	}
});

/*
* @name pointerLocked
* @type property
* @description if the pointer is currently locked
* @parent mouse
* @proto String
*/
Object.defineProperty(exports.mouse, "pointerLocked", {
	get: ()=>{
		return pointerLocked;
	}
});



module.exports = exports;