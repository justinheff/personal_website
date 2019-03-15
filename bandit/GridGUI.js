GridGUI = function (container) {
    // construct a GUI in the given container
    var self = GUI(container);
    self.pixelWidth = 1280;
    self.pixelHeight = 720;

    self.banditType = 'meanProbability';
    self.maxBandit = 0;

    self.update = function() {
        
        
    }

    self.resetChart = function() {
        self.chart = Highcharts.chart('ChartDiv', {
			chart: { animation: false, zoomType: 'xy', type: 'line' },
			title: { text: 'Bandit Function Chart' },
			yAxis: { title: { text: 'Value' } },
			xAxis: { title: { text: 'Episode' } },
			legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle' },
            series: []
        });
    }

    setValueEstimate = function(method) {
        self.hideElements(['labelstep', 'selectstep']);
        if (method == 'target') { self.showElements(['labelstep', 'selectstep']); }
    }

    self.hideElements = function(elements) {
        for (let i=0; i<elements.length; i++) {
            document.getElementById(elements[i]).style.display = 'none';
        }
    }

    self.showElements = function(elements) {
        for (let i=0; i<elements.length; i++) {
            document.getElementById(elements[i]).style.display = 'inline';
        }
    }

    setSelectionMethod = function(method) {
        self.hideElements(['labeleps', 'selecteps', 'labelc', 'selectc']);
        if (method == 'epsilonGreedy')  { self.showElements(['labeleps', 'selecteps']) }
        if (method == 'UCB')            { self.showElements(['labelc', 'selectc']) }
    }

    shuffleArray = function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    self.setBandits = function(numBandits) {
        // fill an array of bandits each with sigma 1 and mean between -10 and 10
        console.log(numBandits);
        var maxValue = -1000000, maxBandit = -1;
        var bandits = [];
        for (let i=0; i < numBandits; i++) {
            let value = Math.random();
            if (self.banditType == 'meanProbability') {
                bandits.push(Bandit_ProbVal(value, 1));
            } else if (self.banditType == 'meanStatic') {
                bandits.push(Bandit_Static(value));
            }
            
            if (value > maxValue) {
                maxValue = value;
                maxBandit = i;
            }            
        }

        self.bandits = bandits;
        self.maxBandit = maxBandit;
    }

    self.getConfig = function() {
        return {
            valueEstimate   : document.getElementById('selectvalue').value,
            selection       : document.getElementById('selectalg').value,
            initialValue    : parseFloat(document.getElementById('selectinit').value),
            stepSize        : parseFloat(document.getElementById('selectstep').value),
            epsilon         : parseFloat(document.getElementById('selecteps').value),
            ucbC            : parseFloat(document.getElementById('selectc').value),
            numBandits      : parseInt(document.getElementById('selectb').value)
        };
    }

    self.runExperiment = function() {

        let config = self.getConfig();
        self.setBandits(config.numBandits);

        let selector = BanditSelector(config);
        let numMaxChosen = 0;
        let series = [];
        let sum = 0;
        let samples = parseInt(document.getElementById('selectsamples').value);

        for (let i=1; i <= samples; i++) {
            let selection = selector.chooseBandit();
            if (selection === self.maxBandit) { numMaxChosen++; }
            let value = self.bandits[selection].getValue();
            selector.updateBandit(selection, value);
            series.push([i, numMaxChosen/i]);
        }

        let key = 'I(' + config.initialValue + '), ';
        if (config.valueEstimate == 'average') { key += 'A, '; }
        if (config.valueEstimate == 'target') { key += 'T(' + config.stepSize + '), '; }
        if (config.selection == 'greedy') { key += 'G'; }
        if (config.selection == 'epsilonGreedy') { key += 'EG(' + config.epsilon + ')'; }
        if (config.selection == 'UCB') { key += 'UCB(' + config.ucbC + ')'; }

        self.chart.addSeries({name:key, data:series});
    }

    self.setHTML = function() {
        
        self.bannerDiv  = self.create('div', 'BannerContainer',    0,   0, 400,  40);
        self.controlDiv = self.create('div', 'ControlContainer',   0,  60, 400, 600);
        self.chartDiv   = self.create('div', 'ChartDiv',         425,   0, 800, 450);
        //self.textDiv    = self.create('div', 'TextContainer',      0, 450, 500, 400);
        
        self.controlDiv.innerHTML += "<label id='labelval'>Value Estimate:</label>";
        self.controlDiv.innerHTML += "<label id='labelalg'>Bandit Selection:</label>";
        self.controlDiv.innerHTML += "<label id='labelinit'>Initial Value:</label>";
        self.controlDiv.innerHTML += "<label id='labelstep'>Step Size:</label>";
        self.controlDiv.innerHTML += "<label id='labeleps'>Epsilon:</label>";
        self.controlDiv.innerHTML += "<label id='labelc'>UCB C:</label>";
        self.controlDiv.innerHTML += "<label id='labelb'>Num Bandits:</label>";
        self.controlDiv.innerHTML += "<label id='labelsamples'>Num Samples:</label>";
        self.controlDiv.innerHTML += "<label id='labeldist'>Bandit Distribution:</label>";
        self.controlDiv.innerHTML += "<select id='selectvalue' onchange='setValueEstimate(value)';> \
                                        <option value='target'>Step to Target</option> \
                                        <option value='average'>Sample Average Method</option></select>";
        self.controlDiv.innerHTML += "<select id='selectalg' onchange='setSelectionMethod(value)';> \
                                        <option value='EG'>Epsilon-Greedy</option>\
                                        <option value='UCB'>Upper Confidence Bound (UCB)</select>";
        self.controlDiv.innerHTML += "<select id='selectdist' onchange='self.banditType = value;'> \
                                        <option value='meanProbability'>Mean Probability of One</option> \
                                        <option value='meanStatic'>Mean Static Return</option></select>";
        self.controlDiv.innerHTML += "<input id='selectstep' type='number' min='0' max='1' step='0.1' value='0.5'>";
        self.controlDiv.innerHTML += "<input id='selectc' type='number' min='0' max='10' step='0.1' value='1.0'>";
        self.controlDiv.innerHTML += "<input id='selectinit' type='number' min='0' max='1' step='0.1' value='1.0'>";
        self.controlDiv.innerHTML += "<input id='selecteps' type='number' min='0' max='1' step='0.01' value='0.1'>";
        self.controlDiv.innerHTML += "<input id='selectb' type='number' min='0' max='100' step='1' value='10'>";
        self.controlDiv.innerHTML += "<input id='selectsamples' type='number' min='0' max='10000' step='100' value='1000'>";
        
        self.controlDiv.innerHTML += "<button id='graphButton'>Graph Selection Method</button>";
        self.controlDiv.innerHTML += "<button id='resetButton'>Reset Chart</button>";
        

        var stylePrefix = 'position:absolute;';
        var ch = '25px', c1l = '0px', c2l = '150px', c3l = '425px', c1w = '140px', c2w = '250px', c3w = '150px';
        
        document.getElementById('labelval').style       = stylePrefix + ' left:' + c1l + '; top:0;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectvalue').style    = stylePrefix + ' left:' + c2l + '; top:0;   width:' + c2w + '; height:' + ch + ';';
        document.getElementById('labelinit').style      = stylePrefix + ' left:' + c2l + '; top:40;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectinit').style     = stylePrefix + ' left:250px;       top:40;   width:150px ; height:' + ch + '; text-align: center;'
        document.getElementById('labelstep').style      = stylePrefix + ' left:' + c2l + '; top:80;   width:' + c1w + '; height:' + ch + '; ';
        document.getElementById('selectstep').style     = stylePrefix + ' left:250px;       top:80;   width:150px ; height:' + ch + '; text-align: center;';
        document.getElementById('labelalg').style       = stylePrefix + ' left:' + c1l + '; top:120;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectalg').style      = stylePrefix + ' left:' + c2l + '; top:120;   width:' + c2w + '; height:' + ch + ';';
        document.getElementById('labeleps').style       = stylePrefix + ' left:' + c2l + '; top:160;   width:' + c1w + '; height:' + ch + '; ';
        document.getElementById('selecteps').style      = stylePrefix + ' left:250px;       top:160;   width:150px ; height:' + ch + ';  text-align: center; ';
        document.getElementById('labelc').style         = stylePrefix + ' left:' + c2l + '; top:160;   width:' + c1w + '; height:' + ch + '; display:none;';
        document.getElementById('selectc').style        = stylePrefix + ' left:250px;       top:160;   width:150px ; height:' + ch + ';  text-align: center; display:none;';
        document.getElementById('labelb').style         = stylePrefix + ' left:' + c1l + '; top:200;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectb').style        = stylePrefix + ' left:' + c2l + '; top:200;   width:' + c2w + '; height:' + ch + '; text-align: center;';
        document.getElementById('labeldist').style      = stylePrefix + ' left:' + c1l + '; top:240;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectdist').style     = stylePrefix + ' left:' + c2l + '; top:240;   width:' + c2w + '; height:' + ch + ';';
        document.getElementById('labelsamples').style   = stylePrefix + ' left:' + c1l + '; top:280;   width:' + c1w + '; height:' + ch + ';';
        document.getElementById('selectsamples').style  = stylePrefix + ' left:' + c2l + '; top:280;   width:' + c2w + '; height:' + ch + '; text-align: center;';

        document.getElementById('graphButton').style    = stylePrefix + ' left:0px; top:400;  width:200px' + '; height:' + ch + ';';
        document.getElementById('resetButton').style    = stylePrefix + ' left:210px; top:400;  width:150px' + '; height:' + ch + ';';
        
        document.getElementById('selectb').onchange     = function() {  }
        document.getElementById('resetButton').onclick  = function() { console.log('Hello!'); self.resetChart(); }
        document.getElementById('graphButton').onclick  = function() { self.runExperiment(); }
        testContainer = self.testDiv;
    }
    self.setHTML();
    self.setBandits(self.getConfig().numBandits);
    self.resetChart();
    return self;
}
