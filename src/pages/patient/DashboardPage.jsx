// import { 
//   Layout, 
//   Menu, 
//   Avatar, 
//   Typography, 
//   Row, 
//   Col, 
//   Card, 
//   Tag, 
//   Space, 
//   Carousel ,
//   Dropdown
// } from "antd";
// import { 
//   CalendarOutlined, 
//   UserOutlined, 
//   ClockCircleOutlined, 
//   EnvironmentOutlined, 
//   MedicineBoxOutlined, 
//   HomeOutlined,
//   ArrowRightOutlined,
//   LogoutOutlined
// } from "@ant-design/icons";
// import ChatBotIcon from "../../components/common/ChatBotIcon";
// import { useNavigate } from "react-router-dom";
// import Footer from "../../components/common/Footer";

// const { Header, Content } = Layout;
// const { Paragraph, Text } = Typography;

// export default function PatientDashboardPage() {
//   const navigate = useNavigate();
//   const user = { name: "Nguyen Van A" };

// const topDoctorsData = [
//     { 
//       id: 1,
//       name: "BS. CK2 Lê Thị Minh Hồng", 
//       specialty: "Nhi khoa", 
//       hospital: "Bệnh viện Nhi Đồng 2",
//       avatarUrl: "/doctor1.png" 
//     },
//     { 
//       id: 2,
//       name: "PGS. TS. BS Lâm Việt Trung", 
//       specialty: "Tiêu hóa - Ngoại tiết niệu", 
//       hospital: "Bệnh viện Chợ Rẫy",
//       avatarUrl: "/doctor2.png"
//     },
//     { 
//       id: 3,
//       name: "BS. CK2 Nguyễn Thị Thu Hà", 
//       specialty: "Nhi khoa", 
//       hospital: "Bệnh viện Nhi Đồng Thành phố",
//       avatarUrl: "/doctor3.png"
//     },
//     { 
//       id: 4,
//       name: "BS. CK2 Võ Đức Hiếu", 
//       specialty: "Ung bướu", 
//       hospital: "Bệnh viện Ung Bướu TP. HCM",
//       avatarUrl: "/doctor4.png"
//     },
//     // Thêm 1 bác sĩ nữa để có thể cuộn
//     { 
//       id: 5,
//       name: "BS. CK1 Nguyễn Văn A", 
//       specialty: "Da liễu", 
//       hospital: "Bệnh viện Da liễu",
//       avatarUrl: "/doctor5.png"
//     },
//         { 
//       id: 6,
//       name: "BS. CK1 Nguyễn Văn A", 
//       specialty: "Da liễu", 
//       hospital: "Bệnh viện Da liễu",
//       avatarUrl: "/doctor5.png"
//     },
//         { 
//       id: 7,
//       name: "BS. CK1 Nguyễn Văn A", 
//       specialty: "Da liễu", 
//       hospital: "Bệnh viện Da liễu",
//       avatarUrl: "/doctor5.png"
//     },
//         { 
//       id: 8,
//       name: "BS. CK1 Nguyễn Văn A", 
//       specialty: "Da liễu", 
//       hospital: "Bệnh viện Da liễu",
//       avatarUrl: "/doctor5.png"
//     },
//         { 
//       id: 9,
//       name: "BS. CK1 Nguyễn Văn A", 
//       specialty: "Da liễu", 
//       hospital: "Bệnh viện Da liễu",
//       avatarUrl: "/doctor5.png"
//     },
//   ];

//   // Mảng 3 câu text cho Carousel
//   const hospitalIntroSlides = [
//     "ATS-Care là nền tảng y tế thông minh giúp bệnh nhân dễ dàng đặt lịch, theo dõi sức khỏe và nhận chẩn đoán da liễu từ AI.",
//     "Mục tiêu của chúng tôi là mang đến trải nghiệm chăm sóc sức khỏe hiệu quả, tiện lợi và an toàn.",
//     "Với đội ngũ y bác sĩ hàng đầu và công nghệ hiện đại, ATS-Care luôn đồng hành cùng sức khỏe của bạn.",
//   ];
  
// const specialtiesData = [
//     { id: 1, name: "Nhi khoa", imageUrl: "/nhikhoa.png" },
//     { id: 2, name: "Sản phụ khoa", imageUrl: "/sanphukhoa.png" },
//     { id: 3, name: "Da liễu", imageUrl: "/dalieu.png" },
//     { id: 4, name: "Tiêu hóa", imageUrl: "/tieuhoa.png" },
//     { id: 5, name: "Cơ xương khớp", imageUrl: "/coxuongkhop.png" },
//     { id: 6, name: "Hô hấp", imageUrl: "/hohap.png" },
//     { id: 7, name: "Nhãn khoa", imageUrl: "/nhankhoa.png" },
//     { id: 8, name: "Tai - mũi - họng", imageUrl: "/taimuihong.png" },
//     { id: 9, name: "Tim mạch", imageUrl: "/timmach.png" },
//     { id: 10, name: "Lão khoa", imageUrl: "/laokhoa.png" },
//   ];
//   const handleSignOut = () => {
//       // Tạm thời log ra console
//       console.log("Đã đăng xuất!");
//       navigate('/');
//     };
//     const menuItems = [
//     {
//       key: '1',
//       label: (
//         <a onClick={() => navigate('/patient/personal')}>
//           Thông tin cá nhân
//         </a>
//       ),
//       icon: <UserOutlined />,
//     },
//     {
//       key: '2',
//       label: (
//         <a onClick={handleSignOut}>
//           Đăng xuất
//         </a>
//       ),
//       icon: <LogoutOutlined />,
//       danger: true, // <-- Tự động bôi đỏ cho nó "nguy hiểm"
//     }
//   ];
//   return (
//     <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
//       {/* HEADER */}
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
//           defaultSelectedKeys={[]} 
//           items={[
//             { key: "1", label: "Trang chủ" },
//             { key: "2", label: "Thông tin cá nhân" },
//             { key: "3", label: "Đặt lịch khám" },
//             { key: "4", label: "Lịch khám của bản thân" },
//           ]}
//           style={{ flex: 1, justifyContent: "center", borderBottom: "none" }}
//           onClick={({ key }) => {
//             switch (key) {
//               case "1": navigate('/patient/dashboard'); break;
//               case "2": navigate('/patient/personal'); break;
//               case "3": navigate('/patient/booking'); break;
//               case "4": navigate('/patient/appointments'); break;
//               default: break;
//             }
//           }}
//         />
        
//         {/* ĐÃ SỬA: Bọc user info bằng Dropdown */}
//         <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
//             <span>{user.name}</span>
//             <Avatar size={36} icon={<UserOutlined />} />
//           </div>
//         </Dropdown>

//       </Header>

//       {/* CONTENT */}
//       <Content style={{ padding: "40px 60px" }}>
        
//        {/* HÀNG 1 (ĐÃ SỬA CHIỀU CAO VÀ BUTTON) */}
//         <Row gutter={[24, 24]} style={{ display: 'flex' }}>
          
//           {/* Cột trái: Lịch hẹn */}
//           <Col xs={24} md={8}>
//             <Card
//               variant="borderless" 
//               style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }} // <-- Thêm height: 100%
//               // Style cho body để đẩy button xuống đáy
//               styles={{ 
//                 body: { 
//                   height: '100%', 
//                   display: 'flex', 
//                   flexDirection: 'column', 
//                   justifyContent: 'space-between' 
//                 } 
//               }}
//             >
//               {/* Nhóm nội dung phía trên lại */}
//               <div>
//                 <Paragraph style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Lịch hẹn sắp tới</Paragraph> 
//                 <Space direction="vertical" size={12} style={{ width: '100%' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                     <CalendarOutlined style={{ fontSize: 18, color: '#1677ff' }} />
//                     <Text>Ngày: <Text strong>20/11/2025</Text></Text>
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                     <ClockCircleOutlined style={{ fontSize: 18, color: '#1677ff' }} />
//                     <Text>Thời gian: <Text strong>09:30</Text></Text>
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                     <MedicineBoxOutlined style={{ fontSize: 18, color: '#1677ff' }} />
//                     <Text>Bác sĩ: <Text strong>Trần Thị Hoa</Text></Text>
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                     <EnvironmentOutlined style={{ fontSize: 18, color: '#1677ff' }} />
//                     <Text>Chuyên khoa: <Tag color="blue" style={{ marginLeft: 4 }}>Da liễu</Tag></Text>
//                   </div>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                     <HomeOutlined style={{ fontSize: 18, color: '#1677ff' }} />
//                      <Text>Tại phòng: <Text strong>205</Text></Text>
//                   </div>
//                 </Space>
//               </div>
//             </Card>
//           </Col>

//           {/* Cột phải: Giới thiệu */}
//           <Col xs={24} md={16}>
//             <Card
//               variant="borderless" 
//               styles={{ body: { padding: 0 } }} 
//               style={{
//                 borderRadius: 12,
//                 boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//                 overflow: 'hidden', 
//                 height: '100%' // <-- Thêm height: 100%
//               }}
//             >
//               <Carousel autoplay autoplaySpeed={5000} dotPosition="bottom">
//                 {hospitalIntroSlides.map((slide, index) => (
//                   <div key={index}> 
//                     <div 
//                       style={{
//                         height: 250, // Cứ giữ 250px làm chiều cao chuẩn
//                         position: 'relative',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         backgroundImage: `url(/hospital.png)`, 
//                         backgroundSize: 'cover',
//                         backgroundPosition: 'center',
//                       }}
//                     >
//                       {/* Lớp phủ Overlay */}
//                       <div style={{
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         width: '100%',
//                         height: '100%',
//                         backgroundColor: 'rgba(0, 0, 0, 0.4)',
//                         zIndex: 1,
//                       }}></div>
//                       {/* Nội dung text */}
//                       <Paragraph style={{
//                         position: 'relative',
//                         zIndex: 2, 
//                         color: '#fff',
//                         fontSize: 18,
//                         textAlign: 'center',
//                         margin: 0,
//                         padding: '0 40px',
//                         textShadow: '0 1px 3px rgba(0,0,0,0.6)',
//                       }}>
//                         {slide}
//                       </Paragraph>
//                     </div>
//                   </div>
//                 ))}
//               </Carousel>
//             </Card>
//           </Col>
//         </Row> 

//       <Card
//         title={
//           <Typography.Title 
//             level={3}
//             style={{ 
//               margin: 0, 
//               textAlign: 'center' 
//             }}
//           >
//             Các bác sĩ hàng đầu của chúng tôi
//           </Typography.Title>
//         }
//         // headStyle={{ ... }} // Không cần nữa, để mặc định là đẹp
//         style={{ marginTop: 40, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
//         variant="borderless" 
//       >
//         <div style={{
//           display: 'flex',
//           flexDirection: 'row',
//           overflowX: 'auto',
//           paddingBottom: 20,
//         }}>
          
//           {topDoctorsData.map((doctor) => (
//             <Card
//               key={doctor.id}
//               style={{
//                 minWidth: 260, 
//                 marginRight: 16,
//                 borderRadius: 16,
//                 boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
//                 overflow: 'hidden'
//               }}
//               styles={{ body: { padding: '20px 16px' } }}
//             >
//               {/* Khối thông tin */}
//               <Space 
//                 direction="vertical" 
//                 align="center" 
//                 style={{ 
//                   width: '100%', 
//                   marginBottom: 16,
//                   paddingBottom: 16,
//                   borderBottom: '1px solid #f0f0f0'
//                 }}
//               >
//                 <Avatar size={100} src={doctor.avatarUrl || <UserOutlined />} />
//                 <Typography.Title level={5} style={{ margin: '12px 0 0 0', textAlign: 'center', minHeight: 48 }}>
//                   {doctor.name}
//                 </Typography.Title>
//                 <Typography.Text type="secondary" style={{ textAlign: 'center' }}>{doctor.specialty}</Typography.Text>
//                 <Typography.Text style={{ textAlign: 'center', minHeight: 40, fontStyle: 'italic' }}>{doctor.hospital}</Typography.Text>
//               </Space>
              
//               {/* Nút đặt lịch (ĐÃ THAY BẰNG DIV) */}
//               <div 
//                 role="button"
//                 tabIndex={0}
//                 style={{ 
//                   fontWeight: 500,
//                   paddingLeft: 8,
//                   paddingRight: 8,
//                   display: 'flex',
//                   flexDirection: 'row', // Quay lại bình thường
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   backgroundColor: 'transparent',
//                   cursor: 'pointer', // Cho cảm giác là nút
//                   color: 'inherit',   // Màu chữ mặc định
//                   outline: 'none',    // TẮT VIỀN XANH KHI TAB
//                 }}
//                 // Khi rê chuột VÀO
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.color = '#1677ff';
//                 }}
//                 // Khi rê chuột RA
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.color = 'inherit';
//                 }}
//                 // Khi CLICK/TAB VÀO (Focus)
//                 onFocus={(e) => {
//                   e.currentTarget.style.color = '#1677ff'; // Chỉ đổi màu chữ
//                   e.currentTarget.style.outline = 'none';  // Tắt viền xanh
//                 }}
//                 // Khi CLICK RA NGOÀI (Blur)
//                 onBlur={(e) => {
//                   e.currentTarget.style.color = 'inherit'; // Trả về màu cũ
//                   e.currentTarget.style.outline = 'none';  // Tắt viền xanh
//                 }}
//                 onClick={() => navigate(`/patient/booking/${doctor.id}`)}
//               >
//                 <span>Đặt lịch khám</span>
//                 <ArrowRightOutlined />
//               </div>
//             </Card>
//           ))}
//         </div>
//       </Card>

//       <div 
//         style={{ 
//           marginTop: 40, 
//           textAlign: 'center', 
//           background: '#fff', 
//           padding: '10px 10px 20px',
//           borderRadius: 12 
//         }}
//       >
//         {/* Tiêu đề */}
//         <Typography.Title level={2} style={{ marginBottom: 8 }}>
//           Đa dạng chuyên khoa khám
//         </Typography.Title>
//         <Typography.Text type="secondary" style={{ fontSize: 16 }}>
//           Đặt khám dễ dàng và tiện lợi hơn với đầy đủ các chuyên khoa
//         </Typography.Text>

//         {/* Lưới 5 cột */}
//         <Row gutter={[24, 32]} style={{ marginTop: 40 }}>
//           {specialtiesData.map((sp) => (
//             // ĐÃ SỬA: md={4} (6 cột) đổi thành md={{ flex: '20%' }} (5 cột)
//             <Col xs={8} md={{ flex: '20%' }} key={sp.id}> 
//               <div 
//                 style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
//                 // Hiệu ứng "nảy" lên khi hover
//                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
//                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
//               >
//                 <img 
//                   src={sp.imageUrl} 
//                   alt={sp.name} 
//                   style={{ 
//                     width: 80, 
//                     height: 80, 
//                     objectFit: 'cover', 
//                     borderRadius: '50%' 
//                   }} 
//                 />
//                 <Typography.Text style={{ marginTop: 12, display: 'block', fontWeight: 500 }}>
//                   {sp.name}
//                 </Typography.Text>
//               </div>
//             </Col>
//           ))}
//         </Row>
//       </div>
//       </Content>
//           < Footer />
//       {/* Chatbot icon fixed */}
//       <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
//         <ChatBotIcon />
//       </div>
//     </Layout>
//   );
// }

import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Tag, 
  Space, 
  Carousel,
  Dropdown,
  Button
} from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  MedicineBoxOutlined, 
  HomeOutlined,
  LogoutOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  RightOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer";

const { Header, Content } = Layout;
const { Paragraph, Text, Title } = Typography;

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const user = { name: "Nguyen Van A" };

  // Dữ liệu giới thiệu bệnh viện (Carousel)
  const hospitalIntroSlides = [
    "ATS-Care là nền tảng y tế thông minh giúp bệnh nhân dễ dàng đặt lịch, theo dõi sức khỏe và nhận chẩn đoán da liễu từ AI.",
    "Mục tiêu của chúng tôi là mang đến trải nghiệm chăm sóc sức khỏe hiệu quả, tiện lợi và an toàn.",
    "Với đội ngũ y bác sĩ hàng đầu và công nghệ hiện đại, ATS-Care luôn đồng hành cùng sức khỏe của bạn.",
  ];

  // --- DỮ LIỆU CÁC CHỨC NĂNG CHÍNH ---
const featureCards = [
    {
      key: 'personal',
      title: 'Hồ sơ sức khỏe cá nhân',
      description: 'Nơi lưu trữ tập trung toàn bộ thông tin y tế của bạn. Dễ dàng cập nhật và chia sẻ với bác sĩ khi cần thiết.',
      features: ['Thông tin hành chính & BHYT', 'Tiền sử bệnh lý & Dị ứng', 'Theo dõi chỉ số sức khỏe (BMI, Huyết áp)'],
      icon: <UserOutlined />,
      color: '#1677ff', // Xanh dương
      bg: '#e6f4ff',
      btnColor: 'primary',
      path: '/patient/personal'
    },
    {
      key: 'booking',
      title: 'Đặt lịch khám trực tuyến',
      description: 'Chủ động lựa chọn bác sĩ và thời gian khám phù hợp. Không còn cảnh xếp hàng chờ đợi mệt mỏi tại bệnh viện.',
      features: ['Tìm kiếm bác sĩ theo chuyên khoa', 'Xem lịch trống theo thời gian thực', 'Nhận phiếu khám điện tử ngay lập tức'],
      icon: <PlusCircleOutlined />,
      color: '#52c41a', // Xanh lá
      bg: '#f6ffed',
      btnColor: 'primary', // Hoặc đổi màu nếu muốn
      path: '/patient/booking'
    },
    {
      key: 'appointments',
      title: 'Quản lý lịch sử khám bệnh',
      description: 'Theo dõi lộ trình điều trị và xem lại kết quả khám bất cứ lúc nào. Hệ thống tự động nhắc nhở khi đến ngày tái khám.',
      features: ['Xem lại toa thuốc & Chẩn đoán', 'Nhắc nhở lịch hẹn sắp tới', 'Đánh giá chất lượng sau khi khám'],
      icon: <ScheduleOutlined />,
      color: '#722ed1', // Tím
      bg: '#f9f0ff',
      btnColor: 'primary',
      path: '/patient/appointments'
    }
  ];

  const handleSignOut = () => {
    console.log("Đã đăng xuất!");
    navigate('/');
  };

  const menuItems = [
    {
      key: '1',
      label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>),
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: (<a onClick={handleSignOut}>Đăng xuất</a>),
      icon: <LogoutOutlined />,
      danger: true,
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* HEADER */}
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

      {/* CONTENT */}
      <Content style={{ padding: "40px 60px" }}>
        
        {/* --- KHỐI 1: LỊCH SẮP TỚI & CAROUSEL (GIỮ NGUYÊN VÌ CÓ ÍCH) --- */}
        <Row gutter={[24, 24]} style={{ display: 'flex', marginBottom: 40 }}>
          {/* Cột trái: Lịch hẹn */}
          <Col xs={24} md={8}>
            <Card
              variant="borderless" 
              style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}
              styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
            >
              <div>
                <Paragraph style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Lịch hẹn sắp tới</Paragraph> 
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                    <Text>Ngày: <Text strong>20/11/2025</Text></Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ClockCircleOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                    <Text>Thời gian: <Text strong>09:30</Text></Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MedicineBoxOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                    <Text>Bác sĩ: <Text strong>Trần Thị Hoa</Text></Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <EnvironmentOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                    <Text>Chuyên khoa: <Tag color="blue" style={{ marginLeft: 4 }}>Da liễu</Tag></Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HomeOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                      <Text>Tại phòng: <Text strong>205</Text></Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>

          {/* Cột phải: Giới thiệu */}
          <Col xs={24} md={16}>
            <Card
              variant="borderless" 
              styles={{ body: { padding: 0 } }} 
              style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: 'hidden', height: '100%' }}
            >
              <Carousel autoplay autoplaySpeed={5000} dotPosition="bottom">
                {hospitalIntroSlides.map((slide, index) => (
                  <div key={index}> 
                    <div style={{ height: 250, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(/hospital.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1 }}></div>
                      <Paragraph style={{ position: 'relative', zIndex: 2, color: '#fff', fontSize: 18, textAlign: 'center', margin: 0, padding: '0 40px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                        {slide}
                      </Paragraph>
                    </div>
                  </div>
                ))}
              </Carousel>
            </Card>
          </Col>
        </Row> 

<div>
          <Title level={3} style={{ marginBottom: 24 }}>Tiện ích dành cho bạn</Title>
          
          <Row gutter={[24, 24]}>
            {featureCards.map((feature) => (
              <Col xs={24} md={8} key={feature.key}>
                <Card
                  hoverable
                  variant="borderless"
                  style={{ borderRadius: 16, height: '100%', boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  onClick={() => navigate(feature.path)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Icon */}
                    <div style={{ 
                      width: 60, height: 60, 
                      background: feature.bg, 
                      borderRadius: 16, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, color: feature.color,
                      marginBottom: 20
                    }}>
                      {feature.icon}
                    </div>
                    
                    {/* Nội dung */}
                    <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>{feature.title}</Title>
                    <Paragraph type="secondary" style={{ marginBottom: 24, flex: 1 }}>
                      {feature.description}
                    </Paragraph>
                    
                    {/* Link giả */}
                    <div style={{ color: '#1677ff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                      Truy cập ngay <RightOutlined style={{ fontSize: 12 }} />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Content>
      
      <Footer />
      
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>
    </Layout>
  );
}