
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
  Button, 
  Input, 
  DatePicker, 
  TimePicker,
  Select, 
  Dropdown, 
  Modal,
  message,
  Tooltip,
  Popconfirm,
  Space
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  SearchOutlined, 
  FilterOutlined, 
  PhoneOutlined, 
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'; 
import Footer from "../../components/common/Footer"; 

dayjs.extend(isBetween);

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker; 

export default function AdmissionStaffAppointmentPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
  const [timeRange, setTimeRange] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const user = { name: "Lê Thị Bích", role: "admission" };

  const initialData = [
    {
      key: '1',
      date: '2026-01-01', 
      time: '08:00 - 08:30',
      patientName: 'Nguyễn Văn A',
      gender: 'male',
      age: 32,
      phone: '0909123456',
      doctor: 'BS. CK2 Trần Thị Hoa',
      reason: 'Đau đầu, chóng mặt kéo dài',
      status: 'pending',
    },
    {
      key: '2',
      date: '2026-01-01',
      time: '08:30 - 09:00',
      patientName: 'Trần Thị B',
      gender: 'female',
      age: 28,
      phone: '0912345678',
      doctor: 'BS. Nguyễn Văn Nam',
      reason: 'Nổi mẩn đỏ vùng mặt',
      status: 'completed',
    },
    {
      key: '3',
      date: '2026-01-01', 
      time: '09:00 - 09:30',
      patientName: 'Lê Văn C',
      gender: 'male',
      age: 45,
      phone: '0987654321',
      doctor: 'BS. CK2 Trần Thị Hoa',
      reason: 'Tái khám viêm da cơ địa',
      status: 'completed',
    },
    {
      key: '4',
      date: '2026-01-01',
      time: '09:30 - 10:00',
      patientName: 'Phạm Thị D',
      gender: 'female',
      age: 50,
      phone: '0933445566',
      doctor: 'BS. Lê Thị Tú',
      reason: 'Đau khớp gối khi vận động',
      status: 'pending',
    },
    {
      key: '5',
      date: '2026-01-01', 
      time: '10:00 - 10:30',
      patientName: 'Hoàng Văn E',
      gender: 'male',
      age: 22,
      phone: '0977889900',
      doctor: 'BS. Nguyễn Văn Nam',
      reason: 'Tư vấn thẩm mỹ sẹo',
      status: 'pending',
    },
  ];

  const [dataSource, setDataSource] = useState(initialData);

  const doctorList = [...new Set(initialData.map(item => item.doctor))];

  const handleSearch = (val) => setSearchText(val.toLowerCase());
  const handleStatusChange = (val) => setFilterStatus(val);
  const handleDoctorChange = (val) => setFilterDoctor(val);

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
  const handleCancelAppointment = (key) => {
    const newData = dataSource.map(item => {
      if (item.key === key) {
        return { ...item, status: 'cancelled' }; 
      }
      return item;
    });
    setDataSource(newData);
    message.success('Đã hủy lịch hẹn thành công!');
  };

  const filteredData = dataSource.filter(item => {

    const matchName = item.patientName.toLowerCase().includes(searchText) || item.phone.includes(searchText);
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchDoctor = filterDoctor === 'all' || item.doctor === filterDoctor;
    
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
    return matchName && matchTime && matchStatus && matchDate && matchDoctor; 
  });

  const columns = [
    {
      title: 'Ngày khám', 
      dataIndex: 'date',
      width: 120,
      render: (date) => (
          <Text strong>{dayjs(date).format('DD/MM/YYYY')}</Text>
      ),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Giờ hẹn',
      dataIndex: 'time',
      width: 140,
      render: (text) => (
        <Tag icon={<ClockCircleOutlined />} color="default" style={{ fontSize: 13 }}>
            {text}
        </Tag>
      )
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: 250,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={40} style={{ backgroundColor: record.gender === 'male' ? '#1677ff' : '#eb2f96' }} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ display: 'block' }}>{record.patientName}</Text>
            <div style={{ fontSize: 12, color: '#666' }}>
                <PhoneOutlined /> {record.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
        title: 'Bác sĩ phụ trách',
        dataIndex: 'doctor',
        width: 180,
        render: (text) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }} icon={<MedicineBoxOutlined />} size="small" />
              <Text strong>{text}</Text>
          </div>
        )
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
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
             <Tooltip title="Hủy lịch">
               <Popconfirm
                 title="Hủy lịch khám"
                 description="Bạn có chắc chắn muốn hủy lịch hẹn này không?"
                 onConfirm={(e) => {
                   e.stopPropagation(); 
                   handleCancelAppointment(record.key);
                 }}
                 onCancel={(e) => e.stopPropagation()}
                 okText="Xác nhận"
                 cancelText="Đóng"
                 placement="topRight"
               >
                 <Button 
                   type="text" 
                   danger
                   size="large" 
                   icon={<CloseCircleOutlined />} 
                   onClick={(e) => e.stopPropagation()}
                 />
               </Popconfirm>
             </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleSignOut = () => navigate('/');
  
  const menuUserItems = [
    { key: '1', label: (<a onClick={() => navigate('/staff/profile')}>Hồ sơ nhân viên</a>), icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/staff/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['2']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" },
            { key: "3", label: "Quản lý lịch" },
          ]}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
          onClick={({ key }) => {
            if(key === '1') navigate('/staff/dashboard');
            if(key === '2') navigate('/staff/appointments');
            if(key === '3') navigate('/staff/manage-schedule');
          }}
        />
        <Dropdown menu={{ items: menuUserItems }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.name}</span>
                <span style={{ fontSize: 12, color: '#888' }}>Phòng Tiếp nhận</span>
            </div>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#faad14' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "30px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>Quản lý lịch hẹn</Title>
          <Text type="secondary">Tra cứu và quản lý danh sách bệnh nhân đã đặt lịch khám tại bệnh viện.</Text>
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
                <Col xs={24} md={5}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Khoảng giờ hẹn:</Text>
                    <TimePicker.RangePicker 
                        format="HH:mm"
                        minuteStep={15}
                        onChange={handleTimeRangeChange}
                        placeholder={['Từ giờ', 'Đến giờ']}
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} md={5}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Từ khóa:</Text>
                    <Input 
                        placeholder="Tìm theo tên hoặc SĐT..." 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                        onChange={(e) => handleSearch(e.target.value)} 
                        allowClear 
                    />
                </Col>

                <Col xs={24} md={4}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Bác sĩ:</Text>
                    <Select 
                      defaultValue="all" 
                      style={{ width: '100%' }} 
                      onChange={handleDoctorChange} 
                      showSearch
                    >
                        <Option value="all">Tất cả bác sĩ</Option>
                        {doctorList.map(doctor => (
                          <Option key={doctor} value={doctor}>{doctor}</Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} md={4}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Trạng thái:</Text>
                    <Select defaultValue="all" style={{ width: '100%' }} onChange={handleStatusChange} suffixIcon={<FilterOutlined />}>
                        <Option value="all">Tất cả</Option>
                        <Option value="pending">Chờ khám</Option>
                        <Option value="completed">Đã khám xong</Option>
                    </Select>
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
        title="Thông tin chi tiết lịch hẹn"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[<Button key="close" onClick={handleCloseModal}>Đóng</Button>]}
      >
        {selectedPatient && (
            <div style={{ padding: '10px 0' }}>
                <p><strong>Bệnh nhân:</strong> {selectedPatient.patientName}</p>
                <p><strong>Ngày khám:</strong> {dayjs(selectedPatient.date).format('DD/MM/YYYY')}</p>
                <p><strong>Giờ hẹn:</strong> {selectedPatient.time}</p>
                <p><strong>Bác sĩ:</strong> {selectedPatient.doctor}</p>
                <p><strong>Lý do khám:</strong> {selectedPatient.reason}</p>
                <p><strong>SĐT:</strong> {selectedPatient.phone}</p>
            </div>
        )}
      </Modal>

    </Layout>
  );
}