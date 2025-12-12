/** Base class for objects which are stored persistently throughout the story. */
export interface PersistentObject {
	
	/** Stores this object to a JSON-compatible value that can be
	 * saved persistently.
	 * 
	 * @returns {*} A simple JSON-compatible value storing the object's state
	 */
	store(): any;

	/** Loads this object's state from a JSON-compatible value that
	 * has been saved persistently.
	 * 
	 * @param {*} data The JSON-compatible value to load the object's state from
	 */
	load(data: any): void;

}

export class PersistentValueRef {
	#path: string;
	#object: any;
	#key: string;

	constructor(path: string, object: any, key: string) {
		this.#path = path;
		this.#object = object;
		this.#key = key;
	}

	get value(): any {
		return this.#object[this.#key];
	}

	set value(value: any) {
		console.log(`PersistentState[${this.#path}] = ${value}`);
		this.#object[this.#key] = value;
	}

}

/** Utility class for managing persistent state stored in `window.story.state`. */
export class PersistentState {
	/** The object containing the persistent state. */
	#data: any;

	constructor(data: any) {
		this.#data = data;
	}

	getValue(key: string): any {
		return this.getReference(key).value;
	}

	setValue(key: string, value: any): void {
		this.getReference(key).value = value;
	}

	/** Gets a reference to a value within the persistent state.
	 * 
	 * @param {string} key The period-separated path to the value
	 * @returns {PersistentValueRef} The reference to the persistent value
	 */
	getReference(key: string): PersistentValueRef {
		let parts = key.split('.');
		var object = this.#data;

		for(var i = 0; i < parts.length - 1; i++) {
			let name = parts[i];
			var value = object[name];
			if (value == null) {
				value = {};
				object[name] = value;
			}
			object = value;
		}

		return new PersistentValueRef(key, object, parts[parts.length - 1]);
	}

	/** Increments a value in the state
	 * 
	 * @param {*} key The key of the persistent value to increment.
	 * @returns The incremented value
	 */
	increment(key: string): number {
		let ref = this.getReference(key);
		var value = ref.value;
		if (value == null) value = 1;
		else value++;
		ref.value = value;
		return value;
	}

	decrementToZero(key: string): number {
		let ref = this.getReference(key);
		var value = ref.value;
		if (value == null) return 0;
		value--;
		if (value <= 0) value = undefined;
		ref.value = value;
		return value == null ? 0 : value;
	}

	get data(): any { return this.#data; }

}