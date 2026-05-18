import { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Avatar,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Descriptions,
  Tabs,
  Timeline,
  Tag,
  List,
  Divider,
  message,
  Input,
  Form,
  Modal
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined, 
  EnvironmentOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  CameraOutlined,
  BankOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer"; 
import { getDoctorInfoAPI, updateDoctorInfoAPI } from '../../services/doctorService';
import useAuth from '../../hooks/useAuth';
import DoctorHeader from './components/DoctorHeader';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;


export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm] = Form.useForm();

  const [doctorInfo, setDoctorInfo] = useState({
    firstName: "", 
    lastName: "",
    phoneNumber: "",
    specialty: "",
    position: "Bác sĩ điều trị", 
    hospital: "Bệnh viện ASTCare", 
    avatar: "/doctor-avatar.png",  
    email: "",
    phone: "",
    address: "Đang cập nhật...", 
    about: "",
    experienceText: "", 
    gender: "",
    
    rating: 4.8,
    reviews: 1250,
    education: [
      { year: "1998 - 2004", title: "Bác sĩ đa khoa", place: "Đại học Y Dược TP.HCM" },
      { year: "2006 - 2008", title: "Thạc sĩ", place: "Đại học Y Dược TP.HCM" },
    ],
    workHistory: [
        { period: "2018 - Nay", role: "Bác sĩ", place: "Bệnh viện ASTCare" },
    ],
    certifications: [
        "Chứng chỉ hành nghề khám chữa bệnh",
    ]
  });

        const fetchDoctorProfile = async () => {
          if (!user?.id) return; 
          try {
              const res = await getDoctorInfoAPI(user.id);
              if (res.data?.success) {
                  const data = res.data.data;
                  
                  setDoctorInfo(prev => ({
                      ...prev,
                      name: `BS. ${data.lastName} ${data.firstName}`,
                      firstName: data.firstName, 
                      lastName: data.lastName,
                      specialty: data.department || "Đa khoa",
                      email: data.email,
                      phone: `${data.phoneCode} ${data.phoneNumber}`,
                      phoneNumber: data.phoneNumber,
                      about: data.description || "Bác sĩ chưa cập nhật thông tin giới thiệu.",
                      avatar: data.avatarUrl || "/doctor-avatar.png",
                      experienceText: data.experience || "Nhiều năm",
                      gender: data.gender === 'MALE' ? 'Nam' : 'Nữ',
                      doctorCode: data.doctorCode
                  }));
              }
          } catch (error) {
              console.error("Lỗi lấy thông tin bác sĩ:", error);
              message.error("Không thể tải thông tin hồ sơ lúc này.");
          }
      };

  useEffect(() => {
      fetchDoctorProfile();
  }, [user?.id]);
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
        await updateDoctorInfoAPI({ avatarUrl: base64 });
        setDoctorInfo(prev => ({ ...prev, avatar: base64 }));
        updateUser({ avatarUrl: base64 });
        message.success('Cập nhật ảnh đại diện thành công!');
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
        lastName: doctorInfo.lastName,
        firstName: doctorInfo.firstName,
        phoneNumber: doctorInfo.phoneNumber,
        experience: doctorInfo.experienceText !== "Nhiều năm" ? doctorInfo.experienceText : "", 
        description: doctorInfo.about !== "Bác sĩ chưa cập nhật thông tin giới thiệu." ? doctorInfo.about : ""
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
            experience: values.experience,
            description: values.description
        };

        const res = await updateDoctorInfoAPI(payload);
        
        if (res.data?.success) {
            message.success("Cập nhật thông tin thành công!");
            setIsEditModalOpen(false);
            fetchDoctorProfile(); 

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
                {doctorInfo.about}
            </Paragraph>
        </div>

        <Divider />

        <Descriptions title="Thông tin cá nhân" column={1} labelStyle={{ fontWeight: 'bold', width: '150px' }}>
            <Descriptions.Item label="Họ và tên">{doctorInfo.firstName} {doctorInfo.lastName}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{doctorInfo.gender || 'Đang cập nhật'}</Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">15/08/1980</Descriptions.Item>
            <Descriptions.Item label="Quốc tịch">Việt Nam</Descriptions.Item>
            <Descriptions.Item label="Ngôn ngữ">Tiếng Việt, Tiếng Anh, Tiếng Pháp</Descriptions.Item>
        </Descriptions>
    </div>
  );

  const ProfessionalTab = () => (
    <div>
         <Row gutter={[24, 24]}>
            <Col span={24}>
                <Title level={5}><BankOutlined /> Lịch sử công tác</Title>
                <Timeline style={{ marginTop: 20 }}>
                    {doctorInfo.workHistory.map((item, index) => (
                        <Timeline.Item key={index} color={index === doctorInfo.workHistory.length - 1 ? "green" : "blue"}>
                            <Text strong>{item.role}</Text>
                            <br />
                            <Text type="secondary">{item.place} ({item.period})</Text>
                        </Timeline.Item>
                    ))}
                </Timeline>
            </Col>
            
            <Col span={24}>
                 <Divider style={{ margin: '0 0 24px 0' }}/>
                <Title level={5}><GlobalOutlined /> Học vấn</Title>
                <List
                    dataSource={doctorInfo.education}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<SafetyCertificateOutlined style={{ fontSize: 24, color: '#faad14' }} />}
                                title={<Text strong>{item.title}</Text>}
                                description={`${item.place} - ${item.year}`}
                            />
                        </List.Item>
                    )}
                />
            </Col>

            <Col span={24}>
                <Divider style={{ margin: '0 0 24px 0' }}/>
                <Title level={5}><SafetyCertificateOutlined /> Chứng chỉ & Bằng cấp</Title>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {doctorInfo.certifications.map((cert, idx) => (
                        <Tag key={idx} color="geekblue" style={{ padding: '4px 10px', fontSize: 13, marginBottom: 8 }}>
                            {cert}
                        </Tag>
                    ))}
                </div>
            </Col>
         </Row>
    </div>
  );

const SettingsTab = () => (
    <Form layout="vertical">
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}>
                    <Input 
                        prefix={<PhoneOutlined style={{ color: '#1677ff' }} />} 
                        value={doctorInfo.phone} 
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
                        value={doctorInfo.email} 
                        readOnly 
                        bordered={false} 
                        style={{ color: '#333', fontSize: 15, paddingLeft: 0, cursor: 'default' }}
                    />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Địa chỉ phòng khám / Nơi làm việc</span>}>
                     <Input 
                        prefix={<EnvironmentOutlined style={{ color: '#1677ff' }} />} 
                        value={doctorInfo.hospital} 
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
                        value={doctorInfo.about} 
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
      <DoctorHeader selectedKey="" />

      <Content style={{ padding: "30px 40px" }}>
         <div style={{ marginBottom: 24 }}>
            <Title level={3}>Hồ sơ bác sĩ</Title>
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
                            src={doctorInfo.avatar}
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#e6f4ff', color: '#1677ff', border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
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
                    
                    <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>{doctorInfo.firstName} {doctorInfo.lastName}</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>{doctorInfo.position}</Text>
                    
                    <div style={{ marginTop: 12 }}>
                        <Tag color="blue">{doctorInfo.specialty}</Tag>
                        <Tag color="purple">{doctorInfo.experienceText}</Tag>
                    </div>

                    <Divider />

                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <EnvironmentOutlined style={{ color: '#1677ff', fontSize: 18, marginTop: 4 }} />
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Nơi làm việc</Text>
                                <Text style={{ display: 'block', fontWeight: 500 }}>{doctorInfo.hospital}</Text>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PhoneOutlined style={{ color: '#1677ff', fontSize: 18, marginTop: 4 }} />
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Số điện thoại</Text>
                                <Text style={{ display: 'block', fontWeight: 500 }}>{doctorInfo.phone}</Text>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <MailOutlined style={{ color: '#1677ff', fontSize: 18, marginTop: 4 }} />
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Email</Text>
                                <Text style={{ display: 'block', fontWeight: 500 }}>{doctorInfo.email}</Text>
                            </div>
                        </div>
                    </div>

                    <Button type="primary" ghost icon={<EditOutlined />} block style={{ marginTop: 24 }} onClick={handleOpenEditModal}>
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
                            { label: 'Chuyên môn & Học vấn', key: '2', children: <ProfessionalTab /> },
                            { label: 'Thông tin tài khoản', key: '3', children: <SettingsTab /> },
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
                  label="Giới thiệu bản thân" 
              >
                  <Input.TextArea rows={4} placeholder="Viết một đoạn ngắn giới thiệu về chuyên môn và bản thân..." />
              </Form.Item>
          </Form>
      </Modal>

    </Layout>
  );
}