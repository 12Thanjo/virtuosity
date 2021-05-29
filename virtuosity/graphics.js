var ocs = require('ocs');
// var escs = require('../../escs/index.js');
var debug = require('./debug.js');
require('@pixi/graphics-extras');
var {structures} = require('../virtuosity-server/index.js');


module.exports = function(PIXI, canvases){
	/*
	* @name engine2d-graphics
	* @type environment
	*/
	var env = "engine2d-graphics";
	new ocs.Environment(env);

	/*
	* @name position
	* @type component
	* @description position of the graphics object
	* @env engine2d-graphics
	* @param {x}{Number}{x coordinate of the graphics object}{0}
	* @param {y}{Number}{y coordinate of the graphics object}{0}
	*/
	var pos = new ocs.Component(env, 'position', (x, y)=>{
		return new ocs.EEO({
			x: x || 0,
			y: y || 0
		}, (entity)=>{
			containers.get(entity.container).draw();
		});
	});

	/*
	* @name color
	* @type component
	* @description color of the graphics object
	* @env engine2d-graphics
	* @param {x}{Hex}{color of the graphics object}{0xffffff}
	*/
	var color = new ocs.Component(env, 'color', (color)=>{
		return new ocs.EEO({
			color: color || 0xffffff
		}, (entity)=>{
			containers.get(entity.container).draw();	
		});
	});

	/*
	* @name alpha
	* @type component
	* @description alpha of the graphics object
	* @env engine2d-graphics
	* @param {alpha}{Number}{alpha of the graphics object}{1}
	*/
	var alpha = new ocs.Component(env, 'alpha', (alpha)=>{
		return new ocs.EEO({
			alpha: alpha || 1
		}, (entity)=>{
			containers.get(entity.container).draw();
		});
	});

	/*
	* @name container
	* @type component
	* @description container of the render object
	* @env engine2d-graphics
	* @param {container}{Container}{container of the render object}
	* @param {zIndex}{Number}{zIndex of the render object}
	*/
	var container = new ocs.Component(env, 'container', (container, zIndex)=>{
		return new ocs.EEO({
			container: container,
			zIndex: zIndex ?? 0
		}, (entity, key, val)=>{
			if(key == "zIndex"){
				var target = containers.get(container);
				target.queue.setPriority(entity, val);
			}else if(key == "container"){
				// read only
				if(val != container){
					entity.container = container;
				}
			}
		});
	});



	containers = new Map();
	var Container = function(name, canvas){
		containers.set(name, this);
		this.name = name;
		this.canvas = canvas;
		this.shapes = new Map();
		this.graphics = new PIXI.Graphics();
		this.queue = new structures.PriorityQueue();
		this.clear = true;
		canvas.stage.addChild(this.graphics);
		canvas.containers.add(name);

		this.draw = function(){
			if(this.clear) this.graphics.clear();

			this.queue.reverseForEach((node)=>{
				var shape = node.getData();
				if(shape.hasTag('circle')){
					this.graphics.beginFill(shape.color, shape.alpha);
					this.graphics.drawCircle(shape.x, shape.y, shape.radius);
					this.graphics.endFill();
				}else if(shape.hasTag('rectangle')){
					this.graphics.beginFill(shape.color, shape.alpha);
					this.graphics.drawRect(shape.x, shape.y, shape.width, shape.height);
				}else if(shape.hasTag('box')){
					this.graphics.beginFill(shape.color, shape.alpha);
					this.graphics.drawRoundedRect(shape.x, shape.y, shape.width, shape.height, shape.borderRadius);
				}else if(shape.hasTag('line')){
					this.graphics.lineStyle(shape.thickness, shape.color, shape.alpha);
					this.graphics.moveTo(shape.x, shape.y);
					this.graphics.lineTo(shape.x2, shape.y2);
				}else if(shape.hasTag('ellipse')){
					this.graphics.beginFill(shape.color, shape.alpha);
					this.graphics.drawEllipse(shape.x, shape.y, shape.width, shape.height);
					this.graphics.endFill();
				}else if(shape.hasTag('torus')){
					var radius = shape;
					this.graphics.beginFill(shape.color, shape.alpha);
					this.graphics.drawTorus(shape.x, shape.y, radius.innerRadius, radius.radius);
					this.graphics.endFill();
				}else if(shape.hasTag('polygon')){
					this.graphics.beginFill(shape.color, shape.alpha);
					this.graphics.drawPolygon(shape.points);
					this.graphics.endFill();
				}
			});
		}

		this.add = function(shape){
			this.shapes.set(shape.name, shape);
			this.queue.push(0, shape);
			this.graphics.clear();
			this.draw();
		}

		new ocs.Tag(name);
	}

	/*
	* @name radius
	* @type component
	* @description radius of the render object
	* @env engine2d-graphics
	* @param {radius}{Number}{radius of the render object}
	*/
	var radius = new ocs.Component(env, 'radius', (r, r2)=>{
		return new ocs.EEO({
			radius: r || 10,
			innerRadius: r2 || null
		}, (entity)=>{
			containers.get(entity.container).draw();
		});
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
	new ocs.Tag('circle');
	var new_circle = function(name, container, x, y, radius, color){
		var new_circle = new ocs.Entity(env, `${name}╎${container}`)
		new_circle.addComponent('container', container)
			      .addComponent('position', x, y)
				  .addComponent('radius', radius)
				  .addComponent('color', color)
				  .addComponent('alpha')
				  .addTag('circle');

		containers.get(container).add(new_circle);
		return new_circle;
	}

	/*
	* @name scale
	* @type component
	* @description scale of the graphics object
	* @env engine2d-graphics
	* @param {width}{Number}{width of the graphics object}{10}
	* @param {height}{Number}{height of the graphics object}{10}
	*/
	var scale = new ocs.Component(env, 'scale', (width, height)=>{
		return new ocs.EEO({
			width: width || 10,
			height: height || 10
		}, (entity)=>{
			containers.get(entity.container).draw();
		});
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
	new ocs.Tag('rectangle');
	var new_rectangle = function(name, container, x, y, width, height, color){
		var new_rectangle = new ocs.Entity(env, `${name}╎${container}`)
		new_rectangle.addComponent('container', container)
			    	 .addComponent('position', x, y)
					 .addComponent('scale', width, height)
					 .addComponent('color', color)
				 	 .addComponent('alpha')
				 	 .addTag('rectangle');

		containers.get(container).add(new_rectangle);
		return new_rectangle;
	}

	/*
	* @name borderRadius
	* @type component
	* @description border radius of the graphics object
	* @env engine2d-graphics
	* @param {radius}{Number}{border radius of the graphics object}{0}
	*/
	var borderRadius = new ocs.Component(env, 'borderRadius', (radius)=>{
		return new ocs.EEO({
			borderRadius: radius || 0
		}, (entity)=>{
			containers.get(entity.container).draw();
		})
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
	new ocs.Tag('box');
	var new_box = function(name, container, x, y, width, height, color, borderRadius){
		var new_box = new ocs.Entity(env, `${name}╎${container}`)
		new_box.addComponent('container', container)
			   .addComponent('position', x, y)
			   .addComponent('scale', width, height)
			   .addComponent('color', color)
			   .addComponent('borderRadius', borderRadius)
			   .addComponent('alpha')
			   .addTag('box');

		containers.get(container).add(new_box);
		return new_box;
	}

	/*
	* @name position2
	* @type component
	* @description position2 of the graphics object
	* @env engine2d-graphics
	* @param {x2}{Number}{x2 coordinate of the graphics object}{0}
	* @param {y2}{Number}{y2 coordinate of the graphics object}{0}
	*/
	var pos2 = new ocs.Component(env, 'position2', (x, y)=>{
		return new ocs.EEO({
			x2: x || 0,
			y2: y || 0
		}, (entity)=>{
			containers.get(entity.container).draw();
		});
	});

	/*
	* @name thickness
	* @type component
	* @description thickness of the graphics object
	* @env engine2d-graphics
	* @param {thickness}{Number}{thickness of the graphics object}{0}
	*/
	var thickness = new ocs.Component(env, 'thickness', (thickness)=>{
		return new ocs.EEO({
			thickness: thickness || 1
		}, (entity)=>{
			containers.get(entity.container).draw();
		});
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
	new ocs.Tag('line');
	var new_line = function(name, container, x1, y1, x2, y2, color){
		var new_line = new ocs.Entity(env, `${name}╎${container}`)
		new_line.addComponent('container', container)
			    .addComponent('position', x1, y1)
				.addComponent('position2', x2, y2)
				.addComponent('color', color)
				.addComponent('thickness')
				.addComponent('alpha')
				.addTag('line');

		containers.get(container).add(new_line);
		return new_line;
	}

	new ocs.Tag('ellipse');
	var new_ellipse = function(name, container, x, y, width, height, color){
		var new_ellipse = new ocs.Entity(env, `${name}╎${container}`)
		new_ellipse.addComponent('container', container)
			       .addComponent('position', x, y)
				   .addComponent('scale', width, height)
				   .addComponent('color', color)
				   .addComponent('alpha')
				   .addTag('ellipse');

		containers.get(container).add(new_ellipse);
		return new_ellipse;
	}

	new ocs.Tag('torus');
	var new_torus = function(name, container, x, y, innerRadius, outerRadius, color){
		var new_torus = new ocs.Entity(env, `${name}╎${container}`)
		new_torus.addComponent('container', container)
			     .addComponent('position', x, y)
				 .addComponent('radius', outerRadius, innerRadius)
				 .addComponent('color', color)
				 .addComponent('alpha')
				 .addTag('torus');

		containers.get(container).add(new_torus);
		return new_torus;
	}

	/*
	* @name points
	* @type component
	* @description points of the graphics object
	* @env engine2d-graphics
	* @param {points}{[Point]}{x coordinate of the graphics object}{0}
	*/
	var points = new ocs.Component(env, 'points', (points)=>{
		return new ocs.EEO({
			points: points || [new PIXI.Point(0,0), new PIXI.Point(10, 0), new PIXI.Point(10, 10)]
		}, (entity)=>{
			containers.get(entity.container).draw();
		});
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
	new ocs.Tag('polygon');
	var new_polygon = function(name, container, color, points){
		var new_polygon = new ocs.Entity(env, `${name}╎${container}`)
		new_polygon.addComponent('container', container)
			       .addComponent('color', color)
				   .addComponent('alpha')
				   .addComponent('points', points)
				   .addTag('polygon');
	 
		containers.get(container).add(new_polygon);
		return new_polygon;
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
				return new Container(name, canvas);
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
				return new_circle(name, container, x, y, radius, color);
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
				return new_rectangle(name, container, x, y, width, height, color);
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
				return new_box(name, container, x, y, width, height, color, borderRadius);
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
				return new_line(name, container, x1, y1, x2, y2, color);
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
				return new_ellipse(name, container, x, y, width, height, color);
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
				return new_torus(name, container, x, y, width, height, color);	
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
				return new_polygon(name, container, color, points);	
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
				return cntnr.shapes.get(`${name}╎${container}`);
			});
		},




		/*
		* @name delete
		* @type obj
		* @description delete a graphics entity
		*/
		delete: {
			/*
			* @name container
			* @type method
			* @description delete a graphics container
			* @parent delete
			* @param {container}{String}{name of the container to delete}
			*/
			container: (container)=>{
				return container_check(container, (cntnr)=>{
					cntnr.shapes.forEach((shape)=>{
						ocs.getEntity(env, shape.name).destroy();
					});
					cntnr.graphics.clear();
					cntnr.graphics.destroy();
				});	
			},

			/*
			* @name shape
			* @type method
			* @description delete a graphics shape
			* @parent delete
			* @param {name}{String}{name of the graphics shape to delete}
			* @param {container}{String}{name of the container to delete}
			*/
			shape: (name, container)=>{
				return container_check(container, (cntnr)=>{
					var shape = cntnr.shapes.get(`${name}╎${container}`);
					cntnr.queue.delete(shape);
					cntnr.shapes.delete(`${name}╎${container}`);
					cntnr.draw();
				});	
			}
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

