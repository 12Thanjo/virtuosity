/*
* @name Node
* @type return
* @description PriortyQueue node
*/
class Node{
	#data;
	#next;
	#previous;
	#priority;

	constructor(priority, data){
		this.#data = data;
		this.#next = null;
		this.#previous = null;
		this.#priority = priority;
	}

	/*
	* @name getData
	* @type method
	* @description get the data of the node
	* @parent Node
	*/
	getData = function(){
		return this.#data;
	}
	/*
	* @name setData
	* @type method
	* @description set the data of the node
	* @parent Node
	*/
	setData = function(data){
		this.#data = data;
	}

	/*
	* @name getNext
	* @type method
	* @description get the next node
	* @parent Node
	*/
	getNext = function(){
		return this.#next;
	}

	/*
	* @name setNext
	* @type method
	* @description set the next node
	* @parent Node
	*/
	setNext = function(next){
		this.#next = next;
	}

	/*
	* @name getPrevious
	* @type method
	* @description get the previous node
	* @parent Node
	*/
	getPrevious = function(){
		return this.#previous;
	}

	/*
	* @name setPrevious
	* @type method
	* @description set the previous node
	* @parent Node
	*/
	setPrevious = function(previous){
		this.#previous = previous;
	}

	/*
	* @name getPriority
	* @type method
	* @description get the priority of the node
	* @parent Node
	*/
	getPriority = function(){
		return this.#priority;
	}

	_setPriority = function(priority){
		this.#priority = priority;	
	}
}


class PriorityQueue{
	#front;
	#rear;
	#size;
	
	constructor(){
		this.#front = null;
		this.#rear = null;
		this.#size = 0;
	}

	/*
	* @name push
	* @type method
	* @description add a node to the PriorityQueue
	* @param {data}{ANY}{data for the new node}
	*/
	push(priority, data){
		if(this.#front == null){
			this.#front = new Node(priority, data);
			this.#rear = this.#front;
		}else{
			var new_node = new Node(priority, data);
			var target = this.#front;
			var previous = null;
			while(target != null && target.getPriority() > priority){
				previous = target;
				target = target.getNext();
			}

			var next = target;
			


			if(next != null){
				new_node.setNext(next);
				next.setPrevious(new_node);
			}else{
				// is rear
				this.#rear = new_node;
			}

			if(previous != null){
				new_node.setPrevious(previous);
				previous.setNext(new_node);
			}else{
				// is front
				this.#front = new_node;
			}

		}
		this.#size += 1;
	}


	/*
	* @name peek
	* @type method
	* @description get the front of the PriorityQueue
	*/
	peek(){
		return this.#front;
	}


	/*
	* @name pop
	* @type method
	* @description remove the top node
	*/
	pop(){
		var output = this.#front;
		this.#size -= 1;
		if(this.#size == 0){
			return null;
		}else{
			this.#front = output.getNext();
			this.#front.setPrevious(null);
			return output;
		}
	}

	dequeue(){
		var output = this.#rear;
		this.#size -= 1;
		if(this.#size == 0){
			return null;
		}else{
			this.#rear = output.getPrevious();
			this.#rear.setNext(null);
			return output;
		}
	}

	/*
	* @name delete
	* @type method
	* @description delete a specific node
	* @param {node}{ANY}{data of the Node to delete}
	*/
	delete(node){
		var target = this.#front;
		while(target != null){
			if(target.getData() == node){
				// delete node

				var previous = target.getPrevious();
				var next = target.getNext();

				if(previous != null){
					previous.setNext(next);
				}else{
					// is front
					this.#front = next;
				}

				if(next != null){
					next.setPrevious(previous);	
				}else{
					// is rear
					this.#rear = previous;
				}

				return target;
			}
			target = target.getNext();
		}
	}

	/*
	* @name get
	* @type method
	* @description get a specific node
	* @param {node}{ANY}{data of the Node to get}
	*/
	get(node){
		var target = this.#front;
		while(target != null){
			if(target.getData() == node){
				return target;
			}
			target = target.getNext();
		}
	}

	/*
	* @name setPriority
	* @type method
	* @description change the priority of a specific node
	* @param {node}{ANY}{data of the Node to change the priority of}
	* @param {priority}{Number}{the new priority}
	*/
	setPriority(node, priority){
		var target = this.get(node);
		target._setPriority(priority);
		while(target.getPrevious() != null && target.getPriority() > target.getPrevious().getPriority()){
			var previous = target.getPrevious().getPrevious();
			target.getPrevious().setNext(target.getNext());
			target.getPrevious().setPrevious(target);
			if(target.getNext() != null){
				target.getNext().setPrevious(target.getPrevious());
			}
			target.setNext(target.getPrevious());
			target.setPrevious(previous);

			if(previous == null){
				this.#front = target;
			}
		}

		while(target.getNext() != null && target.getPriority() < target.getNext().getPriority()){
			var next = target.getNext().getNext();
			var previous = target.getNext();
			if(target.getPrevious() != null){
				target.getPrevious().setNext(previous);
			}
			previous.setPrevious(target.getPrevious());
			previous.setNext(target);

			target.setNext(next);
			target.setPrevious(previous);

			if(previous.getPrevious() == null){
				this.#front = previous;
			}
		}
	}

	/*
	* @name size
	* @type method
	* @description get the size of the PriorityQueue
	*/
	size(){
		return this.#size;
	}

	/*
	* @name print
	* @type method
	* @description output an array representation of the PriorityQueue
	*/
	print(){
		var output = [];
		var target = this.#front;
		while(target != null){
			output.push(target.getData());
			target = target.getNext();
		}
		return output;
	}

	/*
	* @name forEach
	* @type method
	* @description enumerate over all nodes in the PriorityQueue
	* @param {event}{Function}{event to run on all nodes in the PriorityQueue (takes node as a parameter)}
	*/
	forEach(event){
		var target = this.#front;
		while(target != null){
			event(target);
			target = target.getNext();
		}
	}

	/*
	* @name reverseForEach
	* @type method
	* @description enumerate over all nodes in the PriorityQueue in reverse order
	* @param {event}{Function}{event to run on all nodes in the PriorityQueue (takes node as a parameter)}
	*/
	reverseForEach(event){
		var target = this.#rear;
		while(target != null){
			event(target);
			target = target.getPrevious();
		}
	}
}

module.exports = PriorityQueue;