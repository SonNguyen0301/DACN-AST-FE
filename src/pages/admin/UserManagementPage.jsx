import { useState, useEffect, useMemo } from 'react';
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
  Badge,
  Row,
  Col,
  Statistic
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
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Footer from "../../components/common/Footer"; 
import adminService from "../../services/adminService";
import { getDoctorsAPI } from "../../services/doctorService";
import useAuth from "../../hooks/useAuth";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Mapping tiếng Anh -> tiếng Việt để hiển thị
const DEPARTMENT_MAPPING = {
  'dermatology': 'Da liễu',
  'internal_medicine': 'Nội khoa',
  'pediatrics': 'Nhi khoa',
  'otolaryngology': 'Tai Mũi Họng',
  'reception': 'Tiếp nhận',
  'accounting': 'Kế toán',
  'administration': 'Hành chính'
};

const COLORS = ['#1677ff', '#faad14', '#52c41a', '#ff4d4f', '#722ed1', '#eb2f96', '#13c2c2'];

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user, logout } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [globalStats, setGlobalStats] = useState(null);

  const fetchGlobalStats = async () => {
    try {
      const res = await adminService.getUserStatistics();
      setGlobalStats(res.data?.data || res.data);
    } catch (error) {
      console.error("Lỗi khi nạp thống kê", error);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  // Danh sách các phòng ban/chuyên khoa cố định dùng cho Filter (value là tiếng Anh)
  const filterDepartments = [
    { value: 'dermatology', label: 'Da liễu (Doctor)' }, 
    { value: 'internal_medicine', label: 'Nội khoa (Doctor)' }, 
    { value: 'pediatrics', label: 'Nhi khoa (Doctor)' }, 
    { value: 'otolaryngology', label: 'Tai Mũi Họng (Doctor)' },
    { value: 'reception', label: 'Tiếp nhận (Staff)' }, 
    { value: 'accounting', label: 'Kế toán (Staff)' }, 
    { value: 'administration', label: 'Hành chính (Staff)' }
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const isFilterAll = activeTab === 'all';
      const fetchDoctors = isFilterAll || activeTab === 'doctor';
      const fetchStaffs = isFilterAll || activeTab === 'staff';
      const fetchPatients = isFilterAll || activeTab === 'patient';
      
      const deptParam = departmentFilter !== 'all' ? departmentFilter : undefined;
      const searchParam = searchText ? searchText : undefined;

      const promises = [];
      const TAKE_LIMIT = 10; 
      
      if (fetchDoctors) {
        promises.push(getDoctorsAPI({ 
          take: TAKE_LIMIT, 
          page: 1, 
          department: deptParam, 
          keyword: searchParam 
        }).then(res => ({ type: 'doctor', data: res.data?.data?.data || res.data?.data || [] })));
      }
      
      if (fetchStaffs) {
        promises.push(adminService.getListStaffs({ 
          take: TAKE_LIMIT, 
          page: 1, 
          department: deptParam, 
          search: searchParam 
        }).then(res => ({ type: 'staff', data: res.data?.data?.data || res.data?.data || [] })));
      }

      if (fetchPatients) {
        promises.push(adminService.getListPatients({ 
          take: TAKE_LIMIT, 
          page: 1, 
          search: searchParam 
        }).then(res => ({ type: 'patient', data: res.data?.data?.data || res.data?.data || [] })));
      }

      const results = await Promise.all(promises);
      
      let allUsers = [];

      results.forEach(res => {
        if (res.type === 'doctor') {
          const formattedDoctors = res.data.map(doc => ({
              ...doc,
              id: doc.id || doc.userId,
              name: `${doc.lastName || ''} ${doc.firstName || ''}`.trim() || doc.name,
              role: 'doctor',
              email: doc.email || doc.user?.email,
              phone: doc.phoneNumber || doc.phone || doc.user?.phoneNumber,
              department: doc.department, 
              status: doc.user?.status || 'active',
              doctorCode: doc.doctorCode
          }));
          allUsers = [...allUsers, ...formattedDoctors];
        } else if (res.type === 'staff') {
          const formattedStaffs = res.data.map(staff => ({
              ...staff,
              id: staff.id || staff.userId,
              name: `${staff.user?.lastName || ''} ${staff.user?.firstName || ''}`.trim(),
              role: 'staff',
              email: staff.user?.email,
              phone: staff.user?.phoneNumber,
              department: staff.department, 
              status: 'active',
              staffCode: staff.staffCode
          }));
          allUsers = [...allUsers, ...formattedStaffs];
        } else if (res.type === 'patient') {
          const formattedPatients = res.data.map(patient => ({
              ...patient,
              id: patient.id || patient.userId,
              name: `${patient.user?.lastName || ''} ${patient.user?.firstName || ''}`.trim(),
              role: 'patient',
              email: patient.user?.email,
              phone: patient.user?.phoneNumber,
              department: null, 
              status: 'active',
              doctorCode: patient.citizenCode 
          }));
          allUsers = [...allUsers, ...formattedPatients];
        }
      });

      setUsers(allUsers);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, activeTab, departmentFilter]);

  // const user = { name: "Administrator", role: "admin" };

  const menuItems = [
    { key: 'dashboard', label: 'Trang chủ' },
    { key: 'users', label: 'Quản lý tài khoản' },
    { key: 'AI', label: 'Quản lý Model AI' },
  ];

  const handleSignOut = () => {
    logout(); 
    navigate('/login');
  };

  const menuUserItems = [
    { key: '1', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
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
    form.setFieldsValue({
      ...record,
      code: record.doctorCode || record.staffCode || record.citizenCode
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'staff', status: 'active' });
    setIsModalOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      if (record.role === 'doctor') {
        await adminService.deleteDoctorAccount(record.id);
      } else if (record.role === 'staff') {
        await adminService.deleteAdmissionStaffAccount(record.id);
      } else {
        return message.warning('Chỉ có thể xoá Bác sĩ và Nhân viên (Không thể xóa bệnh nhân)');
      }
      message.success('Đã xóa tài khoản thành công');
      fetchUsers();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Có lỗi khi xóa');
    }
  };

  const handleSave = async (values) => {
    try {
      const parts = values.name.split(' ');
      const firstName = parts.pop();
      const lastName = parts.join(' ') || firstName;
      
      const payload = {
        department: values.department, 
      };

      if (values.password) payload.password = values.password;

      if (editingUser) {
        if (editingUser.role === 'doctor') {
          await adminService.updateDoctorAccount(editingUser.id, payload);
        } else if (editingUser.role === 'staff') {
          await adminService.updateAdmissionStaffAccount(editingUser.id, payload);
        } else if (editingUser.role === 'patient') {
          return message.warning('Không hỗ trợ chỉnh sửa tài khoản bệnh nhân từ Admin');
        }
        message.success('Cập nhật thông tin thành công');
      } else {
        const createPayload = {
          ...payload,
          email: values.email,
          firstName,
          lastName,
          phoneNumber: values.phone,
          phoneCode: '+84',
          gender: values.gender || 'MALE',
        };

        if (values.role === 'doctor') {
          createPayload.doctorCode = values.code;
          await adminService.createDoctorAccount(createPayload);
        } else if (values.role === 'staff') {
          createPayload.staffCode = values.code;
          await adminService.createAdmissionStaffAccount(createPayload);
        } else {
           return message.warning('Chỉ hỗ trợ tạo mới tài khoản Bác sĩ hoặc Nhân viên');
        }
        message.success('Đã tạo tài khoản mới');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Có lỗi xảy ra, mã nhân viên/bác sĩ có thể bị trùng');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchRole = activeTab === 'all' || u.role === activeTab;
    const matchDept = departmentFilter === 'all' || u.department === departmentFilter || u.department === null;
    return matchRole && matchDept;
  });

  // ================= STATISTICS COMPUTATION (FROM BACKEND) =================
  const statsData = useMemo(() => {
    if (!globalStats) return [];

    if (activeTab === 'all') {
      const roleMap = { DOCTOR: 'Bác sĩ', 'ADMISSION STAFF': 'Nhân viên', STAFF: 'Nhân viên', PATIENT: 'Bệnh nhân' };
      return (globalStats.roleDistribution || [])
        .filter(d => roleMap[d.role])
        .map(d => ({
          name: roleMap[d.role],
          value: d.count
        }));
    } 
    else if (activeTab === 'doctor') {
      return (globalStats.doctorDepartmentDistribution || []).map(d => ({
        name: DEPARTMENT_MAPPING[d.department] || d.department || 'Khác',
        value: d.count
      }));
    }
    else if (activeTab === 'staff') {
      return (globalStats.staffDepartmentDistribution || []).map(d => ({
        name: DEPARTMENT_MAPPING[d.department] || d.department || 'Khác',
        value: d.count
      }));
    }
    return [];
  }, [globalStats, activeTab]);

  const renderStatistics = () => {
    if (!globalStats) return <div style={{ textAlign: 'center', padding: 40 }}>Đang tải dữ liệu...</div>;

    const totalUsers = (globalStats.roleDistribution || []).reduce((sum, d) => sum + d.count, 0);

    if (activeTab === 'all') {
      return (
        <div style={{ height: 300, minHeight: 300, minWidth: 0, width: '100%' }}>
          <Text strong style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>Tỷ lệ Vai trò (Tổng: {totalUsers})</Text>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statsData} cx="50%" cy="40%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => [`${value} tài khoản`, 'Số lượng']} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (activeTab === 'doctor') {
      const totalDoctors = (globalStats.doctorDepartmentDistribution || []).reduce((sum, d) => sum + d.count, 0);
      return (
        <div style={{ height: 300, minHeight: 300, minWidth: 0, width: '100%' }}>
          <Text strong style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>Bác sĩ theo Chuyên khoa (Tổng: {totalDoctors})</Text>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
              <Tooltip formatter={(value) => [`${value} bác sĩ`, 'Số lượng']} />
              <Bar dataKey="value" fill="#1677ff" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (activeTab === 'staff') {
      const totalStaff = (globalStats.staffDepartmentDistribution || []).reduce((sum, d) => sum + d.count, 0);
      return (
        <div style={{ height: 300, minHeight: 300, minWidth: 0, width: '100%' }}>
          <Text strong style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>Nhân viên theo Phòng ban (Tổng: {totalStaff})</Text>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statsData} cx="50%" cy="40%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => [`${value} nhân viên`, 'Số lượng']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (activeTab === 'patient') {
      const totalPatients = (globalStats.roleDistribution || []).find(r => r.role === 'PATIENT')?.count || 0;
      return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
           <Card style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Statistic title="Tổng Bệnh nhân Hệ thống" value={totalPatients} prefix={<TeamOutlined />} valueStyle={{ color: '#3f8600' }} />
           </Card>
           <Card>
              <Text type="secondary">Quản lý tài khoản bệnh nhân để hỗ trợ đặt lịch khám và tra cứu bệnh án AI.</Text>
           </Card>
        </Space>
      );
    }
  };

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      width: 250,
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
      title: 'Mã (BS/NV/CCCD)',
      key: 'code',
      width: 120,
      render: (_, record) => record.doctorCode || record.staffCode || record.citizenCode || '-'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      width: 130,
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
    { 
      title: 'SĐT', 
      dataIndex: 'phone',
      width: 140 
    },
    { 
      title: 'Khoa/Ban', 
      dataIndex: 'department',
      width: 160,
      render: (text) => DEPARTMENT_MAPPING[text] || text || '-' 
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'error'} text={status === 'active' ? 'Hoạt động' : 'Đã khóa'} />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right', 
      align: 'center',
      render: (_, record) => {
        if (record.role === 'patient') {
          return null; 
        }
        return (
        <Space>
          <Button type="text" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => handleEdit(record)} />
          <Popconfirm title="CHẮC CHẮN xóa tài khoản?" onConfirm={() => handleDelete(record)} okText="Xóa" cancelText="Hủy">
            <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} />
          </Popconfirm>
        </Space>
      )
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
        
        <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
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
                    <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.firstName + ' ' + user.lastName}</span>
                        <span style={{ fontSize: 12, color: '#888' }}>Quản trị hệ thống</span>
                    </div>
                    <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#001529' }} />
                </div>
            </Dropdown>
        </Header>

        <Content style={{ padding: "30px 40px" }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Quản lý Tài khoản</Title>
                    <Text type="secondary">Quản lý danh sách Bác sĩ, Nhân viên và Bệnh nhân trong hệ thống</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined  />} size="large" onClick={handleAdd}>
                    Tạo tài khoản
                </Button>
            </div>

            <Row gutter={[24, 24]}>
              {/* LÊN LEFT SIDE (30%) - BIỂU ĐỒ & THỐNG KÊ */}
              <Col xs={24} lg={7}>
                <Card 
                  title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SolutionOutlined style={{ color: '#1677ff' }} />
                      Tổng quan Dữ liệu
                    </span>
                  }
                  variant="borderless" 
                  style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: '100%' }}
                >
                   {renderStatistics()}
                </Card>
              </Col>

              {/* LÊN RIGHT SIDE (70%) - TABLE */}
              <Col xs={24} lg={17}>
                <Card variant="borderless" style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingBottom: 16 }}>
                        <Tabs 
                            activeKey={activeTab} 
                            onChange={setActiveTab} 
                            items={[
                                { key: 'all', label: 'Tất cả', icon: <UserOutlined /> },
                                { key: 'doctor', label: 'Bác sĩ', icon: <MedicineBoxOutlined /> },
                                { key: 'staff', label: 'Nhân viên', icon: <SolutionOutlined /> },
                                { key: 'patient', label: 'Bệnh nhân', icon: <TeamOutlined /> },
                            ]}
                            style={{ marginBottom: 0, width: '100%', maxWidth: 'max-content' }}
                        />
                        
                        <Space wrap style={{ width: '100%', flex: 1, justifyContent: 'flex-end' }}>
                            {(activeTab === 'doctor' || activeTab === 'staff' || activeTab === 'all') && (
                                <Select
                                    value={departmentFilter}
                                    onChange={setDepartmentFilter}
                                    style={{ width: 180, minWidth: 150, maxWidth: '100%' }}
                                    placeholder="Lọc chuyên khoa"
                                    options={[
                                        { value: 'all', label: 'Tất cả Khoa/Ban' },
                                        ...filterDepartments
                                    ]}
                                />
                            )}
                            <Input 
                                placeholder="Tìm kiếm tên, SĐT, Mã NV..." 
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                                style={{ width: 250, minWidth: 200, maxWidth: '100%' }}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                        </Space>
                    </div>

                    <Table 
                        loading={loading}
                        columns={columns} 
                        dataSource={filteredUsers} 
                        rowKey="id"
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 1020 }} 
                    />
                </Card>
              </Col>
            </Row>

        </Content>
        
        <Footer />

        <Modal
            title={editingUser ? "Chỉnh sửa thông tin" : "Tạo tài khoản có thẩm quyền "}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleSave}>
                <Form.Item label="Vai trò (Phân quyền)" name="role" rules={[{ required: true }]}>
                    <Select disabled={!!editingUser}>
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
                                        <Option value="dermatology">Da liễu</Option>
                                        <Option value="pediatrics">Nhi khoa</Option>
                                        <Option value="internal_medicine">Nội khoa</Option>
                                        <Option value="surgery">Ngoại khoa</Option>
                                    </Select>
                                ) : (
                                    <Select placeholder="Chọn phòng ban">
                                        <Option value="reception">Tiếp nhận</Option>
                                        <Option value="accounting">Kế toán</Option>
                                        <Option value="administration">Hành chính</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        ) : null
                    }
                </Form.Item>

                <Form.Item 
                  label="Mã nhân viên / Bác sĩ" 
                  name="code" 
                  rules={[{ required: true, message: 'Vui lòng nhập mã để quản lý' }]}
                >
                    <Input placeholder="VD: BS001, NV001" disabled={!!editingUser} />
                </Form.Item>

                <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                    <Input placeholder="Nhập họ tên đầy đủ" disabled={!!editingUser} />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input placeholder="example@astcare.com" disabled={!!editingUser} />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                    <Input disabled={!!editingUser} />
                </Form.Item>
                
                <Form.Item label={editingUser ? "Password mới (Để trống nếu không đổi)" : "Password"} name="password" rules={[{ required: !editingUser, message: 'Password không hợp lệ' }]}>
                    <Input.Password placeholder="••••••••" />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                    <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                    <Button type="primary" htmlType="submit">
                        {editingUser ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </div>
            </Form>
        </Modal>

        <style>{`
          @media (max-width: 576px) {
            .hide-on-mobile { display: none !important; }

            .ant-table-cell-fix-right {
                background-color: #fff !important; 
            }
            
            .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
                background-color: #fafafa !important;
            }

            .ant-table-thead > tr > th.ant-table-cell-fix-right {
                background-color: #fafafa !important;
            }
            
            .ant-table-cell-fix-right-first::after {
                box-shadow: inset -6px 0 6px -4px rgba(0, 0, 0, 0.15) !important;
            }
          }
        `}</style>
    </Layout>
  );
}