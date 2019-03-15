RLGUI = function (container, map) {
    
    var self = GUI(container);
    self.env = Environment(map);    
    self.pixelWidth = 720;
    self.pixelHeight = 720;
    self.sqSize = self.pixelWidth / self.env.width;

    // the colors used to draw the map
    self.colors = ["#777777", "#00ff00", "#0000ff"];
    
    self.mouse = 'print';
    self.doRL = false;
    self.totalIterations = 0;
    self.totalTerminal = 1;
    self.frameCount = 0;
    
    // draw the foreground, is called every 'frame'
    self.draw = function () {
        
        self.frameCount++;

        if (self.doRL) {
            
            let updateChart = false;
            let steps = parseInt(document.getElementById('selectiter').value);
            for (let i=0; i < steps; i++) {    
                self.doIteration();
                if (self.totalIterations % 1000 == 0) { updateChart = true; }
            }

            if (self.frameCount % 30 == 0 || updateChart) {
                self.chart.series[0].addPoint([self.totalIterations, self.totalIterations / self.totalTerminal])
            }
        }

        // start the draw timer
        var t0 = performance.now();
        // clear the foreground to white
        self.fg_ctx.clearRect(0, 0, self.bg.width, self.bg.height);
        
        // draw the tiles
        for (x = 0; x < self.env.width; x++) {
            for (y = 0; y < self.env.height; y++) {
                switch (self.env.get(x,y)) {
                    case 'X': self.drawTile(x, y, '#333333'); break;
                    case 'T': self.drawTile(x, y, '#00ff00'); break;
                }
            }
        }

        // draw the episode position
        if (self.RL.state[0] != -1) {
            let x = parseInt((self.RL.state[0] + 0.5) * self.sqSize);
            let y = parseInt((self.RL.state[1] + 0.5) * self.sqSize);
            self.drawCircle(x, y, self.sqSize/3, '#ff0000', '#ff0000')
        }

        // draw the policy
        self.fg_ctx.fillStyle = "#000000";
        for (x = 0; x < self.env.width; x++) {
            for (y = 0; y < self.env.height; y++) {
                
                for (a = 0; a < self.env.actions.length; a++) {
                    if (self.env.get(x,y) == 'X') { continue; }
                    if (self.env.get(x,y) == 'T') { continue; }
                    self.drawPolicyLine(x, y, self.env.actions[a], self.RL.P[x][y][a]);
                }
            }
        }

        // draw horizontal lines
        self.fg_ctx.fillStyle = "#000000";
        for (y = 0; y <= self.env.height; y++) {
            self.fg_ctx.fillRect(0, y * self.sqSize, self.fg.width, 1);
        }   
        for (x = 0; x <= self.env.width; x++) {  
            self.fg_ctx.fillRect(x * self.sqSize, 0, 1, self.fg.height);
        }
    }

    self.drawPolicyLine = function(x, y, a, p) {
        if (p == 0) { return; }
        let px = parseInt((x + 0.5) * self.sqSize);
        let py = parseInt((y + 0.5) * self.sqSize);
        let width = self.sqSize*a[0] * p * 0.45;
        let height = self.sqSize*a[1] * p * 0.45;
        if (width == 0) { width = 1; }
        if (height == 0) { height = 1; }
        self.fg_ctx.fillRect(px, py, width, height);
    }


    self.drawTile = function (x, y, color) {
        self.fg_ctx.fillStyle = color;
        self.fg_ctx.fillRect(x * self.sqSize, y * self.sqSize, self.sqSize, self.sqSize);
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

    self.doIteration = function() {
        self.RL.config = self.getConfig();
        self.RL.learningIteration();
        if (self.env.isTerminal(self.RL.state[0], self.RL.state[1])) {
            self.totalTerminal++;  
        } 
        self.totalIterations++;
    }

    self.getConfig = function() {
        return {
            alpha           : parseFloat(document.getElementById('selectstep').value),
            gamma           : parseFloat(document.getElementById('selectgamma').value),
            epsilon         : parseFloat(document.getElementById('selectepsilon').value)
        };
    }

    setMouse = function(method) {
        self.mouse = method;
    }

    self.addEventListeners = function() {
           
        self.fg.addEventListener('mousedown', function (evt) {
            var mousePos = self.getMousePos(self.fg, evt);
            var x = Math.floor(mousePos.x / self.sqSize);
            var y = Math.floor(mousePos.y / self.sqSize);
            if (evt.which == 1) {
                if (self.mouse == 'print') {
                    console.log('Values[' + x + '][' + y + ']:\n', self.RL.Q[x][y]);
                    console.log('Policy[' + x + '][' + y + ']:\n', self.RL.P[x][y]);
                } 
                else if (self.mouse == 'wall') { 
                    self.env.set(x, y, 'X'); 
                    for (let a = 0; a < self.env.actions.length; a++) {
                        self.RL.Q[x][y][a] = 0;
                        self.RL.P[x][y][a] = 1.0 / self.env.actions.length;
                    }
                }
                else if (self.mouse == 'clear') { 
                    self.env.set(x, y, -1); 
                    for (let a = 0; a < self.env.actions.length; a++) {
                        self.RL.Q[x][y][a] = 0;
                        self.RL.P[x][y][a] = 1.0 / self.env.actions.length;
                    }
                }
                else if (self.mouse == 'terminal') { 
                    self.env.set(x, y, 'T'); 
                    for (let a = 0; a < self.env.actions.length; a++) {
                        self.RL.Q[x][y][a] = 0;
                        self.RL.P[x][y][a] = 1.0 / self.env.actions.length;
                    }
                }            
            }
        }, false);
    
        self.fg.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }

    self.setHTML = function() {
        self.createCanvas(self.env.width * self.sqSize + 1, self.env.height * self.sqSize + 1);
        self.bannerDiv  = self.create('div', 'BannerContainer',    self.fg.width + 30,   0, 400,  40);
        self.controlDiv = self.create('div', 'ControlContainer',   self.fg.width + 30,  60, 400, 600);
        self.chartDiv   = self.create('div', 'ChartDiv',           740, 300, 600, 440);

        
        self.controlDiv.innerHTML += "<label id='labelmouse'>Mouse Mode:</label>";
        self.controlDiv.innerHTML += "<label id='labelstep'>Alpha:</label>";
        self.controlDiv.innerHTML += "<label id='labelepsilon'>Epsilon:</label>";
        self.controlDiv.innerHTML += "<label id='labelgamma'>Gamma:</label>";
        self.controlDiv.innerHTML += "<label id='labeliter'>Iteration Speed:</label>";
        self.controlDiv.innerHTML += "<select id='selectmouse' onchange='setMouse(value)';> \
                                        <option value='print'>Print Values</option> \
                                        <option value='wall'>Insert Wall</option> \
                                        <option value='clear'>Insert Clear</option> \
                                        <option value='terminal'>Insert Terminal</option></select>";
        self.controlDiv.innerHTML += "<input id='selectstep' type='number' min='0' max='1' step='0.1' value='0.1'>";
        self.controlDiv.innerHTML += "<input id='selectepsilon' type='number' min='0' max='1' step='0.1' value='0.1'>";
        self.controlDiv.innerHTML += "<input id='selectgamma' type='number' min='0' max='1' step='0.1' value='0.9'>";
        self.controlDiv.innerHTML += "<input id='selectiter' type='number' min='1' max='100000' step='1' value='1'>";
        
        self.controlDiv.innerHTML += "<button id='toggleButton'>Toggle Iteration</button>";
        self.controlDiv.innerHTML += "<button id='stepButton'>Single Iteration</button>";
        

        var stylePrefix = 'position:absolute;';
        var ch = '25px', c1l = '0px', c2l = '150px', c3l = '425px', c1w = '140px', c2w = '250px', c3w = '150px';
        
        document.getElementById('labelmouse').style     = stylePrefix + ' left:' + c1l + '; top:0;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectmouse').style    = stylePrefix + ' left:' + c2l + '; top:0;   width:' + c2w + '; height:' + ch + ';';
        document.getElementById('labelstep').style      = stylePrefix + ' left:' + c1l + '; top:40;   width:' + c1w + '; height:' + ch + '; ';
        document.getElementById('selectstep').style     = stylePrefix + ' left:' + c2l + '; top:40;   width:' + c2w + '; height:' + ch + '; text-align: center;';
        document.getElementById('labelepsilon').style   = stylePrefix + ' left:' + c1l + '; top:80;   width:' + c1w + '; height:' + ch + '; ';
        document.getElementById('selectepsilon').style  = stylePrefix + ' left:' + c2l + '; top:80;   width:' + c2w + '; height:' + ch + '; text-align: center;';
        document.getElementById('labelgamma').style     = stylePrefix + ' left:' + c1l + '; top:120;   width:' + c1w + '; height:' + ch + '; ';
        document.getElementById('selectgamma').style    = stylePrefix + ' left:' + c2l + '; top:120;   width:' + c2w + '; height:' + ch + '; text-align: center;';
        document.getElementById('labeliter').style      = stylePrefix + ' left:' + c1l + '; top:160;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectiter').style     = stylePrefix + ' left:' + c2l + '; top:160;   width:' + c2w + '; height:' + ch + '; text-align: center;';
        
        document.getElementById('toggleButton').style   = stylePrefix + ' left:0px; top:200;  width:190px' + '; height:' + ch + ';';
        document.getElementById('stepButton').style     = stylePrefix + ' left:210px; top:200;  width:190px' + '; height:' + ch + ';';
        
        document.getElementById('toggleButton').onclick = function() { self.doRL = !self.doRL; }
        document.getElementById('stepButton').onclick   = function() { self.doRL = false; self.doIteration();  }
    }

    self.resetChart = function() {
        self.chart = Highcharts.chart('ChartDiv', {
			chart: { animation: false, zoomType: 'xy', type: 'line' },
			title: { text: 'Average Iterations to Terminal' },
			yAxis: { title: { text: 'Average Iterations' } },
			xAxis: { title: { text: 'Iterations' } },
			legend: { enabled: false },
            series: [{data:[]}]
        });
    }
    
    self.setHTML();
    self.resetChart();
    self.addEventListeners();
    self.RL = RL(self.env, self.getConfig());

    return self;
}
