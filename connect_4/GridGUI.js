GridGUI = function (container) {
    // construct a GUI in the given container
    var self = GUI(container);
    self.pixelWidth = 768;
    self.pixelHeight = 768;

    self.humanAction = -1;
    self.prevMouseClickX = -1;
    self.prevMouseClickY = -1;
    
    self.colors = ['#ffff00', '#ff0000', '#ffffff']
    self.bgColor = '#006FB9'
    
    self.players = [null, null];
    self.autoplay = true;
    self.doturn = false;
    self.algorithm = 'playerHuman';

    self.update = function() {
        let winner = self.state.winner();
        // do the move for the current player
        if (winner == PLAYER_NONE) {
            if (self.players[self.state.player] == null) {
                if (self.humanAction != -1 && self.state.isLegalAction(self.humanAction)) {
                    self.state.doAction(self.humanAction);
                    self.humanAction = -1;
                }
            } else if (self.autoplay || self.doturn) {
                var aiAction = self.players[self.state.player].getAction(self.state.copy());
                if (self.state.isLegalAction(aiAction)) { 
                    self.state.doAction(aiAction);
                    self.doturn = false;
                } else {
                    self.textDiv.innerHTML = "<h3>WARNING: Player " + (self.state.player + 1) + " attempted illegal action: " + aiAction + "</h3>"; 
                }
                
            }
        } else {
            if (winner == PLAYER_ONE)  { self.textDiv.innerHTML = "<h3>Player One Wins!</h3>"; }
            if (winner == PLAYER_TWO)  { self.textDiv.innerHTML = "<h3>Player Two Wins!</h3>"; }
            if (winner == PLAYER_DRAW) { self.textDiv.innerHTML = "<h3>The Game is a Draw!</h3>"; }
        }

        self.drawBackground();
        self.draw();
    }

    self.setGame = function(width, height) {
        self.state = GameState(width, height);
        self.sqSize = Math.min(self.pixelWidth / self.state.width, self.pixelHeight / self.state.height);
        self.sqHalf = self.sqSize/2;
    }

    // draw the foreground, is called every 'frame'
    self.draw = function () {

        // clear the foreground to white
        self.fg_ctx.clearRect(0, 0, self.bg.width, self.bg.height);
        
        // draw the mouseover tile
        self.fg_ctx.fillStyle = self.colors[self.state.player];
        //self.fg_ctx.fillRect(self.mx*self.sqSize, (self.state.height-self.state.pieces[self.mx]-1)*self.sqSize, self.sqSize, self.sqSize);

        for (x = 0; x < self.state.width; x++) {
            for (y = 0; y < self.state.height; y++) {
                self.drawCircle(x*self.sqSize + self.sqHalf, (self.state.height-y-1)*self.sqSize + self.sqHalf, 0.4*self.sqSize, self.colors[self.state.get(x,y)], '#000000', 2);
            }
        }

        if (self.state.winner() == PLAYER_NONE) {
            self.drawCircle(self.mx*self.sqSize + self.sqHalf, 
                (self.state.height-self.state.pieces[self.mx]-1)*self.sqSize + self.sqHalf, 
                0.3*self.sqSize, self.colors[self.state.player], '#000000', 0);
        }

        self.fg_ctx.fillStyle = "#000000";
        for (y = 0; y <= self.state.height; y++) { self.fg_ctx.fillRect(0, y * self.sqSize, self.state.width * self.sqSize, 1); }
        for (x = 0; x <= self.state.width; x++)  { self.fg_ctx.fillRect(x * self.sqSize, 0, 1, self.state.height*self.sqSize); }
    }

    // draw the background map, is called once on construction
    self.drawBackground = function () {
        self.bg_ctx.clearRect(0, 0, self.bg.width, self.bg.height);
        self.bg_ctx.fillStyle = self.bgColor;
        self.bg_ctx.fillRect(0, 0, self.state.width * self.sqSize, self.state.height * self.sqSize);
    }

    self.drawCircle = function(x, y, radius, fillColor, borderColor, borderWidth) {
        self.fg_ctx.fillStyle = fillColor;
        self.fg_ctx.strokeStyle = borderColor;
        self.fg_ctx.beginPath();
        self.fg_ctx.arc(x, y, radius, 0, 2*Math.PI, false);
        self.fg_ctx.fill();
        self.fg_ctx.lineWidth = borderWidth;
        self.fg_ctx.stroke();
    }

    self.drawPiece = function(x, y, player) {

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
            }
    
            self.mx = newmx;
            self.my = newmy;
    
        }, false);
    
        self.fg.addEventListener('mousedown', function (evt) {
            var mousePos = self.getMousePos(self.fg, evt);
            self.mouse = evt.which;
    
            if (self.mouse == 1) {
                self.prevMouseClickX = Math.floor(mousePos.x / self.sqSize);
                self.prevMouseClickY = Math.floor(mousePos.y / self.sqSize);
                self.humanAction = self.prevMouseClickX;
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

    setWidth = function(value) {
        self.setGame(parseInt(value), self.state.height);
    }

    setHeight = function(value) {
        self.setGame(self.state.width, parseInt(value));
    }

    setHeuristic = function(value) {
        self.config.heuristic = value;
        setAlgorithm(self.algorithm);
    }

    setAlgorithm = function(algorithm, player) {
        self.algorithm = algorithm;
        player = parseInt(player);
        if (player == 0) {
            document.getElementById('p1d').style.display = 'none';
            document.getElementById('p1time').style.display = 'none';
            document.getElementById('p1ms').style.display = 'none';
            document.getElementById('p1maxd').style.display = 'none';

        }
        if (player == 1) {
            document.getElementById('p2d').style.display = 'none';
            document.getElementById('p2time').style.display = 'none';
            document.getElementById('p2ms').style.display = 'none';
            document.getElementById('p2maxd').style.display = 'none';
        }
        if (algorithm == 'playerHuman')  { self.players[player] = null; }
        if (algorithm == 'playerRandom') { self.players[player] = Player_Random(); }
        if (algorithm == 'playerGreedy') { self.players[player] = Player_Greedy(); }
        if (algorithm == 'playerSAB')    { 
            if (player == 0) {
                document.getElementById('p1d').style.display = 'inline';
                document.getElementById('p1time').style.display = 'inline';
                document.getElementById('p1ms').style.display = 'inline';
                document.getElementById('p1maxd').style.display = 'inline';
                let config = {}
                config.timeLimit = parseInt(document.getElementById('p1time').value);
                config.maxDepth = parseInt(document.getElementById('p1maxd').value);
                self.players[player] = Player_Student(config); 
            }
            if (player == 1) {
                document.getElementById('p2d').style.display = 'inline';
                document.getElementById('p2time').style.display = 'inline';
                document.getElementById('p2ms').style.display = 'inline';
                document.getElementById('p2maxd').style.display = 'inline';
                let config = {}
                config.timeLimit = parseInt(document.getElementById('p2time').value);
                config.maxDepth = parseInt(document.getElementById('p2maxd').value);
                self.players[player] = Player_Student(config); 
            }
        }
    }

    self.setHTML = function() {
        self.createCanvas(self.pixelWidth + 1, self.pixelHeight + 1);
        self.bannerDiv  = self.create('div', 'BannerContainer',  self.fg.width + 30,   0, 600,  40);
        self.controlDiv = self.create('div', 'ControlContainer', self.fg.width + 30,  60, 600, 350);
        self.textDiv    = self.create('div', 'TextContainer',    self.fg.width + 30, 450, 600, 400);
        
        self.controlDiv.innerHTML += "<label id='labelp1'>Player 1 (Yellow):</label>";
        self.controlDiv.innerHTML += "<label id='p1ms'>Time:</label>";
        self.controlDiv.innerHTML += "<label id='p2ms'>Time:</label>";
        self.controlDiv.innerHTML += "<label id='p1d'>MaxD:</label>";
        self.controlDiv.innerHTML += "<label id='p2d'>MaxD:</label>";
        self.controlDiv.innerHTML += "<label id='labelp2'>Player 2 (Red):</label>";
        self.controlDiv.innerHTML += "<label id='boardwidth'>Board Width:</label>";
        self.controlDiv.innerHTML += "<label id='boardheight'>Board Height:</label>";
        self.controlDiv.innerHTML += "<select id='selectp1' onchange='setAlgorithm(value, 0)';> \
                                        <option value='playerHuman'>Human</option> \
                                        <option value='playerSAB'>Student Alpha Beta</option> \
                                        <option value='playerRandom'>Random</option> \
                                        <option value='playerGreedy'>Greedy</option></select>";
        self.controlDiv.innerHTML += "<select id='selectp2' onchange='setAlgorithm(value, 1)';> \
                                        <option value='playerHuman'>Human</option> \
                                        <option value='playerSAB'>Student Alpha Beta</option> \
                                        <option value='playerRandom'>Random</option> \
                                        <option value='playerGreedy'>Greedy</option></select>";
        self.controlDiv.innerHTML += "<input id='p1time' type='number' min='0' max='10000' step='100' value='1000'>";
        self.controlDiv.innerHTML += "<input id='p1maxd' type='number' min='1' max='100'  step='1' value='4'>";
        self.controlDiv.innerHTML += "<input id='p2time' type='number' min='0' max='10000' step='100' value='1000'>";
        self.controlDiv.innerHTML += "<input id='p2maxd' type='number' min='1' max='100'  step='1' value='4'>";
        self.controlDiv.innerHTML += "<label id='labelauto'><input type='checkbox' id='autobox' checked/>Auto Play AI Turns</label>";
        self.controlDiv.innerHTML += "<button id='doaiturn'>Do AI Turn</button>";
        self.controlDiv.innerHTML += "<button id='reset'>Restart Game</button>";
        
        self.controlDiv.innerHTML += "<input id='widthslider' type='range' name='points' value='7' min='4' max='15' oninput='setWidth(value)'>";
        self.controlDiv.innerHTML += "<input id='heightslider' type='range' name='points' value='6' min='4' max='15' oninput='setHeight(value)'>";

        

        var stylePrefix = 'position:absolute;';
        var ch = '25px', c1l = '0px', c2l = '150px', c3l = '425px', c1w = '140px', c2w = '250px', c3w = '150px';
        
        document.getElementById('labelp1').style        = stylePrefix + ' left:' + c1l + '; top:0;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectp1').style       = stylePrefix + ' left:' + c2l + '; top:0;   width:' + c2w + '; height:' + ch + ';';
        document.getElementById('p1ms').style           = stylePrefix + ' left:' + c2l + '; top:40;  width:' + '150px' + '; height:' + ch + '; display:none';
        document.getElementById('p1d').style            = stylePrefix + ' left:295px; top:40;  width:' + '150px' + '; height:' + ch + '; display:none';
        document.getElementById('p1time').style         = stylePrefix + ' left:200px;       top:40;  width:' + '70px' + '; height:' + ch + '; display:none';
        document.getElementById('p1maxd').style         = stylePrefix + ' left:350px;       top:40;  width:' + '50px' + '; height:' + ch + '; display:none';
        document.getElementById('labelp2').style        = stylePrefix + ' left:' + c1l + '; top:80;  width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectp2').style       = stylePrefix + ' left:' + c2l + '; top:80;  width:' + c2w + '; height:' + ch + ';';
        document.getElementById('p2ms').style           = stylePrefix + ' left:' + c2l + '; top:120;  width:' + '150px' + '; height:' + ch + '; display:none';
        document.getElementById('p2d').style            = stylePrefix + ' left:295px; top:120;  width:' + '150px' + '; height:' + ch + '; display:none';
        document.getElementById('p2time').style         = stylePrefix + ' left:200px;       top:120;  width:' + '70px' + '; height:' + ch + '; display:none';
        document.getElementById('p2maxd').style         = stylePrefix + ' left:350px;       top:120;  width:' + '50px' + '; height:' + ch + '; display:none';
        document.getElementById('labelauto').style      = stylePrefix + ' left:' + c2l + '; top:160;   width:' + c2w + '; height:' + ch + '; ' ;
        document.getElementById('doaiturn').style       = stylePrefix + ' left:310px' + '; top:160px;  width:90px' + '; height:' + ch + ';';
        
        // Object Size Selection
        document.getElementById('boardwidth').style     = stylePrefix + ' left:' + c1l + '; top:200;  width:' + c1w + '; height:' + ch + ';';
        document.getElementById('widthslider').style    = stylePrefix + ' left:' + c2l + '; top:200;  width:' + c2w + '; height:' + ch + ';';
        document.getElementById('boardheight').style    = stylePrefix + ' left:' + c1l + '; top:240;  width:' + c1w + '; height:' + ch + ';';
        document.getElementById('heightslider').style   = stylePrefix + ' left:' + c2l + '; top:240;  width:' + c2w + '; height:' + ch + ';';
        document.getElementById('reset').style          = stylePrefix + ' left:0px' + '; top:300;  width:140px' + '; height:' + ch + ';';
        
        document.getElementById('autobox').onclick      = function () { self.autoplay = !self.autoplay; document.getElementById('doaiturn').disabled = self.autoplay; }
        document.getElementById('doaiturn').onclick     = function () { self.doturn = true; }
        document.getElementById('doaiturn').disabled    = true;
        
        document.getElementById('reset').onclick     = function () { self.state = GameState(self.state.width, self.state.height); }

        document.getElementById('p1time').oninput      = function() { setAlgorithm(self.algorithm, 0); }
        document.getElementById('p2time').oninput      = function() { setAlgorithm(self.algorithm, 1); }
        document.getElementById('p1maxd').oninput      = function() { setAlgorithm(self.algorithm, 0); }
        document.getElementById('p2maxd').oninput      = function() { setAlgorithm(self.algorithm, 1); }

        testContainer = self.testDiv;
    }
    
    self.setGame(7, 6);
    self.setHTML();
    self.addEventListeners();
    self.drawBackground();
    return self;
}
