// Reinforcement Learning GridWorld Environment

Environment = function (array) {
    var self = {};
    self.grid = array;
    self.height = self.grid.length;
    self.width = self.grid[0].length;
    self.actions = [[0,-1], [0,1], [-1,0], [1,0]];

    self.get = function (x, y) {
        return self.grid[y][x];
    }

    self.set = function(x, y, v) {
        self.grid[y][x] = v;
    }

    self.getActions = function() {
        return self.actions;
    }

    self.isOOB = function (x, y) {
        return x < 0 || y < 0 || x >= self.width || y >= self.height;
    }
    
    self.isBlocked = function(x, y) {
        return self.get(x, y) == 'X';
    }

    self.isTerminal = function(x, y) {
        return self.get(x, y) == 'T';
    }

    self.getReward = function(x, y, action) {
        return parseInt(self.get(x,y));
    }

    return self;
}