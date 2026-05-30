import { useState, useEffect } from 'react';
import {
  Layout,
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
  Tooltip,
  Modal,
  Image,        
  Descriptions,  
  Divider,
  message,
  Popconfirm
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  FileImageOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
import Footer from "../../components/common/Footer"; 
import { getDoctorAppointmentsAPI, startExaminationAPI } from '../../services/doctorService';
import { cancelAppointmentAPI } from '../../services/appointmentService';
import useAuth from "../../hooks/useAuth";
import DoctorHeader from './components/DoctorHeader';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { RangePicker } = DatePicker; 
 

export default function DoctorAppointmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState([dayjs().startOf('isoWeek'), dayjs().endOf('isoWeek')]);
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

    const handleCancelAppointment = async (key) => {
    try {
        const res = await cancelAppointmentAPI(key);
        
        if (res.data?.success || res.data?.isSuccess) {
            const newData = appointments.map(item => {
                if (item.key === key) return { ...item, status: 'CANCELLED' }; 
                return item;
            });
            setAppointments(newData);
            fetchAppointments(pagination.current);
            
            message.success(res.data?.message || 'Đã hủy lịch hẹn thành công!');
        }
    } catch (error) {
        const apiMessage = error?.response?.data?.message || '';
        let displayMessage = "Hủy lịch thất bại."; 

        if (apiMessage.includes('Appointment with id') && apiMessage.includes('not found')) {
            displayMessage = "Không tìm thấy cuộc hẹn";
        } 
        else if (apiMessage === 'You do not have permission to cancel this appointment') {
            displayMessage = "Bạn không có quyền hủy cuộc hẹn của người khác";
        } else if (apiMessage === 'You do not have permission to cancel appointment from other department') {
            displayMessage = "Nhân viên không có quyền hủy cuộc hẹn của bệnh nhân khoa khác";
        } else if (apiMessage === 'You do not have permission to cancel appointment from other doctor') {
            displayMessage = "Bạn không thể hủy cuộc hẹn của bệnh nhân này với bác sĩ khác";
        } else if (apiMessage === 'Only appointments with status SCHEDULED can be cancelled') {
            displayMessage = "Chỉ những cuộc hẹn chưa được diễn ra mới có thể hủy";
        } 
        else if (apiMessage === 'Failed to cancel appointment' || apiMessage === 'Error cancelling appointment') {
            displayMessage = "Lỗi hủy cuộc hẹn";
        } 
        else if (apiMessage) {
            displayMessage = apiMessage;
        }

        message.error(displayMessage);
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
      width: 130,
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
            <div style={{ fontSize: 12, color: '#666' }}>
                <PhoneOutlined /> {record.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: ' Triệu chứng',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
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
          {(record.status === 'SCHEDULED'  ||  record.status === 'EXAMINING') && (
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
                   size="small" 
                   icon={<CloseCircleOutlined style={{ fontSize: 18 }} />} 
                   onClick={(e) => e.stopPropagation()}
                 />
               </Popconfirm>
             </Tooltip>
          )}
        </Space>
      ),
    },
  ];
  
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <DoctorHeader selectedKey="2" />

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
                        minuteStep={30}
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
                    <Select defaultValue="all" style={{ width: '100%' }} onChange={handleStatusChange} suffixIcon={<FilterOutlined />}>
                        <Option value="all">Tất cả</Option>
                        <Option value="SCHEDULED">Đã đặt lịch</Option>
                        <Option value="EXAMINING">Đang khám</Option>
                        <Option value="EXAMINED">Đã khám xong</Option>
                        <Option value="CANCELLED">Đã hủy</Option>
                    </Select>
                </Col>

                <Col xs={24} md={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Button type="primary" icon={<FilterOutlined />} style={{ width: '100%' }} onClick={handleFilterClick} loading={loading}>Lọc</Button>
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
                scroll={{ x: 900 }} 
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24, alignItems: 'center' }}>
                    <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: selectedPatient.gender === 'MALE' ? '#1677ff' : '#eb2f96' }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>{selectedPatient.patientName}</Title>
                        <Space direction="vertical" size={2} style={{ marginTop: 8 }}>
                            <Text type="secondary"><UserOutlined /> Giới tính: {selectedPatient.gender === 'MALE' ? 'Nam' : 'Nữ'}</Text>
                            <Text type="secondary"><PhoneOutlined /> SĐT: {selectedPatient.phone}</Text>
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
                                            width={100} 
                                            height={100}
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

      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }

          .ant-picker-dropdown .ant-picker-panels {
            flex-direction: column !important;
          }
          .ant-picker-dropdown {
            max-width: 100vw !important;
          }
          .ant-picker-panel-container {
            max-width: 100vw;
            overflow-x: auto;
          }
        }
      `}</style>
    </Layout>
  );
}