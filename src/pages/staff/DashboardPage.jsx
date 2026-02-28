import  { useState } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Dropdown, 
  List,
  Badge,
  Space
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  CalendarOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  PhoneOutlined,
  SearchOutlined,
  MedicineBoxOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer"; 

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function AdmissionStaffDashboardPage() {
  const navigate = useNavigate();
  
  const user = { name: "Lê Thị Bích", role: "admission" };

  const statsData = [
    { title: "Lịch hẹn hôm nay", value: 45, icon: <CalendarOutlined />, color: "#1677ff", bg: "#e6f4ff" },
    { title: "Đã Check-in", value: 18, icon: <CheckCircleOutlined />, color: "#52c41a", bg: "#f6ffed" },
    { title: "Bác sĩ đang trực", value: 8, icon: <TeamOutlined />, color: "#722ed1", bg: "#f9f0ff" },
  ];

  const initialBookingRequests = [
    { key: '1', patient: 'Trần Văn X', phone: '0909 123 111', doctor: 'BS. CK2 Trần Thị Hoa', time: '09:00 - 09:30', type: 'Tái khám', status: 'pending' },
    { key: '2', patient: 'Lê Thị Y', phone: '0912 456 222', doctor: 'BS. Nguyễn Văn Nam', time: '09:30 - 10:00', type: 'Mới', status: 'pending' },
    { key: '3', patient: 'Nguyễn Z', phone: '0987 888 333', doctor: 'BS. CK2 Trần Thị Hoa', time: '10:00 - 10:30', type: 'Mới', status: 'pending' },
    { key: '4', patient: 'Phạm Văn K', phone: '0933 777 444', doctor: 'BS. Lê Thị Tú', time: '10:30 - 11:00', type: 'Tái khám', status: 'pending' },
    { key: '5', patient: 'Hoàng Thị M', phone: '0977 111 555', doctor: 'BS. Nguyễn Văn Nam', time: '11:00 - 11:30', type: 'Mới', status: 'pending' },
  ];

  const [bookingRequests] = useState(initialBookingRequests);

  const doctorsOnDuty = [
    { name: "BS. CK2 Trần Thị Hoa", dept: "Da liễu", status: "busy", queue: 3 },
    { name: "BS. Nguyễn Văn Nam", dept: "Nội khoa", status: "online", queue: 0 },
    { name: "BS. Lê Thị Tú", dept: "Nhi khoa", status: "online", queue: 1 },
    { name: "BS. Phạm Minh", dept: "Tai Mũi Họng", status: "offline", queue: 0 },
  ];

  const handleSignOut = () => {
    navigate('/');
  };

  const menuUserItems = [
    { key: '1', label: 'Thông tin tài khoản', icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  const columns = [
    {
      title: (
        <Space>
          <UserOutlined />
          <span>Bệnh nhân</span>
        </Space>
      ),
      dataIndex: 'patient',
      width: 200,
      render: (text) => (
        <Text strong style={{ fontSize: 15 }}>{text}</Text>
      )
    },
    {
      title: (
        <Space>
          <PhoneOutlined />
          <span>Số điện thoại</span>
        </Space>
      ),
      dataIndex: 'phone',
      width: 200,
      render: (text) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 14 }}>{text}</Text>
      )
    },
    {
      title: (
        <Space>
          <MedicineBoxOutlined />
          <span>Bác sĩ phụ trách</span>
        </Space>
      ),
      dataIndex: 'doctor',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }} icon={<UserOutlined />} size="small" />
            <Text strong>{text}</Text>
        </div>
      )
    },
    {
      title: (
        <Space>
          <ClockCircleOutlined />
          <span>Giờ hẹn</span>
        </Space>
      ),
      dataIndex: 'time',
      width: 200,
      render: (text) => (
          <Tag color="blue" style={{ fontSize: 14, padding: '4px 10px', textAlign: 'center', minWidth: 80 }}>
              {text}
          </Tag>
      )
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/staff/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" }, 
            { key: "3", label: "Quản lý lịch" }, 
          ]}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
          onClick={({ key }) => {
             if(key === '1') navigate('/staff/dashboard');
             if(key === '2') navigate('/staff/appointments');
             if(key === '3') navigate('/staff/manage-schedule');
          }}
        />
        
        <Dropdown menu={{ items: menuUserItems }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.name}</span>
                <span style={{ fontSize: 12, color: '#888' }}>Phòng Tiếp nhận</span>
            </div>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#faad14' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "30px 40px" }}>
        
        <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Hoạt động trong ngày</Title>
            <Row gutter={[24, 24]}>
                {statsData.map((stat, index) => (
                    <Col xs={24} sm={8} key={index}>
                        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <Text type="secondary">{stat.title}</Text>
                                    <div style={{ marginTop: 4 }}>
                                        <Statistic value={stat.value} valueStyle={{ fontSize: 24, fontWeight: 'bold' }} />
                                    </div>
                                </div>
                                <div style={{ width: 48, height: 48, background: stat.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: stat.color }}>
                                    {stat.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>

        <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
                <Card 
                    title="Lịch hẹn" 
                    variant="borderless"
                    extra={<Button type="link">Xem tất cả</Button>}
                    style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}
                >
                    <Table 
                        columns={columns} 
                        dataSource={bookingRequests} 
                        pagination={false} 
                        size="middle"
                        locale={{ emptyText: "Không có lịch hẹn nào mới" }}
                    />
                </Card>
            </Col>

            <Col xs={24} lg={8}>
                <Card 
                    title="Trạng thái bác sĩ trực" 
                    variant="borderless"
                    style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={doctorsOnDuty}
                        renderItem={(doc) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <Badge dot status={doc.status === 'online' ? 'success' : doc.status === 'busy' ? 'processing' : 'default'}>
                                            <Avatar icon={<UserOutlined />} />
                                        </Badge>
                                    }
                                    title={<Text strong>{doc.name}</Text>}
                                    description={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Khoa {doc.dept}</Text>
                                            {doc.status === 'busy' && <Tag color="red">Đang khám ({doc.queue})</Tag>}
                                            {doc.status === 'online' && <Tag color="green">Rảnh</Tag>}
                                            {doc.status === 'offline' && <Tag color="default">Nghỉ</Tag>}
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                    <Button block style={{ marginTop: 16 }} icon={<SearchOutlined />}>Tra cứu lịch bác sĩ</Button>
                </Card>
            </Col>
        </Row>

      </Content>
      <Footer />
    </Layout>
  );
}