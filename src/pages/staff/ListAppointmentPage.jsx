
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
  Space,
  Form
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  SearchOutlined, 
  FilterOutlined, 
  PhoneOutlined, 
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'; 
import Footer from "../../components/common/Footer"; 

dayjs.extend(isBetween);
import { getStaffAppointmentsAPI, updateAppointmentNoteAPI } from '../../services/staffService';
import { cancelAppointmentAPI } from '../../services/appointmentService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker; 

export default function AdmissionStaffAppointmentPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('SCHEDULED');
  const [filterDoctor, setFilterDoctor] = useState('all');
  
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
  const [timeRange, setTimeRange] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteForm] = Form.useForm();

  const user = { name: "Lê Thị Bích", role: "admission" };

  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
        const params = {
            page: page,
            take: pagination.pageSize,
            sort: 'updatedAt', 
            sortDirection: 'ASC',
            fromDate: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD'),
            toDate: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD'),
        };

        if (searchText) params.keyword = searchText;
        if (filterStatus !== 'all') params.status = filterStatus;
        if (timeRange && timeRange[0] && timeRange[1]) {
            params.from = timeRange[0].format('HH:mm'); 
            params.to = timeRange[1].format('HH:mm');
        }

        const res = await getStaffAppointmentsAPI(params); 
        
        if (res.data?.success) {
            const rawData = res.data.data.data;
            
            const mappedData = rawData.map((item, index) => {
                const fromTime = item.from ? item.from.substring(0, 5) : '';
                const toTime = item.to ? item.to.substring(0, 5) : '';

                return {
                    key: item.id || index, 
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

            const finalData = filterDoctor === 'all' ? mappedData : mappedData.filter(d => d.doctor === filterDoctor);

            setAppointments(finalData);

            if(filterDoctor === 'all'){
               const uniqueDoctors = [...new Set(mappedData.map(item => item.doctor))];
               setDoctorList(uniqueDoctors);
            }

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

  useEffect(() => {
      fetchAppointments();
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
          case 'SCHEDULED': color = 'processing'; label = 'Đã đặt lịch'; break;
          case 'EXAMINING': color = 'warning'; label = 'Đang khám'; break;
          case 'EXAMINED': color = 'success'; label = 'Đã khám xong'; break;
          case 'CANCELLED': color = 'error'; label = 'Đã hủy'; break;
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
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      width: 200,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text ellipsis style={{ maxWidth: 140 }} type={text ? 'default' : 'secondary'}>
                {text || 'Chưa có ghi chú'}
            </Text>
            <Tooltip title="Thêm/Sửa ghi chú">
                <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        openNoteModal(record); 
                    }} 
                />
            </Tooltip>
        </div>
      )
    }
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
                        minuteStep={15}
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
                          <Option key={doctor} value={doctor}>{doctor}</Option>
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
                    <Button type="primary" loading={loading} onClick={handleFilterClick} icon={<FilterOutlined />}>Lọc dữ liệu</Button>
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

    </Layout>
  );
}