import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Table, 
  Tag, 
  Button, 
  Dropdown, 
  Progress,
  List,
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowRightOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer"; 

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  
  const user = { name: "Administrator", role: "admin" };

  const menuItems = [
    { 
      key: 'dashboard', 
      label: 'Trang chủ', 
    },
    { 
      key: 'users', 
      label: 'Quản lý tài khoản', 
    },
    { 
      key: 'AI', 
      label: 'Quản lý Model AI', 
    },
  ];

  const statsData = [
    { 
      title: "Tổng doanh thu tháng", 
      value: "1.2 Tỷ", 
      prefix: <DollarOutlined />, 
      suffix: "VNĐ", 
      color: "#1677ff", 
      bg: "#e6f4ff",
      trend: "up",
      trendVal: "12%"
    },
    { 
      title: "Tổng lượt khám", 
      value: 1250, 
      prefix: <MedicineBoxOutlined />, 
      color: "#52c41a", 
      bg: "#f6ffed",
      trend: "up",
      trendVal: "5%"
    },
    { 
      title: "Bệnh nhân mới", 
      value: 340, 
      prefix: <TeamOutlined />, 
      color: "#faad14", 
      bg: "#fffbe6",
      trend: "down",
      trendVal: "2%"
    },
    { 
      title: "Bác sĩ đang hoạt động", 
      value: 45, 
      prefix: <UserOutlined />, 
      color: "#722ed1", 
      bg: "#f9f0ff",
      trend: "stable",
      trendVal: "0%"
    },
  ];

  const topDoctors = [
    { key: 1, name: 'BS. CK2 Trần Thị Hoa', dept: 'Da liễu', patients: 120, rating: 4.9, revenue: '150tr' },
    { key: 2, name: 'BS. Nguyễn Văn Nam', dept: 'Nội khoa', patients: 98, rating: 4.8, revenue: '120tr' },
    { key: 3, name: 'BS. Lê Thị Tú', dept: 'Nhi khoa', patients: 85, rating: 4.7, revenue: '90tr' },
    { key: 4, name: 'BS. Phạm Minh', dept: 'Tai Mũi Họng', patients: 70, rating: 4.6, revenue: '85tr' },
  ];


  const columns = [
    {
      title: 'Bác sĩ',
      dataIndex: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Chuyên khoa',
      dataIndex: 'dept',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Lượt khám',
      dataIndex: 'patients',
      sorter: (a, b) => a.patients - b.patients,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      render: (rate) => <span style={{ color: '#faad14' }}>★ {rate}</span>
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      render: (text) => <Text type="success" strong>{text}</Text>
    },
  ];

  const handleSignOut = () => navigate('/');

  const menuUserItems = [
    { key: '1', label: 'Hồ sơ Admin', icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  const handleMenuClick = ({ key }) => {
    switch (key) {
        case 'dashboard': navigate('/admin/dashboard'); break;
        case 'users': navigate('/admin/user-management'); break;
        case 'AI': navigate('/admin/model-ai'); break;
        default: break;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
        
        <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>
                <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
            </div>

            <Menu
                mode="horizontal"
                defaultSelectedKeys={['dashboard']}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ 
                    fontSize: 15, 
                    fontWeight: 500, 
                    color: '#555', 
                    borderBottom: 'none', 
                    flex: 1, 
                    justifyContent: 'center',
                    marginLeft: 20
                }}
            />

            <Dropdown menu={{ items: menuUserItems }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.name}</span>
                        <span style={{ fontSize: 12, color: '#888' }}>Quản trị hệ thống</span>
                    </div>
                    <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#001529' }} />
                </div>
            </Dropdown>
        </Header>

        <Content style={{ padding: "30px 40px" }}>
            
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>Tổng quan hệ thống</Title>
                <Row gutter={[24, 24]}>
                    {statsData.map((stat, index) => (
                        <Col xs={24} sm={12} xl={6} key={index}>
                            <Card variant="borderless" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 13 }}>{stat.title}</Text>
                                        <Title level={3} style={{ margin: '4px 0' }}>{stat.value}</Title>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Tag color={stat.trend === 'up' ? 'green' : stat.trend === 'down' ? 'red' : 'default'} style={{ margin: 0 }}>
                                                {stat.trend === 'up' ? <RiseOutlined /> : stat.trend === 'down' ? <FallOutlined /> : '-'} {stat.trendVal}
                                            </Tag>
                                            <Text type="secondary" style={{ fontSize: 12 }}>so với tháng trước</Text>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        width: 48, height: 48, 
                                        background: stat.bg, borderRadius: 12, 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontSize: 24, color: stat.color 
                                    }}>
                                        {stat.prefix}
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
                        title="Top bác sĩ tiêu biểu tháng này" 
                        extra={<Button type="link">Xem tất cả <ArrowRightOutlined /></Button>}
                        variant="borderless" 
                        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    >
                        <Table 
                            columns={columns} 
                            dataSource={topDoctors} 
                            pagination={false} 
                            size="middle"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card 
                        title="Phân bổ bệnh nhân theo khoa" 
                        variant="borderless" 
                        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 24 }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text>Da liễu</Text>
                                    <Text strong>45%</Text>
                                </div>
                                <Progress percent={45} showInfo={false} strokeColor="#1677ff" />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text>Nội khoa</Text>
                                    <Text strong>25%</Text>
                                </div>
                                <Progress percent={25} showInfo={false} strokeColor="#52c41a" />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text>Nhi khoa</Text>
                                    <Text strong>20%</Text>
                                </div>
                                <Progress percent={20} showInfo={false} strokeColor="#faad14" />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text>Khác</Text>
                                    <Text strong>10%</Text>
                                </div>
                                <Progress percent={10} showInfo={false} strokeColor="#bfbfbf" />
                            </div>
                        </div>
                    </Card>

                    <Card 
                        title="Hoạt động hệ thống" 
                        variant="borderless" 
                        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={[
                                { title: 'Bệnh nhân Nguyễn A đã đặt lịch khám Da liễu', time: '5 phút trước' },
                                { title: 'BS. Hoa đã hoàn thành ca khám #1234', time: '10 phút trước' },
                                { title: 'Thêm mới thuốc "Panadol" vào kho', time: '1 giờ trước' },
                                { title: 'Hệ thống sao lưu dữ liệu tự động', time: '2 giờ trước' },
                            ]}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<BellOutlined style={{ color: '#faad14', fontSize: 18 }} />}
                                        title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
                                        description={<Text type="secondary" style={{ fontSize: 11 }}>{item.time}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

        </Content>
        
        <Footer />
    </Layout>
  );
}