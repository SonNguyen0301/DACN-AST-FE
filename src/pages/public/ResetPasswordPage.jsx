import { 
  Layout, Form, Input, Button, Typography, 
  Row, Col, Image, message 
} from 'antd';
import { 
  LockOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { resetPasswordAPI } from '../../services/authService';

const { Header, Content } = Layout;
const { Title, Text, Link } = Typography;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      message.error('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      navigate('/login');
    }
  }, [token, email, navigate]);

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
    setLoading(true);
    try {
      const res = await resetPasswordAPI({
        email,
        token,
        newPassword: values.password
      });
      
      if (res.data === true || res.data.success) {
        message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error(res.data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      
      const errorMapping = {
        'User not found': 'Người dùng không tìm thấy',
        'Invalid or expired password reset link': 'Link thay đổi mật khẩu không hợp lệ hoặc hết hạn'
      };

      const displayMessage = errorMapping[apiMessage] || apiMessage || 'Link đã hết hạn hoặc không hợp lệ.';
      
      message.error(displayMessage);
    } finally {
      setLoading(false);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img 
            src="/ASTCare1.png" 
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Button className="hide-on-mobile" type="text" style={{ fontSize: '16px', fontWeight: '600', color: '#1677ff' }} onClick={() => navigate('/login')}>
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
            padding: '40px'
          }}>
            <Image 
                preview={false}
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop"
                alt="Reset Password Illustration"
                style={{ 
                    width: '100%', maxWidth: 500, 
                    borderRadius: '30px',
                    boxShadow: '0 30px 60px rgba(22, 119, 255, 0.15)',
                    border: '6px solid #fff'
                }}
            />
          </Col>

          <Col xs={24} md={12} lg={10} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            padding: '40px 8%',
            background: '#fff'
          }}>
            <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
              
              <div style={{ marginBottom: 30, textAlign: 'center' }}>
                <Title level={2} style={{ fontWeight: 800, marginBottom: 10, color: '#1f2937' }}>
                  Đặt lại mật khẩu
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Vui lòng nhập mật khẩu mới cho tài khoản <Text strong>{email}</Text>.
                </Text>
              </div>

              <Form
                name="reset-password"
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="password"
                  label={<span style={{ fontWeight: 600, color: '#374151' }}>Mật khẩu mới</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự!' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />} 
                    placeholder="••••••••" 
                    style={inputStyle}
                  />
                </Form.Item>

                <Form.Item
                  name="confirm"
                  label={<span style={{ fontWeight: 600, color: '#374151' }}>Xác nhận mật khẩu</span>}
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />} 
                    placeholder="••••••••" 
                    style={inputStyle}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: 30 }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    style={btnPrimaryStyle}
                    loading={loading} 
                    block
                  >
                    Đặt lại mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
      </Content>

      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}