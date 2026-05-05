import { useState, useEffect } from 'react';
import {
  Layout,
  Avatar,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  List,
  Badge,
  Space,
  Modal
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  PhoneOutlined,
  SearchOutlined,
  MedicineBoxOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer"; 
import { getTodayAppointments, getActiveDoctors, getStaffDashboardInfo } from '../../services/staffService'; 
import dayjs from 'dayjs';
import useAuth from "../../hooks/useAuth";
import StaffHeader from './components/StaffHeader';

const { Content } = Layout;
const { Title, Text } = Typography;

const getTimeRange = () => {
    const now = dayjs();
    const minutes = now.minute();
    const dateStr = now.format('YYYY-MM-DD');
  
    let from, to;
  
    if (minutes < 30) {
      from = now.minute(0).second(0).format('HH:mm:ss+07');
      to = now.minute(30).second(0).format('HH:mm:ss+07');
    } else {
      from = now.minute(30).second(0).format('HH:mm:ss+07');
      to = now.add(1, 'hour').minute(0).second(0).format('HH:mm:ss+07');
    }
  
    return { currentDate: dateStr, from, to };
};

export default function AdmissionStaffDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [bookingRequests, setBookingRequests] = useState([]);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
      todayAppointments: 0,
      nextAvailableShift: "Hết ca trống"
  });

  const [availableShifts, setAvailableShifts] = useState([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const fetchAppointments = async () => {
        try {
            const { currentDate, from, to } = getTimeRange();
            const params = { currentDate, from, to };
            
            const response = await getTodayAppointments(params);
            
            if (response.data.success) {
                const mappedData = response.data.data.map((item, index) => ({
                    key: index,
                    patient: item.patientName,
                    phone: item.phoneNumber,
                    doctor: item.doctorName,
                    time: `${item.from.substring(0, 5)} - ${item.to.substring(0, 5)}`,
                    status: item.status
                }));
                setBookingRequests(mappedData);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách cuộc hẹn:", error);
        }
    };

  const fetchActiveDoctors = async () => {
      try {
          const currentDate = dayjs().format('YYYY-MM-DD'); 
          
          const response = await getActiveDoctors(currentDate);

          if (response.data.success) {
              const mappedDoctors = response.data.data.map(doc => {
                  let uiStatus = 'offline';
                  if (doc.status === 'EXAMINING') uiStatus = 'busy';
                  if (doc.status === 'ON_DUTY') uiStatus = 'online';
                  if (doc.status === 'OFF_DUTY') uiStatus = 'free';
                  if (doc.status === 'NO_WORKING') uiStatus = 'offline';

                  return {
                      name: doc.doctorName,
                      dept: doc.department,
                      status: uiStatus,
                  };
              });
              setDoctorsOnDuty(mappedDoctors);
          }
      } catch (error) {
          console.error("Lỗi lấy danh sách bác sĩ trực:", error);
      }
  };

  const fetchDashboardStatsInfo = async () => {
      try {
          const now = dayjs();
          const currentDate = now.format('YYYY-MM-DD');
          const from = now.format('HH:mm:ss+07'); 
          const startMonthDate = now.startOf('month').format('YYYY-MM-DD');
          const endMonthDate = now.endOf('month').format('YYYY-MM-DD');
          const startLastMonthDate = now.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
          const endLastMonthDate = now.subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
          const params = { currentDate, from , startMonthDate, endMonthDate, startLastMonthDate, endLastMonthDate };

          const response = await getStaffDashboardInfo(params);

          if (response.data.success) {
              const data = response.data.data;
              let nextShift = "Hết ca trống";

              if (data.shifts && data.shifts.length > 0) {
                  nextShift = data.shifts[0].startTime.substring(0, 5);
              }

              setDashboardStats({
                  todayAppointments: data.todayAppointmentsCount || 0,
                  nextAvailableShift: nextShift
              });
              setAvailableShifts(data.shifts || []);
          }
      } catch (error) {
          console.error("Lỗi lấy thống kê dashboard:", error);
      }
  };

  useEffect(() => {
      fetchAppointments();
      fetchActiveDoctors(); 
      fetchDashboardStatsInfo();
  
      const interval = setInterval(() => {
          fetchAppointments();
          fetchActiveDoctors();
          fetchDashboardStatsInfo();
      }, 60000); 
  
      return () => clearInterval(interval); 
  }, []);

  const statsData = [
    { title: "Lịch hẹn hôm nay", value: dashboardStats.todayAppointments, icon: <CalendarOutlined />, color: "#1677ff", bg: "#e6f4ff" },
    { 
        title: "Ca trống gần nhất", 
        value: dashboardStats.nextAvailableShift, 
        icon: <ThunderboltOutlined />, 
        color: "#13c2c2", bg: "#e6fffb", 
        isClickable: true, 
        onClick: () => setIsShiftModalOpen(true) 
    },
    { title: "Bác sĩ đang trực", value: doctorsOnDuty.length, icon: <TeamOutlined />, color: "#722ed1", bg: "#f9f0ff" },
  ];

  const columns = [
    {
      title: (
        <Space>
          <UserOutlined />
          <span>Bệnh nhân</span>
        </Space>
      ),
      dataIndex: 'patient',
      width: 200,
      render: (text) => (
        <Text strong style={{ fontSize: 15 }}>{text}</Text>
      )
    },
    {
      title: (
        <Space>
          <PhoneOutlined />
          <span>Số điện thoại</span>
        </Space>
      ),
      dataIndex: 'phone',
      width: 200,
      render: (text) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 14 }}>{text}</Text>
      )
    },
    {
      title: (
        <Space>
          <MedicineBoxOutlined />
          <span>Bác sĩ phụ trách</span>
        </Space>
      ),
      dataIndex: 'doctor',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }} icon={<UserOutlined />} size="small" />
            <Text strong>{text}</Text>
        </div>
      )
    },
    {
      title: (
        <Space>
          <ClockCircleOutlined />
          <span>Giờ hẹn</span>
        </Space>
      ),
      dataIndex: 'time',
      width: 200,
      render: (text) => (
          <Tag color="blue" style={{ fontSize: 14, padding: '4px 10px', textAlign: 'center', minWidth: 80 }}>
              {text}
          </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        let color = 'blue';
        let text = status;
        if (status === 'EXAMINING') { color = 'orange'; text = 'ĐANG KHÁM'; }
        if (status === 'PENDING') { color = 'default'; text = 'CHỜ TIẾP NHẬN'; }
        return <Tag color={color}>{text}</Tag>;
      }
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <StaffHeader selectedKey="1" />

      <Content style={{ padding: "30px 40px" }}>
        
        <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Hoạt động trong ngày</Title>
            <Row gutter={[24, 24]}>
                {statsData.map((stat, index) => (
                    <Col xs={24} sm={8} key={index}>
                        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",cursor: stat.isClickable ? 'pointer' : 'default', transition: 'all 0.2s' }}
                          hoverable={stat.isClickable}
                          onClick={stat.onClick} 
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <Text type="secondary">{stat.title}</Text>
                                    <div style={{ marginTop: 4 }}>
                                        <Statistic value={stat.value} valueStyle={{ fontSize: 24, fontWeight: 'bold' }} />
                                    </div>
                                </div>
                                <div style={{ width: 48, height: 48, background: stat.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: stat.color }}>
                                    {stat.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>

        <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
                <Card 
                    title="Lịch hẹn " 
                    variant="borderless"
                    extra={<Button type="link" onClick={() => navigate('/staff/appointments')}>Xem tất cả</Button>}
                    style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}
                >
                    <Table 
                        columns={columns} 
                        dataSource={bookingRequests} 
                        pagination={false} 
                        size="middle"
                        scroll={{ x: 800 }}
                        locale={{ emptyText: "Không có lịch hẹn nào mới" }}
                    />
                </Card>
            </Col>

            <Col xs={24} lg={8}>
                <Card 
                    title="Trạng thái bác sĩ trực" 
                    variant="borderless"
                    style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={doctorsOnDuty}
                        renderItem={(doc) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <Badge dot status={doc.status === 'online' ? 'success' : doc.status === 'busy' ? 'processing' : 'default'}>
                                            <Avatar icon={<UserOutlined />} />
                                        </Badge>
                                    }
                                    title={<Text strong>{doc.name}</Text>}
                                    description={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Khoa {doc.dept}</Text>
                                            {doc.status === 'busy' && <Tag color="blue">Đang khám </Tag>}
                                            {doc.status === 'online' && <Tag color="yellow">Đang trực</Tag>}
                                            {doc.status === 'offline' && <Tag color="default">Nghỉ</Tag>}
                                            {doc.status === 'free' && <Tag color="green">Sẵn sàng</Tag>}
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                    <Button block style={{ marginTop: 16 }} icon={<SearchOutlined />} onClick={() => navigate('/staff/manage-schedule')}>Tra cứu lịch bác sĩ</Button>
                </Card>
            </Col>
        </Row>

      </Content>
      <Footer />
      <Modal
        title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThunderboltOutlined style={{ color: '#13c2c2', fontSize: 20 }} />
                <span>Danh sách các ca trống tiếp theo</span>
            </div>
        }
        open={isShiftModalOpen}
        onCancel={() => setIsShiftModalOpen(false)}
        footer={[
            <Button key="close" type="primary" onClick={() => setIsShiftModalOpen(false)}>Đóng</Button>
        ]}
      >
        {availableShifts.length > 0 ? (
            <List
                itemLayout="horizontal"
                dataSource={availableShifts}
                renderItem={(shift) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<ClockCircleOutlined />} style={{ backgroundColor: '#e6fffb', color: '#13c2c2' }} />}
                            title={<Text strong style={{ fontSize: 16 }}>Khung giờ: {shift.startTime.substring(0, 5)}</Text>}
                            description={
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>Bác sĩ sẵn sàng nhận bệnh:</Text>
                                    <Space wrap>
                                        {shift.doctorName && shift.doctorName.map((docName, idx) => (
                                            <Tag color="cyan" key={idx} style={{ padding: '2px 8px', fontSize: 13 }}>
                                                <UserOutlined style={{ marginRight: 4 }}/>
                                                {docName}
                                            </Tag>
                                        ))}
                                    </Space>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
                <CalendarOutlined style={{ fontSize: 32, color: '#d9d9d9', marginBottom: 12 }} />
                <p style={{ color: '#999', margin: 0 }}>Không còn ca trống nào trong hôm nay.</p>
            </div>
        )}
      </Modal>

      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}