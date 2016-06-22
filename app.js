var http = require('http');
var static = require('node-static');
const PORT=3000; 

var file = new static.Server('./public');
 
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(3000);

