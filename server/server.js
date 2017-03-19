var express = require ('express');

var server = express();

server.use(express.static(__dirname + '/../client'));
require('./routes.js')(server, express);

server.listen(3535);

console.log('in the year 3535');
