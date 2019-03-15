
var playerChoices = [[]];
RLBlackjack = function(env, config){
    self.env = env;
    self.config = config;
    self.Q = [];
    self.P = [];
    self.wins = 0;
    self.losses = 0;
    self.ties = 0;
    self.state;

    self.init = function() {
        // Initialize State value
        for (x=0; x<self.env.width; x++) {
            self.Q.push([]);
            for (y=0; y<self.env.height; y++) {
                self.Q[x].push([]);
                for (a=0; a<self.env.actions.length; a++) {
                    self.Q[x][y].push(0);
                }
            }
        }
        // initialize Policy values 
        for (x=0; x<self.env.width; x++) {
            self.P.push([]);
            for (y=0; y<self.env.height; y++) {
                self.P[x].push([]);
                for (a=0; a<self.env.actions.length; a++) {
                    self.P[x][y].push(1.0 / self.env.actions.length);
                }
            }
        }
    }

    self.learningIteration = function() {        
        if (state == "Win" || state  == "Loss" || state == "Tie")  { self.state = self.getRandomState(); }  
        let action = self.selectActionFromPolicy(self.state);        
        let nextState = self.getNextState(self.state, action);
        let reward = self.getReward(nextState);   
        self.updateQ(self.state, action, reward, nextState);
        self.updateP(self.state);
        self.tableUpdate(self.state);
        self.state = nextState;
    }
    
    self.dealCard = function() {
        var card = Math.floor(Math.random()* 11);
        return card;
    }
    
    self.getReward = function(nextState) {
        if(nextState == "Win"){
            self.wins += 1;
            return 1;
        }
        else if(nextState == "Loss"){
            self.losses += 1;
            return -1;
        }
        else if (nextState == "Tie"){
            self.ties += 1;
            return 0;
        }
        else {
            return 0;
        }
    }

    self.playDealersHand = function(dealersCard) {
        var handValue = dealersCard + self.dealCard();
        if(handValue == 11 && (dealersCard == 1 || dealersCard == 10)) { // Assumption here: dealer will hit on any soft cards, except for soft 21 on first pair
            return 21;
        }
        while(handValue < 17) {
            handValue += self.dealCard();
        }
        return handValue;
    }

    self.updateQ = function(state, action, reward, nextState) {
        let a = self.config.alpha; // TODO: Set these from user inp
        let g = self.config.gamma;
        let aIndex = self.getIndex(action, self.env.actions);
        let pIndex = self.findPlayerCardIndex(state[0]);
        let dIndex = self.findDealerCardIndex(state[1]);
        let currentVal = self.Q[dIndex][pIndex][aIndex];
        self.Q[dIndex][pIndex][aIndex] = currentVal + a * (reward + g*self.getMaxActionValue(nextState) - currentVal);
    }

    self.updateP = function(state) {
        let maxActionValue = self.getMaxActionValue(state);
        let maxActions = self.getMaxActions(state, maxActionValue);
        let pIndex = self.findPlayerCardIndex(state[0]);
        let dIndex = self.findDealerCardIndex(state[1]);
        for(let a = 0; a < self.env.actions.length; a++){
            if(self.checkArray(self.env.actions[a], maxActions)) {
                self.P[dIndex][pIndex][a] = 1.0/maxActions.length;
            }
            else { self.P[dIndex][pIndex][a] = 0; }
        }
    }

    self.getNextState = function(state, a) {
        if(a == "stand") {
            let dealersVal = self.playDealersHand(state[1]);
            if (dealersVal > 21 || dealersVal < state[0][1] ) {
                return "Win";
            }
            else if (dealersVal > state[0][1]) {
                return "Loss";
            }
            else { return "Tie"; }
        }
        else if (a == "hit"){
            let card = self.dealCard();
            newVal = state[0][1] + card;
            let newCards;
            if(state[0][0] == 'Soft' && newVal < 22) {
                newCards = ['Soft', newVal];
            }
            else if (state[0][0] == 'Soft' && newVal > 22){
                newCards = ['Hard', newVal - 10];
            }
            
            else if (state[0][0] == 'Hard' && newVal < 22 ) {
                newCards = ['Hard', newVal];
            }
            else {
                return "Loss";
            }
            return [newCards, state[1]];            
        }
    }
    self.findPlayerCardIndex = function(card) {
        for(let i = 0; i < self.env.playerCards.length; i++ ){
            if(card[0] == self.env.playerCards[i][0] && card[1] == self.env.playerCards[i][1]){
                return i;
            }
        }
    }
    self.findDealerCardIndex = function(card) {
        for(let i = 0; i < self.env.dealersCards.length; i++ ){
            if(card == self.env.dealersCards[i]){
                return i;
            }
        }
    }

    self.getMaxActionValue = function(state) {
        if (state == "Win" || state  == "Loss" || state == "Tie")  { return 0;}
        let maxActionValue = -100000;
        let pIndex = self.findPlayerCardIndex(state[0]);
        let dIndex = self.findDealerCardIndex(state[1]);
        for(let a = 0; a < self.env.actions.length; a++) {
            let aValue = self.Q[dIndex][pIndex][a];
            if(aValue > maxActionValue) { maxActionValue = aValue; }
        }
        return maxActionValue;
    }

    self.getMaxActions = function(state, value) {
        let maxActions = [];
        let pIndex = self.findPlayerCardIndex(state[0]);
        let dIndex = self.findDealerCardIndex(state[1]);
        for(a = 0; a < self.env.actions.length; a++) {
            let aValue = self.Q[dIndex][pIndex][a];
            if( aValue == value ){ 
                maxActions.push(self.env.actions[a]);
            }
        }
        return maxActions;
    }

    self.selectActionFromPolicy = function() {
        var epsilon = self.config.epsilon;
        if (Math.random() < epsilon) { return self.getRandomAction(); }
        else {
            let maxActionValue = self.getMaxActionValue(self.state);
            let maxActions = self.getMaxActions(self.state,maxActionValue);
            let randMaxActionInd = Math.floor(Math.random() * Math.floor(maxActions.length));
            return maxActions[randMaxActionInd];
        }
    }

    self.getRandomAction = function() {
        let a = Math.floor(Math.random() * self.env.actions.length);
        return self.env.actions[a];
    }

    self.getRandomState = function() {
        let x = Math.floor(Math.random() * self.env.height);
        let y = Math.floor(Math.random() * self.env.width);
        let playerCards = self.env.playerCards[x];
        let dealerCard = self.env.dealersCards[y];
        let state = [playerCards, dealerCard];
        return state;
    }

    self.getIndex = function(value){
        for(a = 0; a < self.env.actions.length; a++){
            if(value == self.env.actions[a]){
                return a;
            }
        }
        return undefined;
    }
    
    self.tableUpdate = function(state) {
        var table = document.getElementById('blackjackTable');
        let pIndex = self.findPlayerCardIndex(state[0]);
        let dIndex = self.findDealerCardIndex(state[1]);
        let action = self.getPreferredAction(pIndex,dIndex);
        table.rows[pIndex+1].cells[dIndex+1].innerHTML = action;
        if(action == 'stand') {
            table.rows[pIndex+1].cells[dIndex+1].style.backgroundColor = "yellow";
        }
        else if(action == 'hit') {
            table.rows[pIndex+1].cells[dIndex+1].style.backgroundColor = "red";
        }
        else { table.rows[pIndex+1].cells[dIndex+1].style.backgroundColor = "green"; }
        var table2 = document.getElementById('winLossTable');
        let total = self.wins+self.losses+self.ties;
        table2.rows[1].cells[0].innerHTML = self.wins;
        table2.rows[1].cells[1].innerHTML = self.losses;
        table2.rows[1].cells[2].innerHTML = self.ties;
        table2.rows[2].cells[0].innerHTML = ((self.wins / total)*100).toFixed(2) + "%";
        table2.rows[2].cells[1].innerHTML = ((self.losses / total)*100).toFixed(2) + "%";
        table2.rows[2].cells[2].innerHTML = ((self.ties / total)*100).toFixed(2) + "%";

    }

    self.getPreferredAction = function(playerCardInd, dealerCardInd) {
        let count = 0;
        let action = "";
        for(let a = 0; a < self.env.actions.length; a++) {
            if(self.P[dealerCardInd][playerCardInd][a] > 0){
                if(count > 0) {
                    action = action + "/" + self.env.actions[a];
                }
                else{
                    action = self.env.actions[a];
                }
                count++;
            }    
        }
        return action;
    }

    self.checkArray = function (valueToCheck, arrayToCheck){
        for(let i = 0; i < arrayToCheck.length; i++ ){
            if(valueToCheck == arrayToCheck[i] ) { return true;}
        }
        return false;
    }

    self.init();
    return self;
}
