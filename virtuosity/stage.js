var setup_text = function(text,	config){
	text.id					= config.id;
	text.x					= config.x;
	text.y					= config.y;
	text.rotation			= config.rotation;
	text.alpha				= config.alpha;
	text.anchor.x			= config.anchor.x;
	text.anchor.y			= config.anchor.y;
	text.pivot.x			= config.pivot.x;
	text.pivot.y			= config.pivot.y;
	text.zIndex				= config.zIndex;
	text.fontSize			= config.fontSize;
	text.fontFamily			= config.fontFamily;
	text.fill				= config.fill;
	text.align 				= config.align;
	text.stroke 			= config.stroke;
	text.strokeThickness	= config.strokeThickness;
	text.letterSpacing		= config.letterSpacing;
	text.lineHeight			= config.lineHeight;
	text.fontWeight			= config.fontWeight;
	text.fontStyle			= config.fontStyle;
	text.text				= config.text;
}

var setup_circle = function(circle, config){
	circle.zIndex 	= config.zIndex;
	circle.x 		= config.x;
	circle.y 		= config.y;
	circle.radius 	= config.radius;
	circle.color 	= config.color;
	circle.alpha 	= config.alpha;
}




module.exports = function(internal){
	var stages2d = new Map();
	/*
	* @name Stage2D
	* @type class
	* @description A 2D stage
	* @param {name}{String}{name of the stage}
	*/
	class Stage2d{
		#name;
		#images;
		#texts;
		#graphics;
		#textboxes;
		#enabled;

		constructor(name){
			/*
			* @name name
			* @type prop
			* @description name of the stage
			* @parent Stage2D
			*/
			this.#name = name;
			Object.defineProperty(this, "name", {get: ()=>{return this.#name;}});

			this.#enabled = new Set();
			this.#images = new Map();
			this.#texts = new Map();
			this.#graphics = {
				cirlces: new Map(),
				rectangles: new Map(),
				boxes: new Map(),
				lines: new Map(),
				polygons: new Map()
			};
			this.#textboxes = new Map();

			stages2d.set(name, stages2d);

			/*
			* @name add
			* @type obj
			* @description add entities to the Stage2D
			* @parent Stage2D
			*/
			this.add = {
				image: (img)=>{
					this.#images.set(img.id, {
						id: 		img.id,
						key: 		img.key,
						x: 			img.x,
						y: 			img.y,
						rotation: 	img.rotation,
						alpha: 		img.alpha,
						tint: 		img.tint,
						anchor: {
							x: 		img.anchor.x,
							y: 		img.anchor.y
						},
						pivot: {
							x: 		img.pivot.x,
							y: 		img.pivot.y
						},
						skew: {
							x: 		img.skew.x,
							y: 		img.skew.y
						},
						zIndex: 	img.zIndex,
						width: 		img.width,
						height: 	img.height,
						assets: 	new Map(),
						type: 		"image"
					});
				},

				/*
				* @name text
				* @type method
				* @description add an text to the Stage2D (either from a non-exported state)
				* @parent Stage2D.add
				* @param {img}{Image}{text to add}
				*/
				text: (txt)=>{
					this.#texts.set(txt.id, {
						id: 				txt.id,
						x: 					txt.x,
						y: 					txt.y,
						rotation: 			txt.rotation,
						alpha: 				txt.alpha,
						anchor: {
							x: 				txt.anchor.x,
							y: 				txt.anchor.y
						},
						pivot: {
							x: 				txt.pivot.x,
							y: 				txt.pivot.y
						},
						zIndex: 			txt.zIndex,
						fontSize: 			txt.fontSize,
						fontFamily: 		txt.fontFamily,
						fill: 				txt.fill,
						align: 				txt.align,
						stroke: 			txt.stroke,
						strokeThickness: 	txt.strokeThickness,
						letterSpacing: 		txt.letterSpacing,
						lineHeight: 		txt.lineHeight,
						fontWeight: 		txt.fontWeight,
						fontStyle: 			txt.fontStyle,
						text: 				txt.text,
						assets: 			new Map(),
						type: 				'text'
					});
				},
				graphics: {
					circle: (circle)=>{
						this.#graphics.circles.set(circle.id, {
							id: 		circle.id,
							zIndex: 	circle.zIndex,
							x: 			circle.x,
							y: 			circle.y,
							radius: 	circle.radius,
							color: 		circle.color,
							alpha: 		circle.alpha,
							assets: 	new Map(),
							type: 		'circle'
						});
					}
				},
				textboxes: (box)=>{
					this.#textboxes.set(box.id, {
						id: 	box.id,
						key: 	box.key,
						x: 		box.x,
						y: 		box.y,
						value: 	box.value,
						width: 	box.width,
						assets: new Map(),
						type: 	'textbox'
					});
				}
			};

			/*
			* @name get
			* @type obj
			* @description get live 2D assets
			* @parent Stage2D
			*/
			this.get = {
				/*
				* @name text
				* @type method
				* @description get live text
				* @parent Stage2D.get
				* @param {canvas}{String}{name of canvas}
				* @param {id}{String}{id of the text entity}
				*/
				text: (canvas, id)=>{
					if(this.#enabled.has(canvas)){
						return internal.get_text(canvas, `(stage2d╎${this.#name}╎${id})`);
					}
				},
				graphics: {
					circle: (canvas, container, id)=>{
						if(this.#enabled.has(canvas)){
							return internal.get_circle(id, container, `(stage2d╎${this.#name}╎${id})`);
						}
					}
				}
			}

			/*
			* @name has
			* @type obj
			* @description check if the Stage2D has a live 2D assets
			* @parent Stage2D
			*/
			this.has = {
				/*
				* @name text
				* @type method
				* @description check if the Stage2D has a live text
				* @parent Stage2D.has
				*/
				text: (name)=>{
					return this.#texts.has(name);
				},
				graphics: {
					circle: (name)=>{
						return this.#graphics.circle.has(name);
					}
				}
			}

			/*
			* @name forEach
			* @type obj
			* @description itterate over all entities
			* @parent Stage2D
			*/
			this.forEach = {
				images: (event)=>{
					this.#images.forEach((entity)=>{
						event(entity);
					});
				},

				/*
				* @name texts
				* @type method
				* @description itterate over text entities
				* @parent Stage2D.forEach
				* @param {event}{Function}{event to run on each entity (takes the entity as a parameter)}
				*/
				texts: (event)=>{
					this.#texts.forEach((entity)=>{
						event(entity);
					});
				},
				graphics: {
					cirlces: (event)=>{
						this.#graphics.circles.forEach((entity)=>{
							event(entity);
						});
					},

					all: (event)=>{
						this.forEach.graphics.circles(event);
					}
				},
				textboxes: (event)=>{
					this.#textboxes.forEach((entity)=>{
						event(entity);
					});
				},

				/*
				* @name all
				* @type method
				* @description itterate over all entities
				* @parent Stage2D.forEach
				* @param {event}{Function}{event to run on each entity (takes the entity as a parameter)}
				*/
				all: (event)=>{
					this.forEach.images(event);
					this.forEach.texts(event);
					this.forEach.textboxes(event);
					this.forEach.graphics.all(event);
				}
			};

			this.delete = {
				image: (name)=>{
					this.#images.delete(name);
				},
				text: (name)=>{
					this.#texts.delete(name);
				},
				textbox: (name)=>{
					this.#textboxes.delete(name);
				}
			};
		}

		/*
		* @name setup
		* @type method
		* @description setup the Stage2D
		* @parent Stage2D
		* @param {canvas}{String}{name of the canvas}
		*/
		setup(canvas){
			this.#texts.forEach((txt)=>{
				internal.add_text(canvas, `(stage2d╎${this.#name}╎${txt.id})`, txt.x, txt.y, txt.text, txt.fontSize, (text)=>{
					setup_text(text, txt);
					txt.assets.set(canvas, text);
					text.stageEntity = txt;
				});
			});

			this.#enabled.add(canvas);
		}

		/*
		* @name teardown
		* @type method
		* @description teardown the Stage2D
		* @parent Stage2D
		* @param {canvas}{String}{name of the canvas}
		*/
		teardown(canvas){
			var ctx = internal.canvases.get(canvas);
			this.#texts.forEach((txt)=>{
				var id = `(stage2d╎${this.#name}╎${txt.id})`;
				if(ctx.texts.has(id)){
					internal.delete_text(canvas, id);
				}
				txt.assets.delete(canvas);
			});
			this.#enabled.delete(canvas);
		}

		/*
		* @name getEnabled
		* @type method
		* @description get canvases this Stage2D is enabled on (using <a href="#setup">setup</a>)
		* @parent Stage2D
		*/
		getEnabled(){
			return this.#enabled;
		}


		/*
		* @name export
		* @type method
		* @description export the Stage2D for storage (returns JSON) 
		* @parent Stage2D
		*/
		export(){
			var images = [];
			this.#images.forEach((img)=>{
				images.push(img);
			});

			var texts = [];
			this.#texts.forEach((txt)=>{
				texts.push(txt);
			});

			var textboxes = [];
			this.#textboxes.forEach((box)=>{
				textboxes.push(box);
			});

			return {
				name: this.#name,
				images: images,
				texts: texts,
				textboxes: textboxes
			}
		}
	}

	var build = function(stage){
		var new_stage = new Stage2d(stage.name);

		stage.images.forEach((img)=>{
			new_stage.add.image(img);
		});
		stage.texts.forEach((txt)=>{
			new_stage.add.text(txt);
		});
		stage.textboxes.forEach((tbx)=>{
			new_stage.add.textbox(tbx);
		});

		return new_stage;
	}

	return {
		Stage2d,

		/*
		* @name build
		* @type method
		* @description build a stage from an exported state
		* @param {stage}{Object}{stage to build}
		*/
		build: (stage)=>{
			return build(stage);
		},

		/*
		* @name get
		* @type method
		* @description get a stage
		* @param {name}{String}{name of the stage}
		*/
		get: (name)=>{
			return stages2d(name);
		},

		/*
		* @name delete
		* @type method
		* @description delete a stage
		* @param {name}{String}{name of the stage}
		*/
		delete: (name)=>{
			stages2d.delete(name);
		}
	}
}