var setup_text = function(text,	config){
	text.id = config.id;
	text.x = config.x;
	text.y = config.y;
	text.rotation = config.rotation;
	text.alpha = config.alpha;
	text.anchor.x = config.anchor.x;
	text.anchor.y = config.anchor.y;
	text.pivot.x = config.pivot.x;
	text.pivot.y = config.pivot.y;
	text.zIndex = config.zIndex;
	text.width = config.width;
	text.fontSize = config.fontSize;
	text.fontFamily = config.fontFamily;
	text.fill = config.fill;
	text.align = config.align;
	text.stroke = config.stroke;
	text.strokeThickness = config.strokeThickness;
	text.letterSpacing = config.letterSpacing;
	text.lineHeight = config.lineHeight;
	text.fontWeight = config.fontWeight;
	text.fontStyle = config.fontStyle;
	text.text = config.text;
}




module.exports = function(engine){
	var stages2d = new Map();
	class Stage2d{
		#name;
		#images;
		#texts;
		#textboxes;

		constructor(name){
			this.#name = name;
			Object.defineProperty(this, "name", {get: ()=>{return this.#name;}});

			this.#images = new Map();
			this.#texts = new Map();
			this.#textboxes = new Map();

			stages2d.set(name, stages2d);

			this.add = {
				image: (img)=>{
					this.#images.set(img.id, {
						id: img.id,
						key: img.key,
						x: img.x,
						y: img.y,
						rotation: img.rotation,
						alpha: img.alpha,
						tint: img.tint,
						anchor: {
							x: img.anchor.x,
							y: img.anchor.y
						},
						pivot: {
							x: img.pivot.x,
							y: img.pivot.y
						},
						skew: {
							x: img.skew.x,
							y: img.skew.y
						},
						zIndex: img.zIndex,
						width: img.width,
						height: img.height
					});
				},
				text: (txt)=>{
					this.#texts.set(txt.id, {
						id: txt.id,
						x: txt.x,
						y: txt.y,
						rotation: txt.rotation,
						alpha: txt.alpha,
						anchor: {
							x: txt.anchor.x,
							y: txt.anchor.y
						},
						pivot: {
							x: txt.pivot.x,
							y: txt.pivot.y
						},
						zIndex: txt.zIndex,
						width: txt.width,
						fontSize: txt.fontSize,
						fontFamily: txt.fontFamily,
						fill: txt.fill,
						align: txt.align,
						stroke: txt.stroke,
						strokeThickness: txt.strokeThickness,
						letterSpacing: txt.letterSpacing,
						lineHeight: txt.lineHeight,
						fontWeight: txt.fontWeight,
						fontStyle: txt.fontStyle,
						text: txt.text
					});
				},
				textboxes: (box)=>{
					this.#textboxes.set(box.id, {
						id: box.id,
						key: box.key,
						x: box.x,
						y: box.y,
						value: box.value,
						width: box.width
					});
				}
			};

			this.forEach = {
				images: (event)=>{
					this.#images.forEach((entity)=>{
						event(entity);
					});
				},
				texts: (event)=>{
					this.#texts.forEach((entity)=>{
						event(entity);
					});
				},
				textboxes: (event)=>{
					this.#textboxes.forEach((entity)=>{
						event(entity);
					});
				},
				all: (event)=>{
					this.forEach.images(event);
					this.forEach.texts(event);
					this.forEach.textboxes(event);
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

		setup(canvas){
			this.#texts.forEach((txt)=>{
				engine2d.add.text(canvas, txt.id, txt.x, txt.y, txt.text, txt.fontSize, (text)=>{
					setup_text(text, txt);
				});
			});
		}

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
		build: (stage)=>{
			return build(stage);
		},
		get: (name)=>{
			return stages2d(name);
		},
		delete: (name)=>{
			stages2d.delete(name);
		}
	}
}