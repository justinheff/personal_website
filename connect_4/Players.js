Player_Random = function() {
    var self = {};
    self.getAction = function(state) {
        var actions = state.getLegalActions();
        return actions[Math.floor(Math.random()*actions.length)];
    }
    return self;
}

Player_Greedy = function() {
    var self = {};

    self.eval = function(state, player) {
       
        var winner = state.winner();

        if (winner == player) { return 10000; }
        else if (winner == PLAYER_NONE) { return 0; }
        else if (winner == PLAYER_DRAW) { return 0; }
        else { return -10000; }
    }

    self.getAction = function(state) {
        var actions = state.getLegalActions();
        var player = state.player;
        var max = -10000000;
        var maxAction = -1;
        for (a = 0; a<actions.length; a++) {
            let child = state.copy();
            child.doAction(actions[a]);
            value = self.eval(child, player);
            if (value > max) {
                max = value;
                maxAction = actions[a];
            }
        }
        return maxAction;
    }
    return self;
}