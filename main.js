//Get required modules 
//http for doing server stuff
//fs for linking static files like my html 
var http = require('http');=
var	fs = require('fs');
var sanitize = require('validator');
var port = process.env.PORT || 8888;



//Now let's create our server and define how we'll take in and respond to http requests to it
var app = http.createServer(function(request, response){
	fs.readFile("client.html", "utf-8", function(error,data){
		//TODO catch the error that may be thrown here 
		response.writeHead(200, {'Content-Type':'text/html'});

		//this line writes the data we just read back to the user
		response.write(data);
		response.end();
	});


 }).listen(port,"0.0.0.0");
//we're telling it to listen in on some free port, in this case 8888 (this is arbitrary)


var io = require('socket.io').listen(app); //listen for our server configuration
var people = {};
//socket.emit will update locally whereas io.sockets.emit will update across clients
io.sockets.on('connection', function(socket){
	socket.on("join", function(name){
		people[socket.id] = name;
		socket.emit("update", "Succesfully connected to server.");
		io.sockets.emit("update", name + " has joined the chat.");
		io.sockets.emit("update-people", people);
	});
	socket.on("disconnect", function(){
		io.sockets.emit("update", people[socket.id] + " has left the chat.");
		delete people[socket.id];
		io.sockets.emit("update-people",people);
	});
	socket.on("message_to_server", function(data){
		var escaped_message = sanitize.escape(data["message"]);
		//This way we have sanitized our messages before adding them to our chatlog
		io.sockets.emit("message_to_client", { message:  people[socket.id] +": " +escaped_message});
	});
});







console.log('Server running at http://127.0.0.1:'+ port + '/');