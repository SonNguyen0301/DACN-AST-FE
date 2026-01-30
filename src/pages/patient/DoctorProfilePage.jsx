
import { useState } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Card, Button, Select,
  Space, Dropdown, Row, Col, Tag, Tabs, Input, Upload, message, Calendar, Empty, Divider 
} from "antd";
import { 
  UserOutlined, LogoutOutlined, SafetyOutlined,
  BookOutlined, ReadOutlined, TeamOutlined,
  LeftOutlined, InboxOutlined, SunOutlined, 
  CalendarOutlined, ClockCircleOutlined, CloudOutlined, MoonOutlined
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 
import dayjs from 'dayjs'; 

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;

const detailedDoctorsData = [
  { 
    id: 1, 
    name: "BS Nguyễn Hồ Vĩnh Phước", 
    title: "Bác sĩ",
    rating: 5, 
    isVerified: true, 
    experienceYears: 20,
    specialty: "Nam khoa", 
    role: "Giám đốc",
    workplace: "Phòng khám nam khoa và Y học giới tính TPHCM",
    address: "Căn 7.33 Tòa nhà Charmington 181 Cao Thắng, Quận 10",
    avatarUrl: "/doctor1.png",
    introduction: "Bác sĩ Nguyễn Hồ Vĩnh Phước là chuyên gia hàng đầu về Nam khoa. Bác sĩ đã có 20 năm kinh nghiệm...",
    education: [
      "Tốt nghiệp Đại học Y khoa Phạm Ngọc Thạch (TTĐT & BDCBYT).",
      "2001: Tốt nghiệp Chuyên Khoa 1 tại Đại học Y Dược TP.HCM.",
      "Tốt nghiệp Chuyên Khoa 2 tại Đại học Y Khoa Phạm Ngọc Thạch."
    ],
    experience: [
      "Bác sĩ chuyên khoa II Lê Thị Minh Hồng công tác tại bệnh viện Nhi Đồng 2.",
      "Hiện là Phó Giám đốc Bệnh viện Nhi Đồng 2."
    ]
  },
];

const slots_morning = ["07:00 - 07:30", "07:30 - 08:00", "08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00"];
const slots_afternoon = ["13:00 - 13:30", "13:30 - 14:00", "14:00 - 14:30", "14:30 - 15:00", "15:00 - 15:30", "15:30 - 16:00", "16:00 - 16:30", "16:30 - 17:00"];

const bookingSchedule = [
  { id: 1, day: "Thứ 6", date: "14-11-2025", timeSlots: [...slots_morning] },
  { id: 2, day: "Thứ 7", date: "15-11-2025", timeSlots: [...slots_morning, ...slots_afternoon] }, 
  { id: 3, day: "Thứ 2", date: "17-11-2025", timeSlots: slots_afternoon },
  { id: 4, day: "Thứ 3", date: "18-11-2025", timeSlots: slots_morning },
  { id: 5, day: "Thứ 4", date: "19-11-2025", timeSlots: slots_morning },
  { id: 6, day: "Thứ 5", date: "20-11-2025", timeSlots: slots_afternoon },
  { id: 7, day: "Thứ 6", date: "21-11-2025", timeSlots: slots_morning },
];

export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = { name: "Nguyen Van A" }; 

  const [selectedDateStr, setSelectedDateStr] = useState(bookingSchedule[0].date); 
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState("");

  const doctor = detailedDoctorsData.find(d => d.id === parseInt(id));

  const currentSchedule = bookingSchedule.find(d => d.date === selectedDateStr);
  
  const categorizeSlots = (slots) => {
    const morning = [];
    const afternoon = [];
    const evening = [];
    if (!slots) return { morning, afternoon, evening };

    slots.forEach(slot => {
      const startHour = parseInt(slot.split(':')[0]);
      if (startHour < 12) morning.push(slot);
      else if (startHour < 17) afternoon.push(slot);
      else evening.push(slot);
    });
    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = categorizeSlots(currentSchedule?.timeSlots);

  const onDateSelect = (value) => {
    const dateStr = value.format('DD-MM-YYYY');
    const hasSchedule = bookingSchedule.some(d => d.date === dateStr);
    if (hasSchedule) {
      setSelectedDateStr(dateStr);
      setSelectedTime(null); 
    } else {
      message.info("Bác sĩ không có lịch khám vào ngày này.");
    }
  };

  const disabledDate = (current) => {
    const dateStr = current.format('DD-MM-YYYY');
    return !bookingSchedule.some(d => d.date === dateStr);
  };

  const handleSignOut = () => { console.log("Đã đăng xuất!"); };
  
  const handleConfirmBooking = () => {
    message.loading({ content: 'Đang xử lý đặt lịch...', key: 'booking' });
    setTimeout(() => {
      message.success({ content: 'Đặt lịch thành công!', key: 'booking', duration: 2 });
    }, 1500);
  };

  const menuItems = [
    { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
  ];

  const uploadProps = {
    name: 'file', multiple: true, action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76', 
  };

  // Helper render danh sách giờ
  const renderSlotSection = (title, icon, slots) => {
    if (!slots || slots.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{icon} {title}</Text>
        <Row gutter={[8, 8]}>
          {slots.map(time => (
            <Col key={time} span={6} md={8} lg={6}> 
              <Button
                block
                size="large"
                type={time === selectedTime ? 'primary' : 'default'}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </Button>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  if (!doctor) return <div style={{padding: 50, textAlign: 'center'}}>Không tìm thấy bác sĩ</div>;

  const defaultCalendarDate = dayjs("2025-11-14"); 

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)",position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
                    <img 
            src="/ASTCare1.png" 
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </div>

        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']} 
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

      <Content style={{ padding: "24px 60px" }}>
        
        <Button type="link" icon={<LeftOutlined />} style={{ padding: 0, marginBottom: 16 }} onClick={() => navigate('/patient/booking')}>
          Quay lại danh sách
        </Button>

        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
          <Row gutter={24}>
            <Col flex="120px">
              <Avatar size={120} src={doctor.avatarUrl} icon={<UserOutlined />} />
            </Col>
            <Col flex="auto">
              <Title level={3} style={{ margin: 0 }}>{doctor.name}</Title>
              <Space style={{ marginTop: 8 }}>
                <Tag color="blue">{doctor.title}</Tag>
                {doctor.isVerified && <Tag color="green" icon={<SafetyOutlined />}>Đã xác minh</Tag>}
                <Text>{doctor.experienceYears} năm kinh nghiệm</Text>
              </Space>
              <div style={{ marginTop: 12 }}>
                <Text strong>Chuyên khoa:</Text> <Text>{doctor.specialty}</Text> <br/>
                <Text strong>Nơi công tác:</Text> <Text>{doctor.workplace}</Text>
              </div>
            </Col>
          </Row>
          <div style={{ borderTop: '1px solid #f0f0f0', margin: '24px 0 12px 0' }} />
          <Tabs defaultActiveKey="1">
            <TabPane tab={<Space><BookOutlined /> Giới thiệu</Space>} key="1">
              <Paragraph style={{ maxWidth: 800 }}>{doctor.introduction}</Paragraph>
            </TabPane>
            <TabPane tab={<Space><ReadOutlined /> Đào tạo</Space>} key="2">
              <ul>{doctor.education.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </TabPane>
            <TabPane tab={<Space><TeamOutlined /> Kinh nghiệm</Space>} key="3">
              <ul>{doctor.experience.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </TabPane>
          </Tabs>
        </Card>

        <Row gutter={24}>
          
          <Col span={17}>
            <Card title={<Title level={4} style={{margin:0}}>1. Chọn lịch khám</Title>} style={{ borderRadius: 12, marginBottom: 24 }}>
              
              <Row gutter={24}>
                <Col span={12} style={{ borderRight: '1px solid #f0f0f0' }}>
                   <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 4 }}>
                    <Calendar 
                      fullscreen={false} 
                      defaultValue={defaultCalendarDate}
                      disabledDate={disabledDate}
                      onSelect={onDateSelect}
                      headerRender={({ value, onChange }) => {
                        const start = 0;
                        const end = 12;
                        const monthOptions = [];

                        for (let i = start; i < end; i++) {
                          monthOptions.push(
                            <Select.Option key={i} value={i}>
                              Tháng {i + 1}
                            </Select.Option>,
                          );
                        }

                        const year = value.year();
                        const month = value.month();
                        const yearOptions = [];
                        
                        for (let i = year - 1; i < year + 3; i++) {
                          yearOptions.push(
                            <Select.Option key={i} value={i}>
                              {i}
                            </Select.Option>,
                          );
                        }

                        return (
                          <div style={{ padding: 8, display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
                            <Select
                              size="small"
                              dropdownMatchSelectWidth={false}
                              value={month}
                              onChange={(newMonth) => {
                                const now = value.clone().month(newMonth);
                                onChange(now);
                              }}
                            >
                              {monthOptions}
                            </Select>

                            <Select
                              size="small"
                              dropdownMatchSelectWidth={false}
                              value={year}
                              onChange={(newYear) => {
                                const now = value.clone().year(newYear);
                                onChange(now);
                              }}
                            >
                              {yearOptions}
                            </Select>
                          </div>
                        );
                      }}
                    />
                   </div>
                </Col>

                <Col span={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 16 }}>
                       Lịch khám ngày: <span style={{ color: '#1677ff' }}>{selectedDateStr}</span>
                    </Text>
                  </div>

                  {currentSchedule ? (
                    <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
                      {renderSlotSection("Buổi Sáng", <SunOutlined style={{ color: '#faad14' }}/>, morning)}
                      {morning.length > 0 && (afternoon.length > 0 || evening.length > 0) && <Divider style={{ margin: '12px 0' }} />}
                      
                      {renderSlotSection("Buổi Chiều", <CloudOutlined style={{ color: '#1890ff' }}/>, afternoon)}
                      {afternoon.length > 0 && evening.length > 0 && <Divider style={{ margin: '12px 0' }} />}

                      {renderSlotSection("Buổi Tối", <MoonOutlined style={{ color: '#722ed1' }}/>, evening)}
                    </div>
                  ) : (
                    <Empty description="Vui lòng chọn ngày có lịch khám trên lịch" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Col>
              </Row>

            </Card>

            <Card title={<Title level={4} style={{margin:0}}>2. Thông tin bổ sung</Title>} style={{ borderRadius: 12, marginBottom: 24 }}>
               <div style={{ marginBottom: 16 }}>
                  <Text strong>Ghi chú cho bác sĩ:</Text>
                  <TextArea 
                    rows={3} 
                    placeholder="Mô tả triệu chứng, thuốc đang dùng..." 
                    style={{ marginTop: 8 }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
               </div>
               <div>
                  <Text strong>Tệp đính kèm (0/5):</Text>
                  <Dragger {...uploadProps} style={{ marginTop: 8, background: '#fafafa' }}>
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">Chọn tệp tin hoặc kéo thả vào đây</p>
                  </Dragger>
               </div>
            </Card>
          </Col>

          <Col span={7}>
            <Card 
              title={<Title level={4} style={{margin: 0, color: '#1677ff'}}>Phiếu đặt khám</Title>}
              style={{ borderRadius: 12, position: 'sticky', top: 80, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                   <Avatar size={48} src={doctor.avatarUrl} />
                   <div>
                      <Text strong>{doctor.name}</Text><br/>
                      <Text type="secondary" style={{fontSize: 12}}>{doctor.workplace}</Text>
                   </div>
                </div>

                <div>
                  <Row justify="space-between" style={{ marginBottom: 8 }}>
                    <Text type="secondary"><CalendarOutlined /> Ngày khám:</Text>
                    {currentSchedule ? (
                      <Text strong>{currentSchedule.date}-2025 ({currentSchedule.day})</Text> 
                    ) : <Text type="danger">Chưa chọn</Text>}
                  </Row>
                  <Row justify="space-between" align="middle">
                    <Text type="secondary"><ClockCircleOutlined /> Khung giờ:</Text>
                    {selectedTime ? (
                      <Tag color="blue" style={{ margin: 0, fontSize: 14, padding: '4px 8px' }}>{selectedTime}</Tag>
                    ) : (
                      <Text type="danger">Chưa chọn</Text>
                    )}
                  </Row>
                </div>

                <Button 
                  type="primary" 
                  block 
                  size="large"
                  disabled={!selectedTime || !currentSchedule} 
                  onClick={handleConfirmBooking}
                  style={{ height: 48, fontWeight: 'bold', fontSize: 16, marginTop: 8 }}
                >
                  XÁC NHẬN ĐẶT KHÁM
                </Button>
                
                <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
                  Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
                </Text>
              </Space>
            </Card>
          </Col>

        </Row>
      </Content>
      
      <Footer /> 

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>
    </Layout>
  );
}



