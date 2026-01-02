import React from 'react';
import { Layout, Button, Typography, Row, Col, Avatar, Space, Card, Image, Steps, Divider,Carousel ,Tag} from 'antd';
import { 
  ArrowRightOutlined, PlayCircleFilled, CheckCircleFilled, GlobalOutlined,
  CloudUploadOutlined, ScanOutlined, FileProtectOutlined, ScheduleOutlined,
  SafetyCertificateFilled, BankOutlined, UserOutlined, MedicineBoxOutlined,
  ExperimentOutlined, LockOutlined, CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function LandingPage() {
  const navigate = useNavigate();

  // --- STYLE VARIABLES (Để đồng bộ giao diện) ---
  const btnPrimaryStyle = {
    height: '50px', padding: '0 32px', borderRadius: '25px',
    fontSize: '16px', fontWeight: '600', background: '#1677ff', border: 'none',
    boxShadow: '0 10px 20px rgba(22, 119, 255, 0.2)', color: '#fff'
  };

  const btnSecondaryStyle = {
    height: '50px', padding: '0 32px', borderRadius: '25px',
    fontSize: '16px', fontWeight: '600', color: '#1677ff', background: '#e6f4ff', border: 'none',
  };
  const featureImages = [
      {
        src: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop",
        alt: "Chẩn đoán da liễu bằng hình ảnh"
      },
      {
        src: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=2068&auto=format&fit=crop",
        alt: "Đặt lịch và quản lý thời gian thông minh"
      },
      {
        src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop",
        alt: "Đội ngũ bác sĩ hội chẩn chuyên môn"
      }
    ];
  const sectionPadding = '100px 5%'; // Khoảng cách chuẩn giữa các phần

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      
      {/* --- HEADER --- */}
            <Header
        style={{
          background: "#fff", padding: "0 40px", display: "flex", alignItems: "center",
          justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          position: 'sticky', top: 0, zIndex: 1000 // Sticky Header
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
          <img 
            src="/ASTCare1.png" // <-- Đường dẫn đến file ảnh trong thư mục public
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} // Điều chỉnh chiều cao cho vừa header
          />
        </div>
        <Space size="large" className="hidden md:flex">
          {['Trang chủ', 'Tính năng', 'Quy trình', 'Công nghệ', 'Đối tượng'].map(item => (
            <Button type="text" key={item} style={{ fontSize: 16, fontWeight: 500, color: '#555' }}>{item}</Button>
          ))}
        </Space>
        <Button type="primary" style={btnPrimaryStyle} onClick={() => navigate('/login')}>Đăng nhập</Button>
      </Header>

      <Content>
        
        {/* 1. HERO SECTION */}
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
              
              {/* 1. Lớp nền mờ (Glow Effect) trang trí phía sau */}
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

              {/* 2. Hình ảnh chính */}
              {/* Tôi dùng ảnh demo từ Unsplash. Bạn có thể thay bằng đường dẫn ảnh thật của bạn, ví dụ: "/hero-image.png" */}
              <Image 
                preview={false}
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Công nghệ chẩn đoán da liễu AI"
                style={{ 
                  borderRadius: '40px 40px 40px 40px', // Bo góc kiểu hiện đại (góc dưới trái vuông)
                  boxShadow: '0 30px 60px rgba(22, 119, 255, 0.25)', 
                  maxWidth: '100%',
                  height: 'auto',
                  position: 'relative', // Để nổi lên trên lớp nền mờ
                  zIndex: 1,
                  border: '6px solid #fff' // Thêm viền trắng cho nổi bật
                }} 
              />

              {/* 3. Thẻ nổi (Floating Card) trang trí thêm */}
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
                  animation: 'bounce 3s infinite ease-in-out' // Bạn có thể thêm keyframe bounce trong CSS nếu muốn nó chuyển động
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

        {/* 2. ABOUT & FEATURES (Gộp chung style ảnh bạn gửi) */}
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
              
              {/* Hình ảnh Bác sĩ sử dụng Tablet (Thể hiện tính năng Quản lý & Chẩn đoán) */}
              <Image 
                preview={false}
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop"
                alt="Bác sĩ sử dụng ứng dụng SkinCare"
                style={{ 
                  width: '100%',
                  borderRadius: 24, 
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)', // Đổ bóng sâu
                  border: '8px solid #fff', // Viền trắng tạo cảm giác khung tranh
                }} 
              />

              {/* Thẻ nổi nhỏ trang trí (Tùy chọn - Để nhấn mạnh tính năng AI) */}
              <div style={{ 
                position: 'absolute', 
                bottom: 30, 
                left: -20, 
                background: '#fff', 
                padding: '12px 20px', 
                borderRadius: 12, 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10,
                border: '1px solid #f0f0f0'
              }}>
                  <div style={{ width: 40, height: 40, background: '#e6f7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ScanOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', fontSize: 14 }}>Phân tích AI</Text>
                    <Text type="success" style={{ fontSize: 12 }}>Độ chính xác cao</Text>
                  </div>
              </div>

            </Col>
          </Row>
        </div>

        {/* 4. QUY TRÌNH HOẠT ĐỘNG (HOW IT WORKS) */}
        <div style={{ padding: sectionPadding, background: '#f9fafb' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ fontSize: 36, fontWeight: 800 }}>Quy trình hoạt động đơn giản</Title>
            <Text type="secondary" style={{ fontSize: 18 }}>4 bước để tiếp cận dịch vụ y tế thông minh</Text>
          </div>

          <Row gutter={[32, 32]}>
            {[
              { step: '01', title: 'Tải ảnh lên', icon: <CloudUploadOutlined />, desc: 'Chụp ảnh vùng da tổn thương và mô tả triệu chứng.' },
              { step: '02', title: 'Phân tích AI', icon: <ScanOutlined />, desc: 'AI xử lý hình ảnh, so sánh với cơ sở dữ liệu y khoa.' },
              { step: '03', title: 'Nhận kết quả', icon: <FileProtectOutlined />, desc: 'Nhận gợi ý chẩn đoán sơ bộ và mức độ nghiêm trọng.' },
              { step: '04', title: 'Kết nối Bác sĩ', icon: <ScheduleOutlined />, desc: 'Đặt lịch khám với bác sĩ hoặc nhập viện nếu cần.' },
            ].map((item, index) => (
              <Col xs={24} md={6} key={index}>
                <Card 
                  hoverable 
                  bordered={false} 
                  style={{ borderRadius: 20, height: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
                >
                  {/* <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 80, fontWeight: 900, color: '#f0f5ff', opacity: 0.5 }}>{item.step}</div> */}
                  <div style={{ width: 70, height: 70, background: index % 2 === 0 ? '#e6f4ff' : '#fff7e6', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: index % 2 === 0 ? '#1677ff' : '#fa8c16' }}>
                    {item.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 12 }}>{item.title}</Title>
                  <Paragraph type="secondary" style={{ fontSize: 15 }}>{item.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 5. CÔNG NGHỆ & BẢO MẬT (TECHNOLOGY) */}
        <div style={{ padding: sectionPadding, background: '#001529', color: '#fff' }}>
          <Row gutter={[64, 48]} align="middle">
            <Col xs={24} md={12}>
              <div style={{ padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: 30, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>Công nghệ & Bảo mật</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 32 }}>
                  Chúng tôi đặt sự an toàn và chính xác lên hàng đầu. Hệ thống được xây dựng dựa trên các tiêu chuẩn y tế khắt khe nhất.
                </Paragraph>
                
                <Space direction="vertical" size="middle">
                  <div style={{ display: 'flex', gap: 16 }}>
                    <ExperimentOutlined style={{ fontSize: 28, color: '#4096ff' }} />
                    <div>
                      <Text strong style={{ color: '#fff', fontSize: 18 }}>Công nghệ AI Deep Learning</Text>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>Sử dụng TensorFlow, Keras và các mô hình CNN tiên tiến.</Paragraph>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                    <LockOutlined style={{ fontSize: 28, color: '#52c41a' }} />
                    <div>
                      <Text strong style={{ color: '#fff', fontSize: 18 }}>Bảo mật dữ liệu tuyệt đối</Text>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>Mã hóa toàn bộ bệnh án và hình ảnh, đảm bảo quyền riêng tư.</Paragraph>
                    </div>
                  </div>
                </Space>
              </div>
            </Col>
            {/* Ảnh minh họa công nghệ */}
            <Col xs={24} md={12} style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <div style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
                 {/* Hiệu ứng phát sáng phía sau ảnh (Tùy chọn) */}
                 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(64,150,255,0.3) 0%, rgba(0,21,41,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }}></div>

                 <Image 
                   preview={false} 
                   // Ảnh Server Room chất lượng cao
                   src="/public/ai.png" 
                   alt="Trung tâm dữ liệu bảo mật"
                   style={{ 
                     borderRadius: 30, 
                     boxShadow: '0 30px 60px rgba(0,0,0,0.5)', // Đổ bóng tối cho nền tối
                     position: 'relative',
                     zIndex: 1,
                     border: '1px solid rgba(255,255,255,0.1)' // Viền mờ tinh tế
                   }} 
                 />
               </div>
            </Col>
          </Row>
        </div>

        {/* 6. ĐỐI TƯỢNG SỬ DỤNG (TARGET AUDIENCE) */}
        <div style={{ padding: sectionPadding, background: '#fff' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ fontSize: 36, fontWeight: 800 }}>Ai nên sử dụng ATSCare?</Title>
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

        {/* CTA FINAL */}
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

      {/* 7. FOOTER */}
      <Footer style={{ background: '#fff', padding: '60px 5%', borderTop: '1px solid #eee' }}>
        <Row gutter={[48, 48]}>
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, background: '#1677ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><GlobalOutlined /></div>
              <span style={{ fontSize: 20, fontWeight: 'bold' }}>ATSCare</span>
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Hệ thống hỗ trợ chẩn đoán da liễu thông minh.
            </Text>
            <Text type="secondary" style={{ display: 'block' }}><SafetyCertificateFilled style={{ color: '#faad14' }} /> Disclaimer: Kết quả chỉ mang tính tham khảo.</Text>
          </Col>
          <Col xs={12} md={4}>
            <Title level={5}>Liên kết</Title>
            <Space direction="vertical" style={{ color: '#666' }}>
              <Text type="secondary">Về chúng tôi</Text>
              <Text type="secondary">Đặt lịch khám</Text>
              <Text type="secondary">Dành cho bác sĩ</Text>
            </Space>
          </Col>
          <Col xs={12} md={4}>
            <Title level={5}>Liên hệ</Title>
            <Space direction="vertical">
              <Text type="secondary">123 Nguyễn Huệ, Q.1, TP.HCM</Text>
              <Text type="secondary">contact@atscare.ai</Text>
              <Text type="secondary">1900 123 456</Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Title level={5}>Tải ứng dụng</Title>
            <Space>
              <Button>App Store</Button>
              <Button>Google Play</Button>
            </Space>
          </Col>
        </Row>
        <div style={{ textAlign: 'center', marginTop: 60, color: '#aaa', fontSize: 14 }}>
          © 2025 ATSCare AI System. All rights reserved.
        </div>
      </Footer>

    </Layout>
  );
}