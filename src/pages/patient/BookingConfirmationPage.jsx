import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Card, Button,
  Space, Dropdown, Row, Col, Collapse,
  Input, Upload, Spin
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  LeftOutlined,
  InboxOutlined,
  SunOutlined 
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = { name: "Nguyen Van A" }; 

  const { doctor, selectedDate: initialSelectedDate, selectedTime: initialSelectedTime, bookingSchedule } = location.state || {};

  useEffect(() => {
    if (!doctor || !initialSelectedDate || !initialSelectedTime || !bookingSchedule) {
      console.error("Thiếu dữ liệu đặt khám, đang điều hướng...");
      navigate('/patient/booking');
    }
  }, [doctor, initialSelectedDate, initialSelectedTime, bookingSchedule, navigate]);

  // --- LOGIC MỚI ---
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [selectedTime, setSelectedTime] = useState(initialSelectedTime);
  // 1. STATE ĐIỀU KHIỂN COLLAPSE: Mặc định mở Panel 2, đóng Panel 1
  const [activeCollapseKeys, setActiveCollapseKeys] = useState(['2']); 
  // --------------------

  const availableTimeSlots = selectedDate ? selectedDate.timeSlots : [];

  const handleSignOut = () => { console.log("Đã đăng xuất!"); };
  const menuItems = [
    { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
  ];
  
  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76', 
    maxCount: 5,
    onChange(info) {
      console.log(info.file.status);
    },
  };

  if (!doctor || !selectedDate || !bookingSchedule) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* HEADER (Giữ nguyên) */}
      <Header
        style={{
          background: "#fff",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
<div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
                    <img 
            src="/ASTCare1.png" 
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['2']} 
          items={[
            { key: "1", label: "Thông tin cá nhân" },
            { key: "2", label: "Đặt lịch khám" },
            { key: "3", label: "Lịch khám của bản thân" },
          ]}
          style={{ fontSize: 16, fontWeight: 500, color: '#555' }}
          onClick={({ key }) => {
            switch (key) {
              case "1": navigate('/patient/personal'); break;
              case "2": navigate('/patient/booking'); break;
              case "3": navigate('/patient/appointments'); break;
              default: break;
            }
          }}
        />
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#555' }}>{user.name}</span>
            <Avatar size={36} icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </Header>

      {/* CONTENT */}
      <Content style={{ padding: "40px 60px" }}>
        <Button 
          type="link" 
          icon={<LeftOutlined />} 
          style={{ padding: 0, marginBottom: 16 }}
          onClick={() => navigate(`/patient/booking/${doctor.id}`)} 
        >
          Quay lại chọn giờ
        </Button>
        
        <Row gutter={24}>
          {/* CỘT TRÁI (ĐÃ SỬA COLLAPSE) */}
          <Col span={15}>
            {/* 2. SỬA COLLAPSE: Dùng activeKey và onChange (đã bỏ defaultActiveKey) */}
            <Collapse 
              activeKey={activeCollapseKeys}
              onChange={(keys) => setActiveCollapseKeys(keys)}
              style={{ background: '#fff' }}
            >
              {/* 3. SỬA PANEL 1: Đã xóa 'collapsible="disabled"' */}
              <Panel header={<Title level={5} style={{ margin: 0 }}>1. Ngày và giờ khám</Title>} key="1">
                
                <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                  {bookingSchedule.map((day) => ( 
                    <Button 
                      key={day.id} 
                      type={day.id === selectedDate.id ? 'primary' : 'text'} 
                      style={{ 
                        minWidth: 180, 
                        marginRight: 8, 
                        textAlign: 'center',
                      }}
                      onClick={() => {
                        setSelectedDate(day); 
                        setSelectedTime(null);
                      }}
                    >
                      <Text strong style={{ color: day.id === selectedDate.id ? '#fff' : 'inherit' }}>
                        {day.day}, {day.date} - {day.timeSlots.length} khung giờ
                      </Text>
                    </Button>
                  ))}
                </div>
                
                <Title level={5} style={{ marginTop: 16 }}><SunOutlined /> Buổi chiều</Title>
                <Row gutter={[8, 8]}>
                  {availableTimeSlots.map(time => (
                    <Col key={time}>
                      <Button
                        type={time === selectedTime ? 'primary' : 'default'}
                        // 4. SỬA NÚT GIỜ: Thêm logic đóng Panel 1, mở Panel 2
                        onClick={() => {
                          setSelectedTime(time);
                          setActiveCollapseKeys(['2']); // <-- TỰ ĐỘNG ĐÓNG
                        }}
                      >
                        {time}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Panel>
              
              <Panel header={<Title level={5} style={{ margin: 0 }}>2. Thông tin bổ sung (không bắt buộc)</Title>} key="2">
                <div style={{ marginTop: 8 }}>
                  <Text>Ghi chú</Text>
                  <TextArea rows={4} placeholder="Triệu chứng, thuốc đang dùng, tiền sử, ..." />
                </div>
                <div style={{ marginTop: 16 }}>
                  <Text>Tệp đính kèm (0/5)</Text>
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">Chọn tệp tin hoặc kéo thả vào đây</p>
                    <p className="ant-upload-hint">PNG, JPG tối đa 15MB</p>
                  </Dragger>
                </div>
              </Panel>
            </Collapse>
          </Col>

          {/* CỘT PHẢI (Giữ nguyên) */}
          <Col span={9}>
            <Card 
              title={<Title level={5} style={{margin: 0}}>Thông tin đặt khám</Title>}
              styles={{ body: { paddingTop: 16 } }} 
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Space align="center" style={{ width: '100%' }}>
                  <Avatar size={64} src={doctor.avatarUrl} icon={<UserOutlined />} />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 18 }}>{doctor.name}</Text><br/>
                    <Text type="secondary" style={{ fontSize: 14 }}>{doctor.address}</Text>
                  </div>
                </Space>
                <Row justify="space-between" align="middle">
                  <Text type="secondary" style={{ fontSize: 16 }}>Ngày khám</Text>
                  <Text strong style={{ fontSize: 16 }}>{selectedDate.date}/2025</Text> 
                </Row>
                <Row justify="space-between" align="middle">
                  <Text type="secondary" style={{ fontSize: 16 }}>Khung giờ</Text>
                  <Text strong style={{ fontSize: 16, color: selectedTime ? 'inherit' : 'red' }}>
                    {selectedTime || 'Vui lòng chọn giờ'}
                  </Text>
                </Row>
                <Button 
                  type="primary" 
                  block 
                  disabled={!selectedTime} 
                  style={{ marginTop: 16 }}
                  size="large"
                >
                  Xác nhận đặt khám
                </Button>
                <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
                  Bằng cách nhấn nút xác nhận, bạn đã đồng ý với các điều kiện đặt khám
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
      
      <Footer /> 

      {/* Chatbot AI cố định */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>
    </Layout>
  );
}