import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { 
  Modal, Input, Button, List, Typography, 
  Layout, Avatar, Space, Upload
} from "antd";
import { 
  PlusOutlined, 
  MessageOutlined, 
  UserOutlined, 
  SendOutlined,
  PaperClipOutlined
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Text } = Typography;

// (Dữ liệu "giả" giữ nguyên)
const initialChatHistory = [
  { id: 1, title: "Giới thiệu & Hỗ trợ" },
  { id: 2, title: "Hỏi về đặt lịch" },
  { id: 3, title: "Thông tin Bác sĩ" },
];
const initialAllMessages = {
  1: [
    { sender: "bot", text: "Hi , I'm your AI assistant. How can I help you today?" },
  ],
  2: [
    { sender: "bot", text: "Bạn muốn hỏi về quy trình đặt lịch khám?" },
    { sender: "user", text: "Đúng rồi, tôi cần đặt cho chuyên khoa Da liễu." },
  ],
  3: [
    { sender: "bot", text: "Bạn cần tìm thông tin bác sĩ nào?" },
  ],
};
const currentUser = {
  name: "Nguyen Van A",
  avatarUrl: null
};
// -------------------------------------------

export default function ChatBotPopup({ onClose }) {
  const [chatHistory, setChatHistory] = useState(initialChatHistory);
  const [allMessages, setAllMessages] = useState(initialAllMessages);
  const [currentChatId, setCurrentChatId] = useState(1); 
  const [input, setInput] = useState("");
  const chatLogRef = useRef(null); 

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [allMessages, currentChatId]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input };
    const currentMessages = allMessages[currentChatId] || [];
    const updatedMessages = [...currentMessages, newMessage];
    const newAllMessages = { ...allMessages, [currentChatId]: updatedMessages };
    
    setAllMessages(newAllMessages);
    setInput("");

    setTimeout(() => {
      const botMessage = { sender: "bot", text: "I'm processing your question..." };
      setAllMessages((prevAllMessages) => ({
        ...prevAllMessages,
        [currentChatId]: [...updatedMessages, botMessage],
      }));
    }, 600);
  };

  const uploadProps = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76', 
    showUploadList: false, 
    onChange(info) {
      if (info.file.status === 'done') {
        const newMessage = { sender: "user", text: `Đã gửi ảnh: ${info.file.name}` };
        const currentMessages = allMessages[currentChatId] || [];
        setAllMessages({
          ...allMessages,
          [currentChatId]: [...currentMessages, newMessage],
        });
      }
    },
  };

  // (Hàm renderMessage giữ nguyên)
  const renderMessage = (msg) => {
    const isUser = msg.sender === "user";
    return (
      <List.Item
        style={{ 
          borderBottom: 'none', 
          padding: '10px 0',
          display: 'flex',
          justifyContent: isUser ? "flex-end" : "flex-start",
        }}
      >
        <Space align="start" direction={isUser ? "horizontal-reverse" : "horizontal"}>
          <div
            style={{
              background: isUser ? "#1677ff" : "#f1f1f1",
              color: isUser ? "white" : "black",
              padding: "10px 14px",
              borderRadius: 16,
              maxWidth: "350px",
              wordBreak: 'break-word',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Text style={{ color: isUser ? "white" : "black", fontSize: 15 }}>
              {msg.text}
            </Text>
          </div>
        </Space>
      </List.Item>
    );
  };

  return (
    <Modal
      open
      // title={<Text strong style={{ fontSize: 18 }}>AI tư vấn</Text>}
      onCancel={onClose}
      footer={null}
      width={800} 
      bodyStyle={{ padding: 0 }} 
    >
      <Layout style={{ height: '70vh', background: '#fff' }}>
        
        {/* CỘT TRÁI (ĐÃ "ĐỘ" LẠI) */}
        <Sider 
          width={240} 
          theme="light" 
          style={{ 
            borderRight: '1px solid #f0f0f0', 
            background: '#f9f9f9',
            // Bỏ flex ở đây...
          }}
        >
          {/* SỬA 1: Thêm 1 div wrapper 100% để "đẩy" user xuống */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Div "cuộn" (flex: 1) */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Button
                type="primary" 
                icon={<PlusOutlined />}
                style={{ margin: 16, width: 'calc(100% - 32px)' }}
                onClick={() => {
                  const newId = chatHistory.length + 10;
                  setChatHistory([...chatHistory, { id: newId, title: `New Chat ${newId}` }]);
                  setAllMessages({...allMessages, [newId]: [{sender: 'bot', text: 'Đây là chat mới!'}]});
                  setCurrentChatId(newId);
                }}
              >
                New Chat
              </Button>
              <List
                dataSource={chatHistory}
                renderItem={(chat) => (
                  <List.Item
                    style={{
                      padding: '12px 20px', 
                      cursor: 'pointer',
                      borderBottom: 'none',
                      background: chat.id === currentChatId ? '#ceeffeff' : 'transparent',
                      borderRadius: 8,
                      margin: '4px 12px',
                      width: 'auto',
                    }}
                    onClick={() => setCurrentChatId(chat.id)}
                  >
                    <Text ellipsis style={{ fontSize: 15 }}>{chat.title}</Text>
                  </List.Item>
                )}
              />
            </div>
            
            {/* Div User (bị ghim ở đáy) */}
            <div style={{ 
              borderTop: '1px solid #f0f0f0', 
              padding: 16, 
              background: '#fff' 
            }}>
              <Space>
                <Avatar src={currentUser.avatarUrl} icon={<UserOutlined />} />
                <Text strong>{currentUser.name}</Text>
              </Space>
            </div>
          </div>
        </Sider>

        {/* CỘT PHẢI (ĐÃ "ĐỘ" LẠI) */}
        <Content style={{ display: 'flex', flexDirection: 'column', padding: '16px 24px' }}>
          
          <div
            ref={chatLogRef}
            style={{ flex: 1, overflowY: "auto", marginBottom: 16, paddingRight: 8 }}
          >
            <List
              dataSource={allMessages[currentChatId] || []} 
              renderItem={renderMessage}
            />
          </div>
          
          {/* SỬA 2: Bỏ Input.Group, dùng Input với prefix/suffix */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={handleSend}
              size="large"
              style={{ flex: 1 }} 
              // Icon Kẹp ghim (Upload)
              prefix={
                <Upload {...uploadProps}>
                  <Button icon={<PaperClipOutlined />} type="text" style={{ marginLeft: -8 }} />
                </Upload>
              }
              // Icon Send (Gửi)
              suffix={
                <Button 
                  type="primary" 
                  onClick={handleSend}
                  icon={<SendOutlined />}
                  style={{ marginRight: -8 }} // Chỉnh lại padding
                />
              }
            />
          </div>

        </Content>
      </Layout>
    </Modal>
  );
}

ChatBotPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
};