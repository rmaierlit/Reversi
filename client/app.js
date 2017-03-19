angular.module('App', [])
    .controller('Game', ['$log', '$http', function($log, $http){

        const classesByCode = {
             '0': 'empty',
             '1': 'black',
            '-1': 'white',
             '2': 'opblack',
            '-2': 'opwhite',
        }
        
        var preload = true;

        var updateBoard = function(game) {
            let row, column;

            for (var i = 0; i < game.openMoves.length; i++){
                [row, column] = game.openMoves[i].split(' ');
                game.board[row][column] = game.player * 2;
                //for player white (i.e. 1) will set square to be 2 ('open for white');
            }
            public.state.board = game.board;
            public.state.player = game.player;


            let body = document.querySelector('body');
            body.classList.remove(public.background(-(game.player)));
            body.classList.add(public.background(game.player));
            if(preload){
                body.classList.remove('preload');
                preload = false;
            }
        }

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