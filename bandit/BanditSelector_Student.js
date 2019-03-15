BanditSelector = function(config) {
    var self = {};
    self.config = config;
    
    // Q[i] = bandit i's current value estimate, initialized to config value
    // N[i] = how many times the value for bandit i has been updated
    self.Q = new Array(self.config.numBandits).fill(self.config.initialValue);
    self.N = new Array(self.config.numBandits).fill(0);
    self.NTotal = 0;
    
    self.chooseBandit = function() {
		var action = null;
        if (self.config.selection == 'EG') {
			let epsilon = self.config.epsilon;
			if (Math.random() < epsilon) { action = self.randomAction(); } 
			else { action = self.maxAction(); } 
        } else if (self.config.selection == 'UCB') {
			action = self.maxUCB();			
        }
		let R = self.Q[action];
		self.NTotal += 1;
		self.N[action] = self.N[action] + 1;
		self.updateBandit(action,R);
        return action;
    }

    self.updateBandit = function(index, value) {
        if (self.config.valueEstimate == 'average') {
			self.Q[index] = self.Q[index] + (1.0/self.N[index])*(value-self.Q[index])
        } else if (self.config.valueEstimate == 'target') {
			self.Q[index] = self.Q[index] + (self.config.stepSize)*(value-self.Q[index]);
        }
    }

	self.randomAction = function() {
		max = self.Q.length;
		return Math.floor(Math.random()*(max));
	}

	self.maxAction = function() {
		let maxIndex = 0;
		let maxValue = self.Q[0];
		for(let i = 1; i < self.Q.length; i++){
			if(self.Q[i] > maxValue) {
				maxIndex = i;
				maxValue = self.Q[i];
			}
		}
		return maxIndex;
	}
	
	self.maxUCB = function() {
		let maxIndex = 0;
		let c = self.config.ucbC;
		if (self.NTotal < self.N.length) {return self.NTotal;}
		let maxValue = self.Q[0] + c*Math.sqrt(Math.log(self.NTotal)/self.N[0]);
		for(let i = 1; i < self.Q.length; i++){
			if((self.Q[i] + c*Math.sqrt(Math.log(self.NTotal)/self.N[i])) > maxValue) {
				maxIndex = i;
				maxValue = self.Q[i] + c*Math.sqrt(Math.log(self.NTotal)/self.N[i]);
			}
		}
		return maxIndex;
	}

    return self;
}
