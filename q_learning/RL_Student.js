// Computer Science 3200 - Assignment 5
// Authors: Tim Griffin, 200727279, n55thg
//          Justin Heffernan, 201526514, jdh668
RL = function(env, config) {
    var self = {};
    self.config = config;   // learning configuration settings
    self.env = env;         // the environment we will learn about
        
    self.Q = [];            // values array Q[x][y][a] = value of doing action a at (x,y)
    self.P = [];            // policy array P[x][y][a] = probability of doing action a at (x,y)
    
    self.state = [0, 0];    // the current location (state) of the agent on the map

    self.init = function() {

        // initialize all Q values to 0
        for (x=0; x<self.env.width; x++) {
            self.Q.push([]);
            for (y=0; y<self.env.height; y++) {
                self.Q[x].push([]);
                for (a=0; a<self.env.actions.length; a++) {
                    self.Q[x][y].push(0);
                }
            }
        }

        // initialize Policy to equiprobable actions
        for (x=0; x<self.env.width; x++) {
            self.P.push([]);
            for (y=0; y<self.env.height; y++) {
                self.P[x].push([]);
                for (a=0; a<self.env.actions.length; a++) {
                    self.P[x][y].push(1.0 / self.env.actions.length);
                }
            }
        }
    }

    // Perform 1 iteration of the learning function
    self.learningIteration = function() {
        if (self.env.isTerminal(self.state[0], self.state[1])) { self.state = self.setRandomState();}   
        let action = self.selectActionFromPolicy(self.state);
        let reward = self.env.getReward(self.state[0], self.state[1], action);
        let nextState = self.getNextState(self.state, action);   
        self.updateValue(self.state, action, reward, nextState);
        self.updatePolicy(self.state)
        self.state = nextState;
    }

    // Select action based on policy, either random action if random number < epsilon or random action from max actions
    self.selectActionFromPolicy = function(state) {
        if (Math.random() < self.config.epsilon) {return self.getRandomAction(); }
        else {
            let maxActionValue = self.getMaxActionValue(self.state);
            let maxActions = self.getMaxActions(self.state,maxActionValue);
            let randMaxActionInd = Math.floor(Math.random() * Math.floor(maxActions.length));
            return maxActions[randMaxActionInd];
        }
    }

    // Return the next state, if blocked or out of bounds return current state
    self.getNextState = function(state, a) {
        let nextState = [state[0] + a[0], state[1] + a[1]];
        if(self.env.isOOB(nextState[0], nextState[1]) || self.env.isBlocked(nextState[0], nextState[1])) { return state; }
        return nextState;
    }

    // Update Q value
    self.updateValue = function(state, action, reward, nextState) {
        let a = self.config.alpha;
        let g = self.config.gamma;
        let aIndex = self.getIndex(action, self.env.actions);
        let currentVal = self.Q[state[0]][state[1]][aIndex];
        self.Q[state[0]][state[1]][aIndex] = currentVal + a * (reward + g*self.getMaxActionValue(nextState) - currentVal);
    }

    // Update policy based on max actions
    self.updatePolicy = function(state) {
        let maxActionValue = self.getMaxActionValue(state);
        let maxActions = self.getMaxActions(state, maxActionValue);
        for(let a = 0; a < self.env.actions.length; a++){
            if(self.checkArray(self.env.actions[a], maxActions)) {
                self.P[state[0]][state[1]][a] = 1.0/maxActions.length;
            }
            else { self.P[state[0]][state[1]][a] = 0; }
        }
    }

    // Return the max action value from a given state
    self.getMaxActionValue = function(state) {
        let maxActionValue = -100000;
        for(a = 0; a < self.env.actions.length; a++) {
            let aValue = self.Q[state[0]][state[1]][a];
            if(aValue > maxActionValue) { maxActionValue = aValue; }
        }
        return maxActionValue;
    }

    // Return the actions that give the max value specified
    self.getMaxActions = function(state, value) {
        let maxActions = [];
        for(a = 0; a < self.env.actions.length; a++) {
            let aValue = self.Q[state[0]][state[1]][a];
            if( aValue == value ){ 
                maxActions.push(self.env.actions[a]);
            }
        }
        return maxActions;
    }

    // Check if value [x,y] is in a given array[i][x,y]
    self.checkArray = function (valueToCheck, arrayToCheck){
        for(let i = 0; i < arrayToCheck.length; i++ ){
            if(valueToCheck[0] == arrayToCheck[i][0] && valueToCheck[1] == arrayToCheck[i][1] ) { return true;}
        }
        return false;
    }

    // Choose a random state to start from
    self.setRandomState = function() {
        let x = Math.floor(Math.random() * self.env.width);
        let y = Math.floor(Math.random() * self.env.height);
        let state = [x, y];
        if(self.env.isTerminal(x, y) || self.env.isBlocked(x,y)) { state = self.setRandomState(); }
        return state;
    }

    // Randomly choose an action from the legal actions
    self.getRandomAction = function() {
        let a = Math.floor(Math.random() * self.env.actions.length);
        return self.env.actions[a];
    }

    // Return the action index from the list of legal actions
    self.getIndex = function(value){
        for(a = 0; a < self.env.actions.length; a++){
            if(value[0] == self.env.actions[a][0] && value[1] == self.env.actions[a][1]){
                return a;
            }
        }
        return undefined;
    }

    self.init();
    return self;
}