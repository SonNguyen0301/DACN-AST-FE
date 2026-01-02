import  { useState } from 'react';
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
  Space, 
  Dropdown, 
  Tabs,
  Modal,
  Form,
  Select,
  Input,
  Upload,
  message,
  List,
  Popconfirm
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  KeyOutlined,
  FileTextOutlined,
  RobotOutlined,
  ScanOutlined,
  InboxOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer"; 

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

export default function ModelAIPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const user = { name: "Administrator", role: "admin" };
  const menuItems = [
    { key: 'dashboard', label: 'Trang chủ' },
    { key: 'users', label: 'Quản lý tài khoản' },
    { key: 'AI', label: 'Quản lý Model AI' },
  ];
  const menuUserItems = [
    { key: '1', label: 'Hồ sơ Admin', icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={() => navigate('/')}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  const [activeTab, setActiveTab] = useState('chatbot');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [chatbotModels, setChatbotModels] = useState([
    { key: '1', name: 'GPT-4o (Customer Support)', provider: 'OpenAI', version: 'v2.1', created: '10/12/2025', status: 'active', apiKey: 'sk-proj-...' },
    { key: '2', name: 'Gemini 1.5 Pro', provider: 'Google', version: 'v1.0', created: '01/12/2025', status: 'inactive', apiKey: 'AIzaSy...' },
  ]);

  const [diagnosisModels, setDiagnosisModels] = useState([
    { key: '1', name: 'Derma-Net (Skin Lesion)', provider: 'Custom (PyTorch)', version: 'v3.5', created: '15/11/2025', status: 'active', apiKey: 'N/A (Local)' },
    { key: '2', name: 'Derma-Net Legacy', provider: 'Custom (TensorFlow)', version: 'v2.0', created: '10/05/2025', status: 'inactive', apiKey: 'N/A (Local)' },
  ]);

  const [knowledgeFiles, setKnowledgeFiles] = useState([
    { uid: '1', name: 'quy_trinh_kham_benh.pdf', status: 'done' },
    { uid: '2', name: 'danh_sach_thuoc_2025.xlsx', status: 'done' },
  ]);

  const handleMenuClick = ({ key }) => {
    switch (key) {
        case 'dashboard': navigate('/admin/dashboard'); break;
        case 'users': navigate('/admin/user-management'); break;
        case 'AI': navigate('/admin/model-ai'); break;
        default: break;
    }
  };

  const handleActivate = (record, type) => {
    if (type === 'chatbot') {
        const updated = chatbotModels.map(m => ({ ...m, status: m.key === record.key ? 'active' : 'inactive' }));
        setChatbotModels(updated);
    } else {
        const updated = diagnosisModels.map(m => ({ ...m, status: m.key === record.key ? 'active' : 'inactive' }));
        setDiagnosisModels(updated);
    }
    message.success(`Đã kích hoạt model: ${record.name}`);
  };

  const handleDelete = (key, type) => {
    if (type === 'chatbot') {
        setChatbotModels(chatbotModels.filter(m => m.key !== key));
    } else {
        setDiagnosisModels(diagnosisModels.filter(m => m.key !== key));
    }
    message.success('Đã xóa phiên bản model');
  };

  const handleAddModel = (values) => {
    const newModel = {
        key: Date.now().toString(),
        name: values.name,
        provider: values.provider,
        version: values.version,
        created: new Date().toLocaleDateString('vi-VN'),
        status: 'inactive', 
        apiKey: values.apiKey ? `${values.apiKey.substring(0, 5)}...` : 'N/A'
    };

    if (activeTab === 'chatbot') {
        setChatbotModels([newModel, ...chatbotModels]);
    } else {
        setDiagnosisModels([newModel, ...diagnosisModels]);
    }
    
    setIsModalOpen(false);
    form.resetFields();
    message.success('Thêm phiên bản mới thành công!');
  };

  const columns = (type) => [
    {
        title: 'Tên Model',
        dataIndex: 'name',
        render: (text) => <Text strong>{text}</Text>
    },
    {
        title: 'Nhà cung cấp',
        dataIndex: 'provider',
        render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
        title: 'Phiên bản',
        dataIndex: 'version',
    },
    {
        title: 'API Key',
        dataIndex: 'apiKey',
        render: (text) => <Text code>{text}</Text>
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'created',
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        render: (status) => (
            <Tag icon={status === 'active' ? <CheckCircleOutlined /> : null} color={status === 'active' ? 'success' : 'default'}>
                {status === 'active' ? 'Đang sử dụng' : 'Không hoạt động'}
            </Tag>
        )
    },
    {
        title: 'Hành động',
        key: 'action',
        render: (_, record) => (
            <Space>
                <Button 
                    type="link" 
                    size="small" 
                    disabled={record.status === 'active'}
                    onClick={() => handleActivate(record, type)}
                >
                    Kích hoạt
                </Button>
                <Popconfirm title="Xóa phiên bản này?" onConfirm={() => handleDelete(record.key, type)}>
                    <Button type="text" danger icon={<DeleteOutlined />} disabled={record.status === 'active'} />
                </Popconfirm>
            </Space>
        )
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
            mode="horizontal"
            defaultSelectedKeys={['AI']}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ fontSize: 15, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center', marginLeft: 20 }}
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
            <Title level={3} style={{ margin: 0 }}>Quản lý Model AI</Title>
            <Text type="secondary">Cấu hình phiên bản, API Key và dữ liệu huấn luyện cho Chatbot & Chẩn đoán hình ảnh.</Text>
        </div>

        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                    { 
                        key: 'chatbot', 
                        label: (<span><RobotOutlined /> AI Chatbot (Tư vấn)</span>),
                        children: (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <Text strong style={{ fontSize: 16 }}>Danh sách phiên bản Chatbot</Text>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                                        Thêm phiên bản mới
                                    </Button>
                                </div>

                                <Table 
                                    columns={columns('chatbot')} 
                                    dataSource={chatbotModels} 
                                    pagination={false} 
                                    style={{ marginBottom: 24 }}
                                    bordered
                                />

                                <div style={{ marginTop: 32 }}>
                                    <Title level={5}><FileTextOutlined /> Dữ liệu kiến thức (Knowledge Base)</Title>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                        Tải lên các tài liệu y khoa, quy trình bệnh viện để Chatbot học (RAG).
                                    </Text>
                                    
                                    <Row gutter={24}>
                                        <Col span={16}>
                                            <Dragger 
                                                name="file" 
                                                multiple 
                                                height={150}
                                                beforeUpload={() => { message.success('File đã được đưa vào hàng đợi xử lý'); return false; }}
                                            >
                                                <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: '#1677ff' }} /></p>
                                                <p className="ant-upload-text">Kéo thả file PDF, DOCX vào đây</p>
                                            </Dragger>
                                        </Col>
                                        <Col span={8}>
                                            <Card title="File đang hoạt động" size="small" style={{ height: '100%' }}>
                                                <List
                                                    size="small"
                                                    dataSource={knowledgeFiles}
                                                    renderItem={item => (
                                                        <List.Item actions={[<Button key={item.id} type="text" danger icon={<DeleteOutlined />} size="small" />]}>
                                                            <Space><FileTextOutlined style={{ color: '#52c41a' }} /> {item.name}</Space>
                                                        </List.Item>
                                                    )}
                                                />
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        )
                    },
                    { 
                        key: 'diagnosis', 
                        label: (<span><ScanOutlined /> AI Diagnosis (Chẩn đoán ảnh)</span>),
                        children: (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <Text strong style={{ fontSize: 16 }}>Danh sách phiên bản Chẩn đoán</Text>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                                        Thêm phiên bản mới
                                    </Button>
                                </div>
                                <Table 
                                    columns={columns('diagnosis')} 
                                    dataSource={diagnosisModels} 
                                    pagination={false} 
                                    bordered
                                />
                            </div>
                        )
                    }
                ]}
            />
        </Card>

      </Content>
      <Footer />

      <Modal
        title={`Thêm phiên bản mới cho ${activeTab === 'chatbot' ? 'Chatbot' : 'Diagnosis'}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddModel}>
            <Form.Item label="Tên hiển thị (Model Name)" name="name" rules={[{ required: true, message: 'Nhập tên model' }]}>
                <Input placeholder="VD: GPT-4o Medical, Derma-v3..." />
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Nhà cung cấp (Provider)" name="provider" rules={[{ required: true }]}>
                        <Select placeholder="Chọn provider">
                            <Option value="OpenAI">OpenAI</Option>
                            <Option value="Google">Google (Gemini)</Option>
                            <Option value="Anthropic">Anthropic (Claude)</Option>
                            <Option value="Custom/Local">Custom / Local Server</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Phiên bản (Version)" name="version" rules={[{ required: true }]}>
                        <Input placeholder="VD: v1.0" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item 
                label="API Key / Endpoint Token" 
                name="apiKey" 
                rules={[{ required: true, message: 'Cần có Key để model hoạt động' }]}
                tooltip="Key này sẽ được mã hóa khi lưu trữ"
            >
                <Input.Password placeholder="sk-..." prefix={<KeyOutlined />} />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit">Thêm & Lưu</Button>
            </div>
        </Form>
      </Modal>

    </Layout>
  );
}