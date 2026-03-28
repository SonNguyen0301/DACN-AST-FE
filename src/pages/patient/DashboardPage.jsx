
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Tag, 
  Space, 
  Carousel,
  Dropdown,
  Spin,
  Empty,
  Button,
  notification
} from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  MedicineBoxOutlined, 
  HomeOutlined,
  LogoutOutlined,
  ScheduleOutlined,
  PlusCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import dayjs from "dayjs";
import { getUpcomingAppointmentAPI } from "../../services/appointmentService";
import { getUserInfoAPI } from "../../services/userService";

const { Header, Content } = Layout;
const { Paragraph, Text, Title } = Typography;

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const { user, logout} = useAuth(); 
  const [upcomingApt, setUpcomingApt] = useState(null);
  const [loadingApt, setLoadingApt] = useState(true);

  useEffect(() => {
    const checkProfileAndFetchApt = async () => {
      if (!user?.id) return;
      try {
        setLoadingApt(true);
        const profileRes = await getUserInfoAPI();
        const patientData = profileRes.data?.data;

        if (patientData && (patientData.folk === null || patientData.dateOfBirth === null || patientData.citizenCode === null || patientData.address === null || patientData.medicalInsurance === null)) {
            notification.warning({
                key: 'profile-warning',
                message: 'Yêu cầu hoàn thiện hồ sơ',
                description: 'Hồ sơ y tế của bạn chưa đầy đủ. Vui lòng cập nhật thông tin cá nhân để trải nghiệm dịch vụ tốt nhất.',
                placement: 'topRight',
                duration: 5, 
                btn: (
                    <Button 
                        type="primary" 
                        size="small" 
                        onClick={() => {
                            notification.destroy(); 
                            navigate('/patient/personal', { state: { openEditModal: true } }); 
                        }}
                    >
                        Cập nhật ngay
                    </Button>
                ),
            });
        }

        const res = await getUpcomingAppointmentAPI();
        if (res.data?.success && res.data?.data) {
          setUpcomingApt(res.data.data);
        } else {
          setUpcomingApt(null);
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sắp tới:", error);
        setUpcomingApt(null);
      } finally {
        setLoadingApt(false);
      }
    };

    checkProfileAndFetchApt();
  }, [user, navigate]);

  const hospitalIntroSlides = [
    "ATS-Care là nền tảng y tế thông minh giúp bệnh nhân dễ dàng đặt lịch, theo dõi sức khỏe và nhận chẩn đoán da liễu từ AI.",
    "Mục tiêu của chúng tôi là mang đến trải nghiệm chăm sóc sức khỏe hiệu quả, tiện lợi và an toàn.",
    "Với đội ngũ y bác sĩ hàng đầu và công nghệ hiện đại, ATS-Care luôn đồng hành cùng sức khỏe của bạn.",
  ];

const featureCards = [
    {
      key: 'personal',
      title: 'Hồ sơ sức khỏe cá nhân',
      description: 'Nơi lưu trữ tập trung toàn bộ thông tin y tế của bạn. Dễ dàng cập nhật và chia sẻ với bác sĩ khi cần thiết.',
      features: ['Thông tin hành chính & BHYT', 'Tiền sử bệnh lý & Dị ứng', 'Theo dõi chỉ số sức khỏe (BMI, Huyết áp)'],
      icon: <UserOutlined />,
      color: '#1677ff', 
      bg: '#e6f4ff',
      btnColor: 'primary',
      path: '/patient/personal'
    },
    {
      key: 'booking',
      title: 'Đặt lịch khám trực tuyến',
      description: 'Chủ động lựa chọn bác sĩ và thời gian khám phù hợp. Không còn cảnh xếp hàng chờ đợi mệt mỏi tại bệnh viện.',
      features: ['Tìm kiếm bác sĩ theo chuyên khoa', 'Xem lịch trống theo thời gian thực', 'Nhận phiếu khám điện tử ngay lập tức'],
      icon: <PlusCircleOutlined />,
      color: '#52c41a',
      bg: '#f6ffed',
      btnColor: 'primary', 
      path: '/patient/booking'
    },
    {
      key: 'appointments',
      title: 'Quản lý lịch sử khám bệnh',
      description: 'Theo dõi lộ trình điều trị và xem lại kết quả khám bất cứ lúc nào. Hệ thống tự động nhắc nhở khi đến ngày tái khám.',
      features: ['Xem lại toa thuốc & Chẩn đoán', 'Nhắc nhở lịch hẹn sắp tới', 'Đánh giá chất lượng sau khi khám'],
      icon: <ScheduleOutlined />,
      color: '#722ed1', 
      bg: '#f9f0ff',
      btnColor: 'primary',
      path: '/patient/appointments'
    }
  ];

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      key: '1',
      label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>),
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
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)",position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
                    <img 
            src="/ASTCare1.png" 
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </div>

        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']} 
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
            <span style={{ fontSize: 16, fontWeight: 500, color: '#555' }}>{user.firstName + ' ' + user.lastName}</span>
            <Avatar size={36} icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "40px 60px" }}>
        
        <Row gutter={[24, 24]} style={{ display: 'flex', marginBottom: 40 }}>
          <Col xs={24} md={8}>
            <Card
              variant="borderless" 
              style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}
              styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Paragraph style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>Lịch hẹn sắp tới</Paragraph>
                <div style={{ cursor: 'pointer', color: '#1677ff', fontSize: 13 }} onClick={() => navigate('/patient/appointments')}>
                  Xem tất cả
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {loadingApt ? (
                  <div style={{ textAlign: 'center' }}><Spin /></div>
                ) : upcomingApt ? (
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CalendarOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                      <Text>Ngày: <Text strong>{dayjs(upcomingApt.date).format('DD/MM/YYYY')}</Text></Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ClockCircleOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                      <Text>Thời gian: <Text strong>{upcomingApt.from?.substring(0, 5)}  {upcomingApt.to?.substring(0, 5)}</Text></Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MedicineBoxOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                      <Text>Bác sĩ: <Text strong>{upcomingApt.doctorName}</Text></Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <EnvironmentOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                      <Text>Chuyên khoa: <Tag color="blue" style={{ marginLeft: 4 }}>{upcomingApt.department}</Tag></Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HomeOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                        <Text>Tại : <Text strong>{upcomingApt.room}</Text></Text>
                    </div>
                  </Space>
                ) : (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={<Text type="secondary">Bạn chưa có lịch hẹn nào sắp tới</Text>} 
                  />
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card
              variant="borderless" 
              styles={{ body: { padding: 0 } }} 
              style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: 'hidden', height: '100%' }}
            >
              <Carousel autoplay autoplaySpeed={5000} dotPosition="bottom">
                {hospitalIntroSlides.map((slide, index) => (
                  <div key={index}> 
                    <div style={{ height: 270, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(/hospital.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1 }}></div>
                      <Paragraph style={{ position: 'relative', zIndex: 2, color: '#fff', fontSize: 18, textAlign: 'center', margin: 0, padding: '0 40px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                        {slide}
                      </Paragraph>
                    </div>
                  </div>
                ))}
              </Carousel>
            </Card>
          </Col>
        </Row> 

<div>
          <Title level={3} style={{ marginBottom: 24 }}>Tiện ích dành cho bạn</Title>
          
          <Row gutter={[24, 24]}>
            {featureCards.map((feature) => (
              <Col xs={24} md={8} key={feature.key}>
                <Card
                  hoverable
                  variant="borderless"
                  style={{ borderRadius: 16, height: '100%', boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  onClick={() => navigate(feature.path)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ 
                      width: 60, height: 60, 
                      background: feature.bg, 
                      borderRadius: 16, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, color: feature.color,
                      marginBottom: 20
                    }}>
                      {feature.icon}
                    </div>
                    
                    <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>{feature.title}</Title>
                    <Paragraph type="secondary" style={{ marginBottom: 24, flex: 1 }}>
                      {feature.description}
                    </Paragraph>
                    
                    <div style={{ color: '#1677ff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                      Truy cập ngay <RightOutlined style={{ fontSize: 12 }} />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Content>
      
      <Footer />
      
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>
    </Layout>
  );
}