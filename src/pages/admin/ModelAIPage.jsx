import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Row, Col, Card, Table, Tag, Button, Space, Dropdown, Tabs, Modal, Form, Input, message, Popconfirm, Switch, Select
} from 'antd';
import { 
  UserOutlined, LogoutOutlined, PlusOutlined, DeleteOutlined, RobotOutlined, ScanOutlined, EditOutlined, KeyOutlined, LinkOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import adminService from '../../services/adminService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function ModelAIPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const user = { name: 'Administrator', role: 'admin' };
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
  const [editingModel, setEditingModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const [isPublicFilter, setIsPublicFilter] = useState('all');
  const [chatbotModels, setChatbotModels] = useState([]);
  const [diagnosisModels, setDiagnosisModels] = useState([]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const filterParams = { page: 1, take: 10 };
      if (isPublicFilter !== 'all') {
        filterParams.isPublic = isPublicFilter === 'public';
      }
      
      const [chatRes, diagRes] = await Promise.all([
        adminService.getChatbotModels(filterParams),
        adminService.getDiagnoseModels(filterParams)
      ]);
      setChatbotModels(chatRes.data?.data?.data || chatRes.data?.data || chatRes.data || []);
      setDiagnosisModels(diagRes.data?.data?.data || diagRes.data?.data || diagRes.data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách Model');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [isPublicFilter]);

  const handleTestConnection = async () => {
      try {
          // get the token from form
          let token = '';
          if (activeTab === 'chatbot') {
              token = form.getFieldValue('accessToken');
          } else {
              token = form.getFieldValue(['modelConfig', 'accessToken']);
          }

          if (!token) {
              message.warning('Vui lòng nhập Access Token trước khi test!');
              return;
          }

          setTestingConnection(true);
          const response = await adminService.testDifyConnection(token);
          
          if (response.data?.success) {
              message.success('Kết nối Dify API thành công!');
          } else {
              message.error(response.data?.message || 'Kết nối thất bại. Token không hợp lệ.');
          }
      } catch (error) {
          message.error('Lỗi kết nối đến server backend.');
      } finally {
          setTestingConnection(false);
      }
  };

  const handleMenuClick = ({ key }) => {
    switch (key) {
        case 'dashboard': navigate('/admin/dashboard'); break;
        case 'users': navigate('/admin/user-management'); break;
        case 'AI': navigate('/admin/model-ai'); break;
        default: break;
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingModel(record);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ isPublic: true });
    setEditingModel(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, type) => {
    try {
        if (type === 'chatbot') {
            await adminService.deleteChatbotModel(id);
        } else {
            await adminService.deleteDiagnoseModel(id);
        }
        message.success('Đã xóa phiên bản model');
        fetchModels();
    } catch (e) {
        message.error('Lỗi khi xoá model');
    }
  };

  const handleSaveModel = async (values) => {
    try {
        if (activeTab === 'chatbot') {
            if (editingModel) {
                await adminService.updateChatbotModel(editingModel.id, values);
            } else {
                await adminService.createChatbotModel(values);
            }
        } else {
            if (editingModel) {
                await adminService.updateDiagnoseModel(editingModel.id, values);
            } else {
                await adminService.createDiagnoseModel(values);
            }
        }
        message.success('Thao tác thành công!');
        setIsModalOpen(false);
        fetchModels();
    } catch (error) {
        message.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const getColumns = (type) => [
    { title: 'Version', dataIndex: 'version', width: 100, render: (text) => <Text strong>{text}</Text> },
    {
        title: 'Tên hiển thị',
        dataIndex: 'name',
        width: 180,
        render: (t) => t ? <Text>{t}</Text> : <Text type="secondary">—</Text>
    },
    {
        title: 'Trạng thái',
        dataIndex: 'isPublic',
        width: 110,
        render: (isPublic) => (
            <Tag color={isPublic ? 'success' : 'default'}>
                {isPublic ? 'Công khai' : 'Nội bộ'}
            </Tag>
        )
    },
    ...(type === 'chatbot' ? [
        { title: 'Dify Token', dataIndex: 'accessToken', width: 120, render: () => '••••••••' },
        { title: 'Knowledge Base', dataIndex: 'knowledgeName', width: 180, render: (t) => t || <Text type="secondary">—</Text> }
    ] : [
        {
            title: 'Loại AI',
            dataIndex: ['modelConfig', 'providerType'],
            width: 140,
            render: (t) => <Tag color="blue">{t || 'INTERNAL'}</Tag>
        },
        {
            title: 'Tên/Key Model',
            dataIndex: ['modelConfig', 'nameModel'],
            width: 160,
            render: (t) => t ? <Tag color="cyan">{t}</Tag> : <Text type="secondary">—</Text>
        },
        {
            title: 'URL/Host',
            dataIndex: 'modelUrl',
            width: 100,
            render: (t) => t ? <a href={t} target="_blank" rel="noreferrer">Link</a> : <Text type="secondary">—</Text>
        }
    ]),
    {
        title: 'Hành động',
        key: 'action',
        fixed: 'right',
        width: 90,
        render: (_, record) => (
            <Space>
                <Button type="text" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => handleEdit(record)} />
                <Popconfirm title="Xóa phiên bản này?" onConfirm={() => handleDelete(record.id, type)}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        )
    }
  ];

  const getTabItems = () => [
    { 
        key: 'chatbot', 
        label: (<span><RobotOutlined /> AI Chatbot </span>),
        children: (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
                    <Text strong style={{ fontSize: 16 }}>Danh sách phiên bản Chatbot</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm mô hình Dify mới
                    </Button>
                </div>
                <Table loading={loading} columns={getColumns('chatbot')} dataSource={chatbotModels} rowKey="id" bordered scroll={{ x: 800 }} />
            </div>
        )
    },
    { 
        key: 'diagnosis', 
        label: (<span><ScanOutlined /> AI Diagnosis </span>),
        children: (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
                    <Text strong style={{ fontSize: 16 }}>Danh sách phiên bản Chẩn đoán</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm Model Chẩn đoán mới
                    </Button>
                </div>
                <Table loading={loading} columns={getColumns('diagnosis')} dataSource={diagnosisModels} rowKey="id" bordered scroll={{ x: 800 }} />
            </div>
        )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header style={{ background: '#fff', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu mode="horizontal" defaultSelectedKeys={['AI']} items={menuItems} onClick={handleMenuClick} style={{ fontSize: 15, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center', marginLeft: 20 }} />
        <Dropdown menu={{ items: menuUserItems }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.name}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>Quản trị hệ thống</span>
                </div>
                <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#001529' }} />
            </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: '30px 40px' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
                <Title level={3} style={{ margin: 0 }}>Quản lý Model AI</Title>
                <Text type="secondary">Cấu hình phiên bản và API cấu hình cho Chatbot & Chẩn đoán hình ảnh.</Text>
            </div>
            <Space wrap>
                <Text strong>Lọc trạng thái:</Text>
                <Select 
                    value={isPublicFilter} 
                    style={{ width: 160 }} 
                    onChange={setIsPublicFilter}
                    options={[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'public', label: 'Mô hình Công khai' },
                        { value: 'private', label: 'Mô hình Nội bộ' },
                    ]}
                />
            </Space>
        </div>

        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={getTabItems()}
            />
        </Card>
      </Content>
      <Footer />

      <Modal
        title={(editingModel ? 'Cập nhật ' : 'Thêm ') + (activeTab === 'chatbot' ? 'Chatbot Dify Model' : 'Diagnose Model AI')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveModel}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Phiên bản (Version)" name="version" rules={[{ required: true, message: 'Ví dụ v1.0, 15-05-2025' }]} style={{ margin: 0 }}>
                        <Input placeholder="VD: v1.0, v2.5,..." disabled={!!editingModel} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Trạng thái Public" name="isPublic" valuePropName="checked" style={{ margin: 0 }}>
                        <Switch checkedChildren="Phát hành" unCheckedChildren="Nội bộ / Ẩn" defaultChecked />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Tên hiển thị (tuỳ chọn)" name="name" style={{ marginTop: 16 }}>
                <Input placeholder="VD: Model da liễu v2 — dùng để hiển thị cho người dùng" />
            </Form.Item>

            {activeTab === 'chatbot' ? (
                <>
                    <Form.Item label="Access Token (Dify API)" required>
                        <Space.Compact style={{ width: '100%' }}>
                            <Form.Item name="accessToken" noStyle rules={[{ required: true, message: 'Vui lòng nhập Access Token' }]}>
                                <Input.Password placeholder="app-xxx..." prefix={<KeyOutlined />} style={{ width: '100%' }} />
                            </Form.Item>
                            <Button type="primary" onClick={handleTestConnection} loading={testingConnection}>Test Connection</Button>
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item label="Knowledge Base Name" name="knowledgeName">
                        <Input prefix={<FileTextOutlined />} placeholder="Tên DB của tài liệu Dify cung cấp" />
                    </Form.Item>
                    <Form.Item label="Knowledge Base Url" name="knowledgeUrl" rules={[{ required: true }]}>
                        <Input prefix={<LinkOutlined />} placeholder="Base URL Dify..." />
                    </Form.Item>
                </>
            ) : (
                <>
                    <Form.Item label="Provider" name={['modelConfig', 'providerType']} rules={[{ required: true }]} initialValue="INTERNAL">
                        <Select
                            options={[
                                { value: 'INTERNAL', label: 'INTERNAL (Custom Model)' },
                                { value: 'DIFY', label: 'DIFY (RAG Workflow)' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Tên/Key kỹ thuật"
                        name={['modelConfig', 'nameModel']}
                        rules={[{ required: true, message: 'Vui lòng nhập key kỹ thuật của model' }]}
                        extra="Key dùng để hệ thống gọi model, VD: skin_v1, derma_yolo_v3"
                    >
                        <Input placeholder="VD: skin_v1" />
                    </Form.Item>
                    <Form.Item 
                        noStyle 
                        shouldUpdate={(prevValues, currentValues) => prevValues?.modelConfig?.providerType !== currentValues?.modelConfig?.providerType}
                    >
                        {({ getFieldValue }) => 
                            getFieldValue(['modelConfig', 'providerType']) === 'DIFY' ? (
                                <Form.Item label="Dify Access Token" required>
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Form.Item name={['modelConfig', 'accessToken']} noStyle rules={[{ required: true, message: 'Vui lòng nhập Dify Access Token' }]}>
                                            <Input.Password placeholder="app-xxx..." prefix={<KeyOutlined />} style={{ width: '100%' }} />
                                        </Form.Item>
                                        <Button type="primary" onClick={handleTestConnection} loading={testingConnection}>Test Connection</Button>
                                    </Space.Compact>
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                    <Form.Item label="URL Model Server" name="modelUrl" rules={[{ required: true }]}>
                        <Input prefix={<LinkOutlined />} placeholder="Endpoint Model Server (Local/Remote)" />
                    </Form.Item>
                </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
            </div>
        </Form>
      </Modal>

      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}
