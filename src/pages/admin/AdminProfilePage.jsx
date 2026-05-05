import { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Descriptions,
  Tabs,
  Tag,
  Divider,
  message,
  Input,
  Form,
  Modal,
  Select,
  DatePicker,
  Avatar,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';
import Footer from "../../components/common/Footer";
import AdminHeader from "./components/AdminHeader";
import { getAdminInfoAPI, updateAdminInfoAPI } from '../../services/userService';
import useAuth from '../../hooks/useAuth';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function AdminProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm] = Form.useForm();

  const [adminInfo, setAdminInfo] = useState({
    id: "",
    name: "",
    firstName: "", 
    lastName: "",
    email: "",
    phoneNumber: "",
    phoneCode: "+84",
    role: "ADMIN",
    position: "Quản trị viên hệ thống", 
    avatar: "/admin-avatar.png",  
    gender: "",
    dateOfBirth: "",
    isOnBoardingCompleted: true
  });

  const fetchAdminProfile = async () => {
      try {
          // Gọi API GET /users/info
          const res = await getAdminInfoAPI(); 
          if (res.data?.success) {
              const data = res.data.data;

              setAdminInfo({
                  id: data.id,
                  name: `${data.lastName} ${data.firstName}`,
                  firstName: data.firstName || "", 
                  lastName: data.lastName || "",   
                  role: data.role || "ADMIN",
                  position: "Quản trị viên hệ thống",
                  email: data.email,
                  phoneNumber: data.phoneNumber || "", 
                  phoneCode: data.phoneCode || "+84",
                  avatar: data.avatarUrl || "/admin-avatar.png",
                  genderRaw: data.gender, 
                  gender: data.gender === 'MALE' ? 'Nam' : (data.gender === 'FEMALE' ? 'Nữ' : 'Khác'),
                  dateOfBirthRaw: data.dateOfBirth, 
                  dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth).format('DD/MM/YYYY') : "Chưa cập nhật",
                  isOnBoardingCompleted: data.isOnBoardingCompleted
              });
          }
      } catch (error) {
          console.error("Lỗi lấy thông tin admin:", error);
          message.error("Không thể tải thông tin hồ sơ lúc này.");
      }
  };

  useEffect(() => {
      fetchAdminProfile();
  }, []);


  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      message.error('Chỉ chấp nhận file JPG hoặc PNG');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      message.error('Ảnh không được vượt quá 2MB');
      return;
    }
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      try {
        const res = await updateAdminInfoAPI({
          avatarUrl: base64,
          isOnBoardingCompleted: true,
          phoneCode: adminInfo.phoneCode || '+84',
        });
        if (res.data?.success) {
          setAdminInfo(prev => ({ ...prev, avatar: base64 }));
          updateUser({ avatarUrl: base64 });
          message.success('Cập nhật ảnh đại diện thành công!');
        }
      } catch {
        message.error('Lỗi khi cập nhật ảnh đại diện');
      } finally {
        setUploadingAvatar(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEditModal = () => {
    editForm.setFieldsValue({
        lastName: adminInfo.lastName,
        firstName: adminInfo.firstName,
        phoneNumber: adminInfo.phoneNumber,
        gender: adminInfo.genderRaw,
        dateOfBirth: adminInfo.dateOfBirthRaw ? dayjs(adminInfo.dateOfBirthRaw) : null
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (values) => {
    setUpdating(true);
    try {
        const payload = {
            firstName: values.firstName,
            lastName: values.lastName,
            gender: values.gender,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
            phoneCode: adminInfo.phoneCode || "+84",
            phoneNumber: values.phoneNumber,
            avatarUrl: adminInfo.avatar === "/admin-avatar.png" ? "" : adminInfo.avatar,
            isOnBoardingCompleted: true
        };

        const res = await updateAdminInfoAPI(payload);
        
        if (res.data?.success) {
            message.success("Cập nhật thông tin thành công!");
            setIsEditModalOpen(false);
            fetchAdminProfile();

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
        message.error("Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
        setUpdating(false);
    }
  };

  const OverviewTab = () => (
    <div>
        <div style={{ marginBottom: 24 }}>
            <Title level={5}>Vai trò hệ thống</Title>
            <Paragraph style={{ color: '#555', lineHeight: '1.6' }}>
                Bạn đang đăng nhập với tư cách là Quản trị viên (Super Admin). Bạn có toàn quyền truy cập và điều hành các module quản lý nhân sự, dịch vụ, và cấu hình cốt lõi của hệ thống ASTCare.
            </Paragraph>
        </div>

        <Divider />

        <Descriptions title="Thông tin cá nhân" column={1} labelStyle={{ fontWeight: 'bold', width: '150px' }}>
            <Descriptions.Item label="Họ và tên">{adminInfo.name}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{adminInfo.gender}</Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">{adminInfo.dateOfBirth}</Descriptions.Item>
            <Descriptions.Item label="Vai trò"><Tag color="red">{adminInfo.role}</Tag></Descriptions.Item>
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
                        value={`${adminInfo.phoneCode} ${adminInfo.phoneNumber}`} 
                        readOnly 
                        bordered={false} 
                        style={{ color: '#333', fontSize: 15, paddingLeft: 0, cursor: 'default' }}
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                 <Form.Item label={<span style={{ fontWeight: 600 }}>Email liên hệ</span>}>
                    <Input 
                        prefix={<MailOutlined style={{ color: '#1677ff' }} />} 
                        value={adminInfo.email} 
                        readOnly 
                        bordered={false} 
                        style={{ color: '#333', fontSize: 15, paddingLeft: 0, cursor: 'default' }}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Quyền hạn</span>}>
                     <Input 
                        prefix={<SafetyCertificateOutlined style={{ color: '#1677ff' }} />} 
                        value="Toàn quyền quản trị (Full Access)" 
                        readOnly 
                        bordered={false} 
                        style={{ color: '#333', fontSize: 15, paddingLeft: 0, cursor: 'default' }}
                    />
                </Form.Item>
            </Col>
        </Row>
    </Form>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <AdminHeader selectedKey="" />

      <Content style={{ padding: "30px 40px" }}>
         <div style={{ marginBottom: 24 }}>
            <Title level={3}>Hồ sơ Quản trị viên</Title>
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
                            src={adminInfo.avatar}
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#fff1f0', color: '#f5222d', border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                        <input type="file" accept="image/jpeg,image/png" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
                        <Button
                            shape="circle"
                            icon={<CameraOutlined />}
                            size="small"
                            loading={uploadingAvatar}
                            onClick={() => fileInputRef.current?.click()}
                            style={{ position: 'absolute', bottom: 0, right: 0, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                        />
                    </div>
                    
                    <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>{adminInfo.name}</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>{adminInfo.position}</Text>
                    
                    <div style={{ marginTop: 12 }}>
                        <Tag color="red">Hệ thống ASTCare</Tag>
                    </div>

                    <Divider />

                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <MailOutlined style={{ color: '#f5222d', fontSize: 18, marginTop: 4 }} />
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Tài khoản (Email)</Text>
                                <Text style={{ display: 'block', fontWeight: 500 }}>{adminInfo.email}</Text>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PhoneOutlined style={{ color: '#f5222d', fontSize: 18, marginTop: 4 }} />
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Số điện thoại liên hệ</Text>
                                <Text style={{ display: 'block', fontWeight: 500 }}>{adminInfo.phoneNumber || 'Chưa cập nhật'}</Text>
                            </div>
                        </div>
                    </div>

                    <Button type="primary" ghost icon={<EditOutlined />} block style={{ marginTop: 24, borderColor: '#f5222d', color: '#f5222d' }} onClick={handleOpenEditModal}>
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
          title="Chỉnh sửa Hồ sơ Quản trị viên"
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

              <Row gutter={16}>
                  <Col span={12}>
                      <Form.Item 
                          name="gender" 
                          label="Giới tính" 
                          rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                      >
                          <Select placeholder="Chọn giới tính">
                              <Option value="MALE">Nam</Option>
                              <Option value="FEMALE">Nữ</Option>
                              <Option value="OTHER">Khác</Option>
                          </Select>
                      </Form.Item>
                  </Col>
                  <Col span={12}>
                      <Form.Item 
                          name="dateOfBirth" 
                          label="Ngày sinh" 
                          rules={[
                              { required: true, message: 'Vui lòng chọn ngày sinh' },
                              () => ({
                                  validator(_, value) {
                                      if (value && value.isAfter(dayjs(), 'day')) {
                                          return Promise.reject(new Error('Ngày sinh không thể ở trong tương lai!'));
                                      }
                                      return Promise.resolve();
                                  },
                              }),
                          ]}
                      >
                          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
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

          </Form>
      </Modal>
    </Layout>
  );
}