//Get required modules 
//http for doing server stuff
//fs for linking static files like my html 
var http = require('http');
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
var client_name_color = null;
//we're gonna make an array to store name color for the various session ids
var name_color = {};
//socket.emit will update locally whereas io.sockets.emit will update across clients
io.sockets.on('connection', function(socket){
	socket.on("join", function(name){
		people[socket.id] = name;

		//
		client_name_color = "rgb("+Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255)+ "," + Math.floor(Math.random() * 255) + ")";
		//
		name_color[socket.id] = client_name_color;
		socket.emit("update", "Succesfully connected to server.");
		io.sockets.emit("update", "<b id='client_name_" +  socket.id.replace('/#', '')  + "'>" + name + " has joined the chat.");
		io.sockets.emit("update-people", {peep:people,colors:name_color});
		socket.send(socket.id);//this should send our client's session id back to the client side 
	
	});
	socket.on("disconnect", function(){
		io.sockets.emit("update", people[socket.id] + " has left the chat.");
		delete people[socket.id];
		io.sockets.emit("update-people",{peep:people,colors:name_color});
	});
	socket.on("message_to_server", function(data){
		//This way we have sanitized our messages before adding them to our chatlog
		var escaped_message = sanitize.escape(data["message"]);
		if(data['name'].valueOf().trim()!="Nobody" && data['name'].valueOf().trim()!="Select a person to PM"){
		//	var id = people[data['name']];
			var name = data['name'];

			var id = null;
			for(var socketid in people){
				if(people[socketid].valueOf() == name.trim()){
					id = socketid;
			
				}
			}
			//var id = 
			console.log(id);
			
			io.sockets.sockets[id].emit("message_to_client", {message: "<b style='color:"  + name_color[socket.id]  + "'>" + people[socket.id] +"(Private Message)</b> : " +escaped_message});
			io.sockets.sockets[socket.id].emit("message_to_client", {message: "<b style='color:"  + name_color[socket.id]  + "'>" + people[socket.id] +"(Private Message to) " + name + "</b> : " +escaped_message});
		}else{
			io.sockets.emit("message_to_client", {message: "<b style='color:"  + name_color[socket.id]  + "'>" + people[socket.id] +"</b> : " +escaped_message});
		}
		
	
	
		
	});
});







console.log('Server running at http://127.0.0.1:'+ port + '/');