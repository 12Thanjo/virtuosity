/*
* @name Timer
* @type method
* @description Runs a function after a set duration.
* @param {duration}{Int}{duration of the timer}
* @param {func}{Function}{Funciton for the timer to run when completed}
*/
var timer = function(duration, func){
	setTimeout(func, duration);
}

/*
* @name AdvancedTimer
* @type class
* @description Timer with extra functionality
* @param {duration}{Int}{duration of the AdvancedTimer}
* @param {func}{Function}{Funciton for the AdvancedTimer to run when completed}
*/
class AdvancedTimer{
	#DATA;
	constructor(duration, func){
		this.func = func;
		this.#DATA = {
			started: 0,
			duration: duration,
			replay: 0,
			running: false,
			paused: false
		}

		/*
		* @name running
		* @type property
		* @proto Boolean
		* @description True if the AdvancedTimer is running
		* @parent AdvancedTimer
		*/
		Object.defineProperty(this, 'running', {
			get: ()=>{
				return this.#DATA.running;
			}
		});

		/*
		* @name paused
		* @type property
		* @proto Boolean
		* @description True if the AdvancedTimer is paused
		* @parent AdvancedTimer
		*/
		Object.defineProperty(this, 'paused', {
			get: ()=>{
				return this.#DATA.paused;
			}
		});

		/*
		* @name duration
		* @type property
		* @proto Number
		* @description Sets the duration of the AdvancedTimer. If AdvancedTimer is running while the duration is changed, and it is changed to a time less than what has elapsed already, the AdvancedTimer ends.
		* @parent AdvancedTimer
		*/
		Object.defineProperty(this, "duration", {
			get: ()=>{
				return this.#DATA.duration;
			},
			set: (val)=>{
				this.#DATA.duration = val;
				if(this.#DATA.running){
					var now = new Date();
					if(now - this.#DATA.started > val){
						clearTimeout(this.timer);
						this.func();
					}
				}
			}
		});
	}


	/*
	* @name start
	* @type method
	* @description Starts the AdvancedTimer, or continues the AdvancedTimer (if it had been paused).
	* @parent AdvancedTimer
	*/
	start = function(){
		if(this.#DATA.replay != 0){
			this.#DATA.replay = 0;
			this.#DATA.started = new Date();
			this.#DATA.running = true;
			this.timer = setTimeout(this.func, this.duration);
		}else{
			this.#DATA.started = new Date();
			this.#DATA.running = true;
			this.timer = setTimeout(this.func,this.duration);
		}
	}

	/*
	* @name stop
	* @type method
	* @description Stops the AdvancedTimer
	* @parent AdvancedTimer
	*/
	stop = function(){
		clearTimeout(this.timer);
		this.#DATA.running = false;
	}

	/*
	* @name restart
	* @type method
	* @description Restarts the AdvancedTimer
	* @parent AdvancedTimer
	*/
	restart = function(){
		this.stop();
		this.start();
	}

	/*
	* @name pause
	* @type method
	* @description Pauses the AdvancedTimer
	* @parent AdvancedTimer
	*/
	pause = function(){
		this.paused = true;
		var now = new Date();
		this.#DATA.replay = this.duration - (now - this.#DATA.started);
	}

	/*
	* @name getTimeLeft
	* @type method
	* @description Gets the time left until the timer finishes
	* @parent AdvancedTimer
	*/
	getTimeLeft = function(){
		if(this.#DATA.running){
			var now = new Date();
			return this.duration - (now - this.#DATA.started);
		}else{
			return 0;
		}
	}
}

/*
* @name Interval
* @type method
* @description Runs a function at a set interval.
* @param {duration}{Int}{duration of the Interval}
* @param {func}{Function}{Funciton for the Interval to run when completed}
*/
var interval = function(duration, func){
	setInterval(func, duration);
}

/*
* @name AdvancedInterval
* @type class
* @description Runs a function at a set interval, with some extra functionality.
* @param {duration}{Int}{duration of the Interval}
* @param {func}{Function}{Funciton for the Interval to run when completed}
*/
class AdvancedInterval{
	#DATA;
	constructor(duration, func){
		this.func = func;
		this.#DATA = {
			duration: duration,
			running: false
		}
		/*
		* @name duration
		* @type property
		* @description The duration of the interval of the AdvancedInterval.
		* @parent AdvancedInterval
		*/
		Object.defineProperty(this, "duration", {
			get: ()=>{
				return this.#DATA.duration;
			},
			set: (val)=>{
				this.#DATA.duration = val;
				if(this.running){
					clearInterval(this.timer);
					this.timer = setInterval(this.func, this.#DATA.duration);
				}
			}
		});

		/*
		* @name running
		* @type property
		* @description True if the AdvancedInterval is currently running.
		* @parent AdvancedInterval
		*/
		Object.defineProperty(this, "running", {
			get: ()=>{
				return this.#DATA.running;
			}
		});
	}


	/*
	* @name start
	* @type method
	* @description Starts the AdvancedInterval.
	* @parent AdvancedInterval
	*/
	start = function(){
		this.#DATA.running = true;
		this.timer = setInterval(this.func,this.duration);
	}

	/*
	* @name stop
	* @type method
	* @description Stops the AdvancedInterval.
	* @parent AdvancedInterval
	*/
	stop = function(){
		clearInterval(this.timer);
		this.running = false;
	}
}


module.exports = {
	timer: timer,
	AdvancedTimer: AdvancedTimer,
	interval: interval,
	AdvancedInterval: AdvancedInterval
}