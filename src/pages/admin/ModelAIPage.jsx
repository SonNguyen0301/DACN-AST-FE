import { useState, useEffect } from 'react';
import {
  Layout, Typography, Row, Col, Card, Table, Tag, Button, Space, Tabs, Modal, Form, Input, message, Popconfirm, Switch, Select, Divider, Empty
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, RobotOutlined, ScanOutlined, EditOutlined, KeyOutlined, LinkOutlined, FileTextOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import adminService from '../../services/adminService';
import AdminHeader from './components/AdminHeader';
import useAuth from "../../hooks/useAuth";
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const PAGE_SIZE = 10;

export default function ModelAIPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('chatbot');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const [chatbotActive, setChatbotActive] = useState(null);
  const [diagnosisActive, setDiagnosisActive] = useState(null);
  const [chatbotInternal, setChatbotInternal] = useState([]);
  const [diagnosisInternal, setDiagnosisInternal] = useState([]);
  const [chatbotPagination, setChatbotPagination] = useState({ page: 1, total: 0 });
  const [diagnosisPagination, setDiagnosisPagination] = useState({ page: 1, total: 0 });

  const fetchModels = async (chatPage = 1, diagPage = 1) => {
    setLoading(true);
    try {
      const [chatActiveRes, diagActiveRes, chatInternalRes, diagInternalRes] = await Promise.all([
        adminService.getChatbotModels({ page: 1, take: 1, isPublic: true }),
        adminService.getDiagnoseModels({ page: 1, take: 1, isPublic: true }),
        adminService.getChatbotModels({ page: chatPage, take: PAGE_SIZE, isPublic: false }),
        adminService.getDiagnoseModels({ page: diagPage, take: PAGE_SIZE, isPublic: false }),
      ]);

      const extractFirst = (res) =>
        res.data?.data?.data?.[0] || res.data?.data?.[0] || null;

      const extractList = (res) =>
        res.data?.data?.data || res.data?.data || res.data || [];

      const extractTotal = (res) =>
        res.data?.data?.meta?.total ?? res.data?.meta?.total ?? extractList(res).length;

      setChatbotActive(extractFirst(chatActiveRes));
      setDiagnosisActive(extractFirst(diagActiveRes));
      setChatbotInternal(extractList(chatInternalRes));
      setDiagnosisInternal(extractList(diagInternalRes));
      setChatbotPagination({ page: chatPage, total: extractTotal(chatInternalRes) });
      setDiagnosisPagination({ page: diagPage, total: extractTotal(diagInternalRes) });
    } catch (error) {
      message.error('Lỗi khi tải danh sách Model');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleTestConnection = async () => {
    try {
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
        const apiMessage = response.data?.message;
        
        if (apiMessage === 'Invalid token or API error') {
          message.error('Token không hợp lệ hoặc lỗi API');
        } else {
          message.error(apiMessage || 'Kết nối thất bại. Token không hợp lệ.');
        }
      }
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      
      if (apiMessage === 'Invalid token or API error') {
        message.error('Token không hợp lệ hoặc lỗi API');
      } else {
        message.error(apiMessage || 'Lỗi kết nối đến server backend.');
      }
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && editingModel) {
      form.setFieldsValue(editingModel);
    } else if (!isModalOpen) {
      form.resetFields();
    }
  }, [isModalOpen, editingModel]);

  const handleEdit = (record) => {
    setEditingModel(record);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingModel(null);
    setIsModalOpen(true);
    form.resetFields();
    form.setFieldsValue({ isPublic: false });
  };

  const handleTogglePublic = async (record, checked, type) => {
    try {
      if (type === 'chatbot') {
        await adminService.updateChatbotModel(record.id, { isPublic: checked });
      } else {
        await adminService.updateDiagnoseModel(record.id, { isPublic: checked });
      }
      message.success(checked ? 'Đã kích hoạt model' : 'Đã chuyển sang nội bộ');
      fetchModels(chatbotPagination.page, diagnosisPagination.page);
    } catch (e) {
      message.error('Có lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id, type) => {
    try {
      if (type === 'chatbot') {
        await adminService.deleteChatbotModel(id);
      } else {
        await adminService.deleteDiagnoseModel(id);
      }
      message.success('Đã xóa phiên bản model');
      fetchModels(chatbotPagination.page, diagnosisPagination.page);
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
      fetchModels(chatbotPagination.page, diagnosisPagination.page);
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      
      const errorMapping = {
        'Chatbot model version already exists.': 'Đã tồn tại version của chatbot trong hệ thống',
        'Chatbot model not found.': 'Không tìm thấy chatbot'
      };

      const displayMessage = errorMapping[apiMessage] || apiMessage || 'Có lỗi xảy ra!';
      message.error(displayMessage);
    }
  };

  const renderActiveModelCard = (activeModel, type) => {
    if (!activeModel) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có model nào được công khai. Kích hoạt một phiên bản từ danh sách bên dưới."
        />
      );
    }

    const isChat = type === 'chatbot';

    return (
      <Card
        style={{
          borderRadius: 10,
          border: '1.5px solid #52c41a',
          background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)',
          boxShadow: '0 2px 12px rgba(82,196,26,0.12)'
        }}
      >
        <Row gutter={[24, 12]} align="middle">
          <Col xs={24} sm={16}>
            <Space direction="vertical" size={4}>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                <Text strong style={{ fontSize: 16 }}>
                  {activeModel.name || `Phiên bản ${activeModel.version}`}
                </Text>
                <Tag color="green">ĐANG HOẠT ĐỘNG</Tag>
                <Tag color="blue">v{activeModel.version}</Tag>
              </Space>
              {isChat ? (
                <Space wrap>
                  <Text type="secondary">Knowledge Base:</Text>
                  <Text>{activeModel.knowledgeName || '—'}</Text>
                  {activeModel.knowledgeUrl && (
                    <a href={activeModel.knowledgeUrl} target="_blank" rel="noreferrer">
                      <LinkOutlined /> Link
                    </a>
                  )}
                </Space>
              ) : (
                <Space wrap>
                  <Text type="secondary">Provider:</Text>
                  <Tag color="blue">{activeModel.modelConfig?.providerType || 'INTERNAL'}</Tag>
                  <Text type="secondary">Access Token:</Text>
                  {maskToken(activeModel.modelConfig?.accessToken)
                    ? <Text code>{maskToken(activeModel.modelConfig?.accessToken)}</Text>
                    : <Text type="secondary">—</Text>
                  }
                </Space>
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cập nhật: {activeModel.updatedAt ? dayjs(activeModel.updatedAt).format('DD/MM/YYYY HH:mm') : '—'}
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<EditOutlined />} onClick={() => handleEdit(activeModel)}>Chỉnh sửa</Button>
              <Popconfirm title="Xóa phiên bản này?" onConfirm={() => handleDelete(activeModel.id, type)}>
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  const maskToken = (token) => token ? `••••••${token.slice(-3)}` : null;

  const getInternalColumns = (type) => [
    {
      title: 'Version',
      dataIndex: 'version',
      width: 100,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Tên hiển thị',
      dataIndex: 'name',
      width: 180,
      render: (t) => t ? <Text>{t}</Text> : <Text type="secondary">—</Text>
    },
    ...(type === 'chatbot' ? [
      { title: 'Dify Token', dataIndex: 'accessToken', width: 120, render: () => '••••••••' },
      { title: 'Knowledge Base', dataIndex: 'knowledgeName', width: 180, render: (t) => t || <Text type="secondary">—</Text> }
    ] : [
      {
        title: 'Provider',
        dataIndex: ['modelConfig', 'providerType'],
        width: 140,
        render: (t) => <Tag color="blue">{t || 'INTERNAL'}</Tag>
      },
      {
        title: 'Access Token',
        dataIndex: ['modelConfig', 'accessToken'],
        width: 160,
        render: (t) => maskToken(t) ? <Text code>{maskToken(t)}</Text> : <Text type="secondary">—</Text>
      },
    ]),
    {
      title: 'Cập nhật lúc',
      dataIndex: 'updatedAt',
      width: 160,
      render: (t) => t ? dayjs(t).format('DD/MM/YYYY HH:mm') : '—'
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space>
          <Switch
            size="small"
            checked={false}
            checkedChildren="Kích hoạt"
            unCheckedChildren="Nội bộ"
            onChange={(checked) => handleTogglePublic(record, checked, type)}
          />
          <Button type="text" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa phiên bản này?" onConfirm={() => handleDelete(record.id, type)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const renderTabContent = (type) => {
    const isChat = type === 'chatbot';
    const activeModel = isChat ? chatbotActive : diagnosisActive;
    const internalModels = isChat ? chatbotInternal : diagnosisInternal;
    const pagination = isChat ? chatbotPagination : diagnosisPagination;

    const handlePageChange = (page) => {
      if (isChat) {
        fetchModels(page, diagnosisPagination.page);
      } else {
        fetchModels(chatbotPagination.page, page);
      }
    };

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>Model đang hoạt động</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Phiên bản hiện đang được phát hành công khai cho người dùng</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {isChat ? 'Thêm mô hình Dify mới' : 'Thêm Model Chẩn đoán mới'}
          </Button>
        </div>

        {renderActiveModelCard(activeModel, type)}

        <Divider orientation="left" style={{ marginTop: 28 }}>
          <Text strong style={{ fontSize: 14 }}>Phiên bản nội bộ ({pagination.total})</Text>
        </Divider>

        <Table
          loading={loading}
          columns={getInternalColumns(type)}
          dataSource={internalModels}
          rowKey="id"
          bordered
          size="small"
          scroll={{ x: 800 }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có phiên bản nội bộ nào" /> }}
          pagination={{
            current: pagination.page,
            pageSize: PAGE_SIZE,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} phiên bản`,
            onChange: handlePageChange,
          }}
        />
      </div>
    );
  };

  const getTabItems = () => [
    {
      key: 'chatbot',
      label: (<span><RobotOutlined /> AI Chatbot</span>),
      children: renderTabContent('chatbot')
    },
    {
      key: 'diagnosis',
      label: (<span><ScanOutlined /> AI Diagnosis</span>),
      children: renderTabContent('diagnosis')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <AdminHeader selectedKey="AI" />

      <Content style={{ padding: '30px 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý Model AI</Title>
          <Text type="secondary">Cấu hình phiên bản và API cấu hình cho Chatbot & Chẩn đoán hình ảnh.</Text>
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
        forceRender
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
                <Switch checkedChildren="Phát hành" unCheckedChildren="Nội bộ / Ẩn" />
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
