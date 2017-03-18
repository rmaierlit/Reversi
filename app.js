angular.module('App', [])
    .controller('Game', function(){

        var n = 8;
        var board = [];
        for (let i = 0; i < n; i++){
            let line = [];
            for (let j = 0; j < n; j++) {
                line.push({classes:'', hover: false})
            }
            board.push(line);
        }

        board[0][5].classes = 'p w';
        board[5][0].classes = 'p b';
        board[4][4].classes = 'o w p';
        angular.extend(this, {board: board});

        //console.log(this.board);
    });