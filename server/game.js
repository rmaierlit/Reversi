
//aliases for codes used in the board
const empty = 0, black = 1, white = -1;

const directions = {
    down: [1,0],
    right: [0,1],
    up: [-1,0],
    left: [0,-1],
    downright: [1,1],
    upleft: [-1,-1],
    downleft: [1, -1],
    upright: [-1, 1]
}

function Game(n){
    this.n = n;

    this.board = [];
    for (let i = 0, n = this.n; i < n; i++){
        let line = [];
        for (let j = 0; j < n; j++) {
            line.push(0);
        }
        this.board.push(line);
    }

    this.board[3][3] = white;
    this.board[4][4] = white;
    this.board[3][4] = black;
    this.board[4][3] = black;

    this.player = black;

    this.pieceCount = {
         "1": 2,
        "-1": 2
    };

    this.openSet = new Set(); //stores the open moves on the server
    this.openMoves = []; //array format for sending moves to the client
    this.blocked = 0; //1 if black player had no moves, -1 if white player had no moves
    this.winner = 99; //1 for black, -1 for white, 0 for tie, 99 for "no winner yet"
    this.findOpenMoves();
}

Game.prototype.outOfBounds = function(number) {
    if (number < 0 || number >= this.n){
        return true
    }

    return false;
}

Game.prototype.atSpace = function(row, column){
    if (this.outOfBounds(row) || this.outOfBounds(column)){
        return null;
    }
    return this.board[row][column];
}

Game.prototype.setSpace = function(row, column){
    if (this.atSpace(row, column) === -(this.player)){
        //subtract one from oppenents count if you are flipping his piece.
        this.pieceCount[-(this.player)]--;
    }
    this.board[row][column] = this.player;
    this.pieceCount[this.player]++;
}

Game.prototype.changePlayer = function(){
    ourGame.player = -(ourGame.player); //change player between black and white
}

Game.prototype.evalSpace = function(state, coords){
    //state.open has the last empty space
    //state.closed is true if the current run is bounded by one of the player's squares
    let [row, column] = coords;
    let space = this.atSpace(row, column);

    //end sequence if out of bonds
    if (space === null) {
        state.end = true;
        return state;
    }

    if (space === this.player && state.last === -(this.player)){
        state.closed = false;
        if (state.open !== null){
            this.openSet.add(state.open);
            state.open = null;
        }
    } else if (space === -(this.player) && state.last === this.player) {
        state.closed = true;
        state.open = null;
    } else if (space === empty && state.closed) {
        this.openSet.add([row, column].join(' '));
        state.closed = false;
    } else if (space === empty) {
        state.open = [row, column].join(' ');
    }

    state.last = space;

    return state;
}

Game.prototype.evalSequence = function(coords, mod){
    var state = {
        open: null,
        closed: false,
        last: null,
        end: false
    }

    do{
        state = this.evalSpace(state, coords);
        coords = [coords[0] + mod[0], coords[1] + mod[1]];

    } while (!state.end) //until the function ends up out of bounds

}

Game.prototype.countFlip = function(player){
    //update the count when a piece is flipped
    this.pieceCount[player]++; //add one to the players color
    this.pieceCount[-(player)]--; //subtract one from the oppenents color
}

Game.prototype.flip = function(row, column, mod) {
    var closed = false;
    if (this.atSpace(row, column) === -(this.player)){
        closed = this.flip(row + mod[0], column + mod[1], mod);
        //closed will be true if there's a matching piece on the end
        if(closed){
            this.setSpace(row, column, this.player);
        }
    } else if(this.atSpace(row, column) === this.player){
        closed = true;
    }
    return closed;
}

Game.prototype.flipFrom = function(row, column) {
    for(key in directions){
        let mod = directions[key]
        this.flip(row + mod[0], column + mod[1], mod);
    }
}

Game.prototype.findHorizontal = function(){
    for (var i = 0; i < this.n; i++) {
        this.evalSequence([i,0], directions['right']);
    }
}

Game.prototype.findVertical = function(){
    for (var i = 0; i < this.n; i++) {
        this.evalSequence([0,i], directions['down']);
    }
}

Game.prototype.findMajorD = function() {
    for (var i = 0; i < this.n - 2; i++){
        this.evalSequence([0,i], directions['downright']);
    }
    for (var i = 1; i < this.n - 2; i++){
        this.evalSequence([i,0], directions['downright']);
    }
}

Game.prototype.findMinorD = function() {
    for (var i = 2; i < this.n; i++) {
        this.evalSequence([i,0], directions['upright']);
    }
    for (var i = 1; i < this.n - 2; i++) {
        this.evalSequence([this.n - 1, i], directions['upright']);
    }
}

Game.prototype.findOpenMoves = function(){
    this.openSet.clear();
    this.findHorizontal();
    this.findVertical();
    this.findMajorD();
    this.findMinorD();
    this.openMoves = [...this.openSet]; //spread operator creates an array from the set
}

Game.prototype.checkForBlocked = function() {
    if (this.openMoves.length === 0) {
        //if a player has no moves, their turn is skipped; find moves for the other player
        this.blocked = this.player;
        this.changePlayer();
        this.findOpenMoves();
    } else {
        this.blocked = 0;
    }
}

Game.prototype.checkForWinner = function() {
    if (this.openMoves.length === 0){
        //at this point, no moves in the move list would mean neither player had a move open
        //this would mean the game is over and the winner must be determined
        this.calculateWinner();
    }
}

Game.prototype.calculateWinner = function() {
    //when the game is oven, the game is over, and whoever has the most pieces on the board wins
    if (this.pieceCount[black] > this.pieceCount[white]){
            this.winner = black;
        } else if (this.pieceCount[white] > this.pieceCount[black]){
            this.winner = white;
        } else {
            //if the counts are equal, set winner to zero, meaning a tie
            this.winner = 0;
        }
}

Game.prototype.makeMove = function(row, column, player) {
    if ( player !== this.player || !this.openMoves.includes([row, column].join(' ')) ){
        //invalid move, client data doesn't match with what's on the server;
        console.warn('Invalid Move!');
    } else{
        this.setSpace(row, column);
        this.flipFrom(row, column);
        this.changePlayer();
        this.findOpenMoves();
        this.checkForBlocked();
        this.checkForWinner();
    }
}

var ourGame = new Game(8);

var helpers = {

    getBoardState: function(req, res) {
        res.send(ourGame);
    },

    submitMove: function(req, res) {
        let row = req.body.row;
        let column = req.body.column;
        let player = req.body.player;

        ourGame.makeMove(row, column, player);
        res.send(ourGame);
    },

    resetGame: function(req, res){
        ourGame = new Game(8);
        res.send(ourGame);
    },
}

module.exports = helpers;