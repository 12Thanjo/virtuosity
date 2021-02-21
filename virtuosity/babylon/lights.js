var hex_to_rgb = function(hex){
	var str = hex.toString(16);
	while(str.length < 6){
		str = '0' + str;
	}

	var r = "0x" + str.substr(0, 2);
	var g = "0x" + str.substr(2, 2);
	var b = "0x" + str.substr(4, 2);

	var r = parseInt(r);
	var g = parseInt(g);
	var b = parseInt(b);

	return [r/255, g/255, b/255];
}



var lights = new Map();
var Light = function(canvas, name, x, y, z, onComplete){
	var ctx = canvases.get(canvas);

	this.light = new BABYLON.PointLight(name, new BABYLON.Vector3(x, z, y), ctx.scene);
	this.light.diffuse = new BABYLON.Color3(1,1,1);
	this.light.intensity = 100;

	this.DATA = {
		color: 0xffffff
	}

	/*
	* @name x
	* @type property
	* @description x position of the Light
	* @proto Number
	*/
	Object.defineProperty(this, "x", {
		get: ()=>{
			return this.light.position.x;
		},
		set: (val)=>{
			this.light.position.x = val;
		}
	});

	/*
	* @name y
	* @type property
	* @description y position of the Light
	* @proto Number
	*/
	Object.defineProperty(this, "y", {
		get: ()=>{
			return this.light.position.z;
		},
		set: (val)=>{
			this.light.position.z = val;
		}
	});

	/*
	* @name z
	* @type property
	* @description z position of the Light
	* @proto Number
	*/
	Object.defineProperty(this, "z", {
		get: ()=>{
			return this.light.position.y;
		},
		set: (val)=>{
			this.light.position.y = val;
		}
	});


	/*
	* @name color
	* @type property
	* @description color of the light
	* @proto Hex
	*/
	Object.defineProperty(this, "color", {
		get: ()=>{
			return this.DATA.color;
		},
		set: (val)=>{
			this.DATA.color = val;
			var rgb = hex_to_rgb(val);
			this.light.diffuse = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
		}
	});

	/*
	* @name intesity
	* @type property
	* @description intesity (wattage) of the Light
	* @proto Number
	*/
	Object.defineProperty(this, "intensity", {
		get: ()=>{
			return this.light.intensity;
		},
		set: (val)=>{
			this.light.intensity = val;
		}
	});


	lights.set(name, this);
	if(onComplete != null){
		onComplete(this);
	}
}


module.exports = {
	Light: Light
}