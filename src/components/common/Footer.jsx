import { Layout, Row, Col, Typography, Space } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Footer} = Layout;
const { Title, Text, Link } = Typography;

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
      <Footer style={{ 
          background: '#fff', 
          padding: '40px 50px', 
          borderTop: '1px solid #f0f0f0' 
    }}>
      <Row gutter={[48, 24]} justify="center">
        
        {/* CỘT 1: Về ATS-Care */}
        <Col xs={24} md={8}>
          <Title level={4} style={{ color: '#1677ff', marginBottom: 16 }}>AST-Care</Title>
          <Text type="secondary">
            Nền tảng y tế thông minh giúp bệnh nhân dễ dàng đặt lịch, 
            theo dõi sức khỏe và nhận chẩn đoán AI.
          </Text>
        </Col>

        {/* CỘT 2: Liên kết nhanh */}
        <Col xs={24} md={8}>
          <Title level={5}>Liên kết nhanh</Title>
          <Space direction="vertical" size="small">
            <Link href="/patient/dashboard">Trang chủ</Link>
            <Link href="/patient/booking">Đặt lịch khám</Link>
            <Link href="/about">Về chúng tôi</Link>
          </Space>
        </Col>

        {/* CỘT 3: Thông tin liên hệ */}
        <Col xs={24} md={8}>
          <Title level={5}>Liên hệ</Title>
          <Space direction="vertical" size="small">
            <Space>
              <EnvironmentOutlined />
              <Text>123 Đường ABC, Phường X, Quận Y, TP. Z</Text>
            </Space>
            <Space>
              <PhoneOutlined />
              <Text>(+84) 909 123 456</Text>
            </Space>
            <Space>
              <MailOutlined />
              <Text>support@atscare.com</Text>
            </Space>
          </Space>
        </Col>
      </Row>

      {/* Copyright */}
      <div style={{ textAlign: 'center', marginTop: 30, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
        <Text type="secondary">
          © {currentYear} AST-Care. All rights reserved.
        </Text>
      </div>
    </Footer>
  );
}