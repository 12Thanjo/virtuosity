var inputManager;
var engine2d;
var collisionManager;
var import_libs = function(libs){
	inputManager = libs.inputManager;
	engine2d = libs.engine2d;
	collisionManager = libs.collisionManager;
}

var scaling = 1;
var set_scaling = function(scale){
	scaling = scale;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var rectangles = new Set();
/*
* @name Rectangle
* @type class
* @description Draws a Rectangle.
* @param {x}{Float}{X position of the Rectangle}
* @param {y}{Float}{Y position of the Rectangle}
* @param {width}{Float}{width of the Rectangle}
* @param {height}{Float}{height of the Rectangle}
* @param {color}{HEX code Int}{color of the Rectangle}
*/
var Rectangle = function(x, y, width, height, color){
	this.DATA = {
		x: x,
		y: y,
		width: width,
		height: height,
		color: color,
		alpha: 1
	}

	/*
	* @name x
	* @type property
	* @description X position of the Rectangle
	* @parent Rectangle
	*/
	Object.defineProperty(this, "x", {
		get: ()=>{
			return this.DATA.x*scaling;
		},
		set: (data)=>{
			this.DATA.x = data/scaling;
			this.draw();
		}
	});

	/*
	* @name y
	* @type property
	* @description Y position of the Rectangle
	* @parent Rectangle
	*/
	Object.defineProperty(this, "y", {
		get: ()=>{
			return this.DATA.y*scaling;
		},
		set: (data)=>{
			this.DATA.y = data/scaling;
			this.draw();
		}
	});

	/*
	* @name width
	* @type property
	* @description width of the Rectangle
	* @parent Rectangle
	*/
	Object.defineProperty(this, "width", {
		get: ()=>{
			return this.DATA.width*scaling;
		},
		set: (data)=>{
			this.DATA.width = data/scaling;
			this.draw();
		}
	});

	/*
	* @name height
	* @type property
	* @description height of the Rectangle
	* @parent Rectangle
	*/
	Object.defineProperty(this, "height", {
		get: ()=>{
			return this.DATA.height*scaling;
		},
		set: (data)=>{
			this.DATA.height = data/scaling;
			this.draw();
		}
	});

	/*
	* @name color
	* @type property
	* @description Color of the Rectangle (Int)
	* @parent Rectangle
	*/
	Object.defineProperty(this, "color", {
		get: ()=>{
			return this.DATA.color;
		},
		set: (data)=>{
			this.DATA.color = data;
			this.draw();
		}
	});

	/*
	* @name alpha
	* @type property
	* @description Alpha of the Rectangle (Int)
	* @parent Rectangle
	*/
	Object.defineProperty(this, "alpha", {
		get: ()=>{
			return this.DATA.alpha;
		},
		set: (data)=>{
			this.DATA.alpha = data;
			this.draw();
		}
	});


	this.graphics = engine2d.add.graphics(0,0);
	this.graphics.beginFill(this.DATA.color, this.DATA.alpha);


	this.draw = function(){
		this.graphics.clear();
		//main
		this.graphics.beginFill(this.DATA.color, this.DATA.alpha);
		this.graphics.drawRect(this.x, this.y, this.width, this.height);
	}
	this.draw();



	rectangles.add(this);

	/*
	* @name destroy
	* @type method
	* @description Destroys the Rectangle
	* @parent Rectangle
	*/
	this.destroy = function(){
		rectangles.delete(this);
		this.graphics.clear();
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var boxes = new Set();
/*
* @name Box
* @type class
* @description Draws a box. Simmilar to a rectange, but has added features.
* @param {x}{Float}{X position of the Box}
* @param {y}{Float}{Y position of the Box}
* @param {width}{Float}{width of the Box}
* @param {height}{Float}{height of the Box}
* @param {color}{HEX code Int}{color of the Box}
* @param {radius}{HEX code Int}{radius of the corners of the Box}
*/
var Box = function(x, y, width, height, color, radius, frame){
	this.DATA = {
		x: x,
		y: y,
		width: width,
		height: height,
		color: color,
		radius: radius,
		alpha: 1
	}

	if(radius == null){
		this.DATA.radius = 0;
	}

	/*
	* @name x
	* @type property
	* @description X position of the Box
	* @parent Box
	*/
	Object.defineProperty(this, "x", {
		get: ()=>{
			return this.DATA.x*scaling;
		},
		set: (data)=>{
			this.DATA.x = data/scaling;
			this.draw();
		}
	});

	/*
	* @name y
	* @type property
	* @description Y position of the Box
	* @parent Box
	*/
	Object.defineProperty(this, "y", {
		get: ()=>{
			return this.DATA.y*scaling;
		},
		set: (data)=>{
			this.DATA.y = data/scaling;
			this.draw();
		}
	});
	/*
	* @name width
	* @type property
	* @description width of the Box
	* @parent Box
	*/
	Object.defineProperty(this, "width", {
		get: ()=>{
			return this.DATA.width*scaling;
		},
		set: (data)=>{
			this.DATA.width = data/scaling;
			this.draw();
		}
	});

	/*
	* @name height
	* @type property
	* @description height of the Box
	* @parent Box
	*/
	Object.defineProperty(this, "height", {
		get: ()=>{
			return this.DATA.height*scaling;
		},
		set: (data)=>{
			this.DATA.height = data/scaling;
			this.draw();
		}
	});
	
	/*
	* @name color
	* @type property
	* @description Color of the Box (Int)
	* @parent Box
	*/
	Object.defineProperty(this, "color", {
		get: ()=>{
			return this.DATA.color;
		},
		set: (data)=>{
			this.DATA.color = data;
			this.draw();
		}
	});

	/*
	* @name radius
	* @type property
	* @description radius of the corners of the Box
	* @parent Box
	*/
	Object.defineProperty(this, "radius", {
		get: ()=>{
			return Math.ceil(this.DATA.radius*scaling);
		},
		set: (data)=>{
			this.DATA.radius = Math.ceil(data/scaling);
			this.draw();
		}
	});


	/*
	* @name alpha
	* @type property
	* @description alpha of the corners of the Box
	* @parent Box
	*/
	Object.defineProperty(this, "alpha", {
		get: ()=>{
			return this.DATA.alpha;
		},
		set: (data)=>{
			this.DATA.alpha = data;
			this.draw();
		}
	});


	this.graphics = engine2d.add.graphics(0,0);
	this.graphics.beginFill(this.DATA.color, this.DATA.alpha);


	this.draw = function(){
		if(this.frame){
			this.graphics.clear();
			if(this.DATA.radius != null && this.DATA.radius != 0){
				//frame
				this.graphics.beginFill(this.frame.color, this.DATA.alpha);
				this.graphics.drawRoundedRect(this.x, this.y, this.width, this.height, this.DATA.radius);

				//main
				var thickness = this.frame.thickness;
				this.graphics.beginFill(this.DATA.color, this.DATA.alpha);
				this.graphics.drawRoundedRect(this.x + thickness, this.y + thickness, this.width - (thickness*2), this.height - (thickness*2), this.DATA.radius);
			}else{
				//frame
				this.graphics.beginFill(this.frame.color, this.DATA.alpha);
				this.graphics.drawRect(this.x, this.y, this.width, this.height);

				//main
				var thickness = this.frame.thickness;
				this.graphics.beginFill(this.DATA.color, this.DATA.alpha);
				this.graphics.drawRect(this.x + thickness, this.y + thickness, this.width - (thickness*2), this.height - (thickness*2));
			}
		}
	}


	if(frame == null || !frame){
		this.frame = new Box(this.x, this.y, this.width, this.height, 0x000000, this.DATA.radius, true);
		this.frame.thickness = 0;
		this.draw();
	}

	/*
	* @name borderThickness
	* @type property
	* @description Thickness of the border
	* @parent Box
	*/
	Object.defineProperty(this, 'borderThickness', {
		get: ()=>{
			try{
				return this.frame.thickness*scaling;
			}catch{
				return 0;
			}
		},
		set: (data)=>{
			if(this.frame != null){
				this.frame.thickness = data/scaling;
				this.width = this.frame.width;
				this.draw();
			}
		}
	});

	/*
	* @name borderColor
	* @type property
	* @description Color of the border (Int)
	* @parent Box
	*/
	Object.defineProperty(this, 'borderColor', {
		get: ()=>{
			return this.frame.color;
		},
		set: (data)=>{
			this.frame.DATA.color = data;
			this.draw();
		}
	});

	boxes.add(this);

	/*
	* @name destroy
	* @type method
	* @description Destroys the Box
	* @parent Box
	*/
	this.destroy = function(){
		boxes.delete(this);
		this.graphics.clear();
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var lines = new Set();
/*
* @name Line
* @type class
* @description Draws a Line.
* @param {x1}{Float}{starting X position of the Line}
* @param {y1}{Float}{starting Y position of the Line}
* @param {x2}{Float}{ending X position of the Line}
* @param {y2}{Float}{ending Y position of the Line}
* @param {color}{HEX code Int}{color of the Line}
*/
var Line = function(x1, y1, x2, y2, color){
	this.DATA = {
		x1: x1,
		y1: y1,
		x2: x2,
		y2: y2,
		color: color,
		alpha: 1,
		width: 1
	}

	/*
	* @name x1
	* @type property
	* @description x position of the starting point of the Line 
	* @parent Line
	*/
	Object.defineProperty(this, "x1", {
		get: ()=>{
			return this.DATA.x1*scaling;
		},
		set: (data)=>{
			this.DATA.x1 = data/scaling;
			this.draw();
		}
	});

	/*
	* @name y1
	* @type property
	* @description y position of the starting point of the Line 
	* @parent Line
	*/
	Object.defineProperty(this, "y1", {
		get: ()=>{
			return this.DATA.y1*scaling;
		},
		set: (data)=>{
			this.DATA.y1 = data/scaling;
			this.draw();
		}
	});

	/*
	* @name x2
	* @type property
	* @description x position of the starting point of the Line 
	* @parent Line
	*/
	Object.defineProperty(this, "x2", {
		get: ()=>{
			return this.DATA.x2*scaling;
		},
		set: (data)=>{
			this.DATA.x2 = data/scaling;
			this.draw();
		}
	});

	/*
	* @name y2
	* @type property
	* @description y position of the starting point of the Line 
	* @parent Line
	*/
	Object.defineProperty(this, "y2", {
		get: ()=>{
			return this.DATA.y2*scaling;
		},
		set: (data)=>{
			this.DATA.y2 = data/scaling;
			this.draw();
		}
	});


	/*
	* @name width
	* @type property
	* @description width of the Line
	* @parent Line
	*/
	Object.defineProperty(this, "width", {
		get: ()=>{
			return this.DATA.width*scaling;
		},
		set: (data)=>{
			this.DATA.width = data/scaling;
			this.draw();
		}
	});

	
	/*
	* @name color
	* @type property
	* @description Color of the Line (Int)
	* @parent Line
	*/
	Object.defineProperty(this, "color", {
		get: ()=>{
			return this.DATA.color;
		},
		set: (data)=>{
			this.DATA.color = data;
			this.draw();
		}
	});

	/*
	* @name alpha
	* @type property
	* @description Alpha of the Line (Int)
	* @parent Line
	*/
	Object.defineProperty(this, "alpha", {
		get: ()=>{
			return this.DATA.alpha;
		},
		set: (data)=>{
			this.DATA.alpha = data;
			this.draw();
		}
	});


	this.graphics = engine2d.add.graphics(0,0);
	this.graphics.beginFill(this.DATA.color, this.DATA.alpha);


	this.draw = function(){
		this.graphics.clear();
		//main
		this.graphics.moveTo(this.x1, this.y1);
		this.graphics.lineStyle(this.DATA.width, this.DATA.color, this.DATA.alpha) 
		this.graphics.lineTo(this.x2, this.y2);
	}
	this.draw();



	lines.add(this);

	/*
	* @name destroy
	* @type method
	* @description Destroys the Line
	* @parent Line
	*/
	this.destroy = function(){
		lines.delete(this);
		this.graphics.clear();
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var circles = new Set();
/*
* @name Circle
* @type class
* @description Draws a Circle.
* @param {x}{Float}{X position of the Circle}
* @param {y}{Float}{Y position of the Circle}
* @param {radius}{Float}{radius of the Circle}
* @param {color}{HEX code Int}{color of the Circle}
*/
var Circle = function(x, y, radius, color){
	this.DATA = {
		x: x,
		y: y,
		radius: radius,
		color: color,
		alpha: 1
	}

	/*
	* @name x
	* @type property
	* @description x position of the Circle 
	* @parent Circle
	*/
	Object.defineProperty(this, "x", {
		get: ()=>{
			return this.DATA.x*scaling;
		},
		set: (data)=>{
			this.DATA.x = data/scaling;
			this.draw();
		}
	});

	/*
	* @name y
	* @type property
	* @description y position of the Circle
	* @parent Circle
	*/
	Object.defineProperty(this, "y", {
		get: ()=>{
			return this.DATA.y*scaling;
		},
		set: (data)=>{
			this.DATA.y = data/scaling;
			this.draw();
		}
	});

	/*
	* @name radius
	* @type property
	* @description radius of the Circle
	* @parent Circle
	*/
	Object.defineProperty(this, "radius", {
		get: ()=>{
			return this.DATA.radius*scaling;
		},
		set: (data)=>{
			this.DATA.radius = data/scaling;
			this.draw();
		}
	});

	
	/*
	* @name color
	* @type property
	* @description Color of the Circle (Int)
	* @parent Circle
	*/
	Object.defineProperty(this, "color", {
		get: ()=>{
			return this.DATA.color;
		},
		set: (data)=>{
			this.DATA.color = data;
			this.draw();
		}
	});

	/*
	* @name alpha
	* @type property
	* @description Alpha of the Circle (Int)
	* @parent Circle
	*/
	Object.defineProperty(this, "alpha", {
		get: ()=>{
			return this.DATA.alpha;
		},
		set: (data)=>{
			this.DATA.alpha = data;
			this.draw();
		}
	});


	this.graphics = engine2d.add.graphics(0,0);
	this.graphics.beginFill(this.DATA.color, this.DATA.alpha);


	this.draw = function(){
		this.graphics.clear();
		//main
		this.graphics.beginFill(this.DATA.color, this.DATA.alpha);
		this.graphics.drawCircle(this.x+this.radius, this.y+this.radius, this.radius*2);
	}
	this.draw();



	circles.add(this);

	/*
	* @name destroy
	* @type method
	* @description Destroys the Circle
	* @parent Circle
	*/
	this.destroy = function(){
		circles.delete(this);
		this.graphics.clear();
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ellipses = new Set();
/*
* @name Ellipse
* @type class
* @description Draws a Ellipse.
* @param {x}{Float}{X position of the Ellipse}
* @param {y}{Float}{Y position of the Ellipse}
* @param {xRadius}{Float}{x radius of the Ellipse}
* @param {yRadius}{Float}{y radius of the Ellipse}
* @param {color}{HEX code Int}{color of the Ellipse}
*/
var Ellipse = function(x, y, xRadius, yRadius, color){
	this.DATA = {
		x: x,
		y: y,
		xRadius: xRadius,
		yRadius: yRadius,
		color: color,
		alpha: 1
	}

	/*
	* @name x
	* @type property
	* @description x position of the Ellipse 
	* @parent Ellipse
	*/
	Object.defineProperty(this, "x", {
		get: ()=>{
			return this.DATA.x*scaling;
		},
		set: (data)=>{
			this.DATA.x = data/scaling;
			this.draw();
		}
	});

	/*
	* @name y
	* @type property
	* @description y position of the Ellipse
	* @parent Ellipse
	*/
	Object.defineProperty(this, "y", {
		get: ()=>{
			return this.DATA.y*scaling;
		},
		set: (data)=>{
			this.DATA.y = data/scaling;
			this.draw();
		}
	});

	/*
	* @name xRadius
	* @type property
	* @description xRadius of the Ellipse
	* @parent Ellipse
	*/
	Object.defineProperty(this, "xRadius", {
		get: ()=>{
			return this.DATA.xRadius*scaling;
		},
		set: (data)=>{
			this.DATA.xRadius = data/scaling;
			this.draw();
		}
	});

	/*
	* @name yRadius
	* @type property
	* @description yRadius of the Ellipse
	* @parent Ellipse
	*/
	Object.defineProperty(this, "yRadius", {
		get: ()=>{
			return this.DATA.yRadius*scaling;
		},
		set: (data)=>{
			this.DATA.yRadius = data/scaling;
			this.draw();
		}
	});

	
	/*
	* @name color
	* @type property
	* @description Color of the Ellipse (Int)
	* @parent Ellipse
	*/
	Object.defineProperty(this, "color", {
		get: ()=>{
			return this.DATA.color;
		},
		set: (data)=>{
			this.DATA.color = data;
			this.draw();
		}
	});

	/*
	* @name alpha
	* @type property
	* @description Alpha of the Ellipse (Int)
	* @parent Ellipse
	*/
	Object.defineProperty(this, "alpha", {
		get: ()=>{
			return this.DATA.alpha;
		},
		set: (data)=>{
			this.DATA.alpha = data;
			this.draw();
		}
	});


	this.graphics = engine2d.add.graphics(0,0);
	this.graphics.beginFill(this.DATA.color, this.DATA.alpha);


	this.draw = function(){
		this.graphics.clear();
		//main
		this.graphics.beginFill(this.DATA.color, this.DATA.alpha);
		this.graphics.drawEllipse(this.x+this.xRadius, this.y+this.yRadius, this.xRadius, this.yRadius);
	}
	this.draw();



	ellipses.add(this);

	/*
	* @name destroy
	* @type method
	* @description Destroys the Ellipse
	* @parent Ellipse
	*/
	this.destroy = function(){
		ellipses.delete(this);
		this.graphics.clear();
	}
}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var polygons = new Set();
/*
* @name Polygon
* @type class
* @description Draws a Polygon.
* @param {points}{<a href="./virtuosity.collisionManager.shape.Polygon.html">Polygon</a>}{points of the Polygon}
* @param {color}{HEX code Int}{color of the Polygon}
*/
var Polygon = function(points, color){
	this.DATA = {
		path: path,
		color: color,
		alpha: 1,
		path: points
	}

	
	/*
	* @name color
	* @type property
	* @description Color of the Polygon (Int)
	* @parent Polygon
	*/
	Object.defineProperty(this, "color", {
		get: ()=>{
			return this.DATA.color;
		},
		set: (data)=>{
			this.DATA.color = data;
			this.draw();
		}
	});

	/*
	* @name alpha
	* @type property
	* @description Alpha of the Polygon (Int)
	* @parent Polygon
	*/
	Object.defineProperty(this, "alpha", {
		get: ()=>{
			return this.DATA.alpha;
		},
		set: (data)=>{
			this.DATA.alpha = data;
			this.draw();
		}
	});


	this.graphics = engine2d.add.graphics(0,0);
	this.graphics.beginFill(this.DATA.color, this.DATA.alpha);


	this.draw = function(){
		this.graphics.clear();
		//main
		this.graphics.beginFill(this.DATA.color, this.DATA.alpha);
		this.graphics.drawPolygon(this.DATA.path.points);
		this.graphics.endFill();
	}
	this.draw();



	polygons.add(this);

	/*
	* @name destroy
	* @type method
	* @description Destroys the Polygon
	* @parent Polygon
	*/
	this.destroy = function(){
		polygons.delete(this);
		this.graphics.clear();
	}
}


module.exports = {
	Box: Box,
	Rectangle: Rectangle,
	Line: Line,
	Circle: Circle,
	Ellipse: Ellipse,
	Polygon: Polygon,
	import_libs: (libs)=>{
		import_libs(libs);
	},
	set_scaling: (libs)=>{
		set_scaling(libs);
	},
	// needed for auto scaling, not actually exposed to user
	rectangles: rectangles,
	boxes: boxes,
	lines: lines,
	circles: circles,
	ellipses: ellipses,
	polygons: polygons
}