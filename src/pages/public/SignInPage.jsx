import { 
  Layout, Form, Input, Button, Checkbox, Typography, 
  Row, Col,  Image, message 
} from 'antd';
import { 
  UserOutlined, LockOutlined,
  ScanOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

import { jwtDecode } from "jwt-decode";

const { Header, Content } = Layout;
const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const primaryColor = '#1677ff';
  
  const btnPrimaryStyle = {
    height: '50px', padding: '0 32px', borderRadius: '25px',
    fontSize: '16px', fontWeight: '600', background: '#1677ff', border: 'none',
    boxShadow: '0 10px 20px rgba(22, 119, 255, 0.2)', color: '#fff'
  };

  const inputStyle = {
    height: '50px',
    borderRadius: '12px',
    fontSize: '15px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb'
  };

const onFinish = async (values) => {
    console.log('Form values:', values);
    
    const res = await login(values.email, values.password);

    if (res.success) {
      message.success('Đăng nhập thành công!');

      const decodedUser = jwtDecode(localStorage.getItem('accessToken'));
      
      if (decodedUser.role === 'PATIENT') {
        navigate('/patient/dashboard');
      } else if (decodedUser.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else if (decodedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/staff/dashboard'); 
      }

    } else {
      message.error(res.message || 'Đăng nhập thất bại, vui lòng thử lại.');
    }
  };

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
            onClick={() => navigate('/')}
          />
        </div>
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
        <Row style={{ minHeight: 'calc(100vh - 80px)' }}> 
          
          <Col xs={0} md={12} lg={14} style={{ 
            background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '40px'
          }}>
            <div style={{ 
              position: 'absolute', width: '600px', height: '600px', 
              background: 'radial-gradient(circle, rgba(22,119,255,0.1) 0%, rgba(255,255,255,0) 70%)', 
              borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
            }} />

            <div style={{ position: 'relative', textAlign: 'center', maxWidth: '85%' }}>
              
              <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Image 
                    preview={false}
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop"
                    alt="Login Illustration"
                    style={{ 
                        width: '100%', maxWidth: 600, 
                        borderRadius: '30px',
                        boxShadow: '0 30px 60px rgba(22, 119, 255, 0.15)',
                        border: '6px solid #fff'
                    }}
                  />

                  <div style={{
                      position: 'absolute', bottom: 30, left: -20,
                      background: '#fff', padding: '12px 20px', borderRadius: '16px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      animation: 'float 5s ease-in-out infinite'
                  }}>
                      <div style={{ width: 40, height: 40, background: '#e6f7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ScanOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                          <Text strong style={{ fontSize: 13, display: 'block', color: '#555' }}>AI Analysis</Text>
                          <Text style={{ fontSize: 12, color: '#52c41a' }}>Ready to scan</Text>
                      </div>
                  </div>
              </div>

            </div>
          </Col>

          <Col xs={24} md={12} lg={10} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            padding: '40px 8%',
            background: '#fff'
          }}>
            <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
              
              
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={2} style={{ fontWeight: 800, marginBottom: 10, color: '#1f2937' }}>
                  Đăng nhập
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Chào mừng bạn đến với ASTCare.
                </Text>
              </div>

              <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="email"
                  label={<span style={{ fontWeight: 600, color: '#374151' }}>Email hoặc Số điện thoại</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập Email hoặc SĐT!' }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: '#9ca3af' }} />} 
                    placeholder="user@example.com" 
                    style={inputStyle}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span style={{ fontWeight: 600, color: '#374151' }}>Mật khẩu</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                </Form.Item>

                <Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox style={{ color: '#6b7280' }}>Ghi nhớ tôi</Checkbox>
                    </Form.Item>
                    <Link href="/forgot-password" style={{ color: primaryColor, fontWeight: 600 }}>
                      Quên mật khẩu?
                    </Link>
                  </div>
                </Form.Item>


                <Form.Item style={{ marginBottom: 20, textAlign: 'center' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    style={btnPrimaryStyle}
                    loading={loading} 
                  >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
                  </Button>
                </Form.Item>

              </Form>

              <div style={{ textAlign: 'center', marginTop: 30 }}>
                <Text type="secondary">Bạn chưa có tài khoản? </Text>
                <Link href="/register" style={{ color: primaryColor, fontWeight: 'bold' }}>Đăng ký miễn phí</Link>
              </div>
            </div>
          </Col>

        </Row>
      </Content>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </Layout>
  );
}