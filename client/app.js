angular.module('App', [])
    .controller('Game', ['$log', '$http', '$scope', function($log, $http, $scope){

        const classesByCode = {
             '0': 'empty',
             '1': 'black',
            '-1': 'white',
             '2': 'opblack',
            '-2': 'opwhite',
        }

        var updateBoard = function(game) {
            let row, column;
            for (var i = 0; i < game.openMoves.length; i++){
                [row, column] = game.openMoves[i];
                console.log(row, column);
                game.board[row][column] = game.player * 2;
                //for player white (i.e. 1) will set square to be 2 ('open for white');
            }
            console.log(game);
            public.state.board = game.board;
        }

        var public = {};

        public.state = {}

        public.state.board = [[]];

        public.debug = $log;

        public.click = function(row, column, space) {
            if(space === 2 || space == -2){
                //if space is a white or black open move
                this.debug.log(row, column);
            }
        }

        public.evalClass = function(code){
            return classesByCode[code];
        }

        public.getBoard = function(){
            $http({
                method: 'GET',
                url: '/games/name'
            }).then(response => updateBoard(response.data), error => {
                $log.error(error)
            });
        }

        public.getBoard();

        angular.extend(this, public);
    }]);