class FSM {
    /**
     * Creates new FSM instance.
     * @param config
     */
    constructor(config) {
        this.config = config;
        this.state = config.initial;
        this.stackOfStates = [ ['normal', null, null, 1 ] ];//pattern [data, prev, next, length]
        this.getStatesArr = [];
        this.undoState = config.initial;
        this.undoIndex = 0;

        if (config == null) {
            throw new Error('config isn\'t passed');
        }
    }

    /**
     * Returns active state.
     * @returns {String}
     */
    getState() {
        return this.state;
    }

    /**
     * Goes to specified state.
     * @param state
     */
    changeState(state) {
        if (this.stackOfStates[this.stackOfStates.length - 1] == 'Error' ) {            
            throw new Error('Error in stackOfStates');
        } else if (state in this.config.states && state !== this.state) {
            
            this.undoState = this.state;
            
            this.stackOfStates.push([state, this.state, null, this.stackOfStates.length + 1]);
            this.state = state;
            this.stackOfStates[this.stackOfStates.length - 2][2] = this.state; // next value for previous value
        } else {
            this.stackOfStates.push(['Error', this.state, null, this.stackOfStates.length + 1]);
            throw new Error('hmmm... exception?');
        }
        return this.state;
    }

    /**
     * Changes state according to event transition rules.
     * @param event
     */
    trigger(event) {
        if (this.stackOfStates[this.stackOfStates.length - 1][0] == 'Error') {
            throw new Error('event in current state isn\'t exist');
        }
        
        for (let key in this.config.states) {
            for (let transitionKey in this.config.states[key].transitions )  {
                if (event == transitionKey) {
                    for (let i = 0; i < this.undoIndex; i++) {
                        this.stackOfStates.pop();
                    }
                    this.undoIndex = 0;

                    this.stackOfStates.push( [  this.config.states[key].transitions[event], 
                                                this.state,
                                                null,
                                                this.stackOfStates.length + 1
                    ]);
                    
                    if (this.stackOfStates > 1) {
                        this.stackOfStates[this.stackOfStates.length - 2][2] = this.state;
                    }
                    this.state = this.config.states[key].transitions[event];
                    
                    this.undoState = this.state;
                    return this.state;
                }
            } 
        }
        
        throw new Error('event in current state isn\'t exist');    
    }

    /**
     * Resets FSM state to initial.
     */
    reset() {
        this.state = this.config.initial;
        this.stackOfStates = [ ['normal', null, null, 1 ] ];//pattern [data, prev, next, length]
        // this.undoState = this.state;
    }

    /**
     * Returns an array of states for which there are specified event transition rules.
     * Returns all states if argument is undefined.
     * @param event
     * @returns {Array}
     */
    getStates(event) {
        this.getStatesArr = [];

        if (event == null) {
            for (let key in this.config.states) {
                this.getStatesArr.push(key);

            }
        } else {
            for (let key in this.config.states) {
                for (let transitionKey in this.config.states[key].transitions )  {
                    if (event == transitionKey) {
                        this.getStatesArr.push(key);
                    }
                } 
            }
        }
        return this.getStatesArr;
    }

    /**
     * Goes back to previous state.
     * Returns false if undo is not available.
     * @returns {Boolean}
     */
    undo() {
        if (this.stackOfStates[this.stackOfStates.length - 1][3] === 1) {
            return false;
        }

        if (this.undoIndex === this.stackOfStates.length - 1) {
            return false;
        }
    
        
        this.state = this.stackOfStates[this.stackOfStates.length - this.undoIndex - 2][0];
        this.undoIndex++;
        
        return true;
    }

    /**
     * Goes redo to state.
     * Returns false if redo is not available.
     * @returns {Boolean}
     */
    redo() {
        // if (this.undoState === this.config.initial && this.stackOfStates.length == 1) {
        //     return false;
        // }

        // this.state = this.stackOfStates[this.stackOfStates.length - this.undoCount];
        // this.undoState = this.state;
        // this.undoCount--;
        
        // return true;
    }

    /**
     * Clears transition history
     */
    clearHistory() {}
}

module.exports = FSM;

/** @Created by Uladzimir Halushka **/
