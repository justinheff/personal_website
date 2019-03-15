RLGUI = function (container, env) {
    
    var self = GUI(container);
    self.env = env;
    

    self.pixelWidth = 720;
    self.pixelHeight = 720;
    self.sqSize = self.pixelWidth / self.env.width;

    self.doRL = false;

    self.draw = function () {
        if (self.doRL) {
            let steps = parseInt(document.getElementById('selectiter').value);
            for (let i=0; i < steps; i++) {
                self.doIteration();
            }
        }
    }

    self.doIteration = function() {
        self.RL.config = self.getConfig();
        self.RL.learningIteration();
    }

    self.getConfig = function() {
        return {
            alpha   : parseFloat(document.getElementById('selectstep').value),
            gamma   : parseFloat(document.getElementById('selectgamma').value),
            epsilon : parseFloat(document.getElementById('selectepsilon').value)
        };
    }

    self.setHTML = function() {
        self.createCanvas(self.env.width * self.sqSize + 1, self.env.height * self.sqSize + 1);
        self.controlDiv = self.create('div', 'ControlContainer', self.fg.width + 20, 620, 400, 600);
        
        self.controlDiv.innerHTML += "<label id='labelstep'>Alpha:</label>";
        self.controlDiv.innerHTML += "<label id='labelepsilon'>Epsilon:</label>";
        self.controlDiv.innerHTML += "<label id='labelgamma'>Gamma:</label>";
        self.controlDiv.innerHTML += "<label id='labeliter'>Iteration Speed:</label>";
        self.controlDiv.innerHTML += "<input id='selectstep' type='number' min='0' max='1' step='0.1' value='0.1'>";
        self.controlDiv.innerHTML += "<input id='selectepsilon' type='number' min='0' max='1' step='0.1' value='0.1'>";
        self.controlDiv.innerHTML += "<input id='selectgamma' type='number' min='0' max='1' step='0.1' value='0.9'>";
        self.controlDiv.innerHTML += "<input id='selectiter' type='number' min='1' max='100000' step='1' value='1'>";
        
        self.controlDiv.innerHTML += "<button id='toggleButton'>Toggle Iteration</button>";
        self.controlDiv.innerHTML += "<button id='stepButton'>Single Iteration</button>";

        var stylePrefix = 'position:absolute;';
        var ch = '25px', c1l = '0px', c2l = '150px', c3l = '425px', c1w = '140px', c2w = '250px', c3w = '150px';

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

    self.tableCreate = function() {
        var table = document.getElementById('blackjackTable')
        for(var r = 0; r <= self.env.playerCards.length; r++){
            var x = table.insertRow(r);
            for(var c = 0; c <= self.env.dealersCards.length; c++){
                var y = x.insertCell(c);
                if(r > 0 && c > 0)
                {
                    table.rows[r].cells[c].innerHTML = self.RL.getPreferredAction(r-1,c-1);
                }
            }
        }    
        for(var r = 0; r < self.env.playerCards.length; r++){
            table.rows[r+1].cells[0].innerHTML = self.env.playerCards[r][0] + " " + self.env.playerCards[r][1];
            table.rows[r+1].cells[0].style.backgroundColor = "lightblue";
        }
        for(var c = 0; c < self.env.dealersCards.length; c++){
            if (self.env.dealersCards[c] == 1) { table.rows[0].cells[c+1].innerHTML = 'A'; }
            else { table.rows[0].cells[c+1].innerHTML = self.env.dealersCards[c]; }
            table.rows[0].cells[c+1].style.backgroundColor = "lightblue";
        }
        for(var r = 0; r <= self.env.playerCards.length; r++){
            for(var c = 0; c <= self.env.dealersCards.length; c++){
                if(r > 0 && c > 0)
                {  
                    let action = self.RL.getPreferredAction(r-1,c-1);
                    table.rows[r].cells[c].innerHTML = action;
                    if(action == 'stand') {
                        table.rows[r].cells[c].style.backgroundColor = "yellow";
                    }
                    else if(action == 'hit') {
                        table.rows[r].cells[c].style.backgroundColor = "red";
                    }
                    else { table.rows[r].cells[c].style.backgroundColor = "green"; }
                }
            }
        }
        var table2 = document.getElementById('winLossTable')
        for (let r = 0; r < 3; r++) {
            let row = table2.insertRow(r);
            for (let c = 0; c < 3; c++) {
                let cell = row.insertCell(c);
            }
        }
        table2.rows[0].cells[0].innerHTML = "Wins";
        table2.rows[0].cells[1].innerHTML = "Losses";
        table2.rows[0].cells[2].innerHTML = "Ties";
    }

    
    self.setHTML();
    self.RL = RLBlackjack(env, self.getConfig());
    return self;
}
