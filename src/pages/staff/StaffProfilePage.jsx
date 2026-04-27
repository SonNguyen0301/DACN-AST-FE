import { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Button, 
  Descriptions, 
  Tabs, 
  Tag, 
  Divider,
  Dropdown,
  message,
  Input,
  Form,
  Modal
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  EditOutlined,
  CameraOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import Footer from "../../components/common/Footer"; 
import { getStaffInfoAPI, updateStaffInfoAPI } from '../../services/staffService';
import useAuth from '../../hooks/useAuth';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;


export default function StaffProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm] = Form.useForm();

  const [staffInfo, setStaffInfo] = useState({
    name: "",
    firstName: "", 
    lastName: "",
    phoneNumber: "",
    department: "Tiếp nhận",
    position: "Nhân viên", 
    hospital: "Bệnh viện ASTCare", 
    avatar: "/staff-avatar.png",  
    email: "",
    phone: "",
    about: "",
    gender: "",
    dateOfBirth: "",
  });

  const fetchStaffProfile = async () => {
      try {
          const res = await getStaffInfoAPI();
          if (res.data?.success) {
              const data = res.data.data;
              
              const nameParts = data.name ? data.name.split(" ") : [];
              const fName = nameParts.length > 0 ? nameParts.pop() : "";
              const lName = nameParts.join(" ");

              setStaffInfo(prev => ({
                  ...prev,
                  name: data.name || `${lName} ${fName}`,
                  firstName: data.firstName || fName, 
                  lastName: data.lastName || lName,   
                  department: data.department || "Tiếp nhận",
                  email: data.email,
                  phone: data.phoneNumber,
                  phoneNumber: data.phoneNumber, 
                  about: data.description || "Nhân viên chưa cập nhật thông tin giới thiệu.",
                  avatar: data.avatarUrl || "/staff-avatar.png",
                  gender: data.gender === 'MALE' ? 'Nam' : (data.gender === 'FEMALE' ? 'Nữ' : 'Khác'),
                  dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth).format('DD/MM/YYYY') : "Đang cập nhật",
              }));
          }
      } catch (error) {
          console.error("Lỗi lấy thông tin nhân viên:", error);
          message.error("Không thể tải thông tin hồ sơ lúc này.");
      }
  };

  useEffect(() => {
      fetchStaffProfile();
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const menuUserItems = [
    { key: '1', label: (<a onClick={() => navigate('/staff/profile')}>Hồ sơ nhân viên</a>), icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  const handleOpenEditModal = () => {
    editForm.setFieldsValue({
        lastName: staffInfo.lastName,
        firstName: staffInfo.firstName,
        phoneNumber: staffInfo.phoneNumber,
        description: staffInfo.about !== "Nhân viên chưa cập nhật thông tin giới thiệu." ? staffInfo.about : ""
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (values) => {
    setUpdating(true);
    try {
        const payload = {
            lastName: values.lastName,
            firstName: values.firstName,
            phoneNumber: values.phoneNumber,
            description: values.description
        };

        const res = await updateStaffInfoAPI(payload);
        
        if (res.data?.success) {
            message.success("Cập nhật thông tin thành công!");
            setIsEditModalOpen(false);
            fetchStaffProfile(); 

            if (updateUser) {
                updateUser({
                    firstName: values.firstName,
                    lastName: values.lastName
                });
            }
        } else {
            message.error("Không thể cập nhật thông tin lúc này.");
        }
    } catch (error) {
        console.error("Lỗi cập nhật profile:", error);
    } finally {
        setUpdating(false);
    }
  };


  const OverviewTab = () => (
    <div>
        <div style={{ marginBottom: 24 }}>
            <Title level={5}>Giới thiệu bản thân</Title>
            <Paragraph style={{ color: '#555', lineHeight: '1.6' }}>
                {staffInfo.about}
            </Paragraph>
        </div>

        <Divider />

        <Descriptions title="Thông tin cá nhân" column={1} labelStyle={{ fontWeight: 'bold', width: '150px' }}>
            <Descriptions.Item label="Họ và tên">{staffInfo.name}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{staffInfo.gender}</Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">{staffInfo.dateOfBirth}</Descriptions.Item>
            <Descriptions.Item label="Phòng ban">Khoa {staffInfo.department}</Descriptions.Item>
        </Descriptions>
    </div>
  );

const SettingsTab = () => (
    <Form layout="vertical">
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}>
                    <Input 
                        prefix={<PhoneOutlined style={{ color: '#1677ff' }} />} 
                        value={staffInfo.phone} 
                        readOnly 
                        bordered={false} 
                        style={{ color: '#333', fontSize: 15, paddingLeft: 0, cursor: 'default' }}
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                 <Form.Item label={<span style={{ fontWeight: 600 }}>Email</span>}>
                    <Input 
                        prefix={<MailOutlined style={{ color: '#1677ff' }} />} 
                        value={staffInfo.email} 
                        readOnly 
                        bordered={false} 
                        style={{ color: '#333', fontSize: 15, paddingLeft: 0, cursor: 'default' }}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Nơi làm việc</span>}>
                     <Input 
                        prefix={<EnvironmentOutlined style={{ color: '#1677ff' }} />} 
                        value={staffInfo.hospital} 
                        readOnly 
                        bordered={false} 
                        style={{ color: '#333', fontSize: 15, paddingLeft: 0, cursor: 'default' }}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                 <Form.Item label={<span style={{ fontWeight: 600 }}>Giới thiệu ngắn</span>}>
                     <Input.TextArea 
                        rows={4} 
                        value={staffInfo.about} 
                        readOnly 
                        bordered={false} 
                        style={{ color: '#333', fontSize: 15, paddingLeft: 0, cursor: 'default', resize: 'none' }}
                    />
                </Form.Item>
            </Col>
        </Row>
    </Form>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/staff/dashboard')}>
            <img src="/ASTCare1.png" alt="ASTCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={[]} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" },
            { key: "3", label: "Quản lý lịch" },
          ]}
          onClick ={({ key }) => {
            switch (key) {
              case "1": navigate('/staff/dashboard'); break;
              case "2": navigate('/staff/appointments'); break;
              case "3": navigate('/staff/manage-schedule'); break;
              default: break;
            }
          }}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
        />
        <Dropdown menu={{ items: menuUserItems }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.firstName} {user.lastName}</span>
                <span style={{ fontSize: 12, color: '#888' }}>Khoa {staffInfo.department}</span>
            </div>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#faad14' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "30px 40px" }}>
         <div style={{ marginBottom: 24 }}>
            <Title level={3}>Hồ sơ nhân viên</Title>
         </div>

         <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
                <Card 
                    variant="borderless" 
                    style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", textAlign: 'center' }}
                    styles={{ body: { padding: 30 } }}
                >
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar 
                            size={120} 
                            src={staffInfo.avatar} 
                            icon={<UserOutlined />} 
                            style={{ backgroundColor: '#fffbe6', color: '#faad14', border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                        />
                        <Button 
                            shape="circle" 
                            icon={<CameraOutlined />} 
                            size="small" 
                            style={{ position: 'absolute', bottom: 0, right: 0, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} 
                        />
                    </div>
                    
                    <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>{user.firstName} {user.lastName}</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>{staffInfo.position}</Text>
                    
                    <div style={{ marginTop: 12 }}>
                        <Tag color="orange">Khoa {staffInfo.department}</Tag>
                    </div>

                    <Divider />

                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <EnvironmentOutlined style={{ color: '#faad14', fontSize: 18, marginTop: 4 }} />
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Nơi làm việc</Text>
                                <Text style={{ display: 'block', fontWeight: 500 }}>{staffInfo.hospital}</Text>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PhoneOutlined style={{ color: '#faad14', fontSize: 18, marginTop: 4 }} />
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Số điện thoại</Text>
                                <Text style={{ display: 'block', fontWeight: 500 }}>{staffInfo.phone}</Text>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <MailOutlined style={{ color: '#faad14', fontSize: 18, marginTop: 4 }} />
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Email</Text>
                                <Text style={{ display: 'block', fontWeight: 500 }}>{staffInfo.email}</Text>
                            </div>
                        </div>
                    </div>

                    <Button type="primary" ghost icon={<EditOutlined />} block style={{ marginTop: 24, borderColor: '#faad14', color: '#faad14' }} onClick={handleOpenEditModal}>
                        Chỉnh sửa hồ sơ
                    </Button>
                </Card>
            </Col>

            <Col xs={24} md={16}>
                <Card 
                    variant="borderless" 
                    style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", minHeight: 600 }}
                >
                    <Tabs 
                        defaultActiveKey="1" 
                        items={[
                            { label: 'Thông tin chung', key: '1', children: <OverviewTab /> },
                            { label: 'Cài đặt tài khoản', key: '2', children: <SettingsTab /> },
                        ]}
                    />
                </Card>
            </Col>
         </Row>
      </Content>

      <Footer />

      <Modal
          title="Chỉnh sửa Thông tin Cá nhân"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          onOk={() => editForm.submit()}
          confirmLoading={updating}
          okText="Lưu thay đổi"
          cancelText="Hủy"
          width={600}
      >
          <Form 
              form={editForm} 
              layout="vertical" 
              onFinish={handleUpdateProfile}
              style={{ marginTop: 20 }}
          >
              <Row gutter={16}>
                  <Col span={12}>
                      <Form.Item 
                          name="lastName" 
                          label="Họ" 
                          rules={[{ required: true, message: 'Vui lòng nhập Họ' }]}
                      >
                          <Input placeholder="Nhập họ..." />
                      </Form.Item>
                  </Col>
                  <Col span={12}>
                      <Form.Item 
                          name="firstName" 
                          label="Tên" 
                          rules={[{ required: true, message: 'Vui lòng nhập Tên' }]}
                      >
                          <Input placeholder="Nhập tên..." />
                      </Form.Item>
                  </Col>
              </Row>

              <Form.Item 
                  name="phoneNumber" 
                  label="Số điện thoại" 
                  rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
              >
                  <Input placeholder="Nhập số điện thoại..." />
              </Form.Item>

              <Form.Item 
                  name="description" 
                  label="Giới thiệu công việc" 
              >
                  <Input.TextArea rows={4} placeholder="Mô tả ngắn về nhiệm vụ, công việc tại phòng khám..." />
              </Form.Item>
          </Form>
      </Modal>
    </Layout>
  );
}