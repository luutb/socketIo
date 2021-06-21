const uuidv4 = require('uuid/v4');
var md5 = require('md5');

const ResponseBuilder = require("./responsebuilder");
const MessageType = require("./messagetype");
const Database = require("./memorydb");
const Client =  require("./client");

const MESSAGE_EMIT = "MESSAGE";

let clientData = new Map();

function createConversationId(id1,id2){
    var mx = (id1>id2)?id1:id2;
    var mn =  (mx==id1)?id2:id1;
    return md5(mx+mn);
}
function findConversationById(id1,id2){
   
    let conversationId = createConversationId(id1,id2);
    let conversation = Database.conversation.getById(conversationId); 
    return conversation;

}
function checkLogin(sock,data){
    for (let [socket, client] of clientData){
        if (sock == socket)
            continue;
         
        if (client.equalByName(data.name)){
            return true;
        }
    } 
    return false;
}
function responseListFriend(socket){
    let list  = []
    for (let [sock, client] of clientData){
        if (socket == sock)
            continue; 
        // chỉ lấy danh sách các client đã login .
        if (client.isActive())
            list.push({id:client.getId(),name:client.getName()})
    }  
    socket.emit(MESSAGE_EMIT,ResponseBuilder.buildListFriendResponse(list))
}
function getClientSocketById(id){
    for( let [sock, client] of clientData){
        if (id == client.getId()){
            return sock;
        }
    }
}
function forwardMessageToAll(msg){ 
    let data = ResponseBuilder.buildSendMessageResponse(msg);
    for( let userId of Database.conversation.getUsers(msg.conversationId)){
        let client =  getClientSocketById(userId);

        if (client == null)
            continue;
        client.emit(MESSAGE_EMIT,data);
    }

}

function registEvent(socket){
    socket.on("login", (data) => {
        if (!checkLogin(socket,data)){
           let client =  clientData.get(socket);
            client.active(data);

            // gửi danh sách friend mới
            clientData.forEach((value,key)=>{ 
                if (key == socket)
                    return;
                responseListFriend(key);
            });

            console.log(data.name+ " login success");
            socket.emit(MESSAGE_EMIT,ResponseBuilder.buildLoginResponse( client.data,"success"));
            
        }else{ 
            console.log(data.name+ "login failed");
            socket.emit(MESSAGE_EMIT,ResponseBuilder.buildLoginResponse(null,"failed"));
        }
    });

    socket.on("logout", (data) => {
        
    });
 
    socket.on(MESSAGE_EMIT, (data) => {
        // xử lý sự kiện gửi tin nhắn.
        
        if (data.type&(MessageType.sendImage|MessageType.sendText)){
            let myClient = clientData.get(socket);

           
            let msg = {
                payload:data.payload,
                owner:myClient.getId(),
                conversationId:data.conversation,
                created:new Date()
            }
            Database.messages.addMessage(msg); 
            forwardMessageToAll(msg);

        }else
        // xử lý tạo cuộc trò chuyện
        if (data.type &MessageType.createConversation){
            let myClient = clientData.get(socket);
            let conversationId = null;
            // tạo cuộc trò chuyện đơn
            if (data.conversationType==0){
                let conversationExist = findConversationById(myClient.getId(),data.friend);
                if (  conversationExist != null ){

                    //cuộc trò chuyện này đã được tạo trước đó => trả vể luôn
                    socket.emit(MESSAGE_EMIT,ResponseBuilder.buildCreateConversationResponse("exist",conversationExist))
                    return;
                }
                // tạo mới
                conversationId = createConversationId(myClient.getId(),data.friend);
            }else{
                conversationId = uuidv4();
            }
            
            let conversation = Database.conversation.createConversation(conversationId,myClient.getId(),data.conversationType); 
            Database.conversation.addUser(conversationId,data.friend);

            socket.emit(MESSAGE_EMIT,ResponseBuilder.buildCreateConversationResponse("created",conversation));

        } else
        // kiểm tra cuộc trò chuyện theo id người bạn
        if (data.type == MessageType.checkConversation){
            let myId = clientData.get(socket).getId();
            let conversation = findConversationById(myId,data.friend);
            socket.emit(MESSAGE_EMIT,ResponseBuilder.buildCheckConversationResponse(conversation))
        } 
        else 
        // lấy danh sách  
        if (data.type == MessageType.getListFriend){
            
            responseListFriend(socket);
        }
        else 
        // lấy tin nhắn của conversation
        if (data.type == MessageType.getConversationMessage){
            var listMessage = Database.messages.getByConversationId(data.conversation);
            socket.emit(MESSAGE_EMIT,ResponseBuilder.buildGetMessagesResponse(listMessage))
        }
    });

}

module.exports ={
    onClientConnected : (socket)=>{
        clientData.set(socket,new Client(socket));
        registEvent(socket);
    },
    onClientDisconect: (socket)=>{
        clientData.delete(socket);
        clientData.forEach((value,key)=>{ 
            if (key == socket)
                return;
            responseListFriend(key);
        });
    }
}

