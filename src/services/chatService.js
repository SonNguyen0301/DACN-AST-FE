import axios from './api'; 

const API_BASE_URL = (import.meta.env.VITE_URL_SERVER || '').replace(/\/$/, '');


const getChatbotTokenAPI = () => {
    return axios.post('/embedded-chat/passport'); 
};



const getConversationsAPI = (chatToken, page = 1, take = 20) => {
    return axios.get('/embedded-chat/conversations', {
        params: { page, take },
        headers: { 'Authorization': `Bearer ${chatToken}` }
    });
};


const getMessagesAPI = (conversationId, chatToken) => {
    return axios.get('/embedded-chat/messages', {
        params: { conversationId },
        headers: { 'Authorization': `Bearer ${chatToken}` }
    });
};


const uploadFileChatAPI = async (file, chatToken) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/embedded-chat/upload-file`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${chatToken}`,
        },
        body: formData,
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    return response.json(); // { success, data: { id, name, ... } }
};

const sendChatStreamAPI = async ({ query, conversation_id, parent_message_id, files, chatToken, onData, onEnd, onError }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/embedded-chat/chat-messages-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chatToken}`
            },
            body: JSON.stringify({
                query,
                conversation_id: conversation_id || "",
                parent_message_id: parent_message_id || "",
                files: files || [],
            })
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n');
            buffer = lines.pop(); 

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr) continue;

                    try {
                        const data = JSON.parse(jsonStr);
                        
                        if (data.event === 'message') {
                            onData(data.answer);
                        } else if (data.event === 'message_end') {
                            onEnd(data);
                        }
                    } catch (e) {
                        console.error("Error parsing stream JSON", e);
                    }
                }
            }
        }
    } catch (error) {
        if (onError) onError(error);
    }
};

export {getChatbotTokenAPI, getConversationsAPI, getMessagesAPI, uploadFileChatAPI, sendChatStreamAPI };