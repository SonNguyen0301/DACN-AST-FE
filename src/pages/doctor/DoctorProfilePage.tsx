import React, { useState } from 'react';
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
  Timeline, 
  Tag, 
  List,
  Divider,
  Dropdown,
  message,
  Upload,
  Input,
  Form
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  CalendarOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  UploadOutlined,
  CameraOutlined,
  BankOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer"; 

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const [doctorInfo, setDoctorInfo] = useState({
    name: "BS. CK2 Trần Thị Hoa",
    specialty: "Da liễu",
    position: "Trưởng khoa Da liễu",
    hospital: "Bệnh viện Da Liễu TP.HCM",
    avatar: "/doctor-avatar.png",  
    email: "tranthihoa@astcare.com",
    phone: "0909 123 456",
    address: "Quận 3, TP. Hồ Chí Minh",
    about: "Bác sĩ Trần Thị Hoa có hơn 15 năm kinh nghiệm trong việc khám và điều trị các bệnh lý về da. Bà từng tu nghiệp tại Pháp và Hàn Quốc, chuyên sâu về điều trị mụn, sẹo và thẩm mỹ da công nghệ cao.",
    experience: 15,  
    rating: 4.8,
    reviews: 1250,
    education: [
      { year: "1998 - 2004", title: "Bác sĩ đa khoa", place: "Đại học Y Dược TP.HCM" },
      { year: "2006 - 2008", title: "Thạc sĩ Da liễu", place: "Đại học Y Dược TP.HCM" },
      { year: "2015", title: "Tu nghiệp Thẩm mỹ da", place: "Seoul, Hàn Quốc" },
    ],
    workHistory: [
        { period: "2004 - 2010", role: "Bác sĩ điều trị", place: "Bệnh viện Quận 5" },
        { period: "2010 - 2018", role: "Phó khoa Da liễu", place: "Bệnh viện Da Liễu TP.HCM" },
        { period: "2018 - Nay", role: "Trưởng khoa Da liễu", place: "Bệnh viện Da Liễu TP.HCM" },
    ],
    certifications: [
        "Chứng chỉ hành nghề khám chữa bệnh Da liễu",
        "Chứng chỉ Ứng dụng Laser và Ánh sáng trong Da liễu",
        "Thành viên Hội Da liễu Việt Nam"
    ]
  });

  const handleSignOut = () => {
    console.log("Đã đăng xuất!");
    navigate('/');
  };

  const menuUserItems = [
    { key: '1', label: (<a onClick={() => navigate('/doctor/profile')}>Hồ sơ bác sĩ</a>), icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];


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
            <Descriptions.Item label="Họ và tên">{doctorInfo.name}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">Nữ</Descriptions.Item>
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
                <Form.Item label="Số điện thoại">
                    <Input prefix={<PhoneOutlined />} defaultValue={doctorInfo.phone} />
                </Form.Item>
            </Col>
            <Col span={12}>
                 <Form.Item label="Email">
                    <Input prefix={<MailOutlined />} defaultValue={doctorInfo.email} disabled />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item label="Địa chỉ phòng khám / Nơi làm việc">
                     <Input prefix={<EnvironmentOutlined />} defaultValue={doctorInfo.hospital} />
                </Form.Item>
            </Col>
            <Col span={24}>
                 <Form.Item label="Giới thiệu ngắn">
                     <Input.TextArea rows={4} defaultValue={doctorInfo.about} />
                </Form.Item>
            </Col>
        </Row>
        <Button type="primary" onClick={() => message.success("Cập nhật thông tin thành công!")}>
            Lưu thay đổi
        </Button>
    </Form>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/doctor/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={[]} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" },
            { key: "3", label: "Khám bệnh" },
          ]}
          onClick ={({ key }) => {
            switch (key) {
              case "1": navigate('/doctor/dashboard'); break;
              case "2": navigate('/doctor/appointments'); break;
              case "3": navigate('/doctor/consulting'); break;
              default: break;
            }
          }}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
        />
        <Dropdown menu={{ items: menuUserItems }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{doctorInfo.name}</span>
                <span style={{ fontSize: 12, color: '#888' }}>Khoa {doctorInfo.specialty}</span>
            </div>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          </div>
        </Dropdown>
      </Header>

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
                        <Button 
                            shape="circle" 
                            icon={<CameraOutlined />} 
                            size="small" 
                            style={{ position: 'absolute', bottom: 0, right: 0, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} 
                        />
                    </div>
                    
                    <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>{doctorInfo.name}</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>{doctorInfo.position}</Text>
                    
                    <div style={{ marginTop: 12 }}>
                        <Tag color="blue">{doctorInfo.specialty}</Tag>
                        <Tag color="purple">15 năm KN</Tag>
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

                    <Button type="primary" ghost icon={<EditOutlined />} block style={{ marginTop: 24 }}>
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
                            { label: 'Cài đặt tài khoản', key: '3', children: <SettingsTab /> },
                        ]}
                    />
                </Card>
            </Col>
         </Row>
      </Content>

      <Footer />
    </Layout>
  );
}