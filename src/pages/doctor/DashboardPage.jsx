
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Dropdown,
  Calendar,
  List,
  Tag,
  Button,
  Timeline,
  Popover, 
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  TeamOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  BellOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined, 
  ArrowDownOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Progress } from "antd";
import Footer from "../../components/common/Footer";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function DoctorDashboardPage() {
  const navigate = useNavigate();
  
  const user = { name: "BS. CK2 Trần Thị Hoa", role: "doctor" };

  const waitingPatients = [
    { id: 1, name: "Nguyễn Văn A", time: "09:00 - 09:30", status: "processing", reason: "Dị ứng da mặt" },
    { id: 2, name: "Trần Thị B", time: "09:30 - 10:00", status: "waiting", reason: "Tái khám mụn" },
    { id: 3, name: "Lê Văn C", time: "10:00 - 10:30", status: "waiting", reason: "Ngứa phát ban" },
    { id: 4, name: "Phạm Thị D", time: "10:30 - 11:00" , status: "waiting", reason: "Tư vấn thẩm mỹ" },
  ];

  const activities = [
    { type: 'danger', content: 'Có kết quả xét nghiệm máu của BN Nguyễn Văn X', time: '5 phút trước', icon: <FileTextOutlined /> },
    { type: 'success', content: 'Đã hoàn thành hồ sơ bệnh án tháng 11', time: '1 giờ trước', icon: <CheckCircleOutlined /> },
    { type: 'warning', content: 'Họp giao ban khoa Da liễu lúc 14:00', time: '2 giờ trước', icon: <TeamOutlined /> },
  ];

const statsData = [
    { 
      title: "Bệnh nhân hôm nay", 
      value: 8, 
      suffix: "ca",
      icon: <ClockCircleOutlined />, 
      color: "#1677ff", 
      bg: "#e6f4ff", 
      progress: 65, 
      subText: "Đã khám 5/8 ca" 
    },
    { 
      title: "Bệnh nhân tuần này", 
      value: 42, 
      suffix: "người",
      icon: <TeamOutlined />, 
      color: "#52c41a", 
      bg: "#f6ffed", 
      trend: "up",
      trendValue: "15%",
      subText: "So với tuần trước"
    },
    { 
      title: "Tổng khám tháng này", 
      value: 156, 
      suffix: "lượt",
      icon: <RiseOutlined />, 
      color: "#722ed1", 
      bg: "#f9f0ff", 
      trend: "down",
      trendValue: "5%",
      subText: "So với tháng trước"
    },
  ];

  const getListData = (value) => {
    const dateString = value.format('YYYY-MM-DD');
    let listData = [];
    switch (dateString) {
      case '2026-01-08': 
        listData = [
            { type: 'success', content: '09:00 - Nguyễn Văn A' }, 
            { type: 'success', content: '10:30 - Trần Thị B' }
        ]; break;
      case '2026-01-14': 
        listData = [
            { type: 'warning', content: '08:30 - Đào Văn E' }, 
            { type: 'warning', content: '15:00 - Ngô F' }
        ]; break;
      case '2026-01-11':  
        listData = [
            { type: 'success', content: '09:30 - Phạm Thị D' }, 
        ]; break;
      default:
    }
    return listData || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => {
          const patientName = item.content.includes('-') ? item.content.split('-')[1].trim() : item.content;
          
          const popoverContent = (
            <div style={{ width: 280 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                 <Avatar 
                    size={48} 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: item.type === 'success' ? '#87d068' : '#1677ff' }} 
                 />
                 <div>
                    <Text strong style={{ display: 'block', fontSize: 16 }}>{patientName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Nam - 32 tuổi • {index % 2 === 0 ? 'Bệnh nhân mới' : 'Tái khám'}</Text>
                 </div>
              </div>
              
              <div style={{ background: '#f5f7fa', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <FileTextOutlined style={{ color: '#1677ff' }} /> 
                    <Text strong style={{ fontSize: 12 }}>Lý do khám:</Text>
                 </div>
                 <Text style={{ fontSize: 13, color: '#555' }}>
                    Dị ứng da mặt, ngứa nhiều về đêm, đã dùng thuốc bôi nhưng không đỡ.
                 </Text>
              </div>
  
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                  <Tag color={item.type === 'warning' ? 'warning' : item.type === 'error' ? 'red' : 'success'}>
                      {item.type === 'warning' ? 'Chờ khám' : item.type === 'error' ? 'Quan trọng' : 'Đã khám'}
                  </Tag>
                  <Button type="link" size="small" style={{ padding: 0, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => navigate('/doctor/appointments')}>
                      Xem hồ sơ <ArrowRightOutlined />
                  </Button>
              </div>
            </div>
          );

          return (
            <li key={index} style={{ marginBottom: 6 }}>
               <Popover content={popoverContent} title={null} trigger="hover" placement="rightTop">
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: 6,
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f4ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Badge status={item.type} /> 
                
                  <span style={{ fontSize: 12, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#333' }}>
                    {item.content}
                  </span>
                </div>
              </Popover>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderStatusTag = (status) => {
    switch(status) {
      case 'processing': return <Tag color="processing" icon={<ClockCircleOutlined />}>Đang khám</Tag>;
      case 'waiting': return <Tag color="warning">Đang chờ</Tag>;
      default: return <Tag>N/A</Tag>;
    }
  };

  const handleSignOut = () => {
      console.log("Đã đăng xuất!");
      navigate('/');
  };

  const menuUserItems = [
    {
      key: '1',
      label: (<a onClick={() => navigate('/doctor/profile')}>Hồ sơ bác sĩ</a>),
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: (<a onClick={handleSignOut}>Đăng xuất</a>),
      icon: <LogoutOutlined />,
      danger: true,
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/doctor/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" },
            { key: "3", label: "Khám bệnh" },
          ]}
          onClick ={({ key }) => {
            switch (key) {
              case "1": navigate('/doctor/dashboard'); break;
              case "2": navigate('/doctor/appointments'); break;
              case "3": navigate('/doctor/consulting'); break;
              default: break;
            }
          }}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
        />
         <Dropdown menu={{ items: menuUserItems }} placement="bottomRight" arrow>
           <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                 <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.name}</span>
                 <span style={{ fontSize: 12, color: '#888' }}>Khoa Da liễu</span>
             </div>
             <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
           </div>
         </Dropdown>
      </Header>

      <Content style={{ padding: "30px 40px" }}>
        
        <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Tổng quan hoạt động</Title>
            <Row gutter={[24, 24]}>
                {statsData.map((stat, index) => (
                    <Col xs={24} sm={8} key={index}>
                        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <Text type="secondary" style={{ fontSize: 14 }}>{stat.title}</Text>
                                    
                                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        <Text strong style={{ fontSize: 28 }}>{stat.value}</Text>
                                        <Text type="secondary" style={{ fontSize: 14 }}>{stat.suffix}</Text>
                                    </div>

                                    <div style={{ marginTop: 8 }}>
                                        {stat.progress && (
                                            <>
                                                <Progress percent={stat.progress} showInfo={false} size="small" strokeColor={stat.color} />
                                                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                                                    {stat.subText}
                                                </Text>
                                            </>
                                        )}

                                        {stat.trend && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ 
                                                    color: stat.trend === 'up' ? '#52c41a' : '#ff4d4f', 
                                                    background: stat.trend === 'up' ? '#f6ffed' : '#fff1f0',
                                                    padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                                                    display: 'flex', alignItems: 'center', gap: 2
                                                }}>
                                                    {stat.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                                    {stat.trendValue}
                                                </span>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{stat.subText}</Text>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ 
                                    width: 48, height: 48, 
                                    background: stat.bg, borderRadius: 12, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontSize: 24, color: stat.color,
                                    marginLeft: 12
                                }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>Lịch làm việc</Title>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Badge status="warning" /><Text style={{ fontSize: 12 }}>Chờ khám</Text></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Badge status="success" /><Text style={{ fontSize: 12 }}>Đã khám</Text></div>
                    </div>
                </div>
                <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} styles={{ body: { padding: 0 } }}>
                    <Calendar cellRender={dateCellRender} style={{ padding: 24, borderRadius: 16 }} />
                </Card>
            </Col>

            <Col xs={24} lg={8}>
                <div style={{ height: 44 }}></div> 
                <Card 
                    title={<div style={{display: 'flex', alignItems: 'center', gap: 8}}><ClockCircleOutlined style={{color: '#1677ff'}}/> <span>Hàng đợi hôm nay</span></div>}
                    variant="borderless"
                    extra={<a href="#" onClick={() => navigate('/doctor/appointments')}>Xem tất cả</a>}
                    style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: 24 }}
                    styles={{ body: { padding: '0 16px 16px' } }}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={waitingPatients}
                        renderItem={(item) => (
                            <List.Item > 
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: item.status === 'processing' ? '#1677ff' : '#fde3cf', color: item.status === 'processing' ? '#fff' : '#f56a00' }}>{item.name[0]}</Avatar>}
                                    title={<Text strong>{item.name}</Text>}
                                    description={
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>{item.time} - {item.reason}</Text>
                                            <div>{renderStatusTag(item.status)}</div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                    <Button type="primary" block style={{ marginTop: 8 }}>Bắt đầu ca khám tiếp theo</Button>
                </Card>

                <Card 
                    title={<div style={{display: 'flex', alignItems: 'center', gap: 8}}><BellOutlined style={{color: '#faad14'}}/> <span>Thông báo mới</span></div>}
                    variant="borderless"
                    style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                >
                    <Timeline 
                        items={activities.map(act => ({
                            color: act.type === 'danger' ? 'red' : act.type === 'success' ? 'green' : 'blue',
                            dot: act.icon,
                            children: (
                                <>
                                    <Text strong>{act.content}</Text>
                                    <br/>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{act.time}</Text>
                                </>
                            )
                        }))}
                    />
                </Card>

            </Col>
        </Row>
      </Content>
      <Footer />
      
    </Layout>
  );
}