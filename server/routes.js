var jsonParser = require('body-parser').json();
var game = require('./game.js');

module.exports = function (server, express) {
    //server.get('/games', ##get games list##);
    //server.post('/games', ##create new game##);
    server.get('/games/name', game.getBoardState);

    server.post('/games/name', jsonParser, game.submitMove);

    //not RESTful
    server.post('/games/name/reset', game.resetGame);
}