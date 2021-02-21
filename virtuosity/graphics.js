var escs = require("../virtuosity-server/node_modules/escs/index.js");
// var escs = require('../../escs/index.js');
var debug = require('./debug.js');
require('@pixi/graphics-extras');


module.exports = function(PIXI, canvases){
	/*
	* @name engine2d-graphics
	* @type environment
	*/
	var env = "engine2d-graphics";
	escs.add.environment(env);

	/*
	* @name position
	* @type component
	* @description position of the graphics object
	* @env engine2d-graphics
	* @param {x}{Number}{x coordinate of the graphics object}{0}
	* @param {y}{Number}{y coordinate of the graphics object}{0}
	*/
	var pos = escs.add.component('position', env, (x, y)=>{
		return {
			x: x || 0,
			y: y || 0
		}
	});
	pos.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});

	/*
	* @name color
	* @type component
	* @description color of the graphics object
	* @env engine2d-graphics
	* @param {x}{Hex}{color of the graphics object}{0xffffff}
	*/
	var color = escs.add.component('color', env, (color)=>{
		return {
			color: color || 0xffffff
		}
	});
	color.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});

	/*
	* @name alpha
	* @type component
	* @description alpha of the graphics object
	* @env engine2d-graphics
	* @param {alpha}{Number}{alpha of the graphics object}
	*/
	var alpha = escs.add.component('alpha', env, (alpha)=>{
		return {
			alpha: alpha || 1
		}
	});
	alpha.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});

	/*
	* @name container
	* @type component
	* @description container of the render object
	* @env engine2d-graphics
	* @param {container}{Container}{container of the render object}
	*/
	var container = escs.add.component('container', env, (container)=>{
		return {
			container: container
		}
	});
	container.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});



	var containers = new Map();
	var Container = function(name, canvas){
		containers.set(name, this);
		this.name = name;
		this.canvas = canvas;
		this.shapes = new Map();
		this.graphics = new PIXI.Graphics();
		this.clear = true;
		canvas.stage.addChild(this.graphics);

		this.draw = function(){
			if(this.clear) this.graphics.clear();

			this.shapes.forEach((shape)=>{
				if(shape.hasTag('circle')){
					var pos = shape.getComponent('position');
					this.graphics.beginFill(shape.getComponent('color').color, shape.getComponent('alpha').alpha);
					this.graphics.drawCircle(pos.x, pos.y, shape.getComponent('radius').radius);
					this.graphics.endFill();
				}else if(shape.hasTag('rectangle')){
					var pos = shape.getComponent('position');
					this.graphics.beginFill(shape.getComponent('color').color, shape.getComponent('alpha').alpha);
					this.graphics.drawRect(pos.x, pos.y, shape.getComponent('scale').width, shape.getComponent('scale').height);
				}else if(shape.hasTag('box')){
					var pos = shape.getComponent('position');
					var scale = shape.getComponent('scale');
					this.graphics.beginFill(shape.getComponent('color').color, shape.getComponent('alpha').alpha);
					this.graphics.drawRoundedRect(pos.x, pos.y, scale.width, scale.height, shape.getComponent('borderRadius').radius);
				}else if(shape.hasTag('line')){
					var pos = shape.getComponent('position');
					this.graphics.lineStyle(shape.getComponent('thickness').thickness, shape.getComponent('color').color, shape.getComponent('alpha').alpha);
					this.graphics.moveTo(pos.x, pos.y);
					this.graphics.lineTo(shape.getComponent('position2').x, shape.getComponent('position2').y);
				}else if(shape.hasTag('ellipse')){
					var pos = shape.getComponent('position');
					var scale = shape.getComponent('scale');
					this.graphics.beginFill(shape.getComponent('color').color, shape.getComponent('alpha').alpha);
					this.graphics.drawEllipse(pos.x, pos.y, scale.width, scale.height);
					this.graphics.endFill();
				}else if(shape.hasTag('torus')){
					var pos = shape.getComponent('position');
					var radius = shape.getComponent('radius');
					this.graphics.beginFill(shape.getComponent('color').color, shape.getComponent('alpha').alpha);
					this.graphics.drawTorus(pos.x, pos.y, radius.innerRadius, radius.radius);
					this.graphics.endFill();
				}else if(shape.hasTag('polygon')){
					this.graphics.beginFill(shape.getComponent('color').color, shape.getComponent('alpha').alpha);
					this.graphics.drawPolygon(shape.getComponent('points').points);
					this.graphics.endFill();
				}
			});
		}

		this.add = function(shape){
			this.shapes.set(shape.name, shape);
			this.graphics.clear();
			this.draw();
		}

		escs.add.tag(name, env);
	}

	/*
	* @name radius
	* @type component
	* @description radius of the render object
	* @env engine2d-graphics
	* @param {radius}{Number}{radius of the render object}
	*/
	var radius = escs.add.component('radius', env, (r, r2)=>{
		return {
			radius: r || 10,
			innerRadius: r2 || null
		}
	});
	radius.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});
	/*
	* @name Circle
	* @type entity
	* @description A procedurally generated engine2d circle
	* @env engine2d-graphics
	* @component container
	* @component position
	* @component radius
	* @component color
	* @component alpha
	*/
	escs.add.tag('circle', env);
	var new_circle = function(name, container, x, y, radius, color){
		var new_circle = escs.add.entity(name, env)
			.addComponent('container', container)
			.addComponent('position', x, y)
			.addComponent('radius', radius)
			.addComponent('color', color)
			.addComponent('alpha')
			.addTag('circle');

		containers.get(container).add(new_circle);
	}

	/*
	* @name scale
	* @type component
	* @description scale of the graphics object
	* @env engine2d-graphics
	* @param {width}{Number}{width of the graphics object}{10}
	* @param {height}{Number}{height of the graphics object}{10}
	*/
	var scale = escs.add.component('scale', env, (width, height)=>{
		return {
			width: width || 10,
			height: height || 10
		}
	});

	scale.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});

	/*
	* @name Rectange
	* @type entity
	* @description A procedurally generated engine2d rectangle
	* @env engine2d-graphics
	* @component container
	* @component position
	* @component scale
	* @component color
	* @component alpha
	*/
	escs.add.tag('rectangle', env);
	var new_rectangle = function(name, container, x, y, width, height, color){
		var new_rectangle = escs.add.entity(name, env)
			.addComponent('container', container)
			.addComponent('position', x, y)
			.addComponent('scale', width, height)
			.addComponent('color', color)
			.addComponent('alpha')
			.addTag('rectangle');

		containers.get(container).add(new_rectangle);
	}

	/*
	* @name borderRadius
	* @type component
	* @description border radius of the graphics object
	* @env engine2d-graphics
	* @param {radius}{Number}{border radius of the graphics object}{0}
	*/
	var borderRadius = escs.add.component('borderRadius', env, (radius)=>{
		return {
			radius: radius || 0
		}
	});

	borderRadius.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});

	/*
	* @name Box
	* @type entity
	* @description A procedurally generated engine2d box
	* @env engine2d-graphics
	* @component container
	* @component position
	* @component scale
	* @component color
	* @component borderRadius
	* @component alpha
	*/
	escs.add.tag('box', env);
	var new_box = function(name, container, x, y, width, height, color, borderRadius){
		var new_box = escs.add.entity(name, env)
			.addComponent('container', container)
			.addComponent('position', x, y)
			.addComponent('scale', width, height)
			.addComponent('color', color)
			.addComponent('borderRadius', borderRadius)
			.addComponent('alpha')
			.addTag('box');

		containers.get(container).add(new_box);
	}

	/*
	* @name position2
	* @type component
	* @description position2 of the graphics object
	* @env engine2d-graphics
	* @param {x}{Number}{x2 coordinate of the graphics object}{0}
	* @param {y}{Number}{y2 coordinate of the graphics object}{0}
	*/
	var pos2 = escs.add.component('position2', env, (x, y)=>{
		return {
			x: x || 0,
			y: y || 0
		}
	});
	pos2.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});

	/*
	* @name thickness
	* @type component
	* @description thickness of the graphics object
	* @env engine2d-graphics
	* @param {thickness}{Number}{thickness of the graphics object}{0}
	*/
	var thickness = escs.add.component('thickness', env, (thickness)=>{
		return {
			thickness: thickness || 1
		}
	});
	thickness.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});

	/*
	* @name Line
	* @type entity
	* @description A procedurally generated engine2d line
	* @env engine2d-graphics
	* @component container
	* @component position
	* @component position2
	* @component color
	* @component thickness
	* @component alpha
	*/
	escs.add.tag('line', env);
	var new_line = function(name, container, x1, y1, x2, y2, color){
		var new_line = escs.add.entity(name, env)
			.addComponent('container', container)
			.addComponent('position', x1, y1)
			.addComponent('position2', x2, y2)
			.addComponent('color', color)
			.addComponent('thickness')
			.addComponent('alpha')
			.addTag('line');

		containers.get(container).add(new_line);
	}

	escs.add.tag('ellipse', env);
	var new_ellipse = function(name, container, x, y, width, height, color){
		var new_ellipse = escs.add.entity(name, env)
			.addComponent('container', container)
			.addComponent('position', x, y)
			.addComponent('scale', width, height)
			.addComponent('color', color)
			.addComponent('alpha')
			.addTag('ellipse')

		containers.get(container).add(new_ellipse);
	}

	escs.add.tag('torus', env);
	var new_torus = function(name, container, x, y, innerRadius, outerRadius, color){
		var new_torus = escs.add.entity(name, env)
			.addComponent('container', container)
			.addComponent('position', x, y)
			.addComponent('radius', outerRadius, innerRadius)
			.addComponent('color', color)
			.addComponent('alpha')
			.addTag('torus')

		containers.get(container).add(new_torus);
	}

	/*
	* @name points
	* @type component
	* @description points of the graphics object
	* @env engine2d-graphics
	* @param {points}{[Point]}{x coordinate of the graphics object}{0}
	*/
	var points = escs.add.component('points', env, (points)=>{
		return {
			points: points || [new PIXI.Point(0,0), new PIXI.Point(10, 0), new PIXI.Point(10, 10)]
		}
	});
	points.setOnChange((entity)=>{
		containers.get(entity.getComponent('container').container).draw();
	});

	/*
	* @name Polygon
	* @type entity
	* @description A procedurally generated engine2d line
	* @env engine2d-graphics
	* @component container
	* @component color
	* @component alpha
	* @component points
	*/
	escs.add.tag('polygon', env);
	var new_polygon = function(name, container, color, points){
		var new_polygon = escs.add.entity(name, env)
			.addComponent('container', container)
			.addComponent('color', color)
			.addComponent('alpha')
			.addComponent('points', points)
			.addTag('polygon')

		containers.get(container).add(new_polygon);
	}



	var container_check = function(container, action){
		if(containers.has(container)){
			return action(containers.get(container));
		}else{
			debug.error("ReferenceError", `graphics container (${container}) does not exist`);
		}
	}

	return {
		/*
		* @name add
		* @type obj
		* @description add graphics
		*/
		add: {
			/*
			* @name container
			* @type method
			* @description Adds a container. A container holds graphics entities. This increases performance because when a property of an asset inside the container is changed, only that container needs to be redrawn. It is also faster to redraw the entities in batches as opposed to having each graphics entity seperate.
			* @parent add
			* @param {name}{String}{unique name of the container}
			* @param {canvas}{String}{name of the canvas the container should be a part of}
			*/
			container: (name, canvas)=>{
				new Container(name, canvas);
			},

			/*
			* @name circle
			* @type method
			* @description adds a circle
			* @parent add
			* @param {name}{String}{name of the circle}
			* @param {container}{String}{name of the container}
			* @param {x}{Number}{x position of the circle}
			* @param {y}{Number}{y position of the circle}
			* @param {r}{Number}{radius of the circle}
			* @param {color}{Hex}{color of the circle}
			*/
			circle: (name, container, x, y, radius, color)=>{
				new_circle(name, container, x, y, radius, color);
			},

			/*
			* @name rectangle
			* @type method
			* @description adds a rectangle
			* @parent add
			* @param {name}{String}{name of the rectangle}
			* @param {container}{String}{name of the container}
			* @param {x}{Number}{x position of the rectangle}
			* @param {y}{Number}{y position of the rectangle}
			* @param {width}{Number}{width of the rectangle}
			* @param {height}{Number}{height of the rectangle}
			* @param {color}{Hex}{color of the rectangle}
			*/
			rectangle: (name, container, x, y, width, height, color)=>{
				new_rectangle(name, container, x, y, width, height, color);
			},

			/*
			* @name box
			* @type method
			* @description adds a box
			* @parent add
			* @param {name}{String}{name of the box}
			* @param {container}{String}{name of the container}
			* @param {x}{Number}{x position of the box}
			* @param {y}{Number}{y position of the box}
			* @param {width}{Number}{width of the box}
			* @param {height}{Number}{height of the box}
			* @param {color}{Hex}{color of the box}
			* @param {borderRadius}{Int}{radius of the corners of the box}
			*/
			box: (name, container, x, y, width, height, color, borderRadius)=>{
				new_box(name, container, x, y, width, height, color, borderRadius);
			},

			/*
			* @name line
			* @type method
			* @description adds a line
			* @parent add
			* @param {name}{String}{name of the line}
			* @param {container}{String}{name of the container}
			* @param {x1}{Number}{x1 position of the line}
			* @param {y1}{Number}{y1 position of the line}
			* @param {x2}{Number}{x2 position of the line}
			* @param {y2}{Number}{y2 position of the line}
			* @param {color}{Hex}{color of the line}
			*/
			line: (name, container, x1, y1, x2, y2, color)=>{
				new_line(name, container, x1, y1, x2, y2, color);
			},

			/*
			* @name ellipse
			* @type method
			* @description adds a ellipse
			* @parent add
			* @param {name}{String}{name of the ellipse}
			* @param {container}{String}{name of the container}
			* @param {x}{Number}{x position of the ellipse}
			* @param {y}{Number}{y position of the ellipse}
			* @param {width}{Number}{width of the ellipse}
			* @param {height}{Number}{height of the ellipse}
			* @param {color}{Hex}{color of the ellipse}
			*/
			ellipse: (name, container, x, y, width, height, color)=>{
				new_ellipse(name, container, x, y, width, height, color);
			},

			/*
			* @name torus
			* @type method
			* @description adds a torus
			* @parent add
			* @param {name}{String}{name of the torus}
			* @param {container}{String}{name of the container}
			* @param {x}{Number}{x position of the torus}
			* @param {y}{Number}{y position of the torus}
			* @param {width}{Number}{width of the torus}
			* @param {height}{Number}{height of the torus}
			* @param {color}{Hex}{color of the torus}
			*/
			torus: (name, container, x, y, width, height, color)=>{
				new_torus(name, container, x, y, width, height, color);	
			},

			/*
			* @name polygon
			* @type method
			* @description adds a polygon
			* @parent add
			* @param {name}{String}{name of the polygon}
			* @param {container}{String}{name of the container}
			* @param {points}{[Point]}{points of the polygon}
			* @param {color}{Hex}{color of the polygon}
			*/
			polygon: (name, container, color, points)=>{
				new_polygon(name, container, color, points);	
			}
		},

		/*
		* @name get
		* @type method
		* @description get a specific graphics entity
		* @param {name}{String}{name of the graphics entity}
		* @param {container}{String}{name of the container the graphics entity is in}
		*/
		get: (name, container)=>{
			return container_check(container, (cntnr)=>{
				return cntnr.shapes.get(name);
			});
		},

		/*
		* @name containerClear
		* @type method
		* @description tells the container whether to clear canvas on redraw 
		* @param {container}{String}{name of the container}
		* @param {clear}{Boolean}{whether to clear the container canvas on redraw}
		*/
		containerClear: (container, clear)=>{
			return container_check(container, (cntnr)=>{
				if(clear != null){
					cntnr.clear = clear;
				}
				return cntnr.clear;
			});
		}
	}
}

