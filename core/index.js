const configs = require("./config");
const io = require("socket.io");
let {onClientConnected,onClientDisconect} = require("./manager")
var server = null;



function onConnect(socket){ 
    onClientConnected(socket);
  
    
    socket.on("disconnect", () => {
        onClientDisconect(socket); 
    });

} 
module.exports = function (){
    server =  io.listen(configs.SOCKET_PORT); 
    server.on("connection",onConnect); 
}

