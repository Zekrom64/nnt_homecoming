import { SnowmanStory, SnowmanPassage, getStory, getCurrentPassage } from "./snowman";
import { PersistentState } from "./data/persistent";
import dom, { Fragment } from 'jsx-render'

declare global {
	namespace JSX {
		interface IntrinsicElements {
			div: any;
			img: any;
		}
	}
}

/** A function which applies formatting to a passage's body.
 * 
 * @param passage The passage to be formatted
 * @param dom The DOM element for the passage
 */
export type PassageFormatter = (passage: SnowmanPassage, dom: JQuery<HTMLElement>) => void;


const KEY_TIME = 'time';

export class API {
	/** If the save state of the game has been meaningfully changed. */
	saveStateDirty: boolean = false;
	manipulatingHistory: boolean = false;
	isStarting: boolean = true;
	/** A list of functions to invoke to format the current passage. */
	passageFormatters: PassageFormatter[] = [];

	constructor() {
		let $this = this;

		// Hook global events which interface with the API
		// Disallow unloading the page 
		window.addEventListener('beforeunload', function(e) {
			if ($this.saveStateDirty) {
				e.preventDefault();
				e.returnValue = true;
			}
		});

		window.addEventListener('load', function() {
			let $window = $(window);
			$window.on('sm.passage.hidden', function() {
				// Don't push the current state to history if it is being manipulated by the user or if we are at the first passage.
				if (!($this.manipulatingHistory || $this.isStarting)) {
					history.pushState(history.state, '');
				}
			});
			$window.on('sm.passage.shown', function() {
				// Perform autosave if required and the page is getting loaded normally
				if (!$this.manipulatingHistory) {
					//if (getCurrentPassage().tags.includes('autosave')); // TODO Implement autosaves
				}
				// Clear flags to return to normal state after a passage is loaded
				$this.isStarting = false;
				$this.manipulatingHistory = false;

				// Run formatters for the current passage
				let passage = getCurrentPassage();
				let passageDOM = $("tw-passage");
				$this.passageFormatters.forEach(x => x(passage, passageDOM));
			});
		});

		window.addEventListener('popstate', function() {
			// Set flag indicating the user is manipulating the history of the story
			// This is used to disable some of the automatic logic
			$this.manipulatingHistory = true;
		});
	}

	#persistentState: PersistentState;

	get state(): PersistentState {
		// TODO: Throw exceptions if accessing persistent state while Snowman variables are null
		if (this.#persistentState == null) {
			let story = getStory();
			if (story == null) return null;
			var state = story.state;
			if (state == null) {
				state = {};
				story.state = state;
			}
			this.#persistentState = new PersistentState(state);
		}
		return this.#persistentState;
	}

	get time(): number {
		let state = this.state;
		if (!state) return 0;
		return state.getValue(KEY_TIME) || 0;
	}

	doStoryAdvanceTasks(): void {
		let state = this.state;
		if (state) {
			// Increment the time counter every time the scene changes
			state.increment(KEY_TIME);
			
		}

		// Flag the save state as dirty unless saving is disabled
		if (!getCurrentPassage().tags.includes('nosave'))
			this.saveStateDirty = true;
	}

	injectHeader(): string {
		return `Time: ${this.time}`;
	}

	injectInteractions(): string {
		// TODO	
		return '';
	}

	injectLootConfirm(id: string) {
		// TODO
	}

	injectLootComplete(id: string) {
		// TODO
	}

	//================================//
	// Passage Construction Utilities //
	//================================//

	mkInlineImg(src: string) {
		return (
			<div class="inlineimg">
			<img src={src+".webp"}/>
			</div>
		).outerHTML;
	}

	//===============//
	// DOM Utilities //
	//===============//

	/** Defers an operation until after the current passage fully loads. This
	 * is just shorthand for some jQuery glue to register a listener for
	 * the passage shown even which then calls the action and de-registers
	 * itself. This is useful for inline JavaScript in passages which may
	 * need to hook onto DOM elements which only get defined after the
	 * passage is fully loaded.
	 * 
	 * @param {Function} action The action to perform after the passage loads
	 */
	defer(action: Function) {
		$(window).one('sm.passage.shown', function() { action(); });
	}

	/**
	 * 
	 * @param {string} selector 
	 * @param {Function} action 
	 */
	domOnChange(selector: string, action: Function) {
		this.defer(() => {
			let element = $(selector);
			element.change(() => action.call(element));
		});
	}

	//=====================//
	// Debugging Utilities //
	//=====================//
}