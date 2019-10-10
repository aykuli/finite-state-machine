const config = {
    initial: 'normal',
    states: {
        normal: {
            transitions: {
                study: 'busy',
            }
        },
        busy: {
            transitions: {
                get_tired: 'sleeping',
                get_hungry: 'hungry',
            }
        },
        hungry: {
            transitions: {
                eat: 'normal'
            },
        },
        sleeping: {
            transitions: {
                get_hungry: 'hungry',
                get_up: 'normal',
            },
        },
    }
};

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
        // this.prev = null;

        if (config == null) {
            throw new Error('config isn\'t passed');
        }
    }
    getState() {
        return this.state;
    }
    changeState(state) {
        if (this.stackOfStates[this.stackOfStates.length - 1] == 'Error' ) {            
            throw new Error('Error in stackOfStates');
        } else if (state in this.config.states && state !== this.state) {
            this.stackOfStates.push([state, this.state, null, this.stackOfStates.length + 1]);
            this.state = state;
            this.stackOfStates[this.stackOfStates.length - 2][2] = this.state; // next value for previous value
        } else {
            this.stackOfStates.push(['Error', this.state, null, this.stackOfStates.length + 1]);
            throw new Error('hmmm... exception?');
        }
        return this.state;
    }

    trigger(event) {
        console.log(`\n------------------   trigger(${event})  -----------------`);
        if (this.stackOfStates[this.stackOfStates.length - 1][0] == 'Error') {
            throw new Error('event in current state isn\'t exist');
        }
        console.log('WAS this.stackOfStates =', this.stackOfStates);
        
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

                    
                    this.state = this.config.states[key].transitions[event];
                    if (this.stackOfStates > 1) {
                        this.stackOfStates[this.stackOfStates.length - 2][2] = this.state;
                    }
                    
        console.log('BECOME this.stackOfStates =', this.stackOfStates);
        console.log('undoIndex =', this.undoIndex);
                    return this.state;
                }
            } 
        }
        throw new Error('event in current state isn\'t exist');   
    }
    reset() {
        this.state = this.config.initial;
        this.stackOfStates = [ ['normal', null, null, 1 ] ];//pattern [data, prev, next, length]
    }

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
    undo() {
        console.log('\n------------------   undo  -----------------');
        if (this.stackOfStates[this.stackOfStates.length - 1][3] === 1) {
            return false;
        }
        if (this.undoIndex === this.stackOfStates.length - 1) {
            return false;
        }
        console.log('WAS this.state = ', this.state);
        this.state = this.stackOfStates[this.stackOfStates.length - this.undoIndex - 2][0];
        
        this.undoIndex++;
        console.log('BECOME this.state = ', this.state);
        console.log('undoIndex = ', this.undoIndex);
        console.log('this.stackOfStates = ', this.stackOfStates);
        // this.state = this.stackOfStates[this.stackOfStates.length - 1][1];
        return true;
    }
    redo() {
        console.log('\n------------------   redo  -----------------');
        if (this.undoState === this.config.initial && this.stackOfStates.length == 1) {
            return false;
        }
        
        return true;
    }
    clearHistory() {}
}

console.log('\n-------------------------------------------------------------------------');
const student = new FSM(config);

student.trigger('study');
console.log('student.getState() =', student.getState()); //.to.equal('busy');
student.undo();
console.log('student.getState() =', student.getState()); //.to.equal('normal');

student.trigger('study');
student.trigger('get_hungry');
student.undo();
console.log('student.getState() =', student.getState()); //.to.equal('busy');