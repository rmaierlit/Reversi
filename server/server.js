var express = require ('express');

var server = express();

server.use(express.static(__dirname + '/../client'));

server.listen(3535);

console.log('in the year 3535');
