GridGUI = function (container, mapText) {
    // construct a GUI in the given container
    var self = GUI(container);
    self.map = Grid(mapText);
    
    // legal actions passed into the search
    self.config = {};
    self.config.actions = [ [1, 1], [-1, -1], [1, -1], [-1, 1], [0, 1], [0, -1], [1, 0], [-1, 0]];
    self.config.actionCosts = [141, 141, 141, 141, 100, 100, 100, 100];
    self.config.tiebreak = 'lessh';
    self.config.weight = 1;
    self.config.heuristic = 'diag';

    self.search = Search_Student(self.map, self.config);
    self.pixelWidth = 640;
    self.pixelHeight = 640;
    self.sqSize = self.pixelWidth / self.map.width;
    self.showIterations = false;
    self.drawInfo = true;
    self.step = false;
    self.stepping = false;
    self.drawMethod = 'info';
    self.showGrid = true;
    self.animspeed = 1;
    
    // object size and maximum size, for this assignment it is 1
    self.osize = 1;
    self.maxSize = 1;
    self.mx = -1;
    self.my = -1;
    self.gx = -1;
    self.gy = -1;
    self.omx = -1;
    self.omy = -1;
    self.algorithm = 'studentastar';

    ggui = self;

    // the colors used to draw the map
    self.colors = ["#777777", "#00ff00", "#0000ff"];
    self.pathTime = 0;  // time it took to calculate the previous path

    // draw the foreground, is called every 'frame'
    self.draw = function () {

        // start the draw timer
        var t0 = performance.now();
        // clear the foreground to white
        self.fg_ctx.clearRect(0, 0, self.bg.width, self.bg.height);
        // if the left mouse button is down in a valid location
        if (self.omx != -1) {
        
            if (self.showIterations) {
                if (!self.stepping) {
                    for (var a=0; a<self.animspeed; a++) { self.search.searchIteration(); }
                } else if (self.step) {
                    self.search.searchIteration();
                    self.step = false;
                }
            } else {
                var setTime = self.search.inProgress;
                var tt0 = performance.now();
                while (self.search.inProgress) { self.search.searchIteration(); }
                var tt1 = performance.now();
                if (setTime) { self.pathTime = Math.round(tt1 - tt0); }
            }
            
            var ix = self.omx;
            var iy = self.omy;
            
            var open = self.search.getOpen();
            // draw the remaining fringe of the BFS
            for (var i = 0; self.drawInfo && i < open.length; i++) {
                self.drawAgent(open[i][0], open[i][1], self.osize, '#ffff00');
            }

            // draw the expanded states from the BFS
            var closed = self.search.getClosed();
            for (var i = 0; self.drawInfo && i <closed.length; i++) {
                self.drawAgent(closed[i][0], closed[i][1], self.osize, '#ff0000');
            }

            // draw the path returned by the user's algorithm
            for (i = 0; i < self.search.path.length; i++) {
                ix += self.search.path[i][0];
                iy += self.search.path[i][1];
                self.drawAgent(ix, iy, self.osize, '#ffffff');
            }
            // draw the agent in yellow
            self.drawAgent(self.omx, self.omy, self.osize, '#ffffff');
        }

        if (self.mx != -1 && self.mouse == 3) {
			for (var x=0; x < self.map.width; x++) {
				for (var y=0; y < self.map.height; y++) {
					if (self.search.isConnected(self.mx, self.my, x, y, self.osize)) {
						self.drawAgent(x, y, 1, '#ff22ff');
					}
				}
			}
		}

        // if the mouse is on the screen, draw the current location
        if (self.mx != -1) {
            self.drawAgent(self.mx, self.my, self.osize, '#ffffff');
        }

        // if there's a search in progress, draw the goal
        // if the mouse is on the screen, draw the current location
        if (self.search.inProgress) {
            self.drawAgent(self.search.gx, self.search.gy, self.osize, '#ffffff');
        }

        // draw horizontal lines
		if (self.showGrid) {
			self.fg_ctx.fillStyle = "#000000";
			for (y = 0; y < self.map.height; y++) {
				self.fg_ctx.fillRect(0, y * self.sqSize, self.fg.width, 1);
			}
			for (x = 0; x < self.map.width; x++) {
				self.fg_ctx.fillRect(x * self.sqSize, 0, 1, self.fg.height);
			}
		}

        // calculate how long the drawing took
        var t1 = performance.now();
        var ms = Math.round(t1 - t0);
        // print on screen how long the drawing and path-finding took
        self.fg_ctx.fillStyle = "#ffffff";
        self.fg_ctx.fillText("Mouse Pos: (" + self.mx + "," + self.my + ")", 5, self.bg.height - 53);
        self.fg_ctx.fillText("H(n): " + (self.search.gx == -1 ? 'No Goal Selected' : self.search.estimateCost(self.mx, self.my, self.search.gx, self.search.gy)), 5, self.bg.height - 38);
        self.fg_ctx.fillText("Compute Time: " + self.pathTime + " ms", 5, self.bg.height - 23);
        self.fg_ctx.fillText("Path Cost: " + self.search.cost, 5, self.bg.height - 8);
    }

    self.drawAgent = function (x, y, size, color) {
        self.fg_ctx.fillStyle = color;
        for (var sx = 0; sx < size; sx++) {
            for (var sy = 0; sy < size; sy++) {
                self.fg_ctx.fillRect((x + sx) * self.sqSize, (y + sy) * self.sqSize, self.sqSize, self.sqSize);
            }
        }
    }

    // draw the background map, is called once on construction
    self.draw_background = function () {
        for (y = 0; y < self.map.height; y++) {
            for (x = 0; x < self.map.width; x++) {
                self.bg_ctx.fillStyle = self.colors[self.map.get(x, y) - '0'];
                self.bg_ctx.fillRect(x * self.sqSize, y * self.sqSize, self.sqSize, self.sqSize);
            }
        }
    }

    self.addEventListeners = function() {
        self.fg.addEventListener('mousemove', function (evt) {
            var mousePos = self.getMousePos(self.fg, evt);
            var newmx = Math.floor(mousePos.x / self.sqSize);
            var newmy = Math.floor(mousePos.y / self.sqSize);
            
            // if this is a new mouse position
            if (self.mouse == 1) {
                self.gx = self.mx;
                self.gy = self.my;
                self.search.startSearch(self.omx, self.omy, self.mx, self.my, self.osize);
            }
    
            self.mx = newmx;
            self.my = newmy;
    
        }, false);
    
        self.fg.addEventListener('mousedown', function (evt) {
            var mousePos = self.getMousePos(self.fg, evt);
            self.mouse = evt.which;
    
            if (self.mouse == 1) {
                self.omx = Math.floor(mousePos.x / self.sqSize);
                self.omy = Math.floor(mousePos.y / self.sqSize);
                self.gx = self.mx;
                self.gy = self.my;
                self.search.startSearch(self.omx, self.omy, self.mx, self.my, self.osize);
            }
    
            if (self.mouse == 2) {
                self.osize++;
                if (self.osize > self.maxSize) { self.osize = 1; }
            }
        }, false);
    
        self.fg.addEventListener('mouseup', function (e) {
            self.mouse = -1;
            //self.omx = -1;
            //self.omy = -1;
        }, false);
    
        self.fg.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }

    setAnimationSpeed = function(value) {
        if (value == '1') { self.animspeed = 1; }
        if (value == '2') { self.animspeed = 2; }
        if (value == '4') { self.animspeed = 4; }
        if (value == '8') { self.animspeed = 8; }
        if (value == '16') { self.animspeed = 16; }
        if (value == '32') { self.animspeed = 32; }
    }

    setObjectSize = function(value) {
        if (value == '1') { self.osize = 1; }
        if (value == '2') { self.osize = 2; }
        if (value == '3') { self.osize = 3; }
        self.search.startSearch(self.omx, self.omy, self.gx, self.gy, self.osize);
    }

    setAStarWeight = function(value) {
        if (value == '1') { self.config.weight = 1; }
        if (value == '1.1') { self.config.weight = 1.1; }
        if (value == '1.5') { self.config.weight = 1.5; }
        if (value == '2') { self.config.weight = 2; }
        if (value == '4') { self.config.weight = 4; }
        if (value == '8') { self.config.weight = 8; }
        setAlgorithm(self.algorithm);
    }

    setAStarTiebreak = function(value) {
        if (value == 'fonly') { self.config.tiebreak = 'fonly'; }
        if (value == 'lessg') { self.config.tiebreak = 'lessg'; }
        if (value == 'lessh') { self.config.tiebreak = 'lessh'; }
        setAlgorithm(self.algorithm);
    }

    setHeuristic = function(value) {
        self.config.heuristic = value;
        setAlgorithm(self.algorithm);
    }

    setLegalActions = function(value) {
        if (value == 'card') {
            self.config.actions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            self.config.actionCosts = [100, 100, 100, 100];
        }
        if (value == 'diag') {
            self.config.actions = [ [1, 1], [-1, -1], [1, -1], [-1, 1], [0, 1], [0, -1], [1, 0], [-1, 0]];
            self.config.actionCosts = [141, 141, 141, 141, 100, 100, 100, 100];
        }
        setAlgorithm(self.algorithm);
    }

    setMap = function(value) {
        if (value == 'default') { self.map = Grid(document.getElementById("defaultmap").value); }
        if (value == 'blank') { self.map = Grid(document.getElementById("blankmap").value); }
        if (value == 'wheel') { self.map = Grid(document.getElementById("wheelofwar").value); }
        if (value == 'caves') { self.map = Grid(document.getElementById("caves").value); }
        if (value == 'bigcaves') { self.map = Grid(document.getElementById("bigcaves").value); }
        if (value == 'lshape') { self.map = Grid(document.getElementById("lshapemap").value); }
        if (value == '256maze') { self.map = Grid(document.getElementById("256maze").value); }
        if (value == '128maze') { self.map = Grid(document.getElementById("128maze").value); }
        if (value == '64maze') { self.map = Grid(document.getElementById("64maze").value); }
        
        self.sqSize = self.pixelWidth / self.map.width;
        self.bg_ctx.clearRect(0, 0, self.pixelWidth, self.pixelHeight);
        self.omx = -1;
        self.omy = -1;
        self.gx = -1;
        self.gy = -1;
        self.draw_background();
        setAlgorithm(self.algorithm);
    }

    setAlgorithm = function(algorithm) {
        var t0 = performance.now();
        self.pathTime = 0;
        self.algorithm = algorithm;
        document.getElementById('astartiebreak').style.display = 'none';
        document.getElementById('astarweight').style.display = 'none';
        document.getElementById('heuristic').disabled = true;
        if (algorithm == 'bfs') { self.search = Search_BFS(self.map, self.config); }
        if (algorithm == 'dfs') { self.search = Search_DFS(self.map, self.config); }
        if (algorithm == 'ucs') { self.search = Search_UCS(self.map, self.config); }
        if (algorithm == 'gbefs') { self.search = Search_GreedyBeFS(self.map, self.config); document.getElementById('heuristic').disabled = false; }
        if (algorithm == 'astar') { self.search = Search_AStar(self.map, self.config); document.getElementById('astartiebreak').style.display = 'inline'; document.getElementById('heuristic').disabled = false; }
        if (algorithm == 'studentastar') { self.search = Search_Student(self.map, self.config); document.getElementById('heuristic').disabled = false; }
        if (algorithm == 'wastar') { self.search = Search_WAStar(self.map, self.config); document.getElementById('astarweight').style.display = 'inline'; document.getElementById('heuristic').disabled = false;}
        var t1 = performance.now();
        console.log("Search constructor time: ", t1-t0);
        self.search.startSearch(self.omx, self.omy, self.gx, self.gy, self.osize);
    }

    setDrawMethod = function(value) {
        self.drawMethod = value;
        document.getElementById('stepbutton').style.display = "none";
        document.getElementById('animspeed').style.display = "none";
        if (value == 'info') { self.showIterations = false; self.drawInfo = true; self.stepping = false;  }
        else if (value == 'path') { self.showIterations = false; self.drawInfo = false; self.stepping = false;  }
        else if (value == 'iter') { self.showIterations = true; self.drawInfo = true; self.stepping = false; document.getElementById('animspeed').style.display = "inline"; }
        else if (value == 'step') { self.showIterations = true; self.drawInfo = true; self.stepping = true; document.getElementById('stepbutton').style.display = "inline"; }
    }

    self.setHTML = function() {
        self.createCanvas(self.map.width * self.sqSize + 1, self.map.height * self.sqSize + 1);
        self.controlDiv = self.create('div', 'ButtonContainer', self.fg.width + 30, 0, 600, 0);
        self.testDiv = self.create('div', 'TestContainer', self.fg.width + 30, 260, 100, 100);
        
        self.controlDiv.innerHTML += "Environment Map: <select id='selectmap' onchange='setMap(value)';> \
                                        <option value='default'>Default (64 x 64)</option> \
                                        <option value='caves'>Sparse Caves (128 x 128)</option> \
                                        <option value='bigcaves'>Dense Caves (256 x 256)</option> \
                                        <option value='64maze'>Small Maze (64 x 64)</option> \
                                        <option value='128maze'>Medium Maze (128 x 128)</option> \
                                        <option value='256maze'>Large Maze (256 x 256)</option> \
                                        <option value='wheel'>StarCraft: Wheel of War (256 x 256)</option> \
                                        <option value='blank'>Blank (32 x 32)</option> \
                                        <option value='lshape'>L-Shape Wall (16 x 16)</option></select><button id='togglegrid'>Toggle Grid</button><br><br>";
        self.controlDiv.innerHTML += "Search Algorithm: <select id='algorithm' onchange='setAlgorithm(value)';> \
                                        <option value='studentastar'>Student A* (SA*)</option> \
                                        <option value='astar'>Solution A* (A*)</option> \
                                        <option value='wastar'>Weighted A* Search (WA*)</option> \
                                        <option value='bfs'>Breadth-First Search (BFS)</option> \
                                        <option value='dfs'>Depth-First Search (DFS)</option> \
                                        <option value='ucs'>Uniform Cost Search (UCS)</option> \
                                        <option value='gbefs'>Greedy Best-First Search (GBeFS)</option></select>";
        self.controlDiv.innerHTML += "<select id='astarweight' onchange='setAStarWeight(value)';> \
                                        <option value='1'>1x Heuristic</option> \
                                        <option value='1.1'>1.1x Heuristic</option> \
                                        <option value='1.5'>1.5x Heuristic</option> \
                                        <option value='2'>2x Heuristic</option> \
                                        <option value='4'>4x Heuristic</option> \
                                        <option value='8'>8x Heuristic</option></select>";                                        
        self.controlDiv.innerHTML += "<select id='astartiebreak' onchange='setAStarTiebreak(value)';> \
                                        <option value='lessh'>Tiebreak Min H</option> \
                                        <option value='lessg'>Tiebreak Min G</option> \
                                        <option value='fonly'>Select Min F Only</option></select><br><br>";
        self.controlDiv.innerHTML += "Object Size: <select id='objectsize' onchange='setObjectSize(value)';> \
                                        <option value='1'>1x1 Square</option> \
                                        <option value='2'>2x2 Square</option> \
                                        <option value='3'>3x3 Square</option></select><br><br>";
        self.controlDiv.innerHTML += "Legal Actions: <select id='legalactions' onchange='setLegalActions(value)';> \
                                        <option value='diag'>8 Directions (4 Cardinal + Diagonals)</option> \
                                        <option value='card'>4 Cardinal (Up, Down, Left, Right)</option> </select><br><br>";
        self.controlDiv.innerHTML += "Heuristic Function: <select id='heuristic' onchange='setHeuristic(value)';> \
                                        <option value='diag'>8 Direction Manhattan</option> \
                                        <option value='card'>4 Direction Manhattan</option> \
                                        <option value='dist'>2D Euclidean Distance</option> \
                                        <option value='zero'>Zero (No Heuristic)</option></select><br><br>";
        self.controlDiv.innerHTML += "Visualization: <select id='drawMethod' onchange='setDrawMethod(value)';> \
                                        <option value='info'>Instant Path + Open/Closed</option> \
                                        <option value='path'>Instant Path Only</option> \
                                        <option value='iter'>Animated Search</option> \
                                        <option value='step'>Single Step</option></select><button id='stepbutton'>Single Step</button>";
        self.controlDiv.innerHTML += "<select id='animspeed' onchange='setAnimationSpeed(value)';> \
                                        <option value='1'>1x Speed</option> \
                                        <option value='2'>2x Speed</option> \
                                        <option value='4'>4x Speed</option> \
                                        <option value='8'>8x Speed</option> \
                                        <option value='16'>16x Speed</option> \
                                        <option value='32'>32x Speed</option></select><br><br>";
        self.controlDiv.innerHTML += "<button id='rerun'>Re-Run Previous Path</button> ";
        self.controlDiv.innerHTML += "<button id='TestButton'>Run Assignment Tests</button> <button id='RandomTestButton'>Run Random Tests</button>";
    
        document.getElementById('selectmap').style.position = 'absolute';
        document.getElementById('selectmap').style.left = "150px";
        document.getElementById('selectmap').style.height = "25px";
		document.getElementById('selectmap').style.width = "250px";
        document.getElementById('algorithm').style.position = 'absolute';
        document.getElementById('algorithm').style.left = "150px";
        document.getElementById('algorithm').style.height = "25px";
        document.getElementById('algorithm').style.width = "250px";
        document.getElementById('astartiebreak').style.position = 'absolute';
        document.getElementById('astartiebreak').style.left = "425px";
        document.getElementById('astartiebreak').style.height = "25px";
        document.getElementById('astarweight').style.position = 'absolute';
        document.getElementById('astarweight').style.left = "425px";
        document.getElementById('astarweight').style.height = "25px";
        document.getElementById('astarweight').style.display = "none";
        document.getElementById('objectsize').style.position = 'absolute';
        document.getElementById('objectsize').style.left = "150px";
        document.getElementById('objectsize').style.height = "25px";
		document.getElementById('objectsize').style.width = "250px";
        document.getElementById('legalactions').style.position = 'absolute';
        document.getElementById('legalactions').style.left = "150px";
        document.getElementById('legalactions').style.height = "25px";
        document.getElementById('legalactions').style.width = "250px";
        document.getElementById('heuristic').style.position = 'absolute';
        document.getElementById('heuristic').style.left = "150px";
        document.getElementById('heuristic').style.height = "25px";
		document.getElementById('heuristic').style.width = "250px";
        document.getElementById('drawMethod').style.position = 'absolute';
        document.getElementById('drawMethod').style.left = "150px";
        document.getElementById('drawMethod').style.height = "25px";
		document.getElementById('drawMethod').style.width = "250px";
        document.getElementById('stepbutton').style.position = 'absolute';
        document.getElementById('stepbutton').style.left = "425px";
        document.getElementById('stepbutton').style.height = "25px";
        document.getElementById('stepbutton').style.display = "none";
        document.getElementById('animspeed').style.position = 'absolute';
        document.getElementById('animspeed').style.left = "425px";
        document.getElementById('animspeed').style.height = "25px";
        document.getElementById('animspeed').style.display = "none";
		document.getElementById('togglegrid').style.position = 'absolute';
        document.getElementById('togglegrid').style.left = "425px";
        document.getElementById('togglegrid').style.height = "25px";
        document.getElementById('stepbutton').onclick = function () { self.step = true; }
		document.getElementById('togglegrid').onclick = function () { self.showGrid = !self.showGrid; }
        document.getElementById('rerun').onclick = function () { self.search.startSearch(self.omx, self.omy, self.search.gx, self.search.gy, self.osize); }

        document.getElementById('TestButton').onclick = function () { test = 0; randomTests = false; RunTests(); }
        document.getElementById('RandomTestButton').onclick = function () { test = 0; randomTests = true; RunTests(); }
        
        testContainer = self.testDiv;
    }
    
    self.setHTML();
    self.addEventListeners();
    self.draw_background();
    return self;
}

// Test-related global variables, have to be done this way to enable real-time HTML updating during tests
var test = 0;
var startTiles = [[21, 3], [3, 33], [4, 50],  [2, 60], [4, 50],  [17,  0], [53, 43], [30, 33], [47,  0], [30, 34], 
                  [61, 14], [30, 34], [1, 1], [13, 8], [63, 58], [51, 23], [40, 30], [15, 32], [20, 10], [0,0]];
var endTiles   = [[46, 3], [3, 55], [13, 58], [28, 2], [13, 59], [60, 50], [30, 43], [54, 33], [60, 45], [55, 39], 
                  [10, 44], [55, 40], [5, 5], [63, 8], [63,  0], [51, 45], [20, 30], [18, 18], [40, 10], [63,63]];
var tableHeader = "<table rules='all'><tr><th>Test </th><th>Start</th><th>Goal</th><th colspan=2>Solution<br>Path</th><th colspan=2>Student<br>Path</th><th colspan=2>Student<br>Connected</th></tr>";
var tableRows = "";
var tableEnd = "";
var studentPathCorrect = 0;
var studentConnectedCorrect = 0;
var solutionPathTime = 0;
var studentPathTime = 0;
var searchStudent = null;
var searchSolution = null;
var testContainer = null;
var randomTests = false;
var ggui = null;

RunTests = function() {

    if (test == 0) {
        tableRows = "";
        studentPathCorrect = 0;
        studentConnectedCorrect = 0;
        solutionPathTime = 0;
        studentPathTime = 0;
        searchStudent = Search_Student(ggui.map, ggui.config);
        searchSolution = Search_AStar(ggui.map, ggui.config);
    }

    if (test < startTiles.length) {
        var start = [startTiles[test][0], startTiles[test][1]];
        var end   = [endTiles[test][0], endTiles[test][1]];

        if (randomTests) {
            start[0] = Math.floor(Math.random() * ggui.map.width);
            start[1] = Math.floor(Math.random() * ggui.map.height);
            end[0] = Math.floor(Math.random() * ggui.map.width);
            end[1] = Math.floor(Math.random() * ggui.map.height);
        }

        t0 = performance.now();
        searchSolution.startSearch(start[0], start[1], end[0], end[1], ggui.osize);
        while (searchSolution.inProgress) { searchSolution.searchIteration(); }
        var solutionPath = searchSolution.path;
        t1 = performance.now();
        var solutionPathMS = Math.round(t1-t0);
        solutionPathTime += solutionPathMS;

        t0 = performance.now();
        searchStudent.startSearch(start[0], start[1], end[0], end[1], ggui.osize);
        while (searchStudent.inProgress) { searchStudent.searchIteration(); }
        var studentPath = searchStudent.path;
        t1 = performance.now();
        var studentPathMS = Math.round(t1-t0);
        studentPathTime += studentPathMS;

        var studentCon = searchStudent.isConnected(start[0], start[1], end[0], end[1], ggui.osize);
        var solutionCon = searchSolution.isConnected(start[0], start[1], end[0], end[1], ggui.osize);
        
        var pathColor = "#ff0000";
        var conColor = "#ff0000";

        if (searchStudent.cost == searchSolution.cost) {
            studentPathCorrect++;
            pathColor = "#000000"
        }

        if (studentCon == solutionCon) {
            studentConnectedCorrect++;
            conColor = "#000000"
        }

        tableRows += "<tr><td>" + (test+1) + "</td><td>(" + start[0] + "," + start[1] + ")</td><td>(" + end[0] + "," + end[1] + ")</td><td>"; 
        tableRows += searchSolution.cost +"</td><td>" + solutionPathMS + "</td>";
        tableRows += "<td><font color='" + pathColor + "'>" + searchStudent.cost + "</font></td><td>" + studentPathMS + "</td>";
        tableRows += "<td><font color='" + conColor + "'>" + (studentCon ? 'true' : 'false') + "</font></td></tr>";

        tableEnd =  "<tr><td>Total</td><td>-</td><td>-</td><td>-</td><td>" + solutionPathTime + "</td>";
        tableEnd += "<td>" + studentPathCorrect + "/" + (test+1) + "</td><td>" + studentPathTime + "</td>";
        tableEnd += "<td>" + studentConnectedCorrect + "/" + (test+1) + "</tr>";

        testContainer.innerHTML = tableHeader + tableRows + tableEnd + '</table>';
        setTimeout("RunTests();", 1);
    } 

    test++;
}
