var {files} = require('../../virtuosity-server/index.js');

BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = ()=>{};


var add_task = function(canvas, name, path){
	var file_name = files.getFileName(path);
	var file_path = files.getFilePath(path);
	var ctx = canvases.get(canvas);
	var task = ctx.assetsManager.addMeshTask("cache╎" + name, '', file_path, file_name);
	ctx.load_queue.add(name);
	task.onSuccess = (completed)=>{
		ctx.load_queue.delete(name);
		var newMesh = BABYLON.Mesh.MergeMeshes(completed.loadedMeshes, true, true);
		ctx.mesh_cache.set(name, newMesh);
		newMesh.setEnabled(false);
	}
}


var setup_assetsManager = function(new_ctx, config, onComplete){
	new_ctx.assetsManager = new BABYLON.AssetsManager(new_ctx.scene);
	new_ctx.load_queue = new Set();
	new_ctx.assetsManager.onTaskSuccessObservable.add(function(task) {
		var name = task.name;
		name = name.substr(6, name.length-1);
	    console.log(`engine2d succesfully loaded: (${name})`);
	});
	new_ctx.assetsManager.first_load_batch = false;

	new_ctx.mesh_cache = new Map();

	if(config.preload != null && new_ctx.load_queue.size != 0){
	    config.preload();
		new_ctx.assetsManager.loadAsync();
	}else{
		new_ctx.assetsManager.first_load_batch = true;
		onComplete();
	}

	new_ctx.assetsManager.onFinish = function(tasks){
		if(new_ctx.assetsManager.first_load_batch){
			if(new_ctx.load_queue.size != 0){
				new_ctx.assetsManager.loadAsync();
			}
		}else{
			new_ctx.assetsManager.first_load_batch = true;
			onComplete();
		}
	}
}


module.exports = {
	add_task: add_task,
	setup_assetsManager: setup_assetsManager
}