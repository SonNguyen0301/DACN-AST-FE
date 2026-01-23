import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { 
  Modal, Input, Button, List, Typography, 
  Layout, Avatar, Upload, message as antMessage 
} from "antd";
import { 
  PlusOutlined, SendOutlined, 
  PaperClipOutlined, LoadingOutlined
} from "@ant-design/icons";
import useAuth from "../../hooks/useAuth"; 
import { getConversationsAPI, getMessagesAPI, sendChatStreamAPI } from "../../services/chatService";

const { Sider, Content } = Layout;
const { Text } = Typography;

export default function ChatBotPopup({ onClose }) {
  const { chatToken, user } = useAuth(); 
  
  // State quản lý dữ liệu
  const [conversations, setConversations] = useState([]); // List bên trái
  const [messages, setMessages] = useState([]);           // List tin nhắn hiện tại
  
  // State quản lý ngữ cảnh chat
  const [currentConversationId, setCurrentConversationId] = useState(null); // ID hội thoại đang chọn
  const [parentMessageId, setParentMessageId] = useState(null);             // ID tin nhắn cuối cùng để nối mạch
  
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false); // Đang nhận phản hồi?
  const chatLogRef = useRef(null); 

  // --- 1. Load danh sách hội thoại khi mở Popup ---
  useEffect(() => {
    console.log("hsdbfsdhbfkjcnfc");
    if (chatToken) {
      fetchConversations();
    }
  }, [chatToken]);

  // Hàm load list bên trái
  const fetchConversations = async () => {
    try {
      const res = await getConversationsAPI(chatToken);
      if (res.data?.success) {
        setConversations(res.data.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử chat:", error);
    }
  };

  // --- 2. Xử lý khi chọn một cuộc hội thoại cũ ---
  const handleSelectConversation = async (convId) => {
    if (isStreaming) return; // Không cho chuyển khi đang chat dở
    setCurrentConversationId(convId);
    setMessages([]); // Clear màn hình tạm thời
    
    try {
      const res = await getMessagesAPI(convId, chatToken);
      if (res.data?.success) {
        const historyData = res.data.data.data || [];
        
        // Map dữ liệu API -> format của UI
        // API trả về: { message: "...", type: "sent" | "received" }
        // UI cần: { text: "...", sender: "user" | "bot" }
        const mappedMessages = historyData.map(item => ({
            id: item.id,
            text: item.message,
            sender: item.type === 'sent' ? 'user' : 'bot'
        }));

        setMessages(mappedMessages);

        // Quan trọng: Lấy ID tin nhắn cuối cùng làm parent_message_id
        if (historyData.length > 0) {
            setParentMessageId(historyData[historyData.length - 1].id);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết tin nhắn:", error);
    }
  };

  // --- 3. Xử lý tạo cuộc hội thoại mới ---
  const handleNewChat = () => {
      if (isStreaming) return;
      setCurrentConversationId(null); // Reset ID -> API sẽ hiểu là tạo mới
      setParentMessageId(null);       // Reset Parent -> API sẽ hiểu là bắt đầu mới
      setMessages([{ sender: 'bot', text: `Xin chào ${user?.lastName || ''}, tôi có thể giúp gì cho bạn hôm nay?` }]);
  };

  // --- 4. Gửi tin nhắn & Xử lý Stream ---
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userText = input;
    setInput(""); // Xóa ô nhập liệu ngay
    setIsStreaming(true);

    // 4.1. Hiển thị tin nhắn User lên UI ngay lập tức
    const tempUserMsgId = Date.now(); // ID tạm
    setMessages(prev => [...prev, { id: tempUserMsgId, sender: "user", text: userText }]);

    // 4.2. Tạo bong bóng tin nhắn rỗng cho Bot để chuẩn bị hứng chữ
    const tempBotMsgId = "temp-bot-" + Date.now();
    setMessages(prev => [...prev, { id: tempBotMsgId, sender: "bot", text: "" }]);

    // Biến tạm để cộng dồn text stream
    let fullBotResponse = "";

    // 4.3. Gọi API Stream
    await sendChatStreamAPI({
        query: userText,
        conversation_id: currentConversationId, // Có thể null
        parent_message_id: parentMessageId,     // Có thể null
        chatToken,
        // Callback khi có từng chữ (chunk) trả về
        onData: (chunkText) => {
            fullBotResponse += chunkText;
            
            // Cập nhật text vào bong bóng tin nhắn cuối cùng (là của Bot)
            setMessages(prev => {
                const newArr = [...prev];
                const lastMsg = newArr[newArr.length - 1];
                if (lastMsg.sender === 'bot') {
                    lastMsg.text = fullBotResponse; // Cập nhật text
                }
                return newArr;
            });
            
            // Auto scroll
            if (chatLogRef.current) {
                chatLogRef.current.scrollTo({ top: chatLogRef.current.scrollHeight, behavior: 'smooth' });
            }
        },
        // Callback khi Bot trả lời xong
        onEnd: (metaData) => {
            setIsStreaming(false);
            
            // CỰC KỲ QUAN TRỌNG: Cập nhật lại Context cho lần chat tiếp theo
            // API trả về conversation_id mới (nếu nãy là null) và message_id của câu trả lời này
            if (metaData) {
                if (metaData.conversation_id) {
                    setCurrentConversationId(metaData.conversation_id);
                    // Nếu nãy là chat mới, reload lại list bên trái để hiện cuộc hội thoại mới tạo
                    if (!currentConversationId) fetchConversations();
                }
                if (metaData.message_id) {
                    setParentMessageId(metaData.message_id); // Set cái này để câu sau nối tiếp câu trước
                }
            }
        },
        onError: (err) => {
            console.error(err);
            setIsStreaming(false);
            antMessage.error("Mất kết nối với AI.");
        }
    });
  };

  // --- Render Message Bubble ---
  const renderMessage = (msg) => {
    const isUser = msg.sender === "user";
    return (
      <div 
        key={msg.id || Math.random()} 
        style={{ 
          display: 'flex', 
          justifyContent: isUser ? 'flex-end' : 'flex-start', 
          marginBottom: 20,
          paddingRight: isUser ? 10 : 0 
        }}
      >
        {!isUser && (
            <Avatar 
                style={{ backgroundColor: '#e6f7ff', color: '#1677ff', marginRight: 10, marginTop: 5 }} 
            />
        )}
        
        <div
          style={{
            background: isUser ? "#1677ff" : "#f5f5f5", 
            color: isUser ? "white" : "#1f2937",
            padding: "12px 16px",
            borderRadius: isUser ? "20px 20px 5px 20px" : "20px 20px 20px 5px", 
            maxWidth: "75%",
            wordBreak: 'break-word',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            fontSize: '15px',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap' // Giữ format xuống dòng của AI
          }}
        >
          {msg.text}
          {/* Hiệu ứng loading dot nếu text đang rỗng (mới bắt đầu stream) */}
          {!isUser && msg.text === "" && isStreaming && <LoadingOutlined style={{ marginLeft: 5 }} />}
        </div>
      </div>
    );
  };

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width="80%" 
      centered
      closeIcon={null} 
      styles={{ body: { height: '80vh', padding: 0 } }}
    >
      <Layout style={{ height: '100%', background: '#fff', overflow: 'hidden', borderRadius: '8px' }}>
        
        {/* --- CỘT TRÁI (LỊCH SỬ) --- */}
        <Sider 
          width={280} 
          theme="light" 
          style={{ 
            borderRight: '1px solid #e5e7eb', 
            background: '#f8fafc', 
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <Button
              type="primary" 
              icon={<PlusOutlined />}
              style={{ 
                  width: '100%', height: '45px', borderRadius: '12px', 
                  background: '#fff', color: '#1677ff', border: '1px dashed #1677ff',
                  fontWeight: 600, boxShadow: 'none'
              }}
              onClick={handleNewChat}
            >
              Cuộc hội thoại mới
            </Button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 10, marginBottom: 5, display: 'block' }}>Gần đây</Text>
            <List
              dataSource={conversations}
              renderItem={(chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectConversation(chat.id)}
                  style={{
                    padding: '12px 16px', 
                    cursor: 'pointer',
                    borderRadius: 12,
                    margin: '4px 0',
                    transition: 'all 0.2s',
                    background: chat.id === currentConversationId ? '#e6f7ff' : 'transparent',
                    color: chat.id === currentConversationId ? '#1677ff' : '#4b5563',
                  }}
                  className="hover:bg-gray-100" 
                >
                  <Text ellipsis style={{ color: 'inherit', fontWeight: chat.id === currentConversationId ? 600 : 400 }}>
                    {chat.name || "Cuộc trò chuyện mới"}
                  </Text>
                </div>
              )}
            />
          </div>
          
        </Sider>

        {/* --- CỘT PHẢI (CHAT CHÍNH) --- */}
        <Content style={{ display: 'flex', flexDirection: 'column', background: '#fff', position: 'relative' }}>
          
          <div style={{ padding: '15px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 18 }}>ASTCare AI Assistant</Text>
            <Button type="text" onClick={onClose} style={{ color: '#999' }}>Đóng</Button>
          </div>

          <div
            ref={chatLogRef}
            style={{ 
                flex: 1, overflowY: "auto", 
                padding: "20px 40px", 
                scrollBehavior: 'smooth' 
            }}
          >
            {messages.length === 0 && !currentConversationId && (
                <div style={{ textAlign: 'center', marginTop: '20%', color: '#aaa' }}>
                    <p>Bắt đầu cuộc trò chuyện mới với AI ngay.</p>
                </div>
            )}
            
            {messages.map((msg) => renderMessage(msg))}
          </div>
        
          <div style={{ padding: '20px 40px 30px 40px' }}>
             <div style={{ 
                display: 'flex',              
                alignItems: 'flex-end',       
                gap: '10px',                  
                border: '1px solid #e5e7eb', 
                borderRadius: '16px', 
                padding: '8px 12px',          
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                background: '#fff'
            }}>
                <Upload showUploadList={false} beforeUpload={() => false}>
                    <Button 
                        type="text" 
                        icon={<PaperClipOutlined style={{ fontSize: 20, color: '#9ca3af' }} />} 
                        disabled={isStreaming} 
                        style={{ padding: '0 8px', height: '32px' }} 
                    />
                </Upload>

                <Input.TextArea
                    placeholder="Nhập câu hỏi của bạn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    autoSize={{ minRows: 1, maxRows: 6 }} 
                    style={{ 
                        flex: 1,             
                        border: 'none', 
                        boxShadow: 'none', 
                        resize: 'none', 
                        padding: '4px 0',     
                        fontSize: '15px', 
                        background: 'transparent',
                        lineHeight: '1.5'
                    }}
                    disabled={isStreaming}
                />
                
                <Button 
                    type="primary" 
                    shape="circle"
                    onClick={handleSend}
                    icon={isStreaming ? <LoadingOutlined /> : <SendOutlined />}
                    disabled={!input.trim() || isStreaming}
                    style={{ 
                        background: input.trim() ? '#1677ff' : '#e5e7eb', 
                        color: input.trim() ? '#fff' : '#9ca3af',
                        border: 'none',
                        flexShrink: 0,      
                        width: '32px', height: '32px', minWidth: '32px'
                    }}
                />
            </div>
          </div>

        </Content>
      </Layout>
    </Modal>
  );
}

ChatBotPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
};