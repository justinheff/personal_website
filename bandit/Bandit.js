Bandit_Static = function(mean) {
    var self = {};
    self.mean = mean;

    self.getValue = function() {
        return self.mean;
    }

    return self;
}

Bandit_ProbVal = function(prob, value) {
    var self = {};
    self.prob = prob;
    self.value = value;
    self.mean = prob;

    self.getValue = function() {
        return (Math.random() < self.prob) ? value : 0;
    }

    return self;
}

Bandit_Normal = function(mu, sigma) {
    var self = {};
    self.mu = mu;
    self.sigma = sigma;
    
    self.getValue = function() {
        let u = 0, v = 0;
        while (u === 0) { u = Math.random(); }
        while (v === 0) { v = Math.random(); }
        let val = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return self.mu;
        return val * self.sigma + self.mu;
    }

    return self;
}