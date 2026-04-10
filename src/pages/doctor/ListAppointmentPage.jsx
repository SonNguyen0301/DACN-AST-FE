import  { useState, useEffect } from 'react';
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
  message
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
import { getDoctorAppointmentsAPI, startExaminationAPI } from '../../services/doctorService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { RangePicker } = DatePicker; 
 

export default function DoctorAppointmentPage() {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('SCHEDULED');
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
  const [timeRange, setTimeRange] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  
  const fetchAppointments = async (page = 1) => {
      setLoading(true);
      try {
          const params = {
              page: page,
              take: pagination.pageSize,
              sort: 'date',
              sortDirection: 'DESC',
              startDate: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD'),
              endDate: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD'),
          };

          if (searchText) params.keyword = searchText;
          if (filterStatus !== 'all') params.status = filterStatus;
          
          if (timeRange && timeRange[0] && timeRange[1]) {
              params.from = timeRange[0].format('HH:mmZ'); 
              params.to = timeRange[1].format('HH:mmZ');
          }

          const res = await getDoctorAppointmentsAPI(params); 
          
          if (res.data?.success) {
              const rawData = res.data.data.data;
              
              const mappedData = rawData.map((item, index) => {
                  const fromTime = item.from ? item.from.substring(0, 5) : '';
                  const toTime = item.to ? item.to.substring(0, 5) : '';
                  
                  const imageUrls = item.images 
                  ? Object.values(item.images)
                      .map(img => typeof img === 'string' ? img : (img.base64 || img.dataUrl || img.url))
                      .filter(Boolean) 
                  : [];

                  return {
                      key: item.id || index, 
                      patientId: item.patientId,
                      time: `${fromTime} - ${toTime}`,
                      date: item.date,
                      patientName: item.patientName,
                      gender: item.gender === 'MALE' ? 'MALE' : (item.gender === 'FEMALE' ? 'FEMALE' : 'OTHER'),
                      age: item.dateOfBirth ? dayjs().diff(dayjs(item.dateOfBirth), 'year') : 'N/A',
                      phone: item.phoneNumber,
                      reason: item.description || 'Không có ghi chú',
                      detailedSymptoms: item.description || 'Không có mô tả chi tiết.',
                      history: item.previousDiseases?.length ? item.previousDiseases.join(', ') : 'Không có ghi nhận.',
                      images: imageUrls,
                      status: item.status, 
                      rawTime: item.from 
                  };
              });

              setAppointments(mappedData);
              setPagination(prev => ({
                  ...prev,
                  current: res.data.data.meta.page,
                  total: res.data.data.meta.itemCount
              }));
          }
      } catch (error) {
          console.error("Lỗi lấy danh sách khám:", error);
          message.error("Không thể tải danh sách đặt khám.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchAppointments();
  }, []);


  const handleSearch = (val) => setSearchText(val.toLowerCase());
  const handleStatusChange = (val) => setFilterStatus(val);
  const handleDateRangeChange = (dates) => setDateRange(dates);
  const handleTimeRangeChange = (times) => setTimeRange(times);

  const handleFilterClick = () => fetchAppointments(1);
  const handleTableChange = (newPagination) => fetchAppointments(newPagination.current);

  const handleViewDetail = (record) => {
    setSelectedPatient(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };


  const handleStartConsultation = () => {
      const currentStartTime = selectedPatient.time.split(' - ')[0];

      const hasEarlierPendingAppointment = appointments.some(appt => {
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

  const proceedToConsultation = async () => {
      try {
          const res = await startExaminationAPI({
              appointmentId: selectedPatient.key,
              patientId: selectedPatient.patientId
          });
          if (res.data?.success || res.status === 201) {
              const consultationId = res.data?.data?.consultationId || res.data?.consultationId;
              handleCloseModal();
              navigate('/doctor/consulting', { state: { patient: selectedPatient, consultationId } });
          }
      } catch (error) {
          console.error("Lỗi khi bắt đầu khám:", error);
          message.error(error.response?.data?.message || "Không thể bắt đầu ca khám.");
      }
  }

  const columns = [
    {
        title: 'Ngày khám',
        dataIndex: 'date',
        key: 'date',
        width: 120,
        render: (text) => <Tag color="green" style={{ fontSize: 14 }}>{dayjs(text).format('DD/MM/YYYY')}</Tag>,
        sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
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
          <Avatar size={40} style={{ backgroundColor: record.gender === 'MALE' ? '#1677ff' : '#eb2f96' }} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ display: 'block' }}>{record.patientName}</Text>
            <Space size={8} style={{ fontSize: 12, color: '#666', minWidth: 200 }}>
              {record.gender === 'MALE' ? <ManOutlined style={{ color: '#1677ff' }}/> : <WomanOutlined style={{ color: '#eb2f96' }}/>} 
              <span>{record.age} tuổi</span>
              <span>|</span>
              <PhoneOutlined /> {record.phone}
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: ' Triệu chứng',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Hình ảnh đính kèm',
      key: 'images',
      width: 150,
      render: (_, record) => {
        if (!record.images || record.images.length === 0) {
            return <Text type="secondary" style={{fontSize: 12}}>Không có ảnh</Text>;
        }
        return (
          <div onClick={(e) => e.stopPropagation()}> 
            <Image.PreviewGroup>
                <Space size={6} wrap>
                    {record.images.map((imgStr, index) => {
                        const validSrc = imgStr.startsWith('http') || imgStr.startsWith('data:image') 
                            ? imgStr 
                            : `data:image/png;base64,${imgStr}`;
                        
                        return (
                            <Image
                                key={index}
                                width={45}
                                height={45}
                                src={validSrc} 
                                style={{ 
                                    objectFit: 'cover', 
                                    borderRadius: 6, 
                                    border: '1px solid #d9d9d9',
                                    display: index < 5 ? 'block' : 'none' 
                                }}
                                fallback="https://placehold.co/45x45?text=L%E1%BB%97i" 
                            />
                        );
                    })}
                    
                    {record.images.length > 2 && (
                        <div style={{ 
                            width: 45, height: 45, 
                            background: '#f5f5f5', border: '1px dashed #d9d9d9', borderRadius: 6, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: 13, color: '#666', fontWeight: 500
                        }}>
                            +{record.images.length - 2}
                        </div>
                    )}
                </Space>
            </Image.PreviewGroup>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        let color = 'default';
        let label = status;
        switch (status) {
          case 'SCHEDULED': color = 'processing'; label = 'Đã đặt lịch'; break;
          case 'EXAMINING': color = 'warning'; label = 'Đang khám'; break;
          case 'EXAMINED': color = 'success'; label = 'Đã khám xong'; break;
          case 'CANCELLED': color = 'error'; label = 'Đã hủy'; break;
          case 'LATE': color = 'default'; label = 'Đến trễ'; break;
        }
        return <Tag color={color} style={{ minWidth: 90, textAlign: 'center' }}>{label.toUpperCase()}</Tag>;
      }
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết hồ sơ & ảnh">
            <Button 
                type="default" 
                size="small" 
                icon={<EyeOutlined />} 
                onClick={(e) => {
                    e.stopPropagation(); 
                    handleViewDetail(record);
                }}  
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
            { key: "4", label: "Lịch sử khám bệnh" },
          ]}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
          onClick={({ key }) => {
            if(key === '1') navigate('/doctor/dashboard');
            if(key === '2') navigate('/doctor/appointments');
            if(key === '3') navigate('/doctor/consulting');
            if(key === '4') navigate('/doctor/medical-history');
                
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
                        onPressEnter={handleFilterClick}
                        allowClear 
                    />
                </Col>

                <Col xs={24} md={4}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Trạng thái:</Text>
                    <Select defaultValue="SCHEDULED" style={{ width: '100%' }} onChange={handleStatusChange} suffixIcon={<FilterOutlined />}>
                        <Option value="SCHEDULED">Đã đặt lịch</Option>
                        <Option value="EXAMINING">Đang khám</Option>
                        <Option value="EXAMINED">Đã khám xong</Option>
                        <Option value="CANCELLED">Đã hủy</Option>
                    </Select>
                </Col>

                <Col xs={24} md={2} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<FilterOutlined />} style={{ marginTop: 22 }} onClick={handleFilterClick} loading={loading}>Lọc</Button>
                </Col>
            </Row>
        </Card>

        <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} styles={{ body: { padding: 0 } }}>
             <Table 
                columns={columns} 
                dataSource={appointments} 
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
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
            (selectedPatient?.status === 'SCHEDULED' || selectedPatient?.status === 'EXAMINING') && (
                <Button key="start" type="primary" onClick={handleStartConsultation} disabled={!dayjs(selectedPatient.date).isSame(dayjs(), 'day')}>
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
                    <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: selectedPatient.gender === 'MALE' ? '#1677ff' : '#eb2f96' }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>{selectedPatient.patientName}</Title>
                        <Space direction="vertical" size={2} style={{ marginTop: 8 }}>
                            <Text type="secondary"><UserOutlined /> Giới tính: {selectedPatient.gender === 'MALE' ? 'Nam' : 'Nữ'}</Text>
                            <Text type="secondary"><PhoneOutlined /> SĐT: {selectedPatient.phone}</Text>
                            <Text type="secondary"><CalendarOutlined /> Giờ hẹn: <Tag color="blue">{selectedPatient.time}</Tag></Text>
                        </Space>
                    </div>
                </div>

                <Divider />

                <Descriptions title="Thông tin y tế" column={1} bordered size="small">
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
                                {selectedPatient.images.map((imgStr, index) => {
                                    const validSrc = imgStr.startsWith('http') || imgStr.startsWith('data:image') 
                                        ? imgStr 
                                        : `data:image/png;base64,${imgStr}`;
                                    return (
                                        <Image
                                            key={index}
                                            width={120}
                                            height={120}
                                            src={validSrc} 
                                            style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
                                            fallback="https://placehold.co/120x120?text=L%E1%BB%97i" 
                                        />
                                    );
                                })}
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