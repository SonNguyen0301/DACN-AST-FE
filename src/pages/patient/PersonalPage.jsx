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
import { getUserInfoAPI, updateUserInfoAPI, getHistoryConsultationsAPI, getConsultationDetailAPI } from '../../services/userService';
dayjs.extend(customParseFormat);
const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const genderDisplayMap = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác"
};


export default function PersonalPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form] = Form.useForm();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [consultations, setConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; 

  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userData?.id) {
        fetchUserConsulations();
    }
  }, [userData?.id, currentPage]);

  useEffect(() => {
      if (userData && location.state?.openEditModal) {
        showModal(userData);  
        navigate(location.pathname, { replace: true, state: {} });
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

  const fetchUserConsulations = async () => {
    setLoadingConsultations(true);
    try {
      const res = await getHistoryConsultationsAPI(userData.id, { 
          page: currentPage, 
          take: pageSize,
          sortDirection: 'DESC' 
      });
      if (res.data?.success) {
        setConsultations(res.data.data.data || []);
        setTotalConsultations(res.data.data.meta?.itemCount || 0);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử tư vấn:", error);
      message.error("Không thể tải danh sách hồ sơ khám bệnh.");
    } finally {
        setLoadingConsultations(false);
    }
  };

  const handleViewDetail = async (id) => {
      setSelectedConsultation(id);
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
                <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => showModal(userData)} size="middle" />
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
            
            {selectedConsultation === null ? (
              
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

                <Spin spinning={loadingConsultations}>
                <Space direction="vertical" style={{ width: '100%',minHeight: 650 }} size="large">
                  {consultations.length === 0 && !loadingConsultations ? (
                        <div style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>Chưa có hồ sơ khám bệnh nào.</div>
                    ) : (
                        consultations.map(apt => (
                            <Card 
                            key={apt.id} 
                            hoverable
                            variant="borderless" 
                            style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: 'all 0.3s', border: '1px solid #f0f0f0' }}
                            >
                            <Row gutter={24} align="middle">
                                <Col xs={24} md={10}>
                                    <Space align="start">
                                    <Avatar size={64} icon={<UserOutlined />} />
                                    <div>
                                        <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{apt.doctorName}</Text>
                                        <div style={{ marginBottom: 6, marginTop: 6 }}><Tag color="blue" >{apt.department}</Tag></div>

                                        <Space direction="vertical" size={0}>
                                        <Space size="small" split={<Text type="secondary">|</Text>}>
                                            <Text type="secondary" style={{ fontSize: 14 }}><CalendarOutlined /> {dayjs(apt.date).format('DD/MM/YYYY')}</Text>
                                            <Text type="secondary" style={{ fontSize: 14 }}><ScheduleOutlined /> {apt.from?.substring(0,5)} - {apt.to?.substring(0,5)}</Text>
                                            <Text type="secondary" style={{ fontSize: 14 }}><HomeOutlined /> {apt.room}</Text>  
                                        </Space>
                                        </Space>
                                    </div>
                                    </Space>
                                </Col>
                                <Col xs={24} md={10}>
                                    <div style={{ 
                                    background: '#f5f7fa', padding: '10px 16px', borderRadius: 8, 
                                    borderLeft: '4px solid #1677ff', height: '100%',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                    }}>
                                    <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>
                                        Chẩn đoán sơ bộ:
                                    </Text>
                                    <Text strong style={{ color: '#333', fontSize: 15 }}>
                                        {apt.diseases && apt.diseases.length > 0 ? apt.diseases.join(', ') : 'Chưa cập nhật'}
                                    </Text>
                                    </div>
                                </Col>
                                <Col xs={24} md={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button 
                                    type="primary" 
                                    shape="round"
                                    onClick={() => handleViewDetail(apt)}
                                    style={{ minWidth: 110 }}
                                    >
                                    Xem chi tiết
                                    </Button>
                                </Col>
                            </Row>
                            </Card>
                        ))
                    )}
                </Space>

                {totalConsultations > 0 && (
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={totalConsultations}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false} 
                            />
                        </div>
                    )}
                </Spin>
              </>

            ) : (

              <>
                <Button 
                  type="link" 
                  icon={<LeftOutlined />} 
                  style={{ padding: 0, marginBottom: 16 }}
                  onClick={() => setSelectedConsultation(null)} 
                >
                  Quay lại danh sách
                </Button>
                <Spin spinning={loadingDetail}>
                {selectedConsultation && (
                        <Card variant="borderless" style={{ border: '1px solid #f0f0f0' }}>
                        <Title level={4} style={{marginTop: 0, marginBottom: 24}}>
                            Chi tiết hồ sơ khám bệnh
                        </Title>
                        <Descriptions bordered column={1} labelStyle={{ width: '30%', background: '#fafafa', fontWeight: 500 }}>
                            <Descriptions.Item label="Bác sĩ">
                            <Space>
                                <Avatar icon={<UserOutlined />} />
                                <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{selectedConsultation.doctorName}</Text>
                            </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Chuyên khoa">{selectedConsultation.department}</Descriptions.Item>
                            <Descriptions.Item label="Ngày khám">{dayjs(selectedConsultation.date).format('DD/MM/YYYY')}</Descriptions.Item>
                            <Descriptions.Item label="Giờ khám">{selectedConsultation.from?.substring(0,5)} - {selectedConsultation.to?.substring(0,5)}</Descriptions.Item>
                            <Descriptions.Item label="Phòng khám">{selectedConsultation.room}</Descriptions.Item>
                            
                            <Descriptions.Item label="Kết luận bác sĩ">
                            <Text strong>Chẩn đoán: {selectedConsultation.diseases?.join(', ') || 'Chưa cập nhật'}</Text>
                            <br />
                            <Text type="primary" style={{ whiteSpace: 'pre-wrap' }}>
                                Mô tả triệu chứng: {selectedConsultation.symptoms || 'Không có mô tả'}
                            </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Đơn thuốc">
                                <Text style={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedConsultation.prescription || 'Không có đơn thuốc'}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Lời khuyên">
                            <Text type="primary" style={{ whiteSpace: 'pre-wrap' }}>{selectedConsultation.advices || 'Không có lời khuyên'}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Tệp đính kèm">
                                {selectedConsultation.images && selectedConsultation.images.length > 0 ? (
                                    <Image.PreviewGroup>
                                        <Space size="middle" wrap>
                                            {selectedConsultation.images.map((img, idx) => (
                                                <Image
                                                    key={idx}
                                                    width={150} 
                                                    height={150}
                                                    src={img.base64} 
                                                    fallback="https://via.placeholder.com/150?text=L%E1%BB%97i"
                                                    style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }}
                                                />
                                            ))}
                                        </Space>
                                    </Image.PreviewGroup>
                                ) : (
                                    <Text type="secondary">Không có hình ảnh đính kèm</Text>
                                )}
                            </Descriptions.Item>
                        </Descriptions> 
                        </Card>
                    )}
                </Spin>
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
        // cancelButtonProps={{ style: { display: isForceUpdate ? 'none' : 'inline-block' } }} 
        // closable={!isForceUpdate} 
        // maskClosable={!isForceUpdate} 
        // keyboard={!isForceUpdate} 
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
                <Input readOnly style={{ background: '#f5f5f5', color: '#595959', cursor: 'not-allowed' }} />
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
              <Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ message: 'Vui lòng chọn ngày sinh!' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính" rules={[{  message: 'Vui lòng chọn giới tính!' }]}>
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
              <Form.Item name="citizenCode" label="Số CCCD/CMND" rules={[{  message: 'Vui lòng nhập số CCCD/CMND!' }]}>
                <Input placeholder="Nhập mã định danh" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="medicalInsurance" label="Mã BHYT" rules={[{  message: 'Vui lòng nhập mã BHYT!' }]}>
                <Input placeholder="Mã bảo hiểm y tế" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="folk" label="Dân tộc" rules={[{  message: 'Vui lòng nhập dân tộc!' }]}>
                <Input placeholder="Ví dụ: Kinh" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="address" label="Địa chỉ liên hệ" rules={[{  message: 'Vui lòng nhập địa chỉ liên hệ!' }]}>
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