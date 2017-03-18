angular.module('App', [])
    .controller('Game', ['$log', function($log){

        var n = 8;
        var board = [];
        for (let i = 0; i < n; i++){
            let line = [];
            for (let j = 0; j < n; j++) {
                line.push({white: false, black: false, option: false, hover: false});
            }
            board.push(line);
        }

        var methods = {};

        methods.debug = $log;

        methods.click = function(row, column, space) {
            if(space.option){
                this.debug.log(row, column);
            }
        }
        
        
        board[3][3].white = true;
        board[4][4].white = true;
        board[3][4].black = true;
        board[4][3].black = true;

        board[2][4].white = true;
        board[2][4].option = true;


        angular.extend(this, {board: board}, methods);
    }]);