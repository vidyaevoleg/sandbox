var http = require('http');
var static = require('node-static');
const PORT=8080; 

var file = new static.Server('./public');
 
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8081);

