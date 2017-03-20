
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
    this.openMoves = [];
    this.ended = false;
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
    this.board[row][column] = this.player;
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
            this.openMoves.push(state.open);
            state.open = null;
        }
    } else if (space === -(this.player) && state.last === this.player) {
        state.closed = true;
        state.open = null;
    } else if (space === empty && state.closed) {
        this.openMoves.push([row, column].join(' '));
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
    this.openMoves = [];
    this.findHorizontal();
    this.findVertical();
    this.findMajorD();
    this.findMinorD();
}

ourGame = new Game(8);

methods = {}

methods.getState = function(req, res) {
    ourGame.findOpenMoves();
    res.send(ourGame);
}

methods.makeMove = function(req, res) {
    let row = req.body.row;
    let column = req.body.column;
    let player = req.body.player;

    if ( player !== ourGame.player || !ourGame.openMoves.includes([row, column].join(' ')) ){
        //invalid move, client data doesn't match with what's on the server;
        console.warn('Invalid Move!');
    } else{
        ourGame.setSpace(row, column);
        ourGame.flipFrom(row, column);
        ourGame.changePlayer();
        ourGame.findOpenMoves();
    }

    res.send(ourGame);
}

methods.resetGame = function(req, res){
    ourGame = newGame(8);
    res.send(ourGame);
}

module.exports = methods;