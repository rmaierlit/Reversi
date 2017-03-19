angular.module('App', [])
    .controller('Game', ['$log', function($log){

        const n = 8;
        var board = [];
        for (let i = 0; i < n; i++){
            let line = [];
            for (let j = 0; j < n; j++) {
                line.push(0);
            }
            board.push(line);
        }

        const classesByCode = {
             '0': 'empty',
             '1': 'white',
            '-1': 'black',
             '2': 'opwhite',
            '-2': 'opblack',
        }

        var methods = {};

        methods.debug = $log;

        methods.click = function(row, column, space) {
            if(space === 2 || space == -2){
                //if space is a white or black open move
                this.debug.log(row, column);
            }
        }

        methods.evalClass = function(code){
            return classesByCode[code];
        }
        
        
        board[3][3] = 1;
        board[4][4] = 1;
        board[3][4] = -1;
        board[4][3] = -1;

        board[2][4] = 2;


        board[4][5] = -2;


        angular.extend(this, {board: board}, methods);
    }]);