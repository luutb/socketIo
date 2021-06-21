

// Mô phỏng cơ sở dữ liệu

var tableConversation = {
    data:{},
    getById:(id)=>{
        return tableConversation.data[id];
    },
    createConversation:(conversationId,owner,type)=>{
        return tableConversation.data[conversationId] = {
            id:conversationId,
            owner:owner,
            type:type,
            users:[owner]
        }
    },
    addUser:(conversationId,userId)=>{
        tableConversation.data[conversationId].users.push(userId);
    },
    getUsers:(id)=>{
        if (tableConversation.data[id]== null){
            return;
        }
        return tableConversation.data[id].users;
    }
}

var tableMessage = {
    data:{},
    addMessage:(data)=>{
        if (tableMessage.data[data.conversationId] == null){
            tableMessage.data[data.conversationId] = [];
        }

        tableMessage.data[data.conversationId].push(data);
    },
    getByConversationId:(id)=>{
       return tableMessage.data[id];
    }
}

module.exports = {
    conversation:tableConversation,
    messages:tableMessage
}