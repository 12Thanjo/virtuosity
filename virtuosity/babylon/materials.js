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




module.exports = function(canvases){
	/*
	* @name MaterialBasic
	* @type return
	* @description engine3d material that can be added to multiple meshes and dynamically changed
	* @param {canvas}{String}{Name of the canvas to add to}
	* @param {name}{String}{unique name of the material}
	* @param {onComplete}{Function}{function to run after adding the image (takes the newly create image as a parameter)}
	*/
	var materials = new Map();
	var MaterialBasic = function(canvas, name, onComplete){
		var ctx = canvases.get(canvas);
		this.material = new BABYLON.StandardMaterial(name, ctx.scene);
		this.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
		this.material.specularColor = new BABYLON.Color3(1, 1, 1);
		this.material.emissiveColor = new BABYLON.Color3(0, 0, 0);

		this.DATA = {
			color: 0xffffff,
			specular: 0xffffff,
			emission: 0x000000
		}

		/*
		* @name color
		* @type property
		* @description color of the material
		* @parent MaterialBasic
		* @proto Hex
		*/
		Object.defineProperty(this, "color", {
			get: ()=>{
				return this.DATA.color;
			},
			set: (val)=>{
				this.DATA.color = val;
				var rgb = hex_to_rgb(val);
				this.material.diffuseColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
			}
		});


		/*
		* @name specular
		* @type property
		* @description specular of the material
		* @parent MaterialBasic
		* @proto Hex
		*/
		Object.defineProperty(this, "specular", {
			get: ()=>{
				return this.DATA.specular;
			},
			set: (val)=>{
				this.DATA.specular = val;
				var rgb = hex_to_rgb(val);
				this.material.specularColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
			}
		});


		/*
		* @name emissive
		* @type property
		* @description emissive of the material
		* @parent MaterialBasic
		* @proto Hex
		*/
		Object.defineProperty(this, "emissive", {
			get: ()=>{
				return this.DATA.emissive;
			},
			set: (val)=>{
				this.DATA.emissive = val;
				var rgb = hex_to_rgb(val);
				this.material.emissiveColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
			}
		});





		/*
		* @name wireframe
		* @type property
		* @description meshes using this material are wireframe
		* @parent MaterialBasic
		* @proto Boolean
		*/
		Object.defineProperty(this, "wireframe", {
			get: ()=>{
				return this.material.wireframe;
			},
			set: (val)=>{
				this.material.wireframe = val;
			}
		});


		/*
		* @name alpha
		* @type property
		* @description alpha of the material (0-1)
		* @parent MaterialBasic
		* @proto Number
		*/
		Object.defineProperty(this, "alpha", {
			get: ()=>{
				return this.material.alpha;
			},
			set: (val)=>{
				this.material.alpha = val;
			}
		});

		/*
		* @name addTo
		* @type method
		* @description add this material to a mesh
		* @parent MaterialBasic
		* @param {obj}{any engine3d mesh}{object to add the material to}
		*/
		this.addTo = function(obj){
			obj.babylon.material = this.material;
		}


		materials.set(name, this);

		if(onComplete != null){
			onComplete(this);
		}
	}

	


	/*
	* @name MaterialMetallic
	* @type return
	* @description engine3d material that can be added to multiple meshes and dynamically changed
	* @param {canvas}{String}{Name of the canvas to add to}
	* @param {name}{String}{unique name of the material}
	* @param {onComplete}{Function}{function to run after adding the image (takes the newly create image as a parameter)}
	*/
	var MaterialMetallic = function(canvas, name, onComplete){
		var ctx = canvases.get(canvas);
		this.material = new BABYLON.PBRMetallicRoughnessMaterial(name, ctx.scene);
		this.material.baseColor = new BABYLON.Color3(1,1,1);
		this.material.metallic = 1.0;
		this.material.roughness = 0;


		this.DATA = {
			color: 0xffffff,
			specular: 0xffffff,
			emission: 0x000000
		}


		/*
		* @name color
		* @type property
		* @description color of the material
		* @parent MaterialMetallic
		* @proto Hex
		*/
		Object.defineProperty(this, "color", {
			get: ()=>{
				return this.DATA.color;
			},
			set: (val)=>{
				this.DATA.color = val;
				var rgb = hex_to_rgb(val);
				this.material.baseColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
			}
		});

		/*
		* @name specular
		* @type property
		* @description specular of the material
		* @parent MaterialMetallic
		* @proto Hex
		*/
		Object.defineProperty(this, "specular", {
			get: ()=>{
				return this.DATA.specular;
			},
			set: (val)=>{
				this.DATA.specular = val;
				var rgb = hex_to_rgb(val);
				this.material.specularColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
			}
		});


		/*
		* @name emissive
		* @type property
		* @description emissive of the material
		* @parent MaterialMetallic
		* @proto Hex
		*/
		Object.defineProperty(this, "emissive", {
			get: ()=>{
				return this.DATA.emissive;
			},
			set: (val)=>{
				this.DATA.emissive = val;
				var rgb = hex_to_rgb(val);
				this.material.emissiveColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
			}
		});

		/*
		* @name metallic
		* @type property
		* @description metallic of the material (0-1)
		* @parent MaterialMetallic
		* @proto Number
		*/
		Object.defineProperty(this, "metallic", {
			get: ()=>{
				return this.material.metallic;
			},
			set: (val)=>{;
				this.material.metallic = val;
			}
		});

		/*
		* @name roughness
		* @type property
		* @description roughness of the material (0-1)
		* @parent MaterialMetallic
		* @proto Number
		*/
		Object.defineProperty(this, "roughness", {
			get: ()=>{
				return this.material.roughness;
			},
			set: (val)=>{;
				this.material.roughness = val;
			}
		});

		/*
		* @name wireframe
		* @type property
		* @description meshes using this material are wireframe
		* @parent MaterialMetallic
		* @proto Boolean
		*/
		Object.defineProperty(this, "wireframe", {
			get: ()=>{
				return this.material.wireframe;
			},
			set: (val)=>{
				this.material.wireframe = val;
			}
		});


		/*
		* @name alpha
		* @type property
		* @description set alpha of the material (0-1)
		* @parent MaterialMetallic
		* @proto Number
		*/
		Object.defineProperty(this, "alpha", {
			get: ()=>{
				return this.material.alpha;
			},
			set: (val)=>{
				this.material.alpha = val;
			}
		});

		/*
		* @name addTo
		* @type method
		* @description add this material to a mesh
		* @parent MaterialMetallic
		* @param {obj}{any engine3d mesh}{object to add the material to}
		*/
		this.addTo = function(obj){
			obj.babylon.material = this.material;
		}


		materials.set(name, this);

		if(onComplete != null){
			onComplete(this);
		}
	}





	/*
	* @name MaterialGlossy
	* @type return
	* @description engine3d material that can be added to multiple meshes and dynamically changed
	* @param {canvas}{String}{Name of the canvas to add to}
	* @param {name}{String}{unique name of the material}
	* @param {onComplete}{Function}{function to run after adding the image (takes the newly create image as a parameter)}
	*/
	var MaterialGlossy = function(canvas, name, onComplete){
		var ctx = canvases.get(canvas);

		this.material = new BABYLON.PBRSpecularGlossinessMaterial(name, ctx.scene);
		this.material.specularColor = new BABYLON.Color3(1, 1, 1);
		this.material.glossiness = 0.3;

		this.DATA = {
			color: 0xffffff,
			specular: 0xffffff,
			emission: 0x000000
		}


		/*
		* @name color
		* @type property
		* @description color of the material
		* @parent MaterialGlossy
		* @proto Hex
		*/
		Object.defineProperty(this, "color", {
			get: ()=>{
				return this.DATA.color;
			},
			set: (val)=>{
				this.DATA.color = val;
				var rgb = hex_to_rgb(val);
				this.material.specularColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
			}
		});


		/*
		* @name specular
		* @type property
		* @description specular of the material
		* @parent MaterialGlossy
		* @proto Hex
		*/
		Object.defineProperty(this, "specular", {
			get: ()=>{
				return this.DATA.specular;
			},
			set: (val)=>{
				this.DATA.specular = val;
				var rgb = hex_to_rgb(val);
				this.material.specularColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
			}
		});


		/*
		* @name emissive
		* @type property
		* @description emissive of the material
		* @parent MaterialGlossy
		* @proto Hex
		*/
		Object.defineProperty(this, "emissive", {
			get: ()=>{
				return this.DATA.emissive;
			},
			set: (val)=>{
				this.DATA.emissive = val;
				var rgb = hex_to_rgb(val);
				this.material.emissiveColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
			}
		});


		/*
		* @name glossiness
		* @type property
		* @description glossiness of the material (0-1)
		* @parent MaterialGlossy
		* @proto Number
		*/
		Object.defineProperty(this, "glossiness", {
			get: ()=>{
				return this.material.glossiness;
			},
			set: (val)=>{;
				this.material.glossiness = val;
			}
		});


		/*
		* @name wireframe
		* @type property
		* @description meshes using this material are wireframe
		* @parent MaterialGlossy
		* @proto Boolean
		*/
		Object.defineProperty(this, "wireframe", {
			get: ()=>{
				return this.material.wireframe;
			},
			set: (val)=>{
				this.material.wireframe = val;
			}
		});


		/*
		* @name alpha
		* @type property
		* @description set alpha of the material (0-1)
		* @parent MaterialGlossy
		* @proto Number
		*/
		Object.defineProperty(this, "alpha", {
			get: ()=>{
				return this.material.alpha;
			},
			set: (val)=>{
				this.material.alpha = val;
			}
		});

		/*
		* @name addTo
		* @type method
		* @description add this material to a mesh
		* @parent MaterialGlossy
		* @param {obj}{any engine3d mesh}{object to add the material to}
		*/
		this.addTo = function(obj){
			obj.babylon.material = this.material;
		}


		materials.set(name, this);

		if(onComplete != null){
			onComplete(this);
		}
	}






	/*
	* @name MaterialCanvas
	* @type return
	* @description engine3d material using a 2d canvas, that can be added to multiple meshes and dynamically changed
	* @param {canvas}{String}{Name of the canvas to add to}
	* @param {name}{String}{unique name of the material}
	* @param {targetCanvas}{DOM Canvas}{2d canvas target to render from}
	* @param {onComplete}{Function}{function to run after adding the image (takes the newly create image as a parameter)}
	*/
	var MaterialCanvas = function(canvas, name, targetCanvas, onComplete){
		var ctx = canvases.get(canvas);
		this.material = new BABYLON.StandardMaterial(name, ctx.scene);
		this.material.diffuseTexture = new BABYLON.DynamicTexture(name + "dyn", targetCanvas, ctx.scene);
		this.material.specularColor = new BABYLON.Color3(0,0,0);




		/*
		* @name wireframe
		* @type property
		* @description meshes using this material are wireframe
		* @parent MaterialCanvas
		* @proto Boolean
		*/
		Object.defineProperty(this, "wireframe", {
			get: ()=>{
				return this.material.wireframe;
			},
			set: (val)=>{
				this.material.wireframe = val;
			}
		});


		/*
		* @name alpha
		* @type property
		* @description alpha of the material (0-1)
		* @parent MaterialCanvas
		* @proto Number
		*/
		Object.defineProperty(this, "alpha", {
			get: ()=>{
				return this.material.alpha;
			},
			set: (val)=>{
				this.material.alpha = val;
			}
		});

		/*
		* @name addTo
		* @type method
		* @description add this material to a mesh
		* @parent MaterialCanvas
		* @param {obj}{any engine3d mesh}{object to add the material to}
		*/
		this.addTo = function(obj){
			obj.babylon.material = this.material;
			this.material.diffuseTexture.update();
		}

		/*
		* @name update
		* @type method
		* @description update the texture
		* @parent MaterialCanvas
		*/
		this.update = function(){
			this.material.diffuseTexture.update();
		}


		materials.set(name, this);

		if(onComplete != null){
			onComplete(this);
		}
	}




	return {
		MaterialBasic,
		MaterialMetallic,
		MaterialGlossy,
		MaterialCanvas,
		materials
	}
}