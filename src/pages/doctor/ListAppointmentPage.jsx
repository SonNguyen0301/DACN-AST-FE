import  { useState } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Input, 
  DatePicker, 
  TimePicker,
  Select, 
  Dropdown, 
  Tooltip,
  Modal,
  Image,        
  Descriptions,  
  Divider,
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  CalendarOutlined, 
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  FileImageOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import Footer from "../../components/common/Footer"; 

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { RangePicker } = DatePicker; 
  const initialData = [
    {
      key: '1',
      time: '08:00 - 08:30',
      patientName: 'Nguyễn Văn A',
      gender: 'male',
      age: 32,
      phone: '0909123456',
      reason: 'Đau đầu, chóng mặt kéo dài',
      detailedSymptoms: 'Xuất hiện các nốt đỏ ngứa quanh vùng cổ và lan xuống ngực. Đã bôi thuốc mỡ nhưng không giảm. Cảm giác nóng rát khi ra nắng.',
      history: 'Dị ứng hải sản, Tiền sử viêm da cơ địa.',
      images: [
        'https://dalieuhanoi.com/wp-content/uploads/2023/07/viem-da-co-dia-o-tay-1.jpg',  
        'https://dalieuhanoi.com/wp-content/uploads/2023/07/viem-da-co-dia-o-tay-2.jpg'
      ],
      status: 'pending',
      avatar: null
    },
    {
      key: '2',
      time: '08:30 - 09:00',
      patientName: 'Trần Thị B',
      gender: 'female',
      age: 28,
      phone: '0912345678',
      reason: 'Nổi mẩn đỏ vùng mặt',
      detailedSymptoms: 'Da mặt nổi nhiều mụn li ti, sưng đỏ sau khi sử dụng mỹ phẩm mới. Ngứa nhiều vào ban đêm.',
      history: 'Da nhạy cảm, chưa có tiền sử bệnh lý đặc biệt.',
      images: [
        'https://example.com/rash1.jpg',  
      ],
      status: 'completed',
      avatar: null
    },
    {
        key: '3',
        time: '09:00 - 09:30',
        patientName: 'Lê Văn C',
        gender: 'male',
        age: 45,
        phone: '0987654321',
        reason: 'Tái khám viêm da cơ địa',
        detailedSymptoms: 'Tái khám theo lịch hẹn. Tình trạng đã đỡ 80%, chỉ còn hơi khô da.',
        history: 'Đang điều trị theo đơn thuốc đợt 1.',
        images: [], 
        status: 'completed',
        avatar: null
      },
      {
        key: '4',
        time: '09:30 - 10:00',
        patientName: 'Phạm Thị D',
        gender: 'female',
        age: 50,
        phone: '0933445566',
        reason: 'Đau khớp gối khi vận động',
        detailedSymptoms: 'Khớp gối lục cục khi leo cầu thang, đau âm ỉ khi trời lạnh.',
        history: 'Thoái hóa khớp nhẹ.',
        images: [],
        status: 'pending',
        avatar: null
      },
      {
        key: '5',
        time: '10:00 - 10:30',
        patientName: 'Hoàng Văn E',
        gender: 'male',
        age: 22,
        phone: '0977889900',
        reason: 'Tư vấn thẩm mỹ sẹo',
        detailedSymptoms: 'Muốn tư vấn liệu trình laser trị sẹo rỗ do mụn để lại.',
        history: 'Đã trị hết mụn trứng cá.',
        images: ['https://example.com/seo1.jpg'],
        status: 'pending',
        avatar: null
      },
  ];

export default function DoctorAppointmentPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
  const [timeRange, setTimeRange] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  
  const [dataSource, setDataSource] = useState(initialData);


  const handleSearch = (val) => setSearchText(val.toLowerCase());
  const handleStatusChange = (val) => setFilterStatus(val);
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };
  const handleTimeRangeChange = (times) => setTimeRange(times);

  const handleViewDetail = (record) => {
    setSelectedPatient(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };
  const filteredData = dataSource.filter(item => {
  
      const matchName = item.patientName.toLowerCase().includes(searchText) || item.phone.includes(searchText);
      
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      
      let matchDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
          const itemDate = dayjs(item.date);
          matchDate = itemDate.isBetween(dateRange[0], dateRange[1], 'day', '[]'); 
      }
  
      let matchTime = true;
      if (timeRange && timeRange[0] && timeRange[1]) {
          const timeString = item.time.split(' - ')[0]; 
          const appointmentTime = dayjs(timeString, 'HH:mm');
          
          const filterStart = dayjs().hour(timeRange[0].hour()).minute(timeRange[0].minute());
          const filterEnd = dayjs().hour(timeRange[1].hour()).minute(timeRange[1].minute());
          const targetTime = dayjs().hour(appointmentTime.hour()).minute(appointmentTime.minute());
  
          matchTime = targetTime.isBetween(filterStart, filterEnd, null, '[]');
      }
      return matchName && matchTime && matchStatus && matchDate; 
    });
  
  const handleStartConsultation = () => {
      const currentStartTime = selectedPatient.time.split(' - ')[0];

      const hasEarlierPendingAppointment = dataSource.some(appt => {
          if (appt.status === 'pending' && appt.key !== selectedPatient.key) {
              const apptStartTime = appt.time.split(' - ')[0];
              return apptStartTime < currentStartTime;
          }
          return false;
      });

      if (hasEarlierPendingAppointment) {
          confirm({
              title: 'Xác nhận đôn lịch khám',
              icon: <ExclamationCircleOutlined />,
              content: 'Có vẻ như vẫn còn bệnh nhân khác đang chờ khám trước ca này. Bạn có chắc chắn muốn bỏ qua thứ tự và bắt đầu khám cho bệnh nhân này ngay không?',
              okText: 'Xác nhận khám',
              cancelText: 'Hủy',
              centered: true,
              onOk() {
                  proceedToConsultation();
              },
          });
      } else {
          proceedToConsultation();
      }
  };

  const proceedToConsultation = () => {
      handleCloseModal();
      navigate('/doctor/consulting', { state: { patient: selectedPatient } });
  }

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      width: 120,
      render: (text) => <Tag color="blue" style={{ fontSize: 14 }}>{text}</Tag>,
      sorter: (a, b) => a.time.localeCompare(b.time),
    },
    {
      title: 'Thông tin bệnh nhân',
      key: 'patient',
      width: 250,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={40} style={{ backgroundColor: record.gender === 'male' ? '#1677ff' : '#eb2f96' }} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ display: 'block' }}>{record.patientName}</Text>
            <Space size={8} style={{ fontSize: 12, color: '#666', minWidth: 200 }}>
              {record.gender === 'male' ? <ManOutlined style={{ color: '#1677ff' }}/> : <WomanOutlined style={{ color: '#eb2f96' }}/>} 
              <span>{record.age} tuổi</span>
              <span>|</span>
              <PhoneOutlined /> {record.phone}
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: 'Lý do khám / Triệu chứng',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        let color = 'default';
        let label = 'Không rõ';
        switch (status) {
          case 'pending': color = 'warning'; label = 'Chờ khám'; break;
          case 'completed': color = 'success'; label = 'Đã khám'; break;
        }
        return <Tag color={color} style={{ minWidth: 80, textAlign: 'center' }}>{label.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết hồ sơ & ảnh">
            <Button 
                type="default" 
                size="small" 
                icon={<EyeOutlined />} 
                onClick={() => handleViewDetail(record)}  
            >
              Chi tiết
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSignOut = () => {
    navigate('/');
  };
  
  const menuUserItems = [
    { key: '1', label: (<a onClick={() => navigate('/doctor/profile')}>Hồ sơ bác sĩ</a>), icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/doctor/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['2']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" },
            { key: "3", label: "Khám bệnh" },
          ]}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
          onClick={({ key }) => {
            if(key === '1') navigate('/doctor/dashboard');
            if(key === '2') navigate('/doctor/appointments');
            if(key === '3') navigate('/doctor/consulting');
          }}
        />
        <Dropdown menu={{ items: menuUserItems }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>BS. CK2 Trần Thị Hoa</span>
                <span style={{ fontSize: 12, color: '#888' }}>Khoa Da liễu</span>
            </div>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "30px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>Danh sách đặt khám</Title>
          <Text type="secondary">Quản lý ca khám được đặt, xem thông tin về bệnh tình mà bệnh nhân gửi trước đó.</Text>
        </div>

        <Card variant="borderless" style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} md={6}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Khoảng thời gian:</Text>
                    <RangePicker 
                        value={dateRange}
                        format="DD/MM/YYYY"
                        onChange={handleDateRangeChange}
                        style={{ width: '100%' }}
                        allowClear={false}
                    />
                </Col>
                <Col xs={24} md={6}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Khoảng giờ hẹn:</Text>
                    <TimePicker.RangePicker 
                        format="HH:mm"
                        minuteStep={15}
                        onChange={handleTimeRangeChange}
                        placeholder={['Từ giờ', 'Đến giờ']}
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} md={6}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Từ khóa:</Text>
                    <Input 
                        placeholder="Tìm theo tên hoặc SĐT..." 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                        onChange={(e) => handleSearch(e.target.value)} 
                        allowClear 
                    />
                </Col>

                <Col xs={24} md={4}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Trạng thái:</Text>
                    <Select defaultValue="pending" style={{ width: '100%' }} onChange={handleStatusChange} suffixIcon={<FilterOutlined />}>
                        <Option value="pending">Chờ khám</Option>
                        <Option value="completed">Đã khám xong</Option>
                    </Select>
                </Col>

                <Col xs={24} md={2} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<FilterOutlined />} style={{ marginTop: 22 }}>Lọc</Button>
                </Col>
            </Row>
        </Card>

        <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} styles={{ body: { padding: 0 } }}>
             <Table 
                columns={columns} 
                dataSource={filteredData} 
                pagination={{ pageSize: 10 }}
                onRow={(record) => ({
                    style: { cursor: 'pointer' },
                    onClick: () => handleViewDetail(record)  
                })}
             />
        </Card>
      </Content>
      
      <Footer />

      <Modal
        title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MedicineBoxOutlined style={{ color: '#1677ff', fontSize: 24 }} />
                <span style={{ fontSize: 20 }}>Chi tiết hồ sơ bệnh nhân</span>
            </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
            <Button key="close" onClick={handleCloseModal}>
                Đóng
            </Button>,
            selectedPatient?.status === 'pending' && (
                <Button key="start" type="primary" onClick={handleStartConsultation}>
                    Bắt đầu khám
                </Button>
            )
        ]}
        width={700}
        centered
      >
        {selectedPatient && (
            <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                    <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: selectedPatient.gender === 'male' ? '#1677ff' : '#eb2f96' }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>{selectedPatient.patientName}</Title>
                        <Space direction="vertical" size={2} style={{ marginTop: 8 }}>
                            <Text type="secondary"><UserOutlined /> Giới tính: {selectedPatient.gender === 'male' ? 'Nam' : 'Nữ'} - {selectedPatient.age} tuổi</Text>
                            <Text type="secondary"><PhoneOutlined /> SĐT: {selectedPatient.phone}</Text>
                            <Text type="secondary"><CalendarOutlined /> Giờ hẹn: <Tag color="blue">{selectedPatient.time}</Tag></Text>
                        </Space>
                    </div>
                </div>

                <Divider />

                <Descriptions title="Thông tin y tế" column={1} bordered size="small">
                    <Descriptions.Item label="Lý do khám">
                        <Text strong>{selectedPatient.reason}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả chi tiết">
                        {selectedPatient.detailedSymptoms || "Bệnh nhân chưa cung cấp mô tả chi tiết."}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiền sử bệnh">
                         {selectedPatient.history || "Không có ghi nhận."}
                    </Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: 24 }}>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
                        <FileImageOutlined /> Hình ảnh tình trạng bệnh (đính kèm)
                    </Text>
                    {selectedPatient.images && selectedPatient.images.length > 0 ? (
                        <Image.PreviewGroup>
                            <Space size={12} wrap>
                                {selectedPatient.images.map((img, index) => (
                                    <Image
                                        key={index}
                                        width={120}
                                        height={120}
                                        src={img}
                                        style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
                                        fallback="https://placehold.co/120x120?text=No+Image" 
                                    />
                                ))}
                            </Space>
                        </Image.PreviewGroup>
                    ) : (
                        <div style={{ padding: 20, background: '#f5f5f5', borderRadius: 8, textAlign: 'center', color: '#999' }}>
                            Không có hình ảnh đính kèm
                        </div>
                    )}
                </div>
            </div>
        )}
      </Modal>

    </Layout>
  );
}