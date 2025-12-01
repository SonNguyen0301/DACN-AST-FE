import { useState } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Card, Button, Row, Col,Image
,  Space, Select, Modal, Form, Input, DatePicker, Dropdown ,Descriptions,Tag, Pagination
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
  SmileOutlined, // (Cho Giới tính)
  WalletOutlined, // (Cho Nghề nghiệp)
  TeamOutlined, // (Cho Dân tộc)
  LeftOutlined,
  FileImageOutlined
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const { Header, Content, Sider } = Layout;
const { Title, Text, Link } = Typography;

// Dữ liệu mẫu (giữ nguyên)
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // Số lượng hiển thị trên 1 trang

  // 2. TÍNH TOÁN DỮ LIỆU CHO TRANG HIỆN TẠI
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAppointments = appointmentsData.slice(startIndex, endIndex);

  const navigate = useNavigate();
  const user = { 
    name: "Nguyen Van A", 
    email: "nguyenvana@gmail.com", 
    dob: "01/01/1990",
    phone: "0909 123 456",
    bhyt: "DN 4 79 123 456789",
    identifyNumber: "0791 23 004567",
    gender: "Nam",
    occupation: "Kỹ sư phần mềm",
    ethnicity: "Kinh",
    address: {
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      specific: "123 Đường Nguyễn Huệ"
    }
  };
  const fullAddress = `${user.address.specific}, ${user.address.ward}, ${user.address.district}, ${user.address.province}`;
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

const showModal = () => {
    const dobDate = user.dob ? dayjs(user.dob, 'DD/MM/YYYY') : null;
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: dobDate,
      bhyt: user.bhyt,
      identifyNumber: user.identifyNumber,
      gender: user.gender,
      occupation: user.occupation,
      ethnicity: user.ethnicity,
      // "Phá" địa chỉ ra
      province: user.address.province,
      district: user.address.district,
      ward: user.address.ward,
      specificAddress: user.address.specific,
    });
    setIsModalOpen(true);
  };

  const handleOk = () => {
    console.log("Form values:", form.getFieldsValue());
    setIsModalOpen(false);
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
    console.log("Đã đăng xuất!");
    navigate('/');
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
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* HEADER */}
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
            <span style={{ fontSize: 16, fontWeight: 500, color: '#555' }}>{user.name}</span>
            <Avatar size={36} icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "40px 60px" }}>
        <Layout>
          <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <Avatar size={120} icon={<UserOutlined />} />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: 8,
                marginTop: 16 
              }}>
                <Title level={4} style={{ margin: 0 }}>{user.name}</Title>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={showModal}
                  size="large"
                />
              </div>
            </div>
            
            <div style={{ padding: '0 24px' }}>
              {renderInfoItem(<MailOutlined />, "Email", user.email)}
              {renderInfoItem(<PhoneOutlined />, "Số điện thoại", user.phone)}
              {renderInfoItem(<ScheduleOutlined />, "Ngày sinh", user.dob)}
              {renderInfoItem(<SmileOutlined />, "Giới tính", user.gender)}
              {renderInfoItem(<WalletOutlined />, "Nghề nghiệp", user.occupation)}
              {renderInfoItem(<TeamOutlined />, "Dân tộc", user.ethnicity)}
              {renderInfoItem(<IdcardOutlined />, "Mã BHYT", user.bhyt)}
              {renderInfoItem(<UserOutlined />, "CCCD", user.identifyNumber)}
              {renderInfoItem(<HomeOutlined />, "Địa chỉ", fullAddress)}
            </div>
          </Sider>

          <Content style={{ padding: "30px 40px", position: 'relative' }}>
            
            {/* --- BẮT ĐẦU LOGIC "LẬT" TRANG --- */}
            {selectedAppointmentId === null ? (
              
              // --- CHẾ ĐỘ 1: XEM DANH SÁCH (LIST VIEW) ---
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

                    {/* Sắp xếp */}
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

                {/* --- DANH SÁCH CARD (ĐÃ CẮT THEO TRANG) --- */}
                <Space direction="vertical" style={{ width: '100%',minHeight: 650 }} size="large">
                  {/* Sử dụng currentAppointments thay vì appointmentsData */}
                  {currentAppointments.map(apt => (
                    <Card 
                      key={apt.id} 
                      hoverable
                      variant="borderless" 
                      style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: 'all 0.3s' }}
                    >
                    <Row gutter={24} align="middle">
                        {/* CỘT 1: THÔNG TIN BÁC SĨ + THỜI GIAN + PHÒNG (Chiếm 40% - Tăng lên để chứa đủ info) */}
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
                        {/* CỘT 2: CHỈ CÒN CHẨN ĐOÁN SƠ BỘ (Chiếm 40%) */}
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
                        {/* CỘT 3: NÚT ACTION (Chiếm 20%) */}
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

                {/* --- THANH PHÂN TRANG (MỚI THÊM) --- */}
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                  {/* Nhớ import { Pagination } from 'antd' ở trên cùng */}
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={appointmentsData.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false} // Ẩn nút chọn số lượng/trang cho gọn
                  />
                </div>
              </>

            ) : (

              // --- CHẾ ĐỘ 2: XEM CHI TIẾT (DETAIL VIEW) ---
              <>
                {/* 7. NÚT QUAY LẠI */}
                <Button 
                  type="link" 
                  icon={<LeftOutlined />} 
                  style={{ padding: 0, marginBottom: 16 }}
                  onClick={() => setSelectedAppointmentId(null)} // <-- Reset state
                >
                  Quay lại danh sách
                </Button>

                {/* 8. BẢNG CHI TIẾT */}
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
                    
                    {/* Bạn có thể thêm dữ liệu thật vào đây sau */}
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
                      {/* Phần lời khuyên của bạn từ trước, rất hợp lý */}
                      <Text type="primary">Kiêng gà, trứng, tránh làm ẩm vết thương, nên tái khám 19/11/2025</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tệp đính kèm">
                      <Image.PreviewGroup>
                        <Space size="middle">
                          <Image
                            width={200} // Kích thước ảnh thu nhỏ
                            src="/vet_thuong.png" // Đường dẫn file trong public
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
            {/* --- KẾT THÚC LOGIC "LẬT" TRANG --- */}

          </Content>
        </Layout>
      </Content>

      <Modal 
        title="Hồ sơ cá nhân" 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={800} 
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          {/* Hàng 1: Tên, Ngày sinh */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
               <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}>
                 <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
               </Form.Item>
            </Col>
          </Row>

          {/* Hàng 2: Email, Điện thoại */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 3: Giới tính, Nghề nghiệp */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="occupation" label="Nghề nghiệp">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 4: Dân tộc, CCCD, BHYT */}
          <Row gutter={16}>
             <Col span={8}>
              <Form.Item name="ethnicity" label="Dân tộc">
                <Input />
              </Form.Item>
            </Col>
             <Col span={8}>
              <Form.Item name="identifyNumber" label="Số CCCD" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bhyt" label="Mã BHYT" >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          {/* Hàng 5: Địa chỉ (đã phá) */}
          <Title level={5} style={{ marginTop: 8 }}>Địa chỉ thường trú</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="province" label="Tỉnh/Thành phố">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="district" label="Quận/Huyện">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ward" label="Phường/Xã">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="specificAddress" label="Địa chỉ cụ thể (Số nhà, tên đường...)">
                <Input />
              </Form.Item>
            </Col>
          </Row>

        </Form>
      </Modal>
      <Footer /> 
      {/* Chatbot AI cố định */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>
    </Layout>
  );
}