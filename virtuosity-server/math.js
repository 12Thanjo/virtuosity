module.exports = {
	/*
	* @name clamp
	* @type method
	* @description clamps a number (returns the number clamped)
	* @param {val}{Number}{number to clamp}
	* @param {min}{Number}{minimum value}
	* @param {max}{Number}{maximum value}
	*/
	clamp: function(val, min, max){
		if(val < min){
			val = min;
		}else if(val > max){
			val = max;
		}
		return val;
	},

	/*
	* @name color
	* @type obj
	* @description color conversions
	*/
	color: {
		/*
		* @name hexToRgb
		* @type method
		* @description converts a HEX to an RGB array
		* @parent color
		*/
		hexToRgb: function(hex){
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
		},

		/*
		* @name rgbToHex
		* @type method
		* @description converts an RGB array to HEX
		* @parent color
		*/
		rgbToHex: function(rgb){
			var r = rgb[0].toString(16);
			var g = rgb[1].toString(16);
			var b = rgb[2].toString(16);

			return parseInt("0x" + r + g + b, 16);
		}
	}
}