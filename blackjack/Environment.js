// Reinforcement Learning GridWorld Environment

Environment = function () {
    var self = {};
    self.playerCards = [['Soft',12], ['Soft',13] ,['Soft',14], ['Soft',15],['Soft',16],['Soft',17], ['Soft',18], 
    ['Soft',19], ['Soft', 20], ['Soft', 21], ['Hard',4],['Hard',5], ['Hard',6], ['Hard',7], ['Hard',8], ['Hard',9], ['Hard',10],
    ['Hard',11], ['Hard',12], ['Hard',13], ['Hard',14], ['Hard',15], ['Hard',16], ['Hard',17], ['Hard',18], ['Hard',19], ['Hard',20], ['Hard',21]];
    self.dealersCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    self.width = self.dealersCards.length;
    self.height = self.playerCards.length;

    self.actions = ['hit','stand'];

    self.getActions = function() {
        return self.actions;
    }

    return self;
}
/*['Pair 2','Pair 3','Pair 4','Pair 5','Pair 6','Pair 7','Pair 8','Pair 9','Pair 10','Pair A',
    'Soft 13','Soft 14','Soft 15','Soft 16','Soft 17','Soft 18','Soft 19','Soft 20',*/