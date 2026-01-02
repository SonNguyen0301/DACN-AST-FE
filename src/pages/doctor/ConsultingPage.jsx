
import { useState } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Form, 
  Input, 
  Select, 
  Radio, 
  InputNumber, 
  Upload, 
  Button, 
  Divider, 
  Space, 
  Tag, 
  message,
  Dropdown,
  Breadcrumb,
  Image,
  Progress,
  List,
  Alert,
  Spin
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  InboxOutlined, 
  SaveOutlined,
  MedicineBoxOutlined,
  ArrowLeftOutlined,
  HistoryOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  FileProtectOutlined,
  PlusOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/common/Footer"; 

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

export default function ExaminationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [resultForm] = Form.useForm();

  const [viewState, setViewState] = useState('input'); 

  const patientData = location.state?.patient || {
    key: '1',
    patientName: "Nguyễn Văn A", 
    age: 32,
    gender: "male",
    phone: "0909123456",
    avatar: null,
    reason: 'Đau đầu, chóng mặt kéo dài',
    detailedSymptoms: 'Xuất hiện các nốt đỏ ngứa quanh vùng cổ và lan xuống ngực.',
    history: "Dị ứng hải sản, Viêm da cơ địa nhẹ.",
    images: []
  };

  const handleSignOut = () => navigate('/');
  const menuUserItems = [
    { key: '1', label: (<a onClick={() => navigate('/doctor/profile')}>Hồ sơ bác sĩ</a>), icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  const mockAIResult = {
    diagnoses: [
      { name: "Viêm da cơ địa (Atopic Dermatitis)", probability: 85, severity: "Trung bình" },
      { name: "Viêm da tiếp xúc (Contact Dermatitis)", probability: 10, severity: "Nhẹ" },
      { name: "Nhiễm nấm da (Fungal Infection)", probability: 5, severity: "Thấp" }
    ],
    explanation: "Dựa trên hình ảnh tổn thương có tính chất sưng đỏ, bong tróc vảy và vị trí ở vùng cổ/ngực, cộng với tiền sử dị ứng của bệnh nhân, hệ thống nghiêng nhiều về chẩn đoán Viêm da cơ địa đợt cấp.",
    severityLevel: "medium", 
    analyzedImage: "https://dalieuhanoi.com/wp-content/uploads/2023/07/viem-da-co-dia-o-tay-1.jpg", 
    advice: "Nên sử dụng thuốc bôi Corticoid liều thấp kết hợp dưỡng ẩm. Tránh tiếp xúc với hóa chất lạ."
  };

  const onFinishInput = (values) => {
    console.log('Input Values:', values);
    setViewState('loading');
    
    setTimeout(() => {
        setViewState('result');
        message.success("AI đã hoàn tất phân tích!");
        
        resultForm.setFieldsValue({
            finalDiagnosis: mockAIResult.diagnoses[0].name,
            doctorAdvice: mockAIResult.advice,
            currentCondition: "Tổn thương sưng đỏ, có dấu hiệu lan rộng nhẹ."
        });
    }, 2000);
  };

  const onFinishResult = (values) => {
      console.log('Final Result:', values);
      message.success("Đã lưu hồ sơ khám bệnh và gửi toa thuốc!");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/doctor/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['3']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" },
            { key: "3", label: "Khám bệnh" },
          ]}
          onClick={({ key }) => {
             if (key === '1') navigate('/doctor/dashboard');
             if (key === '2') navigate('/doctor/appointments');
             if (key === '3') navigate('/doctor/examination');
          }}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
        />
        <Dropdown menu={{ items: menuUserItems }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>BS. CK2 Trần Thị Hoa</span>
                <span style={{ fontSize: 12, color: '#888' }}>Khoa Da liễu</span>
            </div>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "30px 40px" }}>
        
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
                <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Lịch đặt khám' }, { title: 'Khám bệnh' }]} style={{ marginBottom: 8 }} />
                <Title level={3} style={{ margin: 0 }}>
                    <MedicineBoxOutlined /> {viewState === 'result' ? 'Kết quả chẩn đoán & Kê đơn' : 'Phiếu khám bệnh'}
                </Title>
            </div>
            {viewState === 'result' && (
                <Button icon={<ArrowLeftOutlined />} onClick={() => setViewState('input')}>Quay lại nhập liệu</Button>
            )}
            {viewState === 'input' && (
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/doctor/appointments')}>Quay lại danh sách</Button>
            )}

        </div>

        {viewState === 'loading' && (
            <Card style={{ textAlign: 'center', padding: 80, borderRadius: 12 }}>
                <Spin size="large" tip="AI đang phân tích hình ảnh và dữ liệu..." />
            </Card>
        )}

        {viewState === 'input' && (
             <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinishInput} 
                initialValues={{
                    gender: patientData.gender,
                    age: patientData.age,
                    history: patientData.history,
                    symptom: patientData.reason, 
                    description: patientData.detailedSymptoms,
                    genetic: 'no'
                }}
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={6}>
                        <Card title="Hồ sơ bệnh nhân" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: 'sticky', top: 90 }}>
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <Avatar size={80} icon={<UserOutlined />} src={patientData.avatar} style={{ backgroundColor: patientData.gender === 'male' ? '#1677ff' : '#eb2f96', marginBottom: 12 }} />
                                <Title level={4} style={{ margin: 0 }}>{patientData.patientName}</Title>
                                <Text type="secondary">{patientData.phone}</Text>
                            </div>
                            <Divider />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div><Text type="secondary" style={{ fontSize: 12 }}>Tuổi & Giới tính</Text><div style={{ fontWeight: 500 }}>{patientData.age} tuổi - {patientData.gender === 'male' ? 'Nam' : 'Nữ'}</div></div>
                                <div><Text type="secondary" style={{ fontSize: 12 }}>Tiền sử bệnh ghi nhận</Text><div style={{ fontWeight: 500 }}>{patientData.history ? <Tag color="orange" style={{ whiteSpace: 'normal', height: 'auto', padding: '4px' }}>{patientData.history}</Tag> : 'Không có'}</div></div>
                                {patientData.images && patientData.images.length > 0 && (<div><Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Ảnh bệnh nhân gửi:</Text><div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>{patientData.images.map((img, idx) => (<Image key={idx} width={50} height={50} src={img} style={{ borderRadius: 4, objectFit: 'cover' }} />))}</div></div>)}
                                <Button type="dashed" icon={<HistoryOutlined />} block>Xem lịch sử khám cũ</Button>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={18}>
                        <Card title={<span style={{ color: '#1677ff' }}>1. Thông tin lâm sàng (Cấu trúc)</span>} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 24 }}>
                            <Row gutter={24}>
                                <Col span={12}><Form.Item label="Triệu chứng chính" name="symptom" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                <Col span={12}><Form.Item label="Vị trí trên cơ thể" name="location" rules={[{ required: true }]}><Select><Option value="face">Vùng mặt</Option><Option value="neck">Vùng cổ</Option><Option value="arm">Cánh tay / Bàn tay</Option><Option value="body">Thân mình</Option><Option value="leg">Chân</Option></Select></Form.Item></Col>
                                <Col span={8}><Form.Item label="Thời gian kéo dài" name="duration"><Input /></Form.Item></Col>
                                <Col span={8}><Form.Item label="Đặc điểm tổn thương" name="skinType"><Radio.Group><Radio value="surface">Ngoài da</Radio><Radio value="deep">Dưới da/Sâu</Radio></Radio.Group></Form.Item></Col>
                                <Col span={8}><Form.Item label="Mức độ lan rộng" name="severity"><Select><Option value="local">Khu trú</Option><Option value="spread">Lan rộng</Option><Option value="whole">Toàn thân</Option></Select></Form.Item></Col>
                                <Col span={12}><Form.Item label="Dị ứng" name="allergy"><Input /></Form.Item></Col>
                                <Col span={12}><Form.Item label="Tiền sử bệnh lý" name="history"><Input /></Form.Item></Col>
                                <Col span={8}><Form.Item label="Giới tính" name="gender"><Select><Option value="male">Nam</Option><Option value="female">Nữ</Option></Select></Form.Item></Col>
                                <Col span={8}><Form.Item label="Tuổi" name="age"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                                <Col span={8}><Form.Item label="Yếu tố di truyền" name="genetic"><Radio.Group><Radio value="yes">Có</Radio><Radio value="no">Không</Radio></Radio.Group></Form.Item></Col>
                            </Row>
                        </Card>

                        <Card title={<span style={{ color: '#1677ff' }}>2. Mô tả chi tiết & Hình ảnh</span>} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                            <Form.Item label="Mô tả thêm (Ghi chú bác sĩ)" name="description"><TextArea rows={4} /></Form.Item>
                            <Form.Item label="Hình ảnh tổn thương thực tế" name="images">
                                <Dragger multiple listType="picture" height={200}><p className="ant-upload-drag-icon"><InboxOutlined style={{ color: '#1677ff' }} /></p><p className="ant-upload-text">Kéo thả hoặc click để tải ảnh lên</p><p className="ant-upload-hint">Hỗ trợ định dạng: JPG, PNG.</p></Dragger>
                            </Form.Item>
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                                <Button size="large">Lưu nháp</Button>
                                <Button type="primary" size="large" icon={<RobotOutlined />} htmlType="submit">Hoàn tất & AI hỗ trợ chẩn đoán</Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Form>
        )}

        {viewState === 'result' && (
            <Row gutter={[24, 24]}>
                
                <Col xs={24} lg={10}>
                    <Card 
                        title={<><RobotOutlined style={{ color: '#1677ff', marginRight: 8 }} /> Kết quả phân tích AI</>}
                        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: '100%', borderTop: '4px solid #1677ff' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
                             <Image 
                                src={mockAIResult.analyzedImage} 
                                style={{ borderRadius: 8, maxHeight: 250, objectFit: 'contain' }} 
                            />
                            <Tag color="cyan" style={{ position: 'absolute', top: 10, right: 10 }}>AI Analyzed</Tag>
                        </div>

                        <Alert 
                            message={`Mức độ nghiêm trọng: ${mockAIResult.severityLevel === 'medium' ? 'TRUNG BÌNH' : 'CAO'}`}
                            type={mockAIResult.severityLevel === 'medium' ? 'warning' : 'error'}
                            showIcon
                            style={{ marginBottom: 20, fontWeight: 'bold' }}
                        />

                        <Title level={5}>Chẩn đoán có khả năng cao nhất:</Title>
                        <List
                            dataSource={mockAIResult.diagnoses}
                            renderItem={item => (
                                <List.Item style={{ display: 'block', borderBottom: '1px dashed #f0f0f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <Text strong>{item.name}</Text>
                                        <Tag color={item.probability > 80 ? 'green' : 'orange'}>{item.probability}%</Tag>
                                    </div>
                                    <Progress percent={item.probability} showInfo={false} size="small" status={item.probability > 80 ? 'success' : 'normal'} />
                                </List.Item>
                            )}
                        />

                        <div style={{ marginTop: 20 }}>
                            <Title level={5}>Giải thích:</Title>
                            <Paragraph type="secondary" style={{ background: '#f5f7fa', padding: 12, borderRadius: 8 }}>
                                {mockAIResult.explanation}
                            </Paragraph>
                        </div>
                        
                        <div style={{ marginTop: 20 }}>
                            <Title level={5}>Lời khuyên đề xuất:</Title>
                            <Paragraph>
                                <CheckCircleOutlined style={{ color: '#52c41a' }} /> {mockAIResult.advice}
                            </Paragraph>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card 
                        title={<><FileProtectOutlined style={{ color: '#52c41a', marginRight: 8 }} /> Kết luận & Kê đơn của Bác sĩ</>}
                        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    >
                        <Form 
                            form={resultForm} 
                            layout="vertical"
                            onFinish={onFinishResult}
                        >
                            <Form.Item label="Chẩn đoán xác định (Bác sĩ chốt)" name="finalDiagnosis" rules={[{ required: true }]}>
                                <Input size="large" style={{ fontWeight: 600, color: '#1677ff' }} />
                            </Form.Item>

                            <Form.Item label="Mô tả tình trạng bệnh (Hiện tại)" name="currentCondition">
                                <TextArea rows={2} />
                            </Form.Item>

                            <Divider orientation="left">Toa thuốc</Divider>
                            <Form.List name="medicines" initialValue={[{ name: '', quantity: 1, usage: '' }]}>
                                {(fields, { add, remove }) => (
                                    <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'name']}
                                            rules={[{ required: true, message: 'Nhập tên thuốc' }]}
                                        >
                                            <Input placeholder="Tên thuốc" style={{ width: 200 }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'quantity']}
                                        >
                                            <InputNumber min={1} placeholder="SL" style={{ width: 60 }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'usage']}
                                        >
                                            <Input placeholder="Cách dùng (Sáng/Chiều...)" style={{ width: 250 }} />
                                        </Form.Item>
                                        <DeleteOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Thêm thuốc
                                        </Button>
                                    </Form.Item>
                                    </>
                                )}
                            </Form.List>

                            <Form.Item label="Lời khuyên / Dặn dò" name="doctorAdvice">
                                <TextArea rows={3} />
                            </Form.Item>

                            <Form.Item label="Hẹn tái khám" name="reExamDate">
                                <Input type="date" style={{ width: 200 }} />
                            </Form.Item>

                            <Divider />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                                <Button size="large">In toa thuốc</Button>
                                <Button type="primary" size="large" icon={<SaveOutlined />} htmlType="submit">
                                    Lưu hồ sơ & Kết thúc
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        )}

      </Content>
      <Footer />
    </Layout>
  );
}