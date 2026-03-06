import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Card, Button, Row, Col,Image
,  Space, Select, Modal, Form, Input, DatePicker, Dropdown ,Descriptions,Tag, Pagination,message,Spin
} from "antd";
import { 
  UserOutlined, 
  EditOutlined, 
  CalendarOutlined,
  PhoneOutlined, 
  MailOutlined, 
  HomeOutlined, 
  IdcardOutlined, 
  ScheduleOutlined,
  LogoutOutlined ,
  SmileOutlined, 
  TeamOutlined, 
  LeftOutlined,
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getUserInfoAPI, updateUserInfoAPI } from '../../services/userService';
dayjs.extend(customParseFormat);
const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const genderDisplayMap = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác"
};

const appointmentsData = [
  { id: 1, date: "12/11/2025", type: "Khám Da liễu", doctor: "BS. Phạm Anh Dũng ", timeSlot: "18:30 - 19:00", room: "Phòng 203" , avatarUrl: "/doctor1.png", diagnosis: "Viêm da cơ địa dị ứng,"},
  { id: 2, date: "15/08/2025", type: "Khám Tổng quát", doctor: "BS. Trần Thị Hoa", timeSlot: "09:00 - 09:30", room: "Phòng 101", avatarUrl: "/doctor2.png" , diagnosis: "Sức khỏe bình thường"},
  { id: 3, date: "01/03/2025", type: "Khám Tim mạch", doctor: "BS. Lê Minh Tuấn", timeSlot: "14:00 - 14:30", room: "Phòng 305", avatarUrl: "/doctor3.png" , diagnosis: "Rối loạn nhịp tim nhẹ"},
  { id: 4, date: "20/02/2025", type: "Nhi khoa", doctor: "BS. Nguyễn Văn A", timeSlot: "08:00 - 08:30", room: "Phòng 402", avatarUrl: "/doctor4.png", diagnosis: "Sốt siêu vi" }, 
  { id: 5, date: "01/03/2025", type: "Khám Tim mạch", doctor: "BS. Lê Minh Tuấn", timeSlot: "14:00 - 14:30", room: "Phòng 305", avatarUrl: "/doctor4.png" , diagnosis: "Tăng huyết áp"},
  { id: 6, date: "01/03/2025", type: "Khám Tim mạch", doctor: "BS. Lê Minh Tuấn", timeSlot: "14:00 - 14:30", room: "Phòng 305", avatarUrl: "/doctor5.png" , diagnosis: "Thiếu máu cơ tim"},
  { id: 7, date: "01/03/2025", type: "Khám Tim mạch", doctor: "BS. Lê Minh Tuấn", timeSlot: "14:00 - 14:30", room: "Phòng 305", avatarUrl: "/doctor3.png" , diagnosis: "Hở van tim nhẹ"},
  { id: 8, date: "01/03/2025", type: "Khám Tim mạch", doctor: "BS. Lê Minh Tuấn", timeSlot: "14:00 - 14:30", room: "Phòng 305" , avatarUrl: "/doctor2.png", diagnosis: "Theo dõi sau điều trị"},
  { id: 9, date: "01/03/2025", type: "Khám Tim mạch", doctor: "BS. Lê Minh Tuấn", timeSlot: "14:00 - 14:30", room: "Phòng 305" , avatarUrl: "/doctor4.png", diagnosis: "Kiểm tra định kỳ"},
  { id: 10, date: "05/04/2025", type: "Răng Hàm Mặt", doctor: "BS. Hoàng Thị C", timeSlot: "10:00 - 10:30", room: "Phòng 105" , avatarUrl: "/doctor1.png", diagnosis: "Viêm nướu"},
];


export default function PersonalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isForceUpdate, setIsForceUpdate] = useState(false);

  const [form] = Form.useForm();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; 

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAppointments = appointmentsData.slice(startIndex, endIndex);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  
  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
      if (userData && location.state?.openEditModal) {
        setIsForceUpdate(true);
        showModal(userData);  
        window.history.replaceState({}, document.title);
      }
  }, [userData, location.state]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await getUserInfoAPI();
      if (res.data?.success) {
        setUserData(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin:", error);
      message.error("Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (dataToEdit = userData) => {
    if (!dataToEdit) return;

    const dobDate = dataToEdit.dateOfBirth ? dayjs(dataToEdit.dateOfBirth, 'YYYY-MM-DD') : null;
    
    form.setFieldsValue({
      firstName: dataToEdit.firstName,
      lastName: dataToEdit.lastName,
      email: dataToEdit.email,
      phoneCode: dataToEdit.phoneCode || '+84',
      phoneNumber: dataToEdit.phoneNumber,
      dateOfBirth: dobDate,
      gender: dataToEdit.gender,
      folk: dataToEdit.folk,
      citizenCode: dataToEdit.citizenCode,
      medicalInsurance: dataToEdit.medicalInsurance,
      address: dataToEdit.address,
    });
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setUpdating(true);

      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        phoneCode: values.phoneCode,
        phoneNumber: values.phoneNumber,
        avatarUrl: userData.avatarUrl, 
        isOnBoardingCompleted: true,
        folk: values.folk,
        citizenCode: values.citizenCode,
        medicalInsurance: values.medicalInsurance,
        address: values.address
      };

      const res = await updateUserInfoAPI(payload);
      
      if (res.data?.success) {
        message.success("Cập nhật hồ sơ thành công!");
        fetchUserProfile();
        setIsModalOpen(false);
        setIsForceUpdate(false);
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      message.error(error.response?.data?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setUpdating(false);
    }
  };


  const handleCancel = () => {
    setIsModalOpen(false);
    setIsForceUpdate(false);
  };

  
  const renderInfoItem = (icon, label, value) => (
    <div style={{ marginBottom: 12 }}>
      <Space align="start">
        {icon}
        <div>
          <Text strong>{label}</Text><br />
          <Text type="secondary">{value}</Text>
        </div>
      </Space>
    </div>
  );

  const handleSignOut = () => {
      localStorage.removeItem('accessToken');
      message.success("Đã đăng xuất!");
      navigate('/login');
    };
  const menuItems = [
    {
      key: '1',
      label: (
        <a onClick={() => navigate('/patient/personal')}>
          Thông tin cá nhân
        </a>
      ),
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: (
        <a onClick={handleSignOut}>
          Đăng xuất
        </a>
      ),
      icon: <LogoutOutlined />,
      danger: true,
    }
  ];
  const selectedAppointment = appointmentsData.find(
      (apt) => apt.id === selectedAppointmentId
    );
  
  if (loading) {
      return (
          <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f7fa' }}>
              <Spin size="large" tip="Đang tải hồ sơ..." />
          </div>
      );
  }

  if (!userData) return null;

  const fullName = `${userData.firstName || ''} ${userData.lastName || ''} `.trim();
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          position: 'sticky', top: 0, zIndex: 1000
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
          <img 
            src="/ASTCare1.png" 
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['2']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Thông tin cá nhân" },
            { key: "3", label: "Đặt lịch khám" },
            { key: "4", label: "Lịch khám của bản thân" },
          ]}
          style={{ fontSize: 16, fontWeight: 500, color: '#555' }}
          onClick={({ key }) => {
            switch (key) {
              case "1": navigate('/patient/dashboard'); break;
              case "2": navigate('/patient/personal'); break;
              case "3": navigate('/patient/booking'); break;
              case "4": navigate('/patient/appointments'); break;
              default: break;
            }
          }}
        />
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#555' }}>{fullName}</span>
            <Avatar size={36} icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "40px 60px" }}>
        <Layout>
          <Sider width={320} theme="light" style={{ borderRight: '1px solid #f0f0f0', padding: '20px 0' }}>
            <div style={{ padding: '0 24px 24px 24px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}>
              <Avatar size={100} src={userData.avatarUrl} icon={<UserOutlined />} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
                <Title level={4} style={{ margin: 0 }}>{fullName}</Title>
                <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={showModal} size="middle" />
              </div>
              <Tag color="blue" style={{ marginTop: 8 }}>{userData.role}</Tag>
            </div>
            
            <div style={{ padding: '0 30px' }}>
              {renderInfoItem(<ScheduleOutlined />, "Ngày sinh", userData.dateOfBirth ? dayjs(userData.dateOfBirth).format('DD/MM/YYYY') : null)}
              {renderInfoItem(<SmileOutlined />, "Giới tính", genderDisplayMap[userData.gender])}
              {renderInfoItem(<PhoneOutlined />, "Số điện thoại", userData.phoneNumber ? `${userData.phoneCode} ${userData.phoneNumber}` : null)}
              {renderInfoItem(<MailOutlined />, "Email", userData.email)}
              {renderInfoItem(<UserOutlined />, "CCCD/CMND", userData.citizenCode)}
              {renderInfoItem(<IdcardOutlined />, "Mã BHYT", userData.medicalInsurance)}
              {renderInfoItem(<TeamOutlined />, "Dân tộc", userData.folk)}
              {renderInfoItem(<HomeOutlined />, "Địa chỉ", userData.address)}
            </div>
          </Sider>

          <Content style={{ padding: "30px 40px", position: 'relative' }}>
            
            {selectedAppointmentId === null ? (
              
              <>
                <div style={{ 
                  marginBottom: 24, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: 16 
                }}>
                  <Title level={3} style={{ margin: 0, color: '#1677ff', whiteSpace: 'nowrap' }}>
                     Hồ sơ khám bệnh
                  </Title>
                  
                  <Space wrap size="small">
                    <DatePicker.RangePicker 
                        placeholder={['Từ ngày', 'Đến ngày']}
                        style={{ width: 240 }}
                    />

                    <Select
                        placeholder="Chuyên khoa"
                        style={{ width: 180 }}
                        options={[
                            { value: 'all', label: 'Tất cả chuyên khoa' },
                            { value: 'cardiology', label: 'Tim mạch' },
                            { value: 'dermatology', label: 'Da liễu' },
                        ]}
                        allowClear
                    />

                    <Select
                        defaultValue="newest"
                        style={{ width: 160 }}
                        options={[
                            { value: 'newest', label: 'Mới nhất trước' },
                            { value: 'oldest', label: 'Cũ nhất trước' },
                        ]}
                    />
                  </Space>
                </div>

                <Space direction="vertical" style={{ width: '100%',minHeight: 650 }} size="large">
                  {currentAppointments.map(apt => (
                    <Card 
                      key={apt.id} 
                      hoverable
                      variant="borderless" 
                      style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: 'all 0.3s' }}
                    >
                    <Row gutter={24} align="middle">
                        <Col xs={24} md={10}>
                          <Space align="start">
                            <Avatar size={64} src={apt.avatarUrl} icon={<UserOutlined />} />
                            <div>
                              <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{apt.doctor}</Text>
                              <div style={{ marginBottom: 6, marginTop: 6 }}><Tag color="blue" >{apt.type}</Tag></div>

                              <Space direction="vertical" size={0}>
                                <Space size="small" split={<Text type="secondary">|</Text>}>
                                    <Text type="secondary" style={{ fontSize: 14 }}><CalendarOutlined /> {apt.date}</Text>
                                    <Text type="secondary" style={{ fontSize: 14 }}><ScheduleOutlined /> {apt.timeSlot}</Text>
                                    <Text type="secondary" style={{ fontSize: 14 }}><HomeOutlined /> {apt.room}</Text>  
                                </Space>
                              </Space>
                            </div>
                          </Space>
                        </Col>
                        <Col xs={24} md={10}>
                             <div style={{ 
                                background: '#f5f7fa', 
                                padding: '10px 16px', 
                                borderRadius: 8, 
                                borderLeft: '4px solid #1677ff',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                             }}>
                                <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>
                                    Chẩn đoán sơ bộ:
                                </Text>
                                <Text strong style={{ color: '#333', fontSize: 15 }}>
                                    {apt.diagnosis}
                                </Text>
                             </div>
                        </Col>
                        <Col xs={24} md={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            type="primary" 
                            shape="round"
                            onClick={() => setSelectedAppointmentId(apt.id)}
                            style={{ minWidth: 110 }}
                          >
                            Xem chi tiết
                          </Button>
                        </Col>

                      </Row>
                    </Card>
                  ))}
                </Space>

                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={appointmentsData.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false} 
                  />
                </div>
              </>

            ) : (

              <>
                <Button 
                  type="link" 
                  icon={<LeftOutlined />} 
                  style={{ padding: 0, marginBottom: 16 }}
                  onClick={() => setSelectedAppointmentId(null)} 
                >
                  Quay lại danh sách
                </Button>

                <Card>
                  <Title level={4} style={{marginTop: 0, marginBottom: 24}}>
                    Chi tiết hồ sơ khám bệnh
                  </Title>
                  <Descriptions bordered column={1} labelStyle={{ width: '30%' }}>
                    <Descriptions.Item label="Bác sĩ">
                      <Space>
                        <Avatar src={selectedAppointment.avatarUrl} icon={<UserOutlined />} />
                        <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{selectedAppointment.doctor}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Chuyên khoa">{selectedAppointment.type}</Descriptions.Item>
                    <Descriptions.Item label="Ngày khám">{selectedAppointment.date}</Descriptions.Item>
                    <Descriptions.Item label="Giờ khám">{selectedAppointment.timeSlot}</Descriptions.Item>
                    <Descriptions.Item label="Phòng khám">{selectedAppointment.room}</Descriptions.Item>
                    
                    <Descriptions.Item label="Kết luận bác sĩ">
                      <Text strong>Chẩn đoán: Rách da cẳng tay phải (S51.8).</Text>
                      <br />
                      <Text type="primary">
                        Mô tả: Vết thương hở dài khoảng 4cm do tai nạn sinh hoạt.
                        <br />
                        Xử lý: Đã làm sạch, gây tê tại chỗ và khâu 5 mũi (chỉ không tiêu). Vết khâu khô, mép lành.
                      </Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Đơn thuốc">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Text>1. Zinnat 500mg (Kháng sinh): <Text type="primary">Sáng 1 viên, Tối 1 viên (Sau ăn)</Text></Text>
                        <Text>2. Alpha Choay (Kháng viêm): <Text type="primary">Sáng 2 viên, Tối 2 viên (Ngậm)</Text></Text>
                        <Text>3. Paracetamol 500mg (Giảm đau): <Text type="primary">Uống 1 viên khi đau (cách 4-6h)</Text></Text>
                        <Text>4. Povidine 10% (Sát khuẩn): <Text type="primary">Rửa vết thương ngày 1 lần</Text></Text>
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Lời khuyên">
                      <Text type="primary">Kiêng gà, trứng, tránh làm ẩm vết thương, nên tái khám 19/11/2025</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tệp đính kèm">
                      <Image.PreviewGroup>
                        <Space size="middle">
                          <Image
                            width={200} 
                            src="/vet_thuong.png" 
                          />
                          <Image
                            width={200}
                            src="/vet_thuong.png"
                          />
                        </Space>
                      </Image.PreviewGroup>
                    </Descriptions.Item>
                  </Descriptions> 
                </Card>
              </>
            )}

          </Content>
        </Layout>
      </Content>

      <Modal 
        title={<Title level={4}>Cập nhật hồ sơ cá nhân</Title>} 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={handleCancel}
        confirmLoading={updating}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        cancelButtonProps={{ style: { display: isForceUpdate ? 'none' : 'inline-block' } }} 
        closable={!isForceUpdate} 
        maskClosable={!isForceUpdate} 
        keyboard={!isForceUpdate} 
        width={800} 
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="lastName" label="Họ" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}>
                <Input placeholder="Nguyễn Văn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="firstName" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input placeholder="A" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" tooltip="Email dùng để đăng nhập, không thể thay đổi.">
                <Input disabled style={{ background: '#f5f5f5', color: '#888' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item label="Số điện thoại" required>
                    <Input.Group compact style={{ display: 'flex' }}>
                        <Form.Item name="phoneCode" noStyle>
                            <Select style={{ width: '30%' }}>
                                <Option value="+84">+84</Option>
                                <Option value="+1">+1</Option>
                                <Option value="+44">+44</Option>
                                <Option value="+81">+81</Option>
                                <Option value="+82">+82</Option>
                                <Option value="+86">+86</Option>
                                <Option value="+65">+65</Option>
                                <Option value="+66">+66</Option>
                                <Option value="+61">+61</Option>
                                <Option value="+49">+49</Option>
                                <Option value="+33">+33</Option>
                                <Option value="+855">+855</Option>
                                <Option value="+856">+856</Option>
                                <Option value="+886">+886</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="phoneNumber" noStyle rules={[{ required: true, message: 'Nhập số điện thoại!' }]}>
                            <Input style={{ width: '70%' }} placeholder="Nhập SĐT" />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                <Select placeholder="Chọn giới tính">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="citizenCode" label="Số CCCD/CMND" rules={[{ required: true, message: 'Vui lòng nhập số CCCD/CMND!' }]}>
                <Input placeholder="Nhập mã định danh" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="medicalInsurance" label="Mã BHYT" rules={[{ required: true, message: 'Vui lòng nhập mã BHYT!' }]}>
                <Input placeholder="Mã bảo hiểm y tế" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="folk" label="Dân tộc" rules={[{ required: true, message: 'Vui lòng nhập dân tộc!' }]}>
                <Input placeholder="Ví dụ: Kinh" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="address" label="Địa chỉ liên hệ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ liên hệ!' }]}>
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ đầy đủ (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)" />
          </Form.Item>

        </Form>
      </Modal>
      
      <Footer /> 

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>
    </Layout>
  );
}