import  { useRef }from 'react';
import { Layout, Button, Typography, Row, Col, Space, Card, Image, Carousel } from 'antd';
import { 
  ArrowRightOutlined, CheckCircleFilled, 
  CloudUploadOutlined, ScanOutlined, FileProtectOutlined, ScheduleOutlined,
   BankOutlined, UserOutlined, MedicineBoxOutlined,
  ExperimentOutlined, LockOutlined, CalendarOutlined, ReadOutlined, LeftOutlined, RightOutlined, 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Footer from "../../components/common/Footer"; 

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function LandingPage() {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const arrowBtnStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    background: 'rgba(255, 255, 255, 0.8)', 
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  const btnPrimaryStyle = {
    height: '50px', padding: '0 32px', borderRadius: '25px',
    fontSize: '16px', fontWeight: '600', background: '#1677ff', border: 'none',
    boxShadow: '0 10px 20px rgba(22, 119, 255, 0.2)', color: '#fff'
  };
  const featureSlides = [
    {
      key: 'ai',
      img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2070&auto=format&fit=crop", 
      alt: "Chẩn đoán AI",
      badgeIcon: <ScanOutlined style={{ color: '#1677ff', fontSize: 20 }} />,
      badgeTitle: "Phân tích AI",
      badgeSub: "Độ chính xác cao"
    },
    {
      key: 'booking',
      img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop", 
      alt: "Đặt lịch khám",
      badgeIcon: <CalendarOutlined style={{ color: '#52c41a', fontSize: 20 }} />,
      badgeTitle: "Đặt lịch 24/7",
      badgeSub: "Không cần chờ đợi"
    },
    {
      key: 'support',
      img: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop", 
      alt: "Hỗ trợ chuyên môn",
      badgeIcon: <ReadOutlined style={{ color: '#722ed1', fontSize: 20 }} />,
      badgeTitle: "Hồ sơ số",
      badgeSub: "Quản lý tập trung"
    }
  ];

  const sectionPadding = '100px 5%'; 

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      
      <Header
        style={{
          background: "#fff", padding: "0 40px", display: "flex", alignItems: "center",
          justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
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
        <Space size="large" className="hidden md:flex">
          {['Trang chủ', 'Tính năng', 'Quy trình', 'Công nghệ', 'Đối tượng'].map(item => (
            <Button type="text" key={item} style={{ fontSize: 16, fontWeight: 500, color: '#555' }}>{item}</Button>
          ))}
        </Space>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Button type="text" style={{ fontSize: '16px', fontWeight: '600', color: '#1677ff' }} onClick={() => navigate('/login')}>
                Đăng nhập
            </Button>
            <Button type="primary" style={btnPrimaryStyle} onClick={() => navigate('/register')}>
                Đăng ký
            </Button>
        </div>
      </Header>

      <Content>
        
        <div style={{ padding: '80px 5%', background: 'linear-gradient(180deg, #fff 0%, #f8fbff 100%)' }}>
          <Row gutter={[64, 48]} align="middle">
            <Col xs={24} md={12}>
              <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 20, fontSize: 14, marginBottom: 24, background: '#e6f4ff', color: '#1677ff', fontWeight: 600 }}>
                🚀 Trợ lý da liễu AI 24/7
              </div>
              <Title style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.2, marginBottom: 24, color: '#1f2937' }}>
                Chẩn đoán Da liễu <br/><span style={{ color: '#1677ff' }}>Thông minh bằng AI</span>
              </Title>
              <Paragraph style={{ fontSize: 18, color: '#6b7280', marginBottom: 40, lineHeight: 1.6, maxWidth: 500 }}>
                Nền tảng hỗ trợ bác sĩ và bệnh nhân kết nối nhanh chóng. Phân tích hình ảnh tổn thương da với độ chính xác cao.
              </Paragraph>
              <Space size="middle">
              </Space>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'center', position: 'relative', padding: '20px' }}>
              
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                width: '90%', 
                height: '90%', 
                background: 'radial-gradient(circle, rgba(22,119,255,0.2) 0%, rgba(255,255,255,0) 70%)', 
                filter: 'blur(40px)', 
                borderRadius: '50%', 
                zIndex: 0 
              }}></div>

              <Image 
                preview={false}
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Công nghệ chẩn đoán da liễu AI"
                style={{ 
                  borderRadius: '40px 40px 40px 40px', 
                  boxShadow: '0 30px 60px rgba(22, 119, 255, 0.25)', 
                  maxWidth: '100%',
                  height: 'auto',
                  position: 'relative', 
                  zIndex: 1,
                  border: '6px solid #fff' 
                }} 
              />

              <div style={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '-5%',
                  background: '#fff',
                  padding: '15px 25px',
                  borderRadius: '20px',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  zIndex: 2,
                  animation: 'bounce 3s infinite ease-in-out' 
              }}>
                  <div style={{ width: 50, height: 50, background: '#e6f7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleFilled style={{ fontSize: 28, color: '#1677ff' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                      <Text strong style={{ fontSize: 16, display: 'block' }}>Độ chính xác</Text>
                      <Text style={{ fontSize: 24, fontWeight: 800, color: '#1677ff' }}>85%</Text>
                  </div>
              </div>
            </Col>
          </Row>
        </div>

        <div style={{ padding: sectionPadding, background: '#fff' }}>
          <Row gutter={[80, 48]} align="middle">
            <Col xs={24} md={13}>
              <Title level={3} style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>3 Tính năng cốt lõi</Title>
              <Paragraph style={{ fontSize: 17, color: '#666', lineHeight: 1.8, marginBottom: 32 }}>
                Giải pháp toàn diện giúp hỗ trợ quy trình khám chữa bệnh cho cả bệnh nhân và bác sĩ.
              </Paragraph>
              
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {[
                  { title: 'Chẩn đoán AI ', desc: 'Trả kết quả gợi ý và mức độ nghiêm trọng dưới 10 giây.' },
                  { title: 'Đặt lịch & Quản lý', desc: 'Đăng ký lịch khám trực tuyến, giảm thời gian xếp hàng.' },
                  { title: 'Hỗ trợ chuyên môn', desc: 'Giảm tải áp lực cho bác sĩ, quản lý hồ sơ tập trung.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 20 }}>
                    <div style={{ width: 40, height: 40, background: '#e6f4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1677ff', flexShrink: 0 }}>
                      <CheckCircleFilled />
                    </div>
                    <div>
                      <Title level={5} style={{ margin: 0, fontSize: 18 }}>{item.title}</Title>
                      <Text type="secondary" style={{ fontSize: 15 }}>{item.desc}</Text>
                    </div>
                  </div>
                ))}
              </Space>
            </Col>

           <Col xs={24} md={11} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              
              <div style={{ width: '100%', maxWidth: '500px', position: 'relative' }}> 
                
                <Button 
                  shape="circle"
                  icon={<LeftOutlined style={{ color: '#1677ff', fontSize: 16 }} />}
                  style={{ ...arrowBtnStyle, left: -20 }} 
                  onClick={() => carouselRef.current.prev()} 
                />

                <Carousel 
                  ref={carouselRef} 
                  autoplay 
                  autoplaySpeed={3000} 
                  effect="fade" 
                  dots={false}
                >
                  {featureSlides.map((slide) => (
                    <div key={slide.key} style={{ position: 'relative', padding: '10px' }}>
                      <Image 
                        preview={false}
                        src={slide.img}
                        alt={slide.alt}
                        style={{ 
                          width: '100%',
                          height: '350px', 
                          objectFit: 'cover',
                          borderRadius: 24, 
                          border: '8px solid #fff',
                        }} 
                      />
                      <div style={{ 
                        position: 'absolute', bottom: 40, left: -10,
                        background: '#fff', padding: '12px 20px', borderRadius: 12, 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', 
                        gap: 10, border: '1px solid #f0f0f0', zIndex: 10
                      }}>
                          <div style={{ width: 40, height: 40, background: '#e6f7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {slide.badgeIcon}
                          </div>
                          <div>
                            <Text strong style={{ display: 'block', fontSize: 14 }}>{slide.badgeTitle}</Text>
                            <Text type="success" style={{ fontSize: 12 }}>{slide.badgeSub}</Text>
                          </div>
                      </div>
                    </div>
                  ))}
                </Carousel>

                <Button 
                  shape="circle"
                  icon={<RightOutlined style={{ color: '#1677ff', fontSize: 16 }} />}
                  style={{ ...arrowBtnStyle, right: -20 }} 
                  onClick={() => carouselRef.current.next()} 
                />
                
              </div>
            </Col>
          </Row>
        </div>

        <div style={{ padding: sectionPadding, background: '#f9fafb' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ fontSize: 36, fontWeight: 800 }}>Quy trình hoạt động đơn giản</Title>
            <Text type="secondary" style={{ fontSize: 18 }}>4 bước để tiếp cận dịch vụ y tế thông minh</Text>
          </div>

          <Row gutter={[32, 32]}>
            {[
              { 
                step: '01', title: 'Tải ảnh lên', icon: <CloudUploadOutlined />, desc: 'Chụp ảnh vùng da tổn thương và mô tả triệu chứng.',
                color: '#1677ff', bg: '#e6f4ff' 
              },
              { 
                step: '02', title: 'Phân tích AI', icon: <ScanOutlined />, desc: 'AI xử lý hình ảnh, so sánh với cơ sở dữ liệu y khoa.',
                color: '#fa8c16', bg: '#fff7e6' 
              },
              { 
                step: '03', title: 'Nhận kết quả', icon: <FileProtectOutlined />, desc: 'Nhận gợi ý chẩn đoán sơ bộ và mức độ nghiêm trọng.',
                color: '#52c41a', bg: '#f6ffed' 
              },
              { 
                step: '04', title: 'Kết nối Bác sĩ', icon: <ScheduleOutlined />, desc: 'Đặt lịch khám với bác sĩ hoặc nhập viện nếu cần.',
                color: '#722ed1', bg: '#f9f0ff' 
              },
            ].map((item, index) => (
              <Col xs={24} md={6} key={index}>
                <Card 
                  hoverable 
                  bordered={false} 
                  style={{ borderRadius: 20, height: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ 
                    width: 70, 
                    height: 70, 
                    background: item.bg, 
                    borderRadius: '50%', 
                    margin: '0 auto 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 30, 
                    color: item.color 
                  }}>
                    {item.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 12 }}>{item.title}</Title>
                  <Paragraph type="secondary" style={{ fontSize: 15 }}>{item.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ padding: sectionPadding, background: '#001529', color: '#fff' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 50, maxWidth: 800, margin: '0 auto 50px' }}>
            <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>An tâm tuyệt đối về Sức khỏe & Dữ liệu</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }}>
              Sự kết hợp hoàn hảo giữa tốc độ của AI và sự tận tâm của bác sĩ.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {[
              {
                icon: <ExperimentOutlined style={{ fontSize: 32, color: '#4096ff' }} />,
                title: "AI Chẩn đoán chuẩn xác",
                desc: "Được huấn luyện trên hàng ngàn hình ảnh lâm sàng, giúp phát hiện sớm các dấu hiệu bất thường mà mắt thường dễ bỏ qua."
              },
              {
                icon: <LockOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
                title: "Dữ liệu là 'Của Riêng Bạn'",
                desc: "Hồ sơ bệnh án được mã hóa an toàn. Chỉ bạn và bác sĩ trực tiếp điều trị mới có quyền truy cập."
              },
            ].map((item, index) => (
              <Col xs={24} md={12} key={index}>
                <div 
                  style={{ 
                    padding: '32px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: 24, 
                    border: '1px solid rgba(255,255,255,0.1)',
                    height: '100%',
                    transition: 'all 0.3s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <div style={{ 
                      padding: 16, 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: 16, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      {item.icon}
                    </div>

                    <div>
                      <Title level={4} style={{ color: '#fff', marginTop: 0, marginBottom: 8 }}>{item.title}</Title>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                        {item.desc}
                      </Paragraph>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ padding: sectionPadding, background: '#fff' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ fontSize: 36, fontWeight: 800 }}>Ai nên sử dụng ASTCare?</Title>
          </div>
          <Row gutter={[32, 32]}>
            {[
              { 
                role: 'Bệnh nhân', 
                desc: 'Người có nhu cầu kiểm tra da, lo lắng về triệu chứng lạ, muốn đặt lịch nhanh.',
                icon: <UserOutlined />, 
                color: '#1677ff', bg: '#e6f4ff' 
              },
              { 
                role: 'Bác sĩ Da liễu', 
                desc: 'Cần công cụ hỗ trợ chẩn đoán nhanh, quản lý bệnh nhân hiệu quả hơn.',
                icon: <MedicineBoxOutlined />, 
                color: '#722ed1', bg: '#f9f0ff' 
              },
              { 
                role: 'Bệnh viện', 
                desc: 'Cần tối ưu quy trình tiếp nhận, giảm tải áp lực trong giờ cao điểm.',
                icon: <BankOutlined />, 
                color: '#52c41a', bg: '#f6ffed' 
              },
            ].map((item, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card hoverable bordered={false} style={{ borderRadius: 24, textAlign: 'center', padding: 20, border: '1px solid #f0f0f0' }}>
                  <div style={{ width: 80, height: 80, background: item.bg, borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: item.color }}>
                    {item.icon}
                  </div>
                  <Title level={4}>{item.role}</Title>
                  <Paragraph type="secondary">{item.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ padding: '80px 5%', background: 'linear-gradient(90deg, #1677ff 0%, #4096ff 100%)', textAlign: 'center', color: '#fff' }}>
          <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>Sẵn sàng chăm sóc làn da của bạn?</Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
            Đừng để những lo lắng về da ảnh hưởng đến cuộc sống. Hãy để công nghệ AI của chúng tôi giúp bạn ngay hôm nay.
          </Paragraph>
          <Button size="large" style={{ height: 56, padding: '0 48px', fontSize: 18, borderRadius: 28, border: 'none', color: '#1677ff', fontWeight: 'bold', background: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }} onClick={() => navigate('/patient/booking')}>
            Bắt đầu chẩn đoán miễn phí <ArrowRightOutlined />
          </Button>
        </div>

      </Content>

      <Footer />

    </Layout>
  );
}