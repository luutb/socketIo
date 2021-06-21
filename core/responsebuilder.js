const ReponseType = require("./responsetype");
const MessageType = require("./messagetype");
module.exports = {
    buildLoginResponse:(data,message)=>{
        return {
            type: ReponseType.login,
            error:data==null,
            message:message,
            data:data
        }
    },
    buildCheckConversationResponse:(conversations)=>{
        return {
            type:ReponseType.message,
            msgType: MessageType.checkConversation,
            error:(conversations == null),
            data:conversations
        }
    },
    buildCreateConversationResponse:(message,conversation)=>{
        return {
            type:ReponseType.message,
            msgType:MessageType.createConversation,
            error:conversation == null,
            data:conversation,
            message:message
        }
    },
    buildListFriendResponse:(list)=>{
        return {
            type:ReponseType.message,
            msgType:MessageType.getListFriend,
            error:list == null,
            data:list
        }
    },
    buildSendMessageResponse:(msg)=>{
        return {
            type:ReponseType.message,
            msgType:MessageType.sendText,
            error:false,
            data:msg
        }
    },
    buildGetMessagesResponse:(messages)=>{
        return {
            type:ReponseType.message,
            msgType:MessageType.getConversationMessage,
            error:messages == null,
            data:messages
        }
    }
    
}