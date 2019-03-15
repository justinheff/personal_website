var PLAYER_ONE = 0;
var PLAYER_TWO = 1;
var PLAYER_NONE = 2;
var PLAYER_DRAW = 3;

GameState = function (width, height) {
    var self = {};
    
    self.width = width;
    self.height = height;
    self.pieces = (new Array(width)).fill(0);
    self.totalPieces = 0;
    self.board = new Array(width).fill(0).map(x => new Array(height).fill(PLAYER_NONE));
    self.player = 0;
    self.dirs = [[1,0], [0,1], [1,1], [1,-1]];
    self.connect = 4;

    // Returns the piece type at the given x,y position
    self.get = function(x, y) {
        return self.board[x][y];
    }

    // Returns whether or not the given x,y position is on the board
    self.isValid = function(x, y) {
        return x >= 0 && y >= 0 && x < self.width && y < self.height;
    }

    // Do the given action
    // An action is an integer representing the column to place the piece in
    // Doing the action puts the piece in the given column and switches players
    self.doAction = function(action) {
        self.board[action][self.pieces[action]] = self.player;
        self.pieces[action]++;
        self.player = (self.player + 1) % 2;
        self.totalPieces++;
    }

    // Checks to see if an action is legal or not
    // An action is an integer representing the column to place the piece in
    // An action is legal if that column is not full
    self.isLegalAction = function(action) {
        return action >= 0 && action < self.width && self.pieces[action] < self.height;
    }

    // Returns an array of legal actions
    // Checks each column to see if a piece can be put there and adds it to the array
    self.getLegalActions = function(action) {
        var legal = [];
        for (var i=0; i<self.width; i++) { 
            if (self.isLegalAction(i)) { legal.push(i); }
        }
        return legal;
    }

    // Checks to see if there is a win in a given direction
    // This function is called by self.winner
    self.checkWin = function(x, y, dir, connect) {
        p = self.get(x,y);
        if (p == PLAYER_NONE) { return; }
        cx = x; cy = y;
        for (c=0; c<connect-1; c++) {
            cx += dir[0]; cy += dir[1];
            if (!self.isValid(cx, cy)) { return false; }
            if (self.get(cx, cy) != p) { return false; }
        }
        return true;
    }

    // Checks to see if there is a win on the board
    // Returns PLAYER_ONE if Player One has won
    // Returns PLAYER_TWO if Player Two has won
    // Returns PLAYER_NONE if the game is not over
    // Returns PLAYER_DRAW if the game is a draw (board filled with no winner)
    self.winner = function() { 

        // For each winning direction possible
        for (d=0; d<self.dirs.length; d++) {
            // Check to see if there's a win in that direction from every place on the board
            for (x=0; x<self.width; x++) {
                for (y=0; y<self.height; y++) {
                    if (self.checkWin(x, y, self.dirs[d], self.connect)) { return self.get(x,y); }
                }
            }
        }
        
        // If the number of pieces on the board is the same size as the board, it's a draw
        if (self.totalPieces == self.width * self.height) { return PLAYER_DRAW; }
        // Otherwise there is no winner
        else return PLAYER_NONE;
    }

    self.copy = function() {
        let state = GameState(self.width, self.height);
        state.player = self.player;
        state.totalPieces = self.totalPieces;
        for (let x=0; x<width; x++) {
            state.pieces[x] = self.pieces[x];
            for (let y=0; y<height; y++) {
                state.board[x][y] = self.board[x][y];
            }
        }
        return state;
    }

    return self;
}