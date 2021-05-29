module.exports = {
	error: function(type, message){
		window.onerror = function(){
	        console.error(`Virtuosity ${type} Error: 
		${message}`);
	        return true;
	    };
	    throw new Error();
	},
	warn: function(type, message){
		console.warn(`Virtuosity ${type} Warning:
		${message}`);
	}
}
