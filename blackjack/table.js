
var playerChoices = [[]];
RLBlackjack = function(env, config){
    self.env = env;
    self.config = config;
    self.Q = [];
    self.P = [];

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


    self.dealCard = function() {
        var card = Math.floor(Math.random()* 11);
        return card;
    }

    self.playHand = function() {
        var dealersHand = [self.dealCard, self.dealCard];
        var playersHand = [self.dealCard, self.dealCard];
        var playerHandIndex = self.env.playerCards.findIndex(evaluateCards(playerHand));
        var dealersHandIndex = self.env.dealersCards.findIndex(dealersHand[0]);
        var action = choosePlayerAction(playersHand, dealersHand);
        if(action == 'Hit') {
            playersHand.push(dealCard());
        }
        else {
            this.self.playDealersHand(dealersHand);
        }
    }

    self.playDealersHand = function(dealersHand) {
        var handValue = dealersHand[0] + dealersHand[1];
        while(handValue < 17) {
            handValue += self.dealCard();
            if(handValue > 21){
                return -1;
            }
        }
        return handValue;
    }

    self.evaluateCards = function(cards) {
        var cardsValue;
        if(cards[0] == 1) {
            cardsValue = 11 + cards[1];
            return "Soft " + cardsValue.toString();
        }
        else if (cards[1] == 1){
            cardsValue = 11 + cards[0];
            return "Soft " + cardsValue.toString();
        }
        else {
            cardsValue = cards[0] + cards[1];
            return cardsValue.toString();
        }
    }

    self.updateQ = function(state, action, reward, nextState) {
        let a = self.config.alpha;
        let g = self.config.gamma;
        let aIndex = self.getIndex(action, self.env.actions);
        let currentVal = self.Q[state[0]][state[1]][aIndex];
        self.Q[state[0]][state[1]][aIndex] = currentVal + a * (reward + g*self.getMaxActionValue(nextState) - currentVal);
    }

    self.updateP = function() {
        let maxActionValue = self.getMaxActionValue(state);
        let maxActions = self.getMaxActions(state, maxActionValue);
        for(let a = 0; a < self.env.actions.length; a++){
            if(self.checkArray(self.env.actions[a], maxActions)) {
                self.P[state[0]][state[1]][a] = 1.0/maxActions.length;
            }
            else { self.P[state[0]][state[1]][a] = 0; }
        }
    }

    self.getMaxActionValue = function(state) {
        let maxActionValue = -100000;
        for(a = 0; a < self.env.actions.length; a++) {
            let aValue = self.Q[state[0]][state[1]][a];
            if(aValue > maxActionValue) { maxActionValue = aValue; }
        }
        return maxActionValue;
    }

    self.init();
    return self;
}
   
/*
function tableCreate() {
    var table = document.getElementById('blackjackTable')
    for(var r = 0; r <= playerCards.length; r++){
        var x = table.insertRow(r);
        for(var c = 0; c <= dealersCard.length; c++){
            var y = x.insertCell(c);
            if(r < playerCards.length && c < dealersCard.length){
                //playerChoices[r][c] = 'stand';
            }
        }
    }    
    for(var r = 0; r < playerCards.length; r++){
        table.rows[r+1].cells[0].innerHTML = playerCards[r];
    }
    for(var c = 0; c < dealersCard.length; c++){
        table.rows[0].cells[c+1].innerHTML = dealersCard[c];
    }
}*/
