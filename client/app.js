angular.module('App', [])
    .controller('Game', ['$log', '$http', '$timeout', function($log, $http, $timeout){

        const classesByCode = {
             '0': 'empty',
             '1': 'black',
            '-1': 'white',
             '2': 'opblack',
            '-2': 'opwhite',
        }
        
        var preload = true;

        var updateBoard = function(game) {
            game.openMoves.forEach( move => {
                let [row, column] = move.split(' ');
                game.board[row][column] = game.player * 2;
                //for player white (i.e. -1) will set square to be -2 ('open for white');
            });
            public.state.board = game.board;
            public.state.player = game.player;
            $log.log(game.pieceCount, 'winner =', game.winner);

            document.body.classList.remove(public.background(-(game.player)));
            document.body.classList.add(public.background(game.player));

            if(preload){
                //avoids intial css transition
                document.body.classList.remove('preload');
                preload = false;
            } else{
                //removes update class applied when move was sent over http
                $timeout(updateDone, 1300);
            }
        }

        var updateDone = function() {
            document.body.classList.remove('updating');
        }

        //methods accessable in scope
        var public = {};

        public.state = {}

        public.state.board = [[]];
        public.state.player = -1;

        public.debug = $log;

        public.background = function(code) {
            return classesByCode[code] + 'Background';
        }

        public.click = function(row, column, space) {
            if(space === 2 || space === -2){
                //if space is a white or black open move matching current player
                document.body.classList.add('updating');
                let data = {row, column, player: public.state.player}
                $http.post('/games/name', data)
                    .then(response => updateBoard(response.data),
                          error => $log.error(error)
                    );
            }
        }

        public.evalClass = function(code){
            return classesByCode[code];
        }

        public.getBoard = function(){
            $http.get('/games/name')
                .then(response => updateBoard(response.data),
                      error => $log.error(error)
                );
        }

        public.getBoard();

        angular.extend(this, public);
    }]);