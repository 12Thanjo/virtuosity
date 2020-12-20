var stringify_map = function(map){
  return JSON.stringify([...map]);
}

var parse_map = function(jsonStr){
  return new Map(JSON.parse(jsonStr));
}

var parse_set = function(set){
	return new Set(JSON.parse(set));
}




module.exports = {
	/*
	* @name stringifyMap
	* @type method
	* @description stringifys a map
	*/
	stringifyMap: (map)=>{
		return stringify_map(map);
	},

	/*
	* @name parseMap
	* @type method
	* @description parses a map stringified by <a href="#stringifyMap">stringifyMap</a>
	*/
	parseMap: (map)=>{
		return parse_map(map);
	}

	/*
	* @name stringifySet
	* @type method
	* @description stringifys a set
	*/
	stringifySet: (set)=>{
		return stringify_map(set);
	},

	/*
	* @name parseSet
	* @type method
	* @description parses a set stringified by <a href="#stringifySet">stringifySet</a>
	*/
	parseSet: (set)=>{
		return parse_set(set);
	}
}