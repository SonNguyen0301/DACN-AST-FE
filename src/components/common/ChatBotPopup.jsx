import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import { 
  Modal, Input, Button, List, Typography, 
  Layout, Avatar, Upload, message as antMessage, Image
} from "antd";
import { 
  PlusOutlined, SendOutlined, 
  PaperClipOutlined, LoadingOutlined, CloseCircleFilled
} from "@ant-design/icons";
import useAuth from "../../hooks/useAuth"; 
import { getConversationsAPI, getMessagesAPI, sendChatStreamAPI, uploadFileChatAPI } from "../../services/chatService";

const { Sider, Content } = Layout;
const { Text } = Typography;

export default function ChatBotPopup({ onClose }) {
  const { chatToken, user } = useAuth(); 
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [parentMessageId, setParentMessageId] = useState(null);
  
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showThinkingHint, setShowThinkingHint] = useState(false);
  const thinkingTimerRef = useRef(null);
  const chatLogRef = useRef(null); 

  useEffect(() => {
    if (chatToken) {
      fetchConversations();
    }
  }, [chatToken]);

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

  const handleSelectConversation = async (convId) => {
    if (isStreaming) return;
    setCurrentConversationId(convId);
    setMessages([]);
    
    try {
      const res = await getMessagesAPI(convId, chatToken);
      if (res.data?.success) {
        const historyData = res.data.data.data || [];
        
        const mappedMessages = historyData.map(item => ({
            id: item.id,
            text: item.message,
            sender: item.type === 'sent' ? 'user' : 'bot',
            imagePreview: item.imageUrls?.[0]
              ? `http://localhost:3001/embedded-chat/image-proxy?url=${encodeURIComponent(item.imageUrls[0])}&token=${encodeURIComponent(chatToken)}`
              : null,
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
      setCurrentConversationId(null);
      setParentMessageId(null);
      setSelectedFile(null);
      setMessages([{ sender: 'bot', text: `Xin chào ${user?.lastName || ''}, tôi có thể giúp gì cho bạn hôm nay?` }]);
  };

  // --- 4. Gửi tin nhắn & Xử lý Stream ---
  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || isStreaming) return;

    const userText = input;
    const fileToSend = selectedFile;
    setInput("");
    setSelectedFile(null);
    setIsStreaming(true);

    const tempUserMsgId = Date.now();
    setMessages(prev => [...prev, { id: tempUserMsgId, sender: "user", text: userText, imagePreview: fileToSend ? URL.createObjectURL(fileToSend) : null }]);

    const tempBotMsgId = "temp-bot-" + Date.now();
    setMessages(prev => [...prev, { id: tempBotMsgId, sender: "bot", text: "" }]);

    let fullBotResponse = "";

    // Sau 3 giây chưa có chunk → hiện hint
    thinkingTimerRef.current = setTimeout(() => setShowThinkingHint(true), 3000);


    let uploadedFileId = null;
    if (fileToSend) {
      try {
        const uploadRes = await uploadFileChatAPI(fileToSend, chatToken);
        uploadedFileId = uploadRes?.data?.id ?? null;
      } catch {
        antMessage.error("Không thể upload ảnh, vui lòng thử lại.");
        setIsStreaming(false);
        return;
      }
    }

    await sendChatStreamAPI({
        query: userText || '.',
        conversation_id: currentConversationId,
        parent_message_id: parentMessageId,
        files: uploadedFileId ? [{ type: 'image', transfer_method: 'local_file', upload_file_id: uploadedFileId }] : [],
        chatToken,
        onData: (chunkText) => {
            // Chunk đầu tiên đến → ẩn hint ngay
            if (showThinkingHint || thinkingTimerRef.current) {
              clearTimeout(thinkingTimerRef.current);
              thinkingTimerRef.current = null;
              setShowThinkingHint(false);
            }
            fullBotResponse += chunkText;

            setMessages(prev => {
                const newArr = [...prev];
                const lastMsg = newArr[newArr.length - 1];
                if (lastMsg.sender === 'bot') {
                    lastMsg.text = fullBotResponse;
                }
                return newArr;
            });
            

            if (chatLogRef.current) {
                chatLogRef.current.scrollTo({ top: chatLogRef.current.scrollHeight, behavior: 'smooth' });
            }
        },

        onEnd: (metaData) => {
            clearTimeout(thinkingTimerRef.current);
            thinkingTimerRef.current = null;
            setShowThinkingHint(false);
            setIsStreaming(false);
            

            if (metaData) {
                if (metaData.conversation_id) {
                    setCurrentConversationId(metaData.conversation_id);
                    if (!currentConversationId) fetchConversations();
                }
                if (metaData.message_id) {
                    setParentMessageId(metaData.message_id);
                }
            }
        },
        onError: (err) => {
            clearTimeout(thinkingTimerRef.current);
            thinkingTimerRef.current = null;
            setShowThinkingHint(false);
            console.error(err);
            setIsStreaming(false);
            antMessage.error("Mất kết nối với AI.");
        }
    });
  };

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
            whiteSpace: isUser ? 'pre-wrap' : 'normal'
          }}
        >
          {/* Hiển thị ảnh nếu có */}
          {msg.imagePreview && (
            <div style={{ marginBottom: msg.text ? 8 : 0 }}>
              <Image
                src={msg.imagePreview}
                alt="attached"
                style={{ maxWidth: 200, borderRadius: 8 }}
                preview={{ mask: false }}
              />
            </div>
          )}
          {isUser ? (
            msg.text
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '4px 0' }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: '4px 0' }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
                strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                code: ({ children }) => (
                  <code style={{ background: '#e8e8e8', borderRadius: 3, padding: '1px 4px', fontSize: 13 }}>
                    {children}
                  </code>
                ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          )}
          {!isUser && msg.text === "" && isStreaming && (
            <span>
              <LoadingOutlined style={{ marginLeft: 5 }} />
              {showThinkingHint && (
                <span style={{ marginLeft: 8, fontSize: 13, color: '#8c8c8c', fontStyle: 'italic' }}>
                  Chờ 1 xíu, mình đang nghĩ...
                </span>
              )}
            </span>
          )}
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
            {selectedFile && (
              <div style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0f7ff', padding: '4px 10px', borderRadius: 8, border: '1px solid #bae0ff' }}>
                <Image
                  src={URL.createObjectURL(selectedFile)}
                  alt="preview"
                  width={48}
                  height={48}
                  style={{ objectFit: 'cover', borderRadius: 6 }}
                  preview={false}
                />
                <span style={{ fontSize: 12, color: '#555', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedFile.name}
                </span>
                <CloseCircleFilled
                  onClick={() => setSelectedFile(null)}
                  style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 16 }}
                />
              </div>
            )}
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
                <Upload
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={(file) => {
                    setSelectedFile(file);
                    return false;
                  }}
                >
                    <Button 
                        type="text" 
                        icon={<PaperClipOutlined style={{ fontSize: 20, color: selectedFile ? '#1677ff' : '#9ca3af' }} />} 
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
                    disabled={(!input.trim() && !selectedFile) || isStreaming}
                    style={{ 
                        background: (input.trim() || selectedFile) ? '#1677ff' : '#e5e7eb', 
                        color: (input.trim() || selectedFile) ? '#fff' : '#9ca3af',
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