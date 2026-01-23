import axios from './api'; 


const getChatbotTokenAPI = () => {
    return axios.post('/embedded-chat/passport'); 
};


// 1. API Lấy danh sách lịch sử chat
const getConversationsAPI = (chatToken, page = 1, take = 20) => {
    return axios.get('/embedded-chat/conversations', {
        params: { page, take },
        headers: { 'Authorization': `Bearer ${chatToken}` }
    });
};

// 2. API Lấy chi tiết tin nhắn của 1 cuộc hội thoại
const getMessagesAPI = (conversationId, chatToken) => {
    return axios.get('/embedded-chat/messages', {
        params: { conversationId },
        headers: { 'Authorization': `Bearer ${chatToken}` }
    });
};

// 3. API Chat Stream (Dùng fetch native để xử lý stream)
const sendChatStreamAPI = async ({ query, conversation_id, parent_message_id, chatToken, onData, onEnd, onError }) => {
    try {
        const response = await fetch('http://localhost:3001/embedded-chat/chat-messages-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chatToken}`
            },
            body: JSON.stringify({
                query,
                conversation_id: conversation_id || "", // Rỗng nếu là chat mới
                parent_message_id: parent_message_id || "" // Rỗng nếu là chat mới
            })
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Giải mã byte thành string và cộng vào buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Tách các dòng bắt đầu bằng 'data: '
            const lines = buffer.split('\n');
            // Giữ lại phần thừa cuối cùng (chưa đủ dòng) cho vòng lặp sau
            buffer = lines.pop(); 

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6).trim(); // Bỏ chữ 'data: '
                    if (!jsonStr) continue;

                    try {
                        const data = JSON.parse(jsonStr);
                        
                        // Xử lý các event khác nhau
                        if (data.event === 'agent_message') {
                            onData(data.answer); // Gọi callback để update UI dần dần
                        } else if (data.event === 'message_end') {
                            onEnd(data); // Gọi callback khi xong để lấy conversation_id mới
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

export {getChatbotTokenAPI, getConversationsAPI, getMessagesAPI, sendChatStreamAPI };