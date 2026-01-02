// import { useState } from 'react';
// import { 
//   Layout, Menu, Avatar, Typography, Card, Button,
//   Space, List, Dropdown, Tabs, Tag, Popconfirm ,
//   Modal, Form, Input, Upload
// } from "antd";
// import { 
//   UserOutlined, 
//   LogoutOutlined,
//   CalendarOutlined,
//   PhoneOutlined, 
//   MailOutlined, 
//   HomeOutlined, 
//   IdcardOutlined, 
//   ScheduleOutlined,
//   EditOutlined, 
//   DeleteOutlined ,
//   InboxOutlined
// } from "@ant-design/icons";
// import ChatBotIcon from "../../components/common/ChatBotIcon";
// import { useNavigate } from 'react-router-dom';
// import Footer from '../../components/common/Footer'; 

// const { Header, Content } = Layout;
// const { Title, Text } = Typography;
// const { TabPane } = Tabs;
// const { TextArea } = Input; 
// const { Dragger } = Upload; 

// // DỮ LIỆU MẪU (Giữ nguyên)

// const upcomingAppointments = [
//   { 
//     id: 10, 
//     date: "25/12/2025", 
//     type: "Khám Răng Hàm Mặt", 
//     doctor: "Dr. Hoang Thi C", 
//     timeSlot: "10:00 - 10:30", 
//     room: "Phòng 401", 
//     avatarUrl: "/doctor1.png", 
//     status: "chưa khám",
//     notes: "Tôi bị ê buốt răng" // Dữ liệu mẫu
//   }
// ];
// const pastAppointments = [
//   { id: 1, date: "12/11/2025", type: "Khám Da liễu", doctor: "Dr. Tran Thi Hoa", timeSlot: "18:30 - 19:00", room: "Phòng 203" , avatarUrl: "/doctor1.png", status: "đã khám"},
//   { id: 2, date: "15/08/2025", type: "Khám Tổng quát", doctor: "Dr. Pham Anh Dung", timeSlot: "09:00 - 09:30", room: "Phòng 101", avatarUrl: "/doctor2.png", status: "đã khám" },
//   { id: 3, date: "01/03/2025", type: "Khám Tim mạch", doctor: "Dr. Le Minh Tuan", timeSlot: "14:00 - 14:30", room: "Phòng 305", avatarUrl: "/doctor3.png", status: "đã hủy" },
//   { id: 5, date: "01/03/2025", type: "Khám Tim mạch", doctor: "Dr. Le Minh Tuan", timeSlot: "14:00 - 14:30", room: "Phòng 305", avatarUrl: "/doctor4.png", status: "đã trễ" },
// ];


// export default function AppointmentPage() {
//   const navigate = useNavigate();
//   const user = { name: "Nguyen Van A" }; 

//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editingAppointment, setEditingAppointment] = useState(null); // Lưu lịch hẹn đang sửa
//   const [form] = Form.useForm();

//   const handleSignOut = () => {
//     console.log("Đã đăng xuất!");
//     navigate('/');
//   };
//   const menuItems = [
//     { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
//     { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
//   ];

//   // HÀM "Vẽ" tag (Giữ nguyên)
// const renderStatusTag = (status) => {
//       // Style chung cho tất cả các tag
//       const tagStyle = {
//         fontSize: '14px', // Tăng kích thước chữ
//         padding: '5px 10px', // Tăng khoảng đệm
//         borderRadius: '6px', // Bo góc mềm mại hơn
//         fontWeight: 'bold', // In đậm chữ
//       };

//       switch (status) {
//         case 'chưa khám':
//           return <Tag color="blue" style={tagStyle}>Chưa khám</Tag>;
//         case 'đã khám':
//           return <Tag color="green" style={tagStyle}>Đã khám</Tag>;
//         case 'đã hủy':
//           return <Tag color="red" style={tagStyle}>Đã hủy</Tag>;
//         case 'đã trễ':
//           return <Tag color="orange" style={tagStyle}>Đã trễ</Tag>;
//         default:
//           return <Tag style={tagStyle}>{status}</Tag>;
//       }
//     };
//     const showEditModal = (apt) => {
//         setEditingAppointment(apt); // "Nhớ" cái đang sửa
//         form.setFieldsValue({
//         notes: apt.notes || "", // "Nạp" ghi chú cũ vào form
//         files: [], // (Phần file upload bạn tự xử lý logic nạp file cũ nhé)
//         });
//         setIsEditModalOpen(true);
//     };

//     const handleEditOk = () => {
//         console.log("Đã lưu thay đổi cho:", editingAppointment.id);
//         console.log("Dữ liệu mới:", form.getFieldsValue());
//         // (Bạn sẽ gọi API update ở đây)
//         setIsEditModalOpen(false);
//         setEditingAppointment(null);
//     };
//     const handleEditCancel = () => {
//         setIsEditModalOpen(false);
//         setEditingAppointment(null);
//     };
//     const uploadProps = {
//         name: 'file',
//         multiple: true,
//         action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76', 
//         maxCount: 5,
//         onChange(info) {
//         console.log(info.file.status);
//         },
//     };

//   // HÀM "Vẽ" nút (ĐÃ "ĐỘ" LẠI LOGIC)
//   const renderActionButtons = (apt, isUpcomingTab = false) => {
//     if (isUpcomingTab && apt.status === 'chưa khám') {
//       return (
//         <Space direction="vertical" align="end">
//           <Button 
//             type="primary" 
//             icon={<EditOutlined />} 
//             onClick={() => showEditModal(apt)} // <-- 8. NỐI LOGIC VÀO ĐÂY
//           >
//             Chỉnh sửa
//           </Button>
//           <Popconfirm
//             title="Hủy lịch hẹn?"
//             description="Bạn có chắc muốn hủy lịch hẹn này?"
//             onConfirm={() => console.log("Đã hủy lịch", apt.id)}
//             okText="Đồng ý"
//             cancelText="Không"
//           >
//             <Button danger icon={<DeleteOutlined />}>
//               Hủy lịch
//             </Button>
//           </Popconfirm>
//         </Space>
//       );
//     }
    
//     if (!isUpcomingTab) {
//       return renderStatusTag(apt.status);
//     }
//     return null;
//   };

//   const renderAppointmentList = (data, isUpcomingTab = false) => {
//     if (data.length === 0) {
//       return (
//         <div style={{ textAlign: 'center', padding: '40px 0' }}>
//           <CalendarOutlined style={{ fontSize: 48, color: '#ccc' }} />
//           <Text block type="secondary" style={{ marginTop: 16 }}>
//             Không có lịch hẹn nào.
//           </Text>
//         </div>
//       );
//     }
    
//     return (
//       <Space direction="vertical" style={{ width: '100%' }} size="large">
//         {data.map(apt => (
//           <Card 
//             key={apt.id} 
//             variant="borderless" 
//             style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
//           >
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <Space align="start" size="middle">
//                 <Avatar size={96} src={apt.avatarUrl} icon={<UserOutlined />} />
//                 <Space direction="vertical" size="small">
                  
//                   {/* DÒNG 1: Tên (ĐÃ XÓA STATUS TAG) */}
//                   <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{apt.doctor}</Text>
                  
//                   {/* DÒNG 2: Chuyên khoa */}
//                   <Text type="secondary" style={{ fontStyle: 'italic' }}>{apt.type}</Text>
                  
//                   {/* DÒNG 3: Ngày/Giờ/Phòng */}
//                   <Space size="middle">
//                     <Text type="primary"><CalendarOutlined /> {apt.date}</Text>
//                     <Text type="primary"><ScheduleOutlined /> {apt.timeSlot}</Text>
//                     <Text type="primary"><HomeOutlined /> {apt.room}</Text>
//                   </Space>  
//                 </Space>
//               </Space>
              
//               {/* NÚT (ĐÃ "ĐỘ" LẠI LOGIC) */}
//               {/* Truyền isUpcomingTab vào đây */}
//               {renderActionButtons(apt, isUpcomingTab)} 
//             </div>
//           </Card>
//         ))}
//       </Space>
//     );
//   };


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
//           position: 'sticky', top: 0, zIndex: 1000
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
//           defaultSelectedKeys={['3']} 
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

//       {/* CONTENT (ĐÃ SỬA LOGIC GỌI HÀM) */}
//       <Content style={{ padding: "40px 60px" }}>
//         <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
//           <Tabs defaultActiveKey="1" size="large">
//             <TabPane 
//               tab={`Lịch hẹn sắp tới (${upcomingAppointments.length})`} 
//               key="1"
//             >
//               {renderAppointmentList(upcomingAppointments, true)}
//             </TabPane>
//             <TabPane 
//               tab={`Lịch sử khám (${pastAppointments.length})`} 
//               key="2"
//             >
//               {renderAppointmentList(pastAppointments, false)}
//             </TabPane>
//           </Tabs>
//         </Card>
//       </Content>

//       <Footer /> 
//       <Modal 
//         title="Chỉnh sửa thông tin đặt khám" 
//         open={isEditModalOpen} 
//         onOk={handleEditOk} 
//         onCancel={handleEditCancel}
//         okText="Lưu thay đổi"
//         cancelText="Hủy"
//         width={700} // Cho nó rộng tí
//       >
//         <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
//           {/* "Bê" code từ Panel 2 (trang Confirm) vào */}
//           <Form.Item name="notes" label="Ghi chú" style={{ marginTop: 8 }}>
//             <TextArea rows={4} placeholder="Triệu chứng, thuốc đang dùng, tiền sử, ..." />
//           </Form.Item>
          
//           <Form.Item name="files" label="Tệp đính kèm (0/5)" style={{ marginTop: 16 }}>
//             <Dragger {...uploadProps}>
//               <p className="ant-upload-drag-icon"><InboxOutlined /></p>
//               <p className="ant-upload-text">Chọn tệp tin hoặc kéo thả vào đây</p>
//               <p className="ant-upload-hint">PNG, JPG tối đa 15MB</p>
//             </Dragger>
//           </Form.Item>
//         </Form>
//       </Modal>

//       {/* Chatbot AI cố định */}
//       <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
//         <ChatBotIcon />
//       </div>
//     </Layout>
//   );
// }



import { useState } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Card, Button,
  Space, Dropdown, Tabs, Tag, Popconfirm,
  Modal, Form, Input, Upload,Row, Col,
} from "antd";
import { 
  UserOutlined, LogoutOutlined, CalendarOutlined,
  HomeOutlined, ScheduleOutlined, EditOutlined, 
  DeleteOutlined, InboxOutlined, PaperClipOutlined ,FormOutlined
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 

const { Header, Content } = Layout;
const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input; 
const { Dragger } = Upload; 

// --- DỮ LIỆU MẪU (ĐÃ CẬP NHẬT ĐỂ TEST HIỂN THỊ) ---
const upcomingAppointments = [
  { 
    id: 10, 
    date: "25/12/2025", 
    type: "Khám Răng Hàm Mặt", 
    doctor: "Dr. Hoang Thi C", 
    timeSlot: "10:00 - 10:30", 
    room: "Phòng 401", 
    avatarUrl: "/doctor1.png", 
    status: "chưa khám",
    notes: "Tôi bị ê buốt răng hàm dưới bên trái, đau hơn khi uống nước", 
    files: [ 
      { name: "X-Quang_Rang.jpg", url: "#" },
      { name: "Don_thuoc_cu.pdf", url: "#" }
    ]
  },
  { 
    id: 11, 
    date: "30/12/2025", 
    type: "Khám Tổng quát", 
    doctor: "Dr. Nguyen Van A", 
    timeSlot: "08:00 - 08:30", 
    room: "Phòng 102", 
    avatarUrl: "/doctor2.png", 
    status: "chưa khám",
    notes: "", // Không có ghi chú
    files: []
  }
];

const pastAppointments = [
  { id: 1, date: "Thứ 4 12/11/2025", type: "Khám Da liễu", doctor: "Dr. Tran Thi Hoa", timeSlot: "18:30 - 19:00", room: "Phòng 203" , avatarUrl: "/doctor1.png", status: "đã khám"},
  { id: 2, date: "Thứ 4 15/08/2025", type: "Khám Tổng quát", doctor: "Dr. Pham Anh Dung", timeSlot: "09:00 - 09:30", room: "Phòng 101", avatarUrl: "/doctor2.png", status: "đã khám" },
  { id: 3, date: "Thứ 3 01/03/2025", type: "Khám Tim mạch", doctor: "Dr. Le Minh Tuan", timeSlot: "14:00 - 14:30", room: "Phòng 305", avatarUrl: "/doctor3.png", status: "đã hủy" },
  { id: 5, date: "Thứ 7 01/03/2025", type: "Khám Tim mạch", doctor: "Dr. Le Minh Tuan", timeSlot: "14:00 - 14:30", room: "Phòng 305", avatarUrl: "/doctor4.png", status: "đã trễ" },
];

export default function AppointmentPage() {
  const navigate = useNavigate();
  const user = { name: "Nguyen Van A" }; 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null); 
  const [form] = Form.useForm();

  const handleSignOut = () => { console.log("Đã đăng xuất!"); navigate('/'); };
  
  const menuItems = [
    { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
  ];

  const renderStatusTag = (status) => {
      const tagStyle = { fontSize: '14px', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold' };
      switch (status) {
        case 'chưa khám': return <Tag color="blue" style={tagStyle}>Chưa khám</Tag>;
        case 'đã khám': return <Tag color="green" style={tagStyle}>Đã khám</Tag>;
        case 'đã hủy': return <Tag color="red" style={tagStyle}>Đã hủy</Tag>;
        case 'đã trễ': return <Tag color="orange" style={tagStyle}>Đã trễ</Tag>;
        default: return <Tag style={tagStyle}>{status}</Tag>;
      }
    };

    const showEditModal = (apt) => {
        setEditingAppointment(apt); 
        form.setFieldsValue({
           notes: apt.notes || "", 
           files: [], 
        });
        setIsEditModalOpen(true);
    };

    const handleEditOk = () => {
        console.log("Đã lưu thay đổi cho:", editingAppointment.id);
        console.log("Dữ liệu mới:", form.getFieldsValue());
        setIsEditModalOpen(false);
        setEditingAppointment(null);
    };
    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setEditingAppointment(null);
    };
    
    const uploadProps = {
        name: 'file', multiple: true, action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76', maxCount: 5,
        onChange(info) { console.log(info.file.status); },
    };

  const renderActionButtons = (apt, isUpcomingTab = false) => {
    if (isUpcomingTab && apt.status === 'chưa khám') {
      return (
        <Space direction="vertical" align="end">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(apt)} style={{ minWidth: 120 }}>Chỉnh sửa</Button>
          <Popconfirm title="Hủy lịch hẹn?" description="Bạn có chắc muốn hủy lịch hẹn này?" onConfirm={() => console.log("Đã hủy lịch", apt.id)} okText="Đồng ý" cancelText="Không">
            <Button danger icon={<DeleteOutlined />} style={{ minWidth: 120 }}>Hủy lịch</Button>
          </Popconfirm>
        </Space>
      );
    }
    if (!isUpcomingTab) return renderStatusTag(apt.status);
    return null;
  };

  const renderAppointmentList = (data, isUpcomingTab = false) => {
    if (data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CalendarOutlined style={{ fontSize: 48, color: '#ccc' }} />
          <Text block type="secondary" style={{ marginTop: 16 }}>Không có lịch hẹn nào.</Text>
        </div>
      );
    }
    
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {data.map(apt => {
           // Kiểm tra xem có notes hoặc files để hiển thị không
           const hasNotesOrFiles = isUpcomingTab && (apt.notes || (apt.files && apt.files.length > 0));

           return (
            <Card key={apt.id} variant="borderless" style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <Row gutter={24} align="middle"> 
                
                {/* --- CỘT 1: THÔNG TIN BÁC SĨ (Chiếm khoảng 35%) --- */}
                <Col xs={24} md={9}>
                  <Space align="start" size="middle">
                    <Avatar size={80} src={apt.avatarUrl} icon={<UserOutlined />} />
                    <div style={{ width: '100%' }}>
                      <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{apt.doctor}</Text>
                      <div style={{ marginBottom: 6 }}><Text type="secondary" style={{ fontStyle: 'italic' }}>{apt.type}</Text></div>
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 13 }}><CalendarOutlined /> {apt.date}</Text>
                        <Text type="secondary" style={{ fontSize: 13 }}><ScheduleOutlined /> {apt.timeSlot}</Text>
                        <Text type="secondary" style={{ fontSize: 13 }}><HomeOutlined /> {apt.room}</Text>
                      </Space> 
                    </div>
                  </Space>
                </Col>

                {/* --- CỘT 2: GHI CHÚ & FILE (LẤP KHOẢNG TRẮNG Ở GIỮA - Chiếm khoảng 45%) --- */}
                <Col xs={24} md={11}>
                  {hasNotesOrFiles ? (
                    <div style={{ 
                      background: '#f0f5ff', // Xanh cực nhạt
                      borderRadius: 8, 
                      padding: '12px 16px',
                      border: '1px solid #d6e4ff', // Viền xanh nhạt
                      height: '100%', // Để nó cao bằng bên cạnh nếu cần
                    }}>
                        {/* Hiển thị Ghi chú */}
                        {apt.notes && (
                            <div style={{ marginBottom: (apt.files && apt.files.length > 0) ? 8 : 0 }}>
                                <Space size={6} style={{ marginBottom: 2 }}>
                                    <FormOutlined style={{ color: '#1677ff', fontSize: 12 }} />
                                    <Text strong style={{ color: '#1677ff', fontSize: 12 }}>GHI CHÚ:</Text>
                                </Space>
                                <Paragraph 
                                  ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }} 
                                  style={{ margin: 0, color: '#595959', fontSize: 13, paddingLeft: 20 }}
                                >
                                    {apt.notes}
                                </Paragraph>
                            </div>
                        )}

                        {/* Hiển thị Files */}
                        {apt.files && apt.files.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <Space size={6} style={{ marginBottom: 4 }}>
                                    <PaperClipOutlined style={{ color: '#1677ff', fontSize: 12 }} />
                                    <Text strong style={{ color: '#1677ff', fontSize: 12 }}>TỆP ĐÍNH KÈM:</Text>
                                </Space>
                                <div style={{ paddingLeft: 20 }}>
                                  <Space size={[8, 8]} wrap>
                                      {apt.files.map((f, idx) => (
                                          <a key={idx} href={f.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                              <Tag color="blue" style={{ cursor: 'pointer', margin: 0 }}>
                                                {f.name}
                                              </Tag>
                                          </a>
                                      ))}
                                  </Space>
                                </div>
                            </div>
                        )}
                    </div>
                  ) : (
                    // Nếu không có ghi chú thì để trống hoặc hiện thông báo mờ
                     isUpcomingTab && <div style={{ border: '1px dashed #d9d9d9', borderRadius: 8, padding: 16, textAlign: 'center', color: '#bfbfbf' }}>Chưa có ghi chú thêm</div>
                  )}
                </Col>
                
                {/* --- CỘT 3: NÚT ACTION (BÊN PHẢI CÙNG - Chiếm khoảng 20%) --- */}
                <Col xs={24} md={4} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                   {renderActionButtons(apt, isUpcomingTab)} 
                </Col>

              </Row>
            </Card>
          );
        })}
      </Space>
    );
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
                    <img 
            src="/ASTCare1.png" 
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />

        </div>
        <Menu mode="horizontal" defaultSelectedKeys={['4']}           
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
          }} />
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow><div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}><span style={{ fontSize: 16, fontWeight: 500, color: '#555' }}>{user.name}</span><Avatar size={36} icon={<UserOutlined />} /></div></Dropdown>
      </Header>

      <Content style={{ padding: "40px 60px" }}>
        <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <Tabs defaultActiveKey="1" size="large">
            <TabPane tab={`Lịch hẹn sắp tới (${upcomingAppointments.length})`} key="1">
              {renderAppointmentList(upcomingAppointments, true)}
            </TabPane>
            <TabPane tab={`Lịch sử khám (${pastAppointments.length})`} key="2">
              {renderAppointmentList(pastAppointments, false)}
            </TabPane>
          </Tabs>
        </Card>
      </Content>

      <Footer /> 
      
      <Modal title="Chỉnh sửa thông tin đặt khám" open={isEditModalOpen} onOk={handleEditOk} onCancel={handleEditCancel} okText="Lưu thay đổi" cancelText="Hủy" width={700}>
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="notes" label="Ghi chú" style={{ marginTop: 8 }}>
            <TextArea rows={4} placeholder="Triệu chứng, thuốc đang dùng, tiền sử, ..." />
          </Form.Item>
          <Form.Item name="files" label="Tệp đính kèm (0/5)" style={{ marginTop: 16 }}>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Chọn tệp tin hoặc kéo thả vào đây</p>
              <p className="ant-upload-hint">PNG, JPG tối đa 15MB</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}><ChatBotIcon /></div>
    </Layout>
  );
}