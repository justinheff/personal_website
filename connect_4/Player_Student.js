

Player_Student = function(config) {
    let self = {};
    self.bestAction;
    self.currentBestAction;
    self.config = config;
    self.currentMax;
    self.searchStartTime = 0;
    self.maxPlayer = 0;
    
    // Function which is called by the GUI to get the action
    self.getAction = function(state) {
        return self.IDAlphaBeta(state);
    }
    
    // Evaluation function
    // Returns 50000 for player win, 0 for draw, -50000 for player loss, and assigns value to the board for a no player win/draw scenario
    // Details on value assigned to board can be found under self.checkValue function
    self.eval = function(state, player) {
        let winner = state.winner();
        let val = 0;
        if      (winner == player)      { return 50000; }
        else if (winner == PLAYER_NONE) {
            // Iterate through board to assign value to current state
            for(let w = 0; w < state.width; w++){
                for(let h = 0; h < state.height; h++){
                    // Add value for player
                    if(state.get(w,h) != ((player + 1 % 2))){
                        if(state.get(w,h) == player){
                            val += self.checkValue(w,h,state,player,1); 
                        }
                        else{
                            val += self.checkValue(w,h,state,player,0); 
                        }
                    }
                    // Subtract value for opponent
                    else if(state.get(w,h) != player){
                        if(state.get(w,h) == (player + 1) % 2){
                            val -= self.checkValue(w,h,state,(player + 1) % 2,1); 
                        }
                        else{
                            val -= self.checkValue(w,h,state,(player + 1) % 2,0); 
                        }
                    }
                }
            }
            return val;
        }
        else if(winner == PLAYER_DRAW) { return 0;}
        else {  return -50000;}
    }

    self.IDAlphaBeta = function(state) {
        self.maxPlayer = state.player;
        self.searchStartTime = performance.now();
        for(let d = 1; d <= self.config.maxDepth; d++){
            try{ 
                self.currentMax = d;
                self.AlphaBeta(state,-100000,100000,0,true);
                self.bestAction = self.currentBestAction;
            }
            catch(TimeOutException){
                break;
            }
        }
        self.currentBestAction = null;
        return self.bestAction;
    }

    self.AlphaBeta = function(state, alpha, beta, depth, max) {
        let timeElapsed = performance.now() - self.searchStartTime;
        let actions = state.getLegalActions();
        let v, newV;
        if(depth >= self.currentMax || state.winner() != PLAYER_NONE || actions.length==0) {
            return self.eval(state,self.maxPlayer);
        }
        if(timeElapsed > self.config.timeLimit && self.config.timeLimit != 0){
            throw TimeOutException;
        }
        if(max){
            v = -100000;
            for(let a = 0; a<actions.length; a++){
                let child = state.copy();
                child.doAction(actions[a]);
                newV = self.AlphaBeta(child,alpha,beta,depth+1,!max);
                if(newV > v) { v = newV; }
                if(newV >= beta) { return v; }
                if(newV > alpha){
                    alpha = newV;
                    if(depth == 0) { self.currentBestAction = actions[a];}
                }
            }

        }
        else {
            v = 100000;
            for(let a = 0; a<actions.length; a++){
                let child = state.copy();
                child.doAction(actions[a]);
                newV = self.AlphaBeta(child,alpha,beta,depth+1,!max);
                if(newV < v) { v = newV; }
                if(newV <= alpha) { return v; }
                if(newV < beta) { beta = newV; }
            }
        }
        return v;
    }

    // Heuristic Helper Function
    // Assigns a value to the board based on its state and current player - Only used if there is no winner/draw on the board
    // For the given (w,h) position, checks how many 4 in a rows are still possible (empty or occupied by current player)
    // in the following directions - vertical (up), horizontal (right), diagonal (up-right and up-left). Down, left, and down-left/right
    // are not checked as they are automatically considered as  the eval function iterates through the board. This is used for both the current player
    // and opponent, with the opponent's "value" being negated from the player's, to come up with a current board value. The more of a 
    // player's pieces in a given "possible 4", the higher the value (tracked with count)
    // (this is definitely overly complex and silly)
    self.checkValue = function(w,h,state, player, count) {
        let startCount = count;
        let val = 0;
        // Check horizontal
        if(w+1 < state.width && !(state.get(w+1,h) == (player+1)%2)){
            if(state.get(w+1,h) == player) {count += 1;}
            if(w+2 < state.width && !(state.get(w+2,h) == (player+1)%2)){
                if(state.get(w+2,h) == player){count += 1;}
                if(w+3 < state.width && !(state.get(w+2,h) == (player+1)%2)){
                    if(state.get(w+3,h) == player){count += 1;}
                    val += self.checkCountVal(count);
                }
            }
        }
        count = startCount;
        // Check vertical
        if(h+1 < state.height && !(state.get(w,h+1) == (player+1)%2)){
            if(state.get(w,h+1) == player) {count += 1;}
            if(h+2 < state.height && !(state.get(w,h+2) == (player+1)%2)){
                if(state.get(w,h+2) == player){count += 1;}
                if(h+3 < state.height && !(state.get(w,h+3) == (player+1)%2)){
                    if(state.get(w,h+3) == player){count += 1;}
                    val += self.checkCountVal(count);  
                }
            }
        }
        count = startCount;
        // Check diagonals
        if(h+1 < state.height && w+1 < state.width && !(state.get(w+1,h+1) == (player+1)%2)){
            if(state.get(w+1,h+1) == player) {count += 1;}
            if(h+2 < state.height && w+2 < state.width && !(state.get(w+2,h+2) == (player+1)%2)){
                if(state.get(w+2,h+2) == player){count += 1;}
                if(h+3 < state.height && w+3 < state.width && !(state.get(w+3,h+3) == (player+1)%2)){
                    if(state.get(w+3,h+3) == player){count += 1;}
                    val += self.checkCountVal(count);
                }
            }
        }
        count = startCount;
        if(h+1 < state.height && w-1 > 0 && !(state.get(w-1,h+1) == (player+1)%2)){
            if(state.get(w-1,h+1) == player) {count += 1;}
            if(h+2 < state.height && w-2 > 0 && !(state.get(w-2,h+2) == (player+1)%2)){
                if(state.get(w-2,h+2) == player) {count += 1;}
                if(h+3 < state.height && w-3 > 0 && !(state.get(w-3,h+3) == (player+1)%2)){
                    if(state.get(w-3,h+3) == player){count += 1;}
                    val += self.checkCountVal(count);  
                }
            }
        }
        count = startCount;
        return val;
    }

    // Heuristic Helper Function
    self.checkCountVal = function(count){
        if(count == 0) {return 0;}
        else if(count == 1) {return 5;}
        else if (count == 2) {return 20;}
        else if (count == 3) {return 50;}
    }

    return self;
}