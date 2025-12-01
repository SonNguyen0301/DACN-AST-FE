// import { useState } from 'react';
// import { 
//   Layout, Menu, Avatar, Typography, Card, Button,
//   Space, Dropdown, Row, Col, Tag, Tabs 
// } from "antd";
// import { 
//   UserOutlined, 
//   LogoutOutlined,
//   SafetyOutlined,
//   BookOutlined,
//   ReadOutlined,
//   TeamOutlined,
//   LeftOutlined // Icon Quay lại
// } from "@ant-design/icons";
// import ChatBotIcon from "../../components/common/ChatBotIcon";
// import { useNavigate, useParams } from 'react-router-dom'; // <-- Thêm useParams
// import Footer from '../../components/common/Footer'; 

// const { Header, Content } = Layout;
// const { Title, Text, Paragraph } = Typography;
// const { TabPane } = Tabs;

// // DỮ LIỆU MẪU (Giống hệt file BookingPage, nhưng đã thêm chi tiết)
// // Trong app thật, bạn sẽ fetch (tải) cái này từ API
// const detailedDoctorsData = [
//   { 
//     id: 1, 
//     name: "BS Nguyễn Hồ Vĩnh Phước", 
//     title: "Bác sĩ",
//     rating: 5, 
//     isVerified: true, 
//     experienceYears: 20,
//     specialty: "Nam khoa", 
//     role: "Giám đốc",
//     workplace: "Phòng khám nam khoa và Y học giới tính TPHCM",
//     address: "Căn 7.33 Tòa nhà Charmington 181 Cao Thắng, Quận 10",
//     avatarUrl: "/doctor1.png",
//     // Thêm 3 mục chi tiết
//     introduction: "Bác sĩ Nguyễn Hồ Vĩnh Phước là chuyên gia hàng đầu về Nam khoa. Bác sĩ đã có 20 năm kinh nghiệm...",
//     education: [
//       "Tốt nghiệp Đại học Y khoa Phạm Ngọc Thạch (TTĐT & BDCBYT).",
//       "2001: Tốt nghiệp Chuyên Khoa 1 tại Đại học Y Dược TP.HCM.",
//       "Tốt nghiệp Chuyên Khoa 2 tại Đại học Y Khoa Phạm Ngọc Thạch."
//     ],
//     experience: [
//       "Bác sĩ chuyên khoa II Lê Thị Minh Hồng công tác tại bệnh viện Nhi Đồng 2.",
//       "Hiện là Phó Giám đốc Bệnh viện Nhi Đồng 2."
//     ]
//   },
//   // (Bạn tự thêm chi tiết cho các bác sĩ khác... id: 2, 3, 4...)
// ];

// // Dữ liệu mẫu cho ngày và giờ khám
// const slots_morning = ["08:00-08:15", "08:15-08:30", "08:30-08:45", "09:00-09:15", "09:15-09:30"];
// const slots_afternoon = ["14:00-14:15", "14:15-14:30", "14:30-14:45", "14:45-15:00", "15:00-15:15", "15:15-15:30"];
// const slots_evening = ["17:00-17:15", "17:15-17:30", "17:30-17:45", "17:45-18:00"];

// const bookingSchedule = [
//   { id: 1, day: "Th 6", date: "14-11", timeSlots: slots_evening }, // Có 4 khung giờ
//   { id: 2, day: "Th 7", date: "15-11", timeSlots: slots_morning }, // Có 5 khung giờ
//   { id: 3, day: "Th 2", date: "17-11", timeSlots: slots_afternoon }, // Có 6 khung giờ
//   { id: 4, day: "Th 3", date: "18-11", timeSlots: slots_evening }, // Lại 4 khung giờ
//   { id: 5, day: "Th 4", date: "19-11", timeSlots: slots_morning }, // Lại 5 khung giờ
//   { id: 6, day: "Th 5", date: "20-11", timeSlots: slots_afternoon }, // Lại 6 khung giờ
//   { id: 7, day: "Th 6", date: "21-11", timeSlots: slots_morning }, // Lại 5 khung giờ
// ];

// export default function DoctorProfilePage() {
//   const navigate = useNavigate();
//   const { id } = useParams(); // <-- Lấy ID của bác sĩ từ URL
//   const user = { name: "Nguyen Van A" }; 

//   const [selectedDateId, setSelectedDateId] = useState(bookingSchedule[0].id);
//   // 2. Lưu khung giờ đang được chọn (mặc định là chưa chọn)
//   const [selectedTime, setSelectedTime] = useState(null);

//   // Tìm đối tượng "ngày" đang được chọn
//   const selectedDate = bookingSchedule.find(d => d.id === selectedDateId);
//   // Lấy ra mảng timeSlots của *chỉ* ngày đó
//   const availableTimeSlots = selectedDate ? selectedDate.timeSlots : [];

//   // Tìm bác sĩ trong data (Trong app thật, đây là 1 API call)
//   const doctor = detailedDoctorsData.find(d => d.id === parseInt(id));

//   // (Các hàm Dropdown Menu cho Header)
//   const handleSignOut = () => { console.log("Đã đăng xuất!"); };
//   const menuItems = [
//     { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
//     { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
//   ];

//   // Nếu không tìm thấy bác sĩ (lỗi)
//   if (!doctor) {
//     return (
//       <Layout>
//         <Content style={{ padding: 50, textAlign: 'center' }}>
//           <Title level={3}>Không tìm thấy bác sĩ</Title>
//           <Button onClick={() => navigate('/patient/booking')}>Quay lại danh sách</Button>
//         </Content>
//       </Layout>
//     );
//   }

//   return (
//     <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
//       {/* HEADER (Giữ nguyên) */}
//       <Header
//         style={{
//           background: "#fff",
//           padding: "0 40px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
//         }}
//       >
//         <div 
//           style={{ fontWeight: "bold", fontSize: 22, color: "#1677ff", cursor: 'pointer' }}
//           onClick={() => navigate('/patient/dashboard')} 
//         >
//           ATS-Care
//         </div>
//         <Menu
//           mode="horizontal"
//           defaultSelectedKeys={['2']} 
//           items={[
//             { key: "1", label: "Thông tin cá nhân" },
//             { key: "2", label: "Đặt lịch khám" },
//             { key: "3", label: "Lịch khám của bản thân" },
//           ]}
//           style={{ flex: 1, justifyContent: "center", borderBottom: "none" }}
//           onClick={({ key }) => {
//             switch (key) {
//               case "1": navigate('/patient/personal'); break;
//               case "2": navigate('/patient/booking'); break;
//               case "3": navigate('/patient/appointments'); break;
//               default: break;
//             }
//           }}
//         />
//         <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
//             <span>{user.name}</span>
//             <Avatar size={36} icon={<UserOutlined />} />
//           </div>
//         </Dropdown>
//       </Header>

//       {/* CONTENT (NỘI DUNG TRANG CHI TIẾT) */}
//       <Content style={{ padding: "40px 60px " }}>

//         {/* Nút quay lại */}
//         <Button 
//           type="link" 
//           icon={<LeftOutlined />} 
//           style={{ padding: 0, marginBottom: 16 }}
//           onClick={() => navigate('/patient/booking')}
//         >
//           Quay lại danh sách
//         </Button>

//         {/* KHỐI 1: THÔNG TIN CƠ BẢN (Ảnh 1) */}
//         <Card style={{ borderRadius: 12 }}>
//           <Row gutter={24}>
//             <Col>
//               <Avatar size={120} src={doctor.avatarUrl} icon={<UserOutlined />} />
//             </Col>
//             <Col>
//               <Title level={3} style={{ margin: 0 }}>{doctor.name}</Title>
//               <Space style={{ marginTop: 8 }}>
//                 <Tag color="blue">{doctor.title}</Tag>
//                 {doctor.isVerified && <Tag color="green" icon={<SafetyOutlined />}>Đã xác minh</Tag>}
//                 <Text>{doctor.experienceYears} năm kinh nghiệm</Text>
//               </Space>
//               <div style={{ marginTop: 12 }}>
//                 <Text strong>Chuyên khoa:</Text> <Text>{doctor.specialty}</Text><br/>
//                 <Text strong>Chức vụ:</Text> <Text>{doctor.role}</Text><br/>
//                 <Text strong>Nơi công tác:</Text> <Text>{doctor.workplace}</Text>
//               </div>
//             </Col>
//           </Row>
//         </Card>

//         {/* KHỐI 2: ĐẶT KHÁM NHANH (ĐÃ NÂNG CẤP LOGIC) */}
//         <Card style={{ marginTop: 24, borderRadius: 12 }}>
//           <Title level={4} style={{ marginTop: 0 }}>Đặt khám nhanh</Title>
          
//           {/* Cuộn ngang chọn ngày (ĐÃ SỬA) */}
//           <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
//             {bookingSchedule.map((day) => ( // <-- Dùng data mới
//               <Button 
//                 key={day.id} 
//                 // Nút 'primary' (xanh) nếu ID của nó == ID đang được chọn
//                 type={day.id === selectedDateId ? 'primary' : 'text'} 
//                 style={{ minWidth: 120, marginRight: 8, textAlign: 'center' }}
//                 // Khi click: 1. Đặt lại ngày. 2. Xóa giờ đã chọn.
//                 onClick={() => {
//                   setSelectedDateId(day.id);
//                   setSelectedTime(null); 
//                 }}
//               >
//                 <Text strong style={{ color: day.id === selectedDateId ? '#fff' : 'inherit' }}>
//                   {day.day}, {day.date}
//                 </Text><br/>
//                 <Text style={{ color: day.id === selectedDateId ? '#fff' : 'inherit' }}>
//                   {day.timeSlots.length} khung giờ
//                 </Text>
//               </Button>
//             ))}
//           </div>
          
//           {/* Lưới chọn giờ (ĐÃ SỬA) */}
//           <Title level={5} style={{ marginTop: 16 }}>Buổi chiều</Title>
//           <Row gutter={[8, 8]}>
//             {/* "Vẽ" các khung giờ TÙY THEO ngày đã chọn */}
//             {availableTimeSlots.map(time => (
//                 <Col key={time}>
//                 <Button
//                   type={time === selectedTime ? 'primary' : 'default'}
//                   // ĐÃ "ĐỘ" LẠI:
//                   onClick={() => {
//                     setSelectedTime(time); // (Vẫn giữ lại để nó xanh lên)
//                     // Chuyển trang và "gửi kèm" dữ liệu
//                     navigate('/patient/book-confirm', { 
//                       state: { 
//                         doctor: doctor, // Gửi cả object bác sĩ
//                         selectedDate: selectedDate, // Gửi cả object ngày
//                         selectedTime: time, // Gửi giờ đã chọn
//                         bookingSchedule: bookingSchedule
//                       } 
//                     });
//                   }}
//                 >
//                   {time}
//                 </Button>
//               </Col>
//             ))}
//           </Row>
//         </Card>

//         {/* KHỐI 3: GIỚI THIỆU, ĐÀO TẠO, KINH NGHIỆM (Ảnh 2 & 3) */}
//         <Card style={{ marginTop: 24, borderRadius: 12 }}>
//           <Tabs defaultActiveKey="1">
//             <TabPane tab={<Space><BookOutlined /> Giới thiệu</Space>} key="1">
//               <Title level={5}>Giới thiệu</Title>
//               <Paragraph>{doctor.introduction}</Paragraph>
//               <Title level={5}>Các dịch vụ của phòng khám</Title>
//               <Paragraph>
//                 <ul>
//                   <li>Khám và điều trị các bệnh lý Nhi khoa: tiêu hóa, hô hấp, thận, nhiễm, dị ứng...</li>
//                   <li>Tư vấn Nhi khoa: sức khỏe, chích ngừa, dinh dưỡng...</li>
//                 </ul>
//               </Paragraph>
//             </TabPane>
//             <TabPane tab={<Space><ReadOutlined /> Quá trình đào tạo</Space>} key="2">
//               <Title level={5}>Quá trình đào tạo</Title>
//               <Paragraph>
//                 <ul>
//                   {doctor.education.map((edu, i) => <li key={i}>{edu}</li>)}
//                 </ul>
//               </Paragraph>
//             </TabPane>
//             <TabPane tab={<Space><TeamOutlined /> Kinh nghiệm</Space>} key="3">
//               <Title level={5}>Kinh nghiệm</Title>
//               <Paragraph>
//                 <ul>
//                   {doctor.experience.map((exp, i) => <li key={i}>{exp}</li>)}
//                 </ul>
//               </Paragraph>
//             </TabPane>
//           </Tabs>
//         </Card>

//       </Content>
      
//       <Footer /> 

//       {/* Chatbot AI cố định */}
//       <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
//         <ChatBotIcon />
//       </div>
//     </Layout>
//   );
// }



import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Card, Button,
  Space, Dropdown, Row, Col, Tag, Tabs, Input, Upload, message
} from "antd";
import { 
  UserOutlined, LogoutOutlined, SafetyOutlined,
  BookOutlined, ReadOutlined, TeamOutlined,
  LeftOutlined, InboxOutlined, SunOutlined, 
  CalendarOutlined, ClockCircleOutlined
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;

// --- DỮ LIỆU MẪU (MOCK DATA) ---
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
      "Tốt nghiệp Chuyên Khoa 2 tại Đại học Y Khoa Phạm Ngọc Thạch.",
      "Tốt nghiệp Chuyên Khoa 2 tại Đại học Y Khoa Phạm Ngọc Thạch.",
      "Tốt nghiệp Chuyên Khoa 2 tại Đại học Y Khoa Phạm Ngọc Thạch.",
      "Tốt nghiệp Chuyên Khoa 2 tại Đại học Y Khoa Phạm Ngọc Thạch."
    ],
    experience: [
      "Bác sĩ chuyên khoa II Lê Thị Minh Hồng công tác tại bệnh viện Nhi Đồng 2.",
      "Hiện là Phó Giám đốc Bệnh viện Nhi Đồng 2."
    ]
  },
];

const slots_morning = ["08:00-08:15", "08:15-08:30", "08:30-08:45", "09:00-09:15", "09:15-09:30"];
const slots_afternoon = ["14:00-14:15", "14:15-14:30", "14:30-14:45", "14:45-15:00", "15:00-15:15", "15:15-15:30"];
const slots_evening = ["17:00-17:15", "17:15-17:30", "17:30-17:45", "17:45-18:00"];

const bookingSchedule = [
  { id: 1, day: "Thứ 6", date: "14-11", timeSlots: slots_evening },
  { id: 2, day: "Thứ 7", date: "15-11", timeSlots: slots_morning },
  { id: 3, day: "Thứ 2", date: "17-11", timeSlots: slots_afternoon },
  { id: 4, day: "Thứ 3", date: "18-11", timeSlots: slots_evening },
  { id: 5, day: "Thứ 4", date: "19-11", timeSlots: slots_morning },
  { id: 6, day: "Thứ 5", date: "20-11", timeSlots: slots_afternoon },
  { id: 7, day: "Thứ 6", date: "21-11", timeSlots: slots_morning },
];

export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = { name: "Nguyen Van A" }; 

  // --- STATE QUẢN LÝ ---
  const [selectedDateId, setSelectedDateId] = useState(bookingSchedule[0].id);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState(""); // State cho ghi chú

  // Lấy data
  const selectedDate = bookingSchedule.find(d => d.id === selectedDateId);
  const availableTimeSlots = selectedDate ? selectedDate.timeSlots : [];
  const doctor = detailedDoctorsData.find(d => d.id === parseInt(id));

  // Xử lý sự kiện
  const handleSignOut = () => { console.log("Đã đăng xuất!"); };
  
  const handleConfirmBooking = () => {
    // Giả lập gửi API
    message.loading({ content: 'Đang xử lý đặt lịch...', key: 'booking' });
    setTimeout(() => {
      message.success({ content: 'Đặt lịch thành công!', key: 'booking', duration: 2 });
      // Chuyển hướng hoặc reset form tùy logic của bạn
      // navigate('/patient/appointments'); 
    }, 1500);
  };

  // Menu dropdown
  const menuItems = [
    { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
  ];

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76', 
    onChange(info) { console.log(info.file.status); },
  };

  if (!doctor) return <div style={{padding: 50, textAlign: 'center'}}>Không tìm thấy bác sĩ</div>;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* --- HEADER --- */}
      <Header
        style={{
          background: "#fff", padding: "0 40px", display: "flex", alignItems: "center",
          justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          position: 'sticky', top: 0, zIndex: 1000 // Sticky Header
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
          mode="horizontal" defaultSelectedKeys={['3']} 
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

      {/* --- CONTENT --- */}
      <Content style={{ padding: "24px 60px" }}>
        
        <Button type="link" icon={<LeftOutlined />} style={{ padding: 0, marginBottom: 16 }} onClick={() => navigate('/patient/booking')}>
          Quay lại danh sách
        </Button>

        {/* CARD THÔNG TIN BÁC SĨ (TOP) */}
<Card style={{ borderRadius: 12, marginBottom: 24 }}>
          {/* Phần trên: Avatar & Info cơ bản */}
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

          {/* Đường gạch ngang ngăn cách nhẹ */}
          <div style={{ borderTop: '1px solid #f0f0f0', margin: '24px 0 12px 0' }} />

          {/* Phần dưới: Tabs chi tiết (Đã dời từ dưới lên đây) */}
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

        {/* LAYOUT 2 CỘT: TRÁI (CHỌN LỊCH) - PHẢI (XÁC NHẬN) */}
        <Row gutter={24}>
          
          {/* --- CỘT TRÁI: LỊCH & INPUT --- */}
          <Col span={15}>
            <Card title={<Title level={4} style={{margin:0}}>1. Chọn Lịch Khám</Title>} style={{ borderRadius: 12, marginBottom: 24 }}>
              {/* Chọn ngày */}
              <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                {bookingSchedule.map((day) => (
                  <Button 
                    key={day.id} 
                    type={day.id === selectedDateId ? 'primary' : 'default'} 
                    style={{ minWidth: 110, height: 'auto', padding: '8px 0', marginRight: 8, textAlign: 'center', border: day.id === selectedDateId ? 'none' : '' }}
                    onClick={() => { setSelectedDateId(day.id); setSelectedTime(null); }}
                  >
                    <Text strong style={{ color: day.id === selectedDateId ? '#fff' : 'inherit', display: 'block' }}>{day.day}</Text>
                    <Text style={{ color: day.id === selectedDateId ? '#fff' : 'inherit' }}>{day.date}</Text>
                  </Button>
                ))}
              </div>

              {/* Chọn giờ */}
              {/* <Title level={5} style={{ marginTop: 0 }}><SunOutlined /> Buổi chiều</Title> */}
              <Row gutter={[12, 12]}>
                {availableTimeSlots.map(time => (
                  <Col key={time} span={6}> 
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
            </Card>

            {/* Form nhập thông tin thêm */}
            <Card title="2. Thông tin bổ sung (Tuỳ chọn)" style={{ borderRadius: 12, marginBottom: 24 }}>
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
                    <p className="ant-upload-hint">PNG, JPG tối đa 15MB</p>
                  </Dragger>
               </div>
            </Card>
          </Col>

          {/* --- CỘT PHẢI: THÔNG TIN ĐẶT (STICKY) --- */}
          <Col span={9}>
            <Card 
              title={<Title level={5} style={{margin: 0, color: '#1677ff'}}>Phiếu đặt khám</Title>}
              style={{ borderRadius: 12, position: 'sticky', top: 80, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} // <-- STICKY HERE
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                
                {/* Tóm tắt bác sĩ */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                   <Avatar size={48} src={doctor.avatarUrl} />
                   <div>
                      <Text strong>{doctor.name}</Text><br/>
                      <Text type="secondary" style={{fontSize: 12}}>{doctor.address}</Text>
                   </div>
                </div>

                {/* Thông tin thời gian */}
                <div>
                  <Row justify="space-between" style={{ marginBottom: 8 }}>
                    <Text type="primary"><CalendarOutlined /> Ngày khám:</Text>
                    <Text strong>{selectedDate.date}-2025 ({selectedDate.day})</Text> 
                  </Row>
                  <Row justify="space-between" align="middle">
                    <Text type="primary"><ClockCircleOutlined /> Khung giờ:</Text>
                    {selectedTime ? (
                      <Tag color="blue" style={{ margin: 0, fontSize: 14, padding: '4px 8px' }}>{selectedTime}</Tag>
                    ) : (
                      <Text type="danger">Chưa chọn</Text>
                    )}
                  </Row>
                </div>

                {/* Nút xác nhận */}
                <Button 
                  type="primary" 
                  block 
                  size="large"
                  disabled={!selectedTime} 
                  onClick={handleConfirmBooking}
                  style={{ height: 48, fontWeight: 'bold', fontSize: 16 }}
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