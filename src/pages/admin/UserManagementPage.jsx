import { useState } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Dropdown, 
  Input,
  Tabs,
  Modal,
  Form,
  Select,
  Popconfirm,
  message,
  Badge
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  MedicineBoxOutlined,
  SolutionOutlined,
  TeamOutlined,
  EditOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer"; 

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const initialUsers = [
    { id: 1, name: 'BS. CK2 Trần Thị Hoa', email: 'hoa.tran@astcare.com', phone: '0909123456', role: 'doctor', department: 'Da liễu', status: 'active' },
    { id: 2, name: 'Nguyễn Văn Nam', email: 'nam.nguyen@astcare.com', phone: '0912345678', role: 'doctor', department: 'Nội khoa', status: 'active' },
    { id: 3, name: 'Lê Thị Bích', email: 'bich.le@astcare.com', phone: '0987654321', role: 'staff', department: 'Tiếp nhận', status: 'active' },
    { id: 4, name: 'Phạm Văn Hùng', email: 'hung.pham@gmail.com', phone: '0933445566', role: 'patient', department: null, status: 'active' },
    { id: 5, name: 'Hoàng Thị Mai', email: 'mai.hoang@gmail.com', phone: '0977889900', role: 'patient', department: null, status: 'inactive' },
  ];
  const [users, setUsers] = useState(initialUsers);

  const user = { name: "Administrator", role: "admin" };

  const menuItems = [
    { key: 'dashboard', label: 'Trang chủ' },
    { key: 'users', label: 'Quản lý tài khoản' },
    { key: 'AI', label: 'Quản lý Model AI' },
  ];

  const handleSignOut = () => navigate('/');

  const menuUserItems = [
    { key: '1', label: 'Hồ sơ Admin', icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  const handleMenuClick = ({ key }) => {
    switch (key) {
        case 'dashboard': navigate('/admin/dashboard'); break;
        case 'users': navigate('/admin/user-management'); break;
        case 'AI': navigate('/admin/model-ai'); break;
        default: break;
    }
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'staff', status: 'active' });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const newUsers = users.filter(item => item.id !== id);
    setUsers(newUsers);
    message.success('Đã xóa tài khoản thành công');
  };

  const handleSave = (values) => {
    if (editingUser) {
      const updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, ...values } : u);
      setUsers(updatedUsers);
      message.success('Cập nhật thông tin thành công');
    } else {
      const newUser = { id: Date.now(), ...values };
      setUsers([newUser, ...users]);
      message.success('Đã tạo tài khoản mới');
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u => {
    const matchRole = activeTab === 'all' || u.role === activeTab;
    const matchSearch = u.name.toLowerCase().includes(searchText.toLowerCase()) || u.phone.includes(searchText);
    return matchRole && matchSearch;
  });

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: record.role === 'doctor' ? '#1677ff' : record.role === 'staff' ? '#faad14' : '#87d068' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (role) => {
        let color = 'default';
        let icon = <UserOutlined />;
        let label = 'Unknown';
        switch(role) {
            case 'doctor': color = 'blue'; icon = <MedicineBoxOutlined />; label = 'Bác sĩ'; break;
            case 'staff': color = 'orange'; icon = <SolutionOutlined />; label = 'Nhân viên'; break;
            case 'patient': color = 'green'; icon = <TeamOutlined />; label = 'Bệnh nhân'; break;
            default: break;
        }
        return <Tag icon={icon} color={color}>{label.toUpperCase()}</Tag>;
      }
    },
    { title: 'SĐT', dataIndex: 'phone' },
    { title: 'Khoa/Ban', dataIndex: 'department', render: (text) => text || '-' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'error'} text={status === 'active' ? 'Hoạt động' : 'Đã khóa'} />
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => handleEdit(record)} />
          <Popconfirm title="CHẮC CHẮN xóa tài khoản?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
        
        <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>
                <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
            </div>

            <Menu
                mode="horizontal"
                defaultSelectedKeys={['users']} 
                items={menuItems}
                onClick={handleMenuClick}
                style={{ 
                    fontSize: 15, 
                    fontWeight: 500, 
                    color: '#555', 
                    borderBottom: 'none', 
                    flex: 1, 
                    justifyContent: 'center',
                    marginLeft: 20
                }}
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Quản lý Tài khoản</Title>
                    <Text type="secondary">Quản lý danh sách Bác sĩ, Nhân viên và Bệnh nhân trong hệ thống</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined  />} size="large" onClick={handleAdd}>
                    Tạo tài khoản có thẩm quyền
                </Button>
            </div>

            <Card variant="borderless" style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tabs 
                        activeKey={activeTab} 
                        onChange={setActiveTab} 
                        items={[
                            { key: 'all', label: 'Tất cả', icon: <UserOutlined /> },
                            { key: 'doctor', label: 'Bác sĩ', icon: <MedicineBoxOutlined /> },
                            { key: 'staff', label: 'Nhân viên', icon: <SolutionOutlined /> },
                            { key: 'patient', label: 'Bệnh nhân', icon: <TeamOutlined /> },
                        ]}
                        style={{ marginBottom: -16 }}
                    />
                    <Input 
                        placeholder="Tìm kiếm tên, email, sđt..." 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                        style={{ width: 300 }}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>
            </Card>

            <Card variant="borderless" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Table 
                    columns={columns} 
                    dataSource={filteredUsers} 
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                />
            </Card>

        </Content>
        
        <Footer />

        <Modal
            title={editingUser ? "Chỉnh sửa thông tin" : "Tạo tài khoản có thẩm quyền "}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleSave}>
                <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                    <Input placeholder="Nhập họ tên đầy đủ" />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input placeholder="example@astcare.com" />
                </Form.Item>
                
                <Form.Item label="Password" name="password" rules={[{ required: true, type: 'password', message: 'Password không hợp lệ' }]}>
                    <Input placeholder="••••••••" />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item label="Số điện thoại" name="phone" style={{ flex: 1 }} rules={[{ required: true, message: 'Nhập SĐT' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Trạng thái" name="status" style={{ flex: 1 }}>
                        <Select>
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Đã khóa</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item label="Vai trò (Phân quyền)" name="role" rules={[{ required: true }]}>
                    <Select onChange={() => {}}>
                        <Option value="doctor">Bác sĩ (Doctor)</Option>
                        <Option value="staff">Nhân viên (Staff)</Option>
                    </Select>
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role}>
                    {({ getFieldValue }) => 
                        (getFieldValue('role') === 'doctor' || getFieldValue('role') === 'staff') ? (
                            <Form.Item 
                                label={getFieldValue('role') === 'doctor' ? "Chuyên khoa" : "Phòng ban"} 
                                name="department"
                                rules={[{ required: true, message: 'Vui lòng chọn thông tin này' }]}
                            >
                                {getFieldValue('role') === 'doctor' ? (
                                    <Select placeholder="Chọn chuyên khoa">
                                        <Option value="Da liễu">Da liễu</Option>
                                        <Option value="Nội khoa">Nội khoa</Option>
                                        <Option value="Nhi khoa">Nhi khoa</Option>
                                        <Option value="Tai Mũi Họng">Tai Mũi Họng</Option>
                                    </Select>
                                ) : (
                                    <Select placeholder="Chọn phòng ban">
                                        <Option value="Tiếp nhận">Tiếp nhận</Option>
                                        <Option value="Kế toán">Kế toán</Option>
                                        <Option value="Hành chính">Hành chính</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        ) : null
                    }
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                    <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                    <Button type="primary" htmlType="submit">
                        {editingUser ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </div>
            </Form>
        </Modal>

    </Layout>
  );
}