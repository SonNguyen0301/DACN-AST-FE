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
  Button,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Modal,
  message,
  Tooltip,
  Popconfirm,
  Space,
  Form,
  Descriptions,
  Divider
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  FilterOutlined, 
  PhoneOutlined, 
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'; 
import Footer from "../../components/common/Footer"; 
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);
dayjs.extend(isBetween);
import { getStaffAppointmentsAPI, updateAppointmentNoteAPI } from '../../services/staffService';
import { cancelAppointmentAPI } from '../../services/appointmentService';
import { getDoctorsAPI } from '../../services/doctorService';
import useAuth from "../../hooks/useAuth";
import StaffHeader from './components/StaffHeader';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker; 

export default function AdmissionStaffAppointmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  
  const [dateRange, setDateRange] = useState([dayjs().startOf('isoWeek'), dayjs().endOf('isoWeek')]);
  const [timeRange, setTimeRange] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, showSizeChanger: false});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteForm] = Form.useForm();


  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
        const params = {
            page: page,
            take: pagination.pageSize,
            sort: 'updatedAt', 
            sortDirection: 'ASC',
        };

        if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
            params.fromDate = dateRange[0].format('YYYY-MM-DD');
            params.toDate = dateRange[1].format('YYYY-MM-DD');
        } else {
             params.fromDate = dayjs().startOf('month').format('YYYY-MM-DD');
             params.toDate = dayjs().endOf('month').format('YYYY-MM-DD');
        }

        if (searchText) params.keyword = searchText;
        if (filterStatus !== 'all') params.status = filterStatus;
        
        if (timeRange && timeRange.length === 2 && timeRange[0] && timeRange[1]) {
            params.from = timeRange[0].format('HH:mm'); 
            params.to = timeRange[1].format('HH:mm');
      }

        if (filterDoctor !== 'all') params.doctorId = filterDoctor;

        const res = await getStaffAppointmentsAPI(params);
        
        if (res.data?.success) {
            const rawData = res.data.data.data;
            
            const mappedData = rawData.map((item) => {
                const fromTime = item.from ? item.from.substring(0, 5) : '';
                const toTime = item.to ? item.to.substring(0, 5) : '';

                return {
                    key: item.appointmentId, 
                    date: item.date,
                    time: `${fromTime} - ${toTime}`,
                    patientName: item.patientName,
                    gender: item.gender,
                    phone: item.phoneNumber,
                    doctor: item.doctorName,
                    department: item.department,
                    reason: item.description || item.note || 'Không có ghi chú',
                    note: item.note,
                    status: item.status, 
                };
            });


            setAppointments(mappedData);

            setPagination({
                current: res.data.data.meta.page,
                pageSize: res.data.data.meta.take,
                total: res.data.data.meta.itemCount
            });
        }
    } catch (error) {
        console.error("Lỗi lấy danh sách khám:", error);
        message.error("Không thể tải danh sách đặt khám.");
    } finally {
        setLoading(false);
    }
  };

  const fetchDoctorsList = async () => {
      try {
          const res = await getDoctorsAPI({ page: 1, take: 50, sortDirection: 'ASC', department: 'Dermatology' });
          
          if (res.data?.success) {
              const docs = res.data.data.data || res.data.data;
              setDoctorList(docs);
          }
      } catch (error) {
          console.error("Lỗi tải danh sách bác sĩ:", error);
      }
  };

  useEffect(() => {
      fetchAppointments();
      fetchDoctorsList();
  }, []);

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
        } else {
            message.error('Không thể hủy lịch hẹn này.');
        }
    } catch (error) {
        console.error("Lỗi khi hủy lịch hẹn:", error);
        const errorMsg = error.response?.data?.message || 'Đã xảy ra lỗi hệ thống khi hủy lịch.';
        message.error(errorMsg);
    }
  };

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

  const openNoteModal = (record) => {
    setSelectedPatient(record);
    noteForm.setFieldsValue({ note: record.note });
    setIsNoteModalOpen(true);
  };

  const handleNoteForAppointment = async (values) => {
    try {
        const res = await updateAppointmentNoteAPI(selectedPatient.key, values.note);
        if (!res.data?.success) {
            message.error('Không thể cập nhật ghi chú cho lịch hẹn này.');
            return;
        }
        
        const newData = appointments.map(item => {
            if (item.key === selectedPatient.key) {
                return { ...item, note: values.note };
            }
            return item;
        });
        setAppointments(newData);
        
        message.success('Đã cập nhật ghi chú thành công!');
        setIsNoteModalOpen(false);
    } catch (error) {
        console.error("Lỗi cập nhật ghi chú:", error);
        message.error('Có lỗi xảy ra khi cập nhật ghi chú.');
    }
  };
  
  const columns = [
    {
      title: 'Ngày khám', 
      dataIndex: 'date',
      width: 110,
      render: (date) => (
          <Text strong>{dayjs(date).format('DD/MM/YYYY')}</Text>
      ),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Giờ hẹn',
      dataIndex: 'time',
      width: 120,
      render: (text) => (
        <Tag icon={<ClockCircleOutlined />} color="default" style={{ fontSize: 13 }}>
            {text}
        </Tag>
      )
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: 220,
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
      width: 140,
      render: (status) => {
        let color = 'default';
        let label = 'Không rõ';
        switch (status) {
          case 'SCHEDULED': color = 'processing'; label = 'Đã đặt lịch'; break;
          case 'EXAMINING': color = 'warning'; label = 'Đang khám'; break;
          case 'EXAMINED': color = 'success'; label = 'Đã khám xong'; break;
          case 'CANCELLED': color = 'error'; label = 'Đã hủy'; break;
        }
        return <Tag color={color} style={{ minWidth: 80, textAlign: 'center' }}>{label.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      width: 180,
      render: (text) => (
          <Text ellipsis style={{ width: '100%' }} type={text ? 'default' : 'secondary'}>
              {text || 'Chưa có ghi chú'}
          </Text>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right', 
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
            <Tooltip title="Thêm/Sửa ghi chú">
                <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined style={{ color: '#1677ff', fontSize: 18 }} />} 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        openNoteModal(record); 
                    }} 
                />
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
      <StaffHeader selectedKey="2" />

      <Content style={{ padding: "30px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>Quản lý lịch hẹn</Title>
          <Text type="secondary">Tra cứu và quản lý danh sách bệnh nhân đã đặt lịch khám tại bệnh viện.</Text>
        </div>

        <Card variant="borderless" style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} md={5}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Khoảng thời gian:</Text>
                    <RangePicker 
                        value={dateRange}
                        format="DD/MM/YYYY"
                        onChange={setDateRange}
                        style={{ width: '100%' }}
                        allowClear={false}
                    />
                </Col>
                <Col xs={24} md={5}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Khoảng giờ hẹn:</Text>
                    <TimePicker.RangePicker 
                        format="HH:mm"
                        minuteStep={30}
                        onChange={setTimeRange}
                        placeholder={['Từ giờ', 'Đến giờ']}
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} md={5}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Từ khóa:</Text>
                    <Input 
                        placeholder="Tìm theo tên hoặc SĐT..." 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                        onChange={(e) => setSearchText(e.target.value)} 
                        onPressEnter={handleFilterClick}
                        allowClear 
                    />
                </Col>

                <Col xs={24} md={4}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Bác sĩ:</Text>
                    <Select 
                      defaultValue="all" 
                      style={{ width: '100%' }} 
                      onChange={setFilterDoctor} 
                      showSearch
                    >
                        <Option value="all">Tất cả bác sĩ</Option>
                        {doctorList.map(doctor => (
                          <Option key={doctor.id} value={doctor.id}>BS. {doctor.firstName} {doctor.lastName}</Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} md={3}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Trạng thái:</Text>
                    <Select defaultValue="all" style={{ width: '100%' }} onChange={setFilterStatus} suffixIcon={<FilterOutlined />}>
                        <Option value="all">Tất cả</Option>
                        <Option value="SCHEDULED">Chờ khám</Option>
                        <Option value="EXAMINING">Đang khám</Option>
                        <Option value="EXAMINED">Đã khám xong</Option>
                        <Option value="CANCELLED">Đã hủy</Option>
                    </Select>
                </Col>
                <Col xs={24} md={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" loading={loading} onClick={handleFilterClick} icon={<FilterOutlined />} style={{ width: '100%' }}>Lọc</Button>
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
                scroll={{ x: 1050 }} 
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
                <CalendarOutlined style={{ color: '#1677ff', fontSize: 24 }} />
                <span style={{ fontSize: 20 }}>Chi tiết lịch hẹn</span>
            </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
            <Button key="close" type="primary" onClick={handleCloseModal}>Đóng</Button>
        ]}
        width={700}
        centered
      >
        {selectedPatient && (
            <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24, alignItems: 'center' }}>
                    <Avatar 
                        size={80} 
                        icon={<UserOutlined />} 
                        style={{ 
                            backgroundColor: selectedPatient.gender === 'FEMALE' ? '#eb2f96' : '#1677ff', 
                            fontSize: 36 
                        }} 
                    />
                    <div>
                        <Title level={4} style={{ margin: 0, marginBottom: 8 }}>{selectedPatient.patientName}</Title>
                        <Space direction="vertical" size={4}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                <UserOutlined style={{ marginRight: 6 }}/> 
                                Giới tính: {selectedPatient.gender === 'MALE' ? 'Nam' : (selectedPatient.gender === 'FEMALE' ? 'Nữ' : 'Không rõ')}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                <PhoneOutlined style={{ marginRight: 6 }}/> 
                                SĐT: {selectedPatient.phone || 'Chưa cập nhật'}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 14, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                <CalendarOutlined style={{ marginRight: 6 }}/> 
                                Giờ hẹn: 
                                <Tag color="blue" bordered={false} style={{ marginLeft: 6, borderRadius: 4, fontSize: 13, padding: '2px 8px' }}>
                                    {selectedPatient.time}
                                </Tag>
                                <span style={{ marginLeft: 4 }}>({dayjs(selectedPatient.date).format('DD/MM/YYYY')})</span>
                            </Text>
                        </Space>
                    </div>
                </div>

                <Divider />

                <Descriptions column={1} bordered size="small" labelStyle={{ width: '160px', fontWeight: 'bold', background: '#fafafa' }}>
                    <Descriptions.Item label="Trạng thái">
                        {(() => {
                            let color = 'default';
                            let label = 'Không rõ';
                            switch (selectedPatient.status) {
                                case 'SCHEDULED': color = 'processing'; label = 'Đã đặt lịch'; break;
                                case 'EXAMINING': color = 'warning'; label = 'Đang khám'; break;
                                case 'EXAMINED': color = 'success'; label = 'Đã khám xong'; break;
                                case 'CANCELLED': color = 'error'; label = 'Đã hủy'; break;
                            }
                            return <Tag color={color} style={{ minWidth: 80, textAlign: 'center' }}>{label.toUpperCase()}</Tag>;
                        })()}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Bác sĩ phụ trách">
                        <MedicineBoxOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                        <Text strong>{selectedPatient.doctor}</Text> 
                        {selectedPatient.department && <Text type="secondary"> (Khoa {selectedPatient.department})</Text>}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Lý do khám">
                        {selectedPatient.reason}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Ghi chú nội bộ">
                        {selectedPatient.note ? (
                            <Text style={{ color: '#d48806', fontWeight: 500 }}>{selectedPatient.note}</Text>
                        ) : (
                            <Text type="secondary" style={{ fontStyle: 'italic' }}>Chưa có ghi chú nào cho lịch hẹn này.</Text>
                        )}
                    </Descriptions.Item>
                </Descriptions>
            </div>
        )}
      </Modal>

      <Modal
        title="Cập nhật ghi chú lịch hẹn"
        open={isNoteModalOpen}
        onCancel={() => setIsNoteModalOpen(false)}
        onOk={() => noteForm.submit()}
        okText="Lưu ghi chú"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={noteForm} layout="vertical" onFinish={handleNoteForAppointment}>
            <Form.Item 
                name="note" 
                label={`Ghi chú cho bệnh nhân: ${selectedPatient?.patientName}`}
            >
                <Input.TextArea 
                    rows={4} 
                    placeholder="Nhập nội dung ghi chú nội bộ, nhắc nhở mang theo giấy tờ, dặn dò..." 
                />
            </Form.Item>
        </Form>
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