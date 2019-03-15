

Search_Student = function (grid, config) {
    var self = {};

    self.config = config;       // search configuration object
                                //   config.actions = array of legal [x, y] actions
                                //   config.actionCosts[i] = cost of config.actions[i]
                                //   config.heuristic = 'diag', 'card', 'dist', or 'zero'
    self.grid = grid;           // the grid we are using to search
    self.sx = -1;               // x location of the start state
    self.sy = -1;               // y location of the start state
    self.gx = -1;               // x location of the goal state
    self.gy = -1;               // y location of the goal state
    self.size = 1;              // the square side length (size) of the agent
    self.maxSize = 3;           // the maximum size of an agent

    self.inProgress = false;    // whether the search is in progress

    self.BFSA = [[0,1],[0,-1],[1,0],[-1,0]]; // legal actions for BFS
    self.diagonals = [[1,1],[-1,1],[1,-1],[-1,-1]]; // array of possible diagonal positions
    self.path = [];             // the path, if the search found one
    self.open = [];             // the current open list of the search (stores Nodes)
    self.closed = [];           // the current closed list of the search
    self.cost = 'Search Not Completed'; // the cost of the path found, -1 if no path
    self.sectors = [];
    
    self.startSearch = function(sx, sy, gx, gy, size) {
        // deals with an edge-case with the GUI, leave this line here
        if (sx == -1 || gx == -1) { return; }

        self.inProgress = true;     // the search is now considered started
        self.sx = sx;               // set the x,y location of the start state
        self.sy = sy;
        self.gx = gx;               // set the x,y location of the goal state
        self.gy = gy;
        self.size = size;           // the size of the agent
        self.path = [];             // set an empty path
        self.open = [];
        self.closed = [];
        self.cost = -1;
        if(self.grid.isOOB(gx,gy,size) || self.grid.isOOB(sx,sy,size)) {return;}
        if(!self.isConnected(sx,sy,gx,gy,self.size)) {return;}
        var node = Node(self.sx,self.sy,null,[0,0],0,0);
        min = [0,node.g + node.h]
        self.open.push(node);
    }

    // estimate the cost using different heuristic functions
    self.estimateCost = function (x, y, gx, gy) {
        var xDiff, yDiff;
        // compute and return the diagonal manhattan distance heuristic
        if (self.config.heuristic == 'diag') {
            xDiff = Math.abs(x - gx);
            yDiff = Math.abs(y - gy);
            if(xDiff > yDiff) {return (100*(xDiff - yDiff) + 141*yDiff);}
            else {return (100*(yDiff - xDiff) + 141*xDiff)}   
        // compute and return the 4 directional (cardinal) manhattan distance
        } else if (self.config.heuristic == 'card') {
            xDiff = Math.abs(x - gx);
            yDiff = Math.abs(y - gy);            
            return (xDiff * 100 + yDiff * 100);
        // compute and return the 2D euclidian distance (Pythagorus)
        } else if (self.config.heuristic == 'dist') {
            xDiff = Math.abs(x - gx)*100;
            yDiff = Math.abs(y - gy)*100;     
            return (Math.sqrt(xDiff*xDiff + yDiff*yDiff));
        // return zero heuristic
        } else if (self.config.heuristic == 'zero') {
            return 0;
        }
    }

    // checks if 2 positions with given size are connected
    self.isConnected = function (x1, y1, x2, y2, size) {
        if(self.sectors[x1][y1][size] == 0) { return false;}
        return self.sectors[x1][y1][size] == self.sectors[x2][y2][size];
    }

    // check if an action is legal from a given position with size
    self.isLegalAction = function (x, y, size, action) {
        if(self.canFit(x+action[0],y+action[1],size)){
            if(self.isConnected(x,y,x+action[0],y+action[1],size)){
                if(self.isDiagonal(action)){
                    if((!self.isConnected(x,y,x+action[0],y,size)) || (!self.isConnected(x,y,x,y+action[1],size))){
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        return false;
    }

    // computer the connected sectors of the given grid with possible sizes up to and including max size
    self.computeSectors = function() {
        var sector = 1;
        // Initialize the sectors array with 0's
        for(x=0; x < self.grid.width; x++){
            self.sectors[x] = [];
            for(y=0; y < self.grid.height; y++){
                self.sectors[x][y] = [];
                for(size=1; size <= self.maxSize; size++){
                    self.sectors[x][y][size] = 0;
                }
            }        
        }    
        for(size=1; size <= self.maxSize; size++){
            for(x=0; x < self.grid.width; x++){
                for(y=0; y < self.grid.height; y++){
                    self.BFS(x,y,size,sector);
                    sector++;                    
                }
            }        
        }
    }

    // BFS function used for computing sectors
    self.BFS = function(x,y,size,sector) {
        if(self.sectors[x][y][size] != 0 || !self.canFit(x,y,size) ) { return; }
        var next, newX, newY,nextX, nextY;
        self.open.push([x,y]);
        while(self.open.length>0){
            next = self.open.shift();
            nextX = next[0];
            nextY = next[1];
            self.sectors[nextX][nextY][size] = sector;
            for(var i = 0; i < self.BFSA.length; i++) {
                newX = nextX+self.BFSA[i][0];
                newY = nextY+self.BFSA[i][1];
                if(self.isBFSLegal(nextX,nextY,size,self.BFSA[i]) && !self.checkBFSOpen(newX,newY,size) && !(self.checkBFSClosed(newX,newY,size))){
                    self.open.push([newX,newY]);
                }
            }
        }
    }

    // Helper function for computer sectors
    // check BFS open list to see if a given position and size is already on list
    self.checkBFSOpen = function(x,y) {
        for(var i = 0; i < self.open.length ; i ++) {
            if(self.open[i][0] == x && self.open[i][1] == y) {
                return true;
            }
        }
        return false;
    }

    // Helper function for computer sectors
    // check BFS open list to see if a given position and size is already on list
    self.checkBFSClosed = function(x,y,size) {
        if(self.sectors[x][y][size] != 0 ) { return true; }
        return false;
    }

    // Checks if the move is legal for the BFS function
    self.isBFSLegal = function (x, y, size,action) {
		//Check if desired position can fit
		if(self.canFit(x+action[0],y+action[1],size)){
            // Check if desired position is same value as current
            // Only need to check x+action,y+action, as if it can fit, it means all at that position within that size are same type 		
			if(self.grid.get(x,y)==self.grid.get(x+action[0],y+action[1])){              
				return true;
			}
		}
        return false;
    }
    // Checks if an action is diagonal
    self.isDiagonal = function (action){
        for(var act = 0; act<self.diagonals.length; act++){
            if(self.diagonals[act][0] == action[0] && self.diagonals[act][1] == action[1]){
                return true;
            }
        }
        return false;
    }

    // one iteration of A* search
    self.searchIteration = function() {
        
        if (!self.inProgress) { return; }
        if(self.open.length == 0) {self.cost = -1; self.inProgress = false; return; }
        if (!self.isConnected(self.sx, self.sy, self.gx, self.gy, self.objectSize)) { 
            self.inProgress = false; // we don't need to search any more
            self.cost = -1; // no path was possible, so the cost is -1
            return; 
        }
        var node, newX, newY, actionNode, cost;
        node = self.open.shift();
        if(node.x == self.gx && node.y == self.gy){
            self.cost = node.g;
            while(node.parent) {
				self.path.push(node.action);
				node = node.parent;
			}
            self.path.reverse();
			self.inProgress = false;
			return;
        }
        if(self.checkClosed(node)) {return;}
        self.closed.push([node.x,node.y]); 
        for(var i = 0; i < self.config.actions.length ; i++) {
            if(self.isLegalAction(node.x,node.y,self.size,self.config.actions[i])){
                newX = node.x + self.config.actions[i][0];
                newY = node.y + self.config.actions[i][1];
                if(node.parent) {
                    if(newX == node.parent.x && newY == node.parent.y) {continue;}
                }
                cost = self.config.actionCosts[i];
                actionNode = Node(newX,newY,node,self.config.actions[i],node.g+cost,self.estimateCost(newX,newY,self.gx,self.gy));
                if(self.checkOpen(actionNode)) { continue; }
                self.enqueueOpen(actionNode);
            }
        }    
    }
    
    // checks if a position can fit with a given size
    self.canFit = function(x,y,size) {
        if(self.grid.isOOB(x,y,size)){
            return false;
        }
        if(size == 1 ){
            return true;
        }
        var val = self.grid.get(x, y);
        for(var j = 0; j < size; j++) {
            for(var k = 0; k < size; k++){
                if(!(val==self.grid.get(x+j, y+k))){
                    return false;
                }                
            }
        }
        return true;
    }

    // returns the open list as an array of [x,y] values
    self.getOpen = function() {
        var openList = [];
		for(var i = 0; i < self.open.length; i++ ){;
            openList.push([self.open[i].x,self.open[i].y]);
		}		
        return openList;
    }

    // returns the closed list as an array of [x,y] values
    self.getClosed = function() {
        return self.closed;
    }

    // checks if a node already exists in the open list
    // if new node's g value is <= the open list node's g, will replace, otherwise skip
    self.checkOpen = function(node){
        for(var i = 0; i < self.open.length; i++){
            if(node.x == self.open[i].x && node.y == self.open[i].y) {
                if(node.g < self.open[i].g){
                    self.open[i] = node;
                }
                return true;
            }
        }
        return false;
    }

    // checks if a state exists in the open list
    self.checkClosed = function(node) {
        for(var i = 0; i < self.closed.length; i++){
            if(self.closed[i][0] == node.x && self.closed[i][1] == node.y){
                return true;
            }
        }
        return false;
    }

    // adds a node to the open list using priority based on heuristic function
    // i.e. lower heuristic = higher priority
    self.enqueueOpen = function(node){
        for(var i = 0; i < self.open.length; i++) {
            if( (node.g + node.h) < (self.open[i].g + self.open[i].h) ){
                self.open.splice(i,0,node);
                return;
            }
        }
        self.open.push(node);
    }

    self.computeSectors();
    return self;
}


