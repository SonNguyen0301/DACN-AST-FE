import { useState } from 'react';
import { 
  Layout, Form, Input, Button, Typography, 
  Row, Col, Image, message, Steps, Select , Space
} from 'antd';
import { 
 LockOutlined, MailOutlined,
  SafetyCertificateOutlined,
  ScanOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { requestOtpAPI, verifyOtpAPI, registerAPI } from '../../services/authService';

import ReactCountryFlag from "react-country-flag";
import useAuth from '../../hooks/useAuth';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const countryPhoneCodes = [
    { code: '+84', country: 'VN', name: 'Việt Nam' },
    { code: '+1', country: 'US', name: ' Hoa Kỳ / Canada' },
    { code: '+44', country: 'UK', name: 'Anh' },
    { code: '+81', country: 'JP', name: 'Nhật Bản' },
    { code: '+82', country: 'KR', name: 'Hàn Quốc' },
    { code: '+86', country: 'CN', name: 'Trung Quốc' },
    { code: '+886', country: 'TW', name: 'Đài Loan' },
    { code: '+65', country: 'SG', name: 'Singapore' },
    { code: '+66', country: 'TH', name: 'Thái Lan' },
    { code: '+855', country: 'KH', name: 'Campuchia' },
    { code: '+856', country: 'LA', name: 'Lào' },
    { code: '+61', country: 'AU', name: 'Úc' },
    { code: '+33', country: 'FR', name: 'Pháp' },
    { code: '+49', country: 'DE', name: 'Đức' },
];

const phoneCodeSelector = (
    <Form.Item name="phoneCode" noStyle>
        <Select
            showSearch
            style={{ minWidth: 120, }} 
            dropdownStyle={{ borderRadius: 12, minWidth: 220, padding: 5 }}
            optionFilterProp="children"
            filterOption={(input, option) =>
                String(option.label).toLowerCase().includes(input.toLowerCase()) ||
                (option.children && String(option.children[2].props.children).toLowerCase().includes(input.toLowerCase()))
            }
            optionLabelProp="label"
            bordered={false} 
        >
            {countryPhoneCodes.map((item) => (
                <Option
                    key={item.country}
                    value={item.code}
                    label={
                        <Space align="center" style={{ height: '100%' }}>
                                <ReactCountryFlag countryCode={item.country} svg style={{ fontSize: '1.4em', lineHeight: '1em' }}/>
                            <span style={{ fontWeight: 500, color: '#374151' }}>{item.code}</span>
                        </Space>
                    }
                >
                    <Space align="center" style={{ padding: '8px 5px' }}>
                        <ReactCountryFlag countryCode={item.country} svg style={{ fontSize: '1.6em', borderRadius: '2px' }} />
                        <Text strong style={{ marginLeft: 5, color: '#374151' }}>{item.code}</Text>
                        <Text type="secondary" style={{ marginLeft: 5 }} ellipsis>{item.name}</Text>
                    </Space>
                </Option>
            ))}
        </Select>
    </Form.Item>
);

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); 
  
  const [registerData, setRegisterData] = useState({
      email: '',
      sessionId: '', 
  });

  const btnPrimaryStyle = {
    height: '50px', padding: '0 32px', borderRadius: '25px',
    fontSize: '16px', fontWeight: '600', background: '#1677ff', border: 'none',
    boxShadow: '0 10px 20px rgba(22, 119, 255, 0.2)', color: '#fff'
  };
  const inputStyle = {
    height: '50px', borderRadius: '12px', fontSize: '15px',
    background: '#f9fafb', border: '1px solid #e5e7eb'
  };

  const handleRequestOtp = async (values) => {
    setLoading(true);
    try {
        const res = await requestOtpAPI(values.email);
        if (res.data?.success) {
            message.success(`Mã OTP đã gửi tới ${values.email}`);
            setRegisterData({ 
                ...registerData, 
                email: values.email,
                sessionId: res.data.data.sessionId 
            });
            setCurrentStep(1);
        }
    } catch (error) {
        message.error(error.response?.data?.message || "Lỗi gửi OTP");
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtpRegister = async (values) => {
    setLoading(true);
    try {
        const payload = {
            email: registerData.email,
            otp: values.otp,
            sessionId: registerData.sessionId,
            type: 'REGISTER'
        };
        
        const res = await verifyOtpAPI(payload);
        
        if (res.data?.success) {
            message.success('Xác thực Email thành công!');
            setCurrentStep(2);
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || "Lỗi xác thực";
        if (errorMsg === 'OTP is expired') {
            message.error("Mã OTP đã hết hạn. Vui lòng lấy mã mới.");
            setCurrentStep(0); 
        } else if (errorMsg === 'Wrong OTP') {
            message.error("Mã OTP không chính xác.");
        } else {
            message.error(errorMsg);
        }
    } finally {
        setLoading(false);
    }
  };

  const handleFinalRegister = async (values) => {
    setLoading(true);
    try {
        const finalPayload = {
            email: registerData.email,
            firstName: values.firstName,
            lastName: values.lastName,
            phoneCode: values.phoneCode,
            phoneNumber: values.phoneNumber,
            gender: values.gender,
            password: values.password
        };

        const res = await registerAPI(finalPayload);

        if (res.data?.success) {
            message.success('Đăng ký tài khoản thành công!');
            const loginRes = await login(registerData.email, values.password);
            if (loginRes.success) {
                navigate('/patient/dashboard'); 
            } else {
                message.error('Đăng nhập tự động thất bại. Vui lòng đăng nhập thủ công.');
                navigate('/login');
            }
        }
    } catch (error) {
        const errorData = error.response?.data?.message;
        if (Array.isArray(errorData)) {
            message.error(errorData[0]); 
        } else {
            message.error(errorData || "Đăng ký thất bại");
        }
    } finally {
        setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
        case 0: 
            return (
                <Form onFinish={handleRequestOtp} layout="vertical" size="large">
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Title level={4}>Đăng ký tài khoản</Title>
                        <Text type="secondary">Nhập Email để bắt đầu.</Text>
                    </div>
                    
                    <Form.Item
                        name="email"
                        rules={[
                            { type: 'email', message: 'Email không hợp lệ!' },
                            { required: true, message: 'Vui lòng nhập Email!' },
                        ]}
                    >
                        <Input prefix={<MailOutlined style={{ color: '#9ca3af' }} />} placeholder="example@mail.com" style={inputStyle} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" style={btnPrimaryStyle} loading={loading} block>
                        Tiếp tục
                    </Button>
                </Form>
            );

        case 1: 
            return (
                <Form onFinish={handleVerifyOtpRegister} layout="vertical" size="large">
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Title level={4}>Nhập mã xác thực</Title>
                        <Text type="secondary">Mã OTP đã gửi đến <b>{registerData.email}</b></Text>
                    </div>

                    <Form.Item
                        name="otp"
                        rules={[{ required: true, message: 'Vui lòng nhập OTP!' }]}
                    >
                        <Input 
                            prefix={<SafetyCertificateOutlined style={{ color: '#9ca3af' }} />} 
                            placeholder="Nhập mã OTP" 
                            style={{ ...inputStyle, textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }} 
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" style={btnPrimaryStyle} loading={loading} block>
                        Xác thực
                    </Button>
                    <div style={{ textAlign: 'center', marginTop: 15 }}>
                        <Button type="link" onClick={() => setCurrentStep(0)} disabled={loading}>
                             Gửi lại mã hoặc đổi Email
                        </Button>
                    </div>
                </Form>
            );

        case 2: 
            return (
                <Form
                    onFinish={handleFinalRegister}
                    layout="vertical"
                    size="large"
                    initialValues={{ phoneCode: '+84', gender: 'MALE' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 25 }}>
                        <Title level={4} style={{color: '#374151'}}>Thông tin cá nhân</Title>
                        <Text type="secondary">Hoàn tất hồ sơ để sử dụng dịch vụ.</Text>
                    </div>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="lastName" rules={[{ required: true, message: 'Thiếu họ!' }]}>
                                <Input placeholder="Họ" style={inputStyle} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="firstName" rules={[{ required: true, message: 'Thiếu tên!' }]}>
                                <Input placeholder="Tên" style={inputStyle} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label={<span style={{ fontWeight: 600, color: '#374151' }}>Số điện thoại</span>} required>
                        <Input.Group compact style={{ display: 'flex', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', focus: 'border-color: #40a9ff' }}>
                            <div style={{
                                background: '#f9fafb',
                                borderRight: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: '5px',
                                zIndex: 2 
                            }}>
                                {phoneCodeSelector}
                            </div>
                            <Form.Item
                                name="phoneNumber"
                                noStyle
                                rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
                            >
                                <Input
                                    placeholder="Số điện thoại"
                                    style={{
                                        height: '50px',
                                        fontSize: '15px',
                                        border: 'none', 
                                        boxShadow: 'none', 
                                        background: '#f9fafb',
                                        flex: 1,
                                        borderRadius: 0 
                                    }}
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>


                    <Form.Item name="gender" label={<span style={{ fontWeight: 600, color: '#374151' }}>Giới tính</span>} rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                        <Select style={{ height: 50 }} dropdownStyle={{ borderRadius: 12 }}>
                            <Option value="MALE">Nam</Option>
                            <Option value="FEMALE">Nữ</Option>
                            <Option value="OTHER">Khác</Option>
                        </Select>
                    </Form.Item>
 
                    <Form.Item
                        name="password"
                        label={<span style={{ fontWeight: 600, color: '#374151' }}>Mật khẩu</span>}
                        rules={[
                            { required: true, message: 'Nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined style={{ color: '#9ca3af' }} />} placeholder="Mật khẩu" style={inputStyle} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" style={{...btnPrimaryStyle, marginTop: 10}} loading={loading} block>
                        Hoàn tất đăng ký
                    </Button>
                </Form>
            );
        default: return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/ASTCare1.png" alt="Logo" style={{ height: '40px' }} />
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

          <Col xs={24} md={12} lg={10} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 8%', background: '#fff' }}>
            <div style={{ maxWidth: 450, width: '100%', margin: '0 auto' }}>
              
              <Steps 
                current={currentStep} 
                size="small"
                style={{ marginBottom: 40 }}
                items={[{ title: 'Email' }, { title: 'Xác thực' }, { title: 'Thông tin' }]}
              />

              <div style={{ minHeight: 300 }}>
                  {renderStepContent()}
              </div>

            </div>
          </Col>
        </Row>
      </Content>
      <style>{`@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }`}</style>
    </Layout>
  );
}