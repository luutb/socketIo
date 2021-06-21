
const MESSAGE_EMIT = "MESSAGE";
class Client {
     
    data = null;
    constructor(socket){
        this.socket = socket;
        this.regisitMessage();
    }

    regisitMessage(){
       
    }
    active(data){
        this.data = data;
        if (this.data.id == null){
            this.data.id = this.data.name;
        }
    }
    send(data){
        this.socket.emit(MESSAGE_EMIT,data);
    }
    isActive(){
        
        return this.data != null;
    }

    getName(){
        
        if(this.data == null){
            return null;
        }

        return this.data.name;
    }
    getId(){
        if (this.data == null){
            return null;
        }
        return this.data.id;
    }

    equal(client){
        if (this.data == null){
            return false;
        }
        
       return this.data.name == client.data.name;
    }
    equalByName(name){
        if (this.data == null){
            return false;
        }
        
       return this.data.name == name;
    }
}
module.exports = Client