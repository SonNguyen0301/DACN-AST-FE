import { 
  Layout, Menu, Avatar, Typography, Card, Button,
  Space, List, Dropdown, Row, Col,
  Collapse, Checkbox, Rate, Tag 
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const detailedDoctorsData = [
  { 
    id: 1, 
    name: "BS Nguyễn Hồ Vĩnh Phước", 
    rating: 5, 
    isVerified: true, 
    specialty: "Nam khoa", 
    address: "Căn 7.33 Tòa nhà Charmington 181 Cao Thắng, Quận 10",
    canBookInPerson: true,
    canBookOnline: true,
    avatarUrl: "/doctor1.png" 
  },
  { 
    id: 2, 
    name: "BS. CK1 Trần Văn Dũng", 
    rating: 5, 
    isVerified: true, 
    specialty: "Nam khoa", 
    address: "Nguyễn Văn Trỗi, Phương Liệt, Thanh Xuân, Hà Nội",
    canBookInPerson: true,
    canBookOnline: false,
    avatarUrl: "/doctor2.png" 
  },
  { 
    id: 3, 
    name: "BS. CK2 Phạm Thị Hồng Nhung", 
    rating: 4, 
    isVerified: false, 
    specialty: "Tim mạch", 
    address: "Viện Tim TP.HCM, 88 Thành Thái, Quận 10",
    canBookInPerson: true,
    canBookOnline: true,
    avatarUrl: "/doctor3.png" 
  },
  { 
    id: 4, 
    name: "BS. CK2 Lê Thị Minh Hồng", 
    rating: 5, 
    isVerified: true, 
    specialty: "Nhi khoa", 
    address: "Bệnh viện Nhi Đồng 2, 14 Lý Tự Trọng, Bến Nghé, Quận 1",
    canBookInPerson: true,
    canBookOnline: true,
    avatarUrl: "/doctor4.png" 
  },
  { 
    id: 5, 
    name: "PGS. TS. BS Lâm Việt Trung", 
    rating: 5, 
    isVerified: true, 
    specialty: "Tiêu hóa", 
    address: "Bệnh viện Chợ Rẫy, 201B Nguyễn Chí Thanh, Phường 12, Quận 5",
    canBookInPerson: true,
    canBookOnline: false,
    avatarUrl: "/doctor5.png" 
  },
  { 
    id: 6, 
    name: "BS. CK1 Trần Thị Thu Hà", 
    rating: 4, 
    isVerified: true, 
    specialty: "Da liễu", 
    address: "Bệnh viện Da liễu, 2 Nguyễn Thông, Phường 6, Quận 3",
    canBookInPerson: true,
    canBookOnline: true,
    avatarUrl: "/doctor5.png" 
  },
  { 
    id: 7, 
    name: "PGS. TS. BS Nguyễn Thị Thanh Hương", 
    rating: 4, 
    isVerified: false, 
    specialty: "Nhãn khoa", 
    address: "456 Lê Lợi, Quận 3, TP. HCM",
    canBookInPerson: true,
    canBookOnline: false,
    avatarUrl: "/doctor4.png" 
  },
  { 
    id: 8, 
    name: "BS. CK1 Lê Văn Thành", 
    rating: 5, 
    isVerified: true, 
    specialty: "Cơ Xương Khớp", 
    address: "Hồng Bàng, Quận 5, TP. HCM",
    canBookInPerson: true,
    canBookOnline: false,
    avatarUrl: "/doctor3.png" 
  },
  { 
    id: 9, 
    name: "BS. CK2 Phan Thị Bích Ngọc", 
    rating: 5, 
    isVerified: true, 
    specialty: "Tai Mũi Họng", 
    address: "Trịnh Văn Cấn, Quận 1, TP. HCM",
    canBookInPerson: true,
    canBookOnline: true,
    avatarUrl: "/doctor2.png" 
  },
  { 
    id: 10, 
    name: "BS. CK2 Võ Đức Hiếu", 
    rating: 5, 
    isVerified: true, 
    specialty: "Ung bướu", 
    address: "Bệnh viện Ung Bướu TP. HCM, Nơ Trang Long, Bình Thạnh",
    canBookInPerson: true,
    canBookOnline: false,
    avatarUrl: "/doctor1.png" 
  },
];

export default function BookingPage() {
  const navigate = useNavigate();
  const user = { name: "Nguyen Van A" }; 

  // (Các hàm Dropdown Menu cho Header)
  const handleSignOut = () => {
    console.log("Đã đăng xuất!");
    // navigate('/login');
  };
  const menuItems = [
    { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
  ];

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
          position: 'sticky', top: 0, zIndex: 1000
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
          defaultSelectedKeys={['3']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Thông tin cá nhân" },
            { key: "3", label: "Đặt lịch khám" },
            { key: "4", label: "Lịch khám của bản thân" },
          ]}
          style={{ fontSize: 16, fontWeight: 500, color: '#555' }}
          onClick={({ key }) => {
            switch (key) {
              case "1": navigate('/patient/dashboard'); break;
              case "2": navigate('/patient/personal'); break;
              case "3": navigate('/patient/booking'); break;
              case "4": navigate('/patient/appointments'); break;
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

      {/* CONTENT (NỘI DUNG TRANG BOOKING ĐÃ "ĐỘ" LẠI) */}
      <Content style={{ padding: "40px 60px" }}>
        <Layout style={{ background: '#f5f7fa' }}>
          
          {/* CỘT TRÁI: BỘ LỌC (SIDER) */}
          <Sider width={280} theme="light" style={{ background: '#f5f7fa', paddingRight: 24 }}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong style={{ fontSize: 16 }}>Lọc</Text>
                <Button type="link" icon={<ReloadOutlined />} style={{ padding: 0 }}>
                  Xoá bộ lọc
                </Button>
              </div>
              <Collapse defaultActiveKey={['1', '2']} ghost>
                <Panel header="Ngôn ngữ" key="1">
                  <Checkbox.Group>
                    <Space direction="vertical">
                      <Checkbox value="vi">Tiếng Việt</Checkbox>
                      <Checkbox value="en">English</Checkbox>
                    </Space>
                  </Checkbox.Group>
                </Panel>
                <Panel header="Bảo hiểm" key="2">
                  <Checkbox.Group>
                    <Space direction="vertical">
                      <Checkbox value="bhxh">Bảo hiểm xã hội</Checkbox>
                      <Checkbox value="other">Bảo hiểm khác</Checkbox>
                    </Space>
                  </Checkbox.Group>
                </Panel>
                <Panel header="Gần tôi" key="3">
                  <Checkbox value="nearby">Gần tôi</Checkbox>
                </Panel>
              </Collapse>
            </div>
          </Sider>

          {/* CỘT PHẢI: KẾT QUẢ (CONTENT) */}
          <Content>
            <Title level={4} style={{ marginBottom: 16 }}>
              {detailedDoctorsData.length} bệnh viện và phòng khám
            </Title>
            
            <List
              grid={{ gutter: 16, column: 1 }} // Chỉ 1 cột
              dataSource={detailedDoctorsData}
              pagination={{
                pageSize: 5, // 5 mục mỗi trang
                style: { textAlign: 'center' } // Căn giữa cho đẹp
              }}
              renderItem={(doctor) => (
                <List.Item>
                  <Card 
                    style={{ width: '100%', borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    variant="borderless"
                  >
                    <Row gutter={16}>
                      {/* Cột Avatar */}
                      <Col span={4} style={{ textAlign: 'center' }}>
                        <Avatar size={160} src={doctor.avatarUrl} icon={<UserOutlined />} />
                      </Col>
                      
                      {/* Cột Thông tin */}
                      <Col span={20}>
                        <Title level={5} style={{ color: '#1677ff', cursor: 'pointer', margin: 0 }}>
                          {doctor.name}
                        </Title>
                        <Space style={{ margin: '4px 0' }}>
                          <Rate disabled defaultValue={doctor.rating} style={{ fontSize: 14 }} />
                          {/* {doctor.isVerified && <Tag color="green" icon={<SafetyOutlined />}>Đã xác minh</Tag>} */}
                        </Space>
                        <Text type="secondary" style={{ display: 'block', marginTop: 10 }}>
                          <UserOutlined /> {doctor.specialty}
                        </Text>
                        <Text type="secondary" style={{ display: 'block' , marginTop: 10 }}>
                          <EnvironmentOutlined /> {doctor.address} 
                        </Text>
                        
                        {/* NÚT ĐẶT LỊCH (ĐÃ SỬA) */}
                        <div style={{ marginTop: 16 }}>
                          <Button 
                            type="primary" 
                            icon={<CalendarOutlined />}
                            onClick={() => navigate(`/patient/booking/${doctor.id}`)}
                          >
                            Đặt khám ngay
                          </Button>
                        </div>

                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          </Content>
        </Layout>
      </Content>
      
      <Footer /> 

      {/* Chatbot AI cố định */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>
    </Layout>
  );
}