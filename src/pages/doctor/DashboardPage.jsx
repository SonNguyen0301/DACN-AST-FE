
import {
  Layout,
  Avatar,
  Typography,
  Row,
  Col,
  Card,
  Badge,
  Calendar,
  List,
  Tag,
  Button,
  Popover, 
  Segmented, 
  Space,
  Empty,
  Modal,
  Spin,
  message,
  Tooltip as AntdTooltip
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined, 
  ArrowDownOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  UserDeleteOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Progress } from "antd";
import Footer from "../../components/common/Footer";
import { useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect } from "react";
import { getAppointmentCalendarAPI, getAppointmentsByDateAPI, getDoctorDashboardInfoAPI, getStatisticMonthlyDiseaseAPI, startExaminationAPI } from "../../services/doctorService";
import useAuth from "../../hooks/useAuth";
import DoctorHeader from './components/DoctorHeader';
const { Content } = Layout;
const { Title, Text } = Typography;

export default function DoctorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();


  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handlePatientClick = (patient) => {
      setSelectedPatient(patient);
      setIsDetailModalOpen(true);
  };


  const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#9e9e9e'];

  const [viewMode, setViewMode] = useState('month'); 
  const [currentDate, setCurrentDate] = useState(dayjs());

  const [calendarMap, setCalendarMap] = useState({});
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [diseaseData, setDiseaseData] = useState([]);

  const currentMonth = dayjs().month();

  useEffect(() => {
      const fetchDashboardData = async () => {
          if (!user?.id) return;
          try {
              const now = dayjs(); 
              
              const dashboardParams = {
                  currentDate: now.format('YYYY-MM-DD'),
                  startWeekDate: now.startOf('week').format('YYYY-MM-DD'),

                  lastStartWeekDate: now.subtract(1, 'week').startOf('isoWeek').format('YYYY-MM-DD'),
                  lastEndWeekDate: now.subtract(1, 'week').endOf('isoWeek').format('YYYY-MM-DD'),
                  
                  startMonthDate: now.startOf('month').format('YYYY-MM-DD'),


                  lastStartMonthDate: now.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
                  lastEndMonthDate: now.subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
              };
            
              const diseaseParams = {
                    startMonthDate: now.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
                    endMonthDate: now.subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
                };

              const [statsRes, diseaseRes] = await Promise.all([
                  getDoctorDashboardInfoAPI(dashboardParams),
                  getStatisticMonthlyDiseaseAPI(diseaseParams)
              ]);

              if (statsRes.data?.success) {
                  setDashboardStats(statsRes.data.data);
              }
            
              if (diseaseRes.data?.success) {
                const totalDiseaseCount = diseaseRes.data.data.reduce((sum, item) => sum + item.count, 0);
                  const mappedDisease = diseaseRes.data.data.map(item => ({
                      name: item.diseaseName,
                      value: Number((item.count/ totalDiseaseCount * 100).toFixed(2)),
                      count: item.count,
                  }));
                  setDiseaseData(mappedDisease);
              }
          } catch (error) {
              console.error("Lỗi lấy dữ liệu Dashboard tổng quan:", error);
          }
      };

      fetchDashboardData();
  }, [user?.id]);

    const calculateTrend = (current, previous) => {
        if (previous === 0) return { trend: current > 0 ? 'up' : null, value: current > 0 ? 100 : 0 };
        const diff = current - previous;
        const percent = Math.round((Math.abs(diff) / previous) * 100);
        return {
            trend: diff >= 0 ? 'up' : 'down',
            value: percent
        };
    };

    let statsData = [];
    if (dashboardStats) {
      const weekTrend = calculateTrend(dashboardStats.currentWeekPatientsCount, dashboardStats.previousWeekPatientsCount);
      const monthTrend = calculateTrend(dashboardStats.currentMonthAppointmentsCount, dashboardStats.previousMonthAppointmentsCount);
      
      let todayProgress = 0;
      if (dashboardStats.totalAppointmentsCount > 0) {
          todayProgress = Math.round((dashboardStats.examinationsCount / dashboardStats.totalAppointmentsCount) * 100);
      }

      statsData = [
          { 
              title: "Ca khám hôm nay", 
              value: dashboardStats.totalAppointmentsCount, 
              suffix: "ca",
              icon: <ClockCircleOutlined />, 
              color: "#1677ff", 
              bg: "#e6f4ff", 
              progress: todayProgress, 
              progressDetail: `Đã khám: ${dashboardStats.examinationsCount}/${dashboardStats.totalAppointmentsCount} ca`, 
          },
          { 
              title: "Lịch bị hủy hôm nay", 
              value: dashboardStats.cancelledAppointmentsCount, 
              suffix: "ca",
              icon: <UserDeleteOutlined />, 
              color: "#ff4d4f", 
              bg: "#fff1f0", 
              clickable: true, 
          },
          { 
              title: "Bệnh nhân tuần này", 
              value: dashboardStats.currentWeekPatientsCount, 
              suffix: "người",
              icon: <TeamOutlined />, 
              color: "#52c41a", 
              bg: "#f6ffed", 
              trend: weekTrend.trend,
              trendValue: `${weekTrend.value}%`,
              subText: "So với tuần trước"
          },
          { 
              title: `Tổng khám tháng ${currentMonth}`, 
              value: dashboardStats.currentMonthAppointmentsCount, 
              suffix: "lượt",
              icon: <RiseOutlined />, 
              color: "#722ed1", 
              bg: "#f9f0ff", 
              trend: monthTrend.trend,
              trendValue: `${monthTrend.value}%`,
              subText: "So với tháng trước"
          }
      ];
  } 
  
  useEffect(() => {
    const fetchCalendarData = async () => {
        if (!user?.id) return; 
        
        setLoadingCalendar(true);
        try {
            const startDate = currentDate.startOf(viewMode).format('YYYY-MM-DD');
            const endDate = currentDate.endOf(viewMode).format('YYYY-MM-DD');
            
            const params = {
                startDate,
                endDate,
                option: viewMode.toUpperCase(), 
                batch: 4
            };

            const res = await getAppointmentCalendarAPI(user.id, params);
            
            if (res.data?.success) {
                const map = {};
                res.data.data.forEach(dayItem => {
                    const dateStr = dayjs(dayItem.date).format('YYYY-MM-DD');
                    map[dateStr] = dayItem;
                });
                setCalendarMap(map);
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu calendar:", error);
        } finally {
            setLoadingCalendar(false);
        }
    };

    fetchCalendarData();
  }, [viewMode, currentDate.startOf(viewMode).format('YYYY-MM-DD'), user?.id]);

  const [waitingPatients, setWaitingPatients] = useState([]);
  const [loadingWaiting, setLoadingWaiting] = useState(false);

  useEffect(() => {
      const fetchAppointmentsByDate = async () => {
          if (!user?.id) return;
          setLoadingWaiting(true);
          try {
            
              const dateStr = currentDate.format('YYYY-MM-DD');
              
              const res = await getAppointmentsByDateAPI(user.id, dateStr);

              if (res.data?.success && res.data.data?.appointments) {
                  const mappedData = res.data.data.appointments.map(apt => {
                      const fromStr = apt.from ? apt.from.substring(0, 5) : '';
                      const toStr = apt.to ? apt.to.substring(0, 5) : '';

                      const imageUrls = apt.images 
                        ? Object.values(apt.images)
                            .map(img => typeof img === 'string' ? img : (img.base64 || img.dataUrl || img.url))
                            .filter(Boolean) 
                        : [];
                      return {
                          id: apt.id,
                          patientId: apt.patientId,
                          name: apt.patientName,
                          patientName: apt.patientName,
                          time: `${fromStr} - ${toStr}`,
                          status: apt.status,
                          reason: apt.description || 'Không có ghi chú',
                          raw: apt ,
                          age: apt.dateOfBirth ? dayjs().diff(dayjs(apt.dateOfBirth), 'year') : 'N/A',
                          history: apt.previousDiseases?.length ? apt.previousDiseases.join(', ') : 'Không có ghi nhận.',
                          gender: apt.gender === 'MALE' ? 'MALE' : (apt.gender === 'FEMALE' ? 'FEMALE' : 'OTHER'),
                          phone : apt.phoneNumber || 'Không có',
                          detailedSymptoms: apt.description || 'Không có mô tả chi tiết.',
                          images: imageUrls
                      };
                  });
                  setWaitingPatients(mappedData);
              } else {
                  setWaitingPatients([]);
              }
          } catch (error) {
              console.error("Lỗi lấy danh sách khám theo ngày:", error);
              setWaitingPatients([]);
          } finally {
              setLoadingWaiting(false);
          }
      };

      fetchAppointmentsByDate();
  }, [currentDate.format('YYYY-MM-DD'), user?.id]);
  
const handleStartConsultation = async (patient) => {
      try {
          
          const res = await startExaminationAPI({
              appointmentId: patient.id, 
              patientId: patient.patientId
          });
          
          if (res.data?.success || res.status === 201 || res.status === 200) {
              message.success({ content: 'Đã bắt đầu ca khám', key: 'startExam' });
              
              const consultationId = res.data?.data?.consultationId || res.data?.consultationId;
              setIsDetailModalOpen(false);
              
              navigate('/doctor/consulting', { state: { patient: patient, consultationId } });
          } else {
              message.error({ content: 'Không thể bắt đầu ca khám', key: 'startExam' });
          }
      } catch (error) {
          console.error("Lỗi khi bắt đầu khám:", error);
          message.error({ content: error.response?.data?.message || "Không thể bắt đầu ca khám.", key: 'startExam' });
      }
  };

const isTodaySelected = currentDate.isSame(dayjs(), 'day');


const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayData = calendarMap[dateStr];
    
    if (!dayData || !dayData.appointments) return [];

    return dayData.appointments.map(apt => {
        let type = 'success'; 
        if (apt.status === 'SCHEDULED') type = 'warning'; 
        if (apt.status === 'EXAMINING') type = 'processing'; 
        if (apt.status === 'CANCELLED') type = 'error'; 

        const timeStr = apt.from ? apt.from.substring(0, 5) : '';

        return { 
            type, 
            content: `${timeStr} - ${apt.patientName}`, 
            reason: apt.description || 'Không có ghi chú',
            status: apt.status,
            raw: apt 
        };
    });
  };

  const renderAppointmentItem = (item, index) => {
    const apt = item.raw;
    const patientName = apt.patientName || item.content.split('-')[1]?.trim();
    
    const age = apt.dateOfBirth ? dayjs().diff(dayjs(apt.dateOfBirth), 'year') : 'Không rõ';
    
    let genderStr = 'Không rõ';
    if (apt.gender === 'MALE') genderStr = 'Nam';
    else if (apt.gender === 'FEMALE') genderStr = 'Nữ';

    const reason = apt.description || 'Bệnh nhân chưa cung cấp lý do khám.';

    const popoverContent = (
      <div style={{ width: 280 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
           <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: item.type === 'success' ? '#87d068' : '#1677ff' }} />
           <div>
              <Text strong style={{ display: 'block', fontSize: 16 }}>{patientName}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{genderStr} - {age} tuổi</Text>
           </div>
        </div>
        <div style={{ background: '#f5f7fa', padding: 10, borderRadius: 8, marginBottom: 12 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <FileTextOutlined style={{ color: '#1677ff' }} /> <Text strong style={{ fontSize: 12 }}>Lý do khám:</Text>
           </div>
           <Text style={{ fontSize: 13, color: '#555' }}>{reason}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
            <Tag color={item.type === 'warning' ? 'warning' : item.type === 'error' ? 'red' : 'success'}>
                {item.type === 'warning' ? 'Chờ khám' : item.type === 'error' ? 'Quan trọng' : 'Đã khám'}
            </Tag>
            <Button type="link" size="small" style={{ padding: 0, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => navigate('/doctor/appointments')}>
                Xem hồ sơ <ArrowRightOutlined />
            </Button>
        </div>
      </div>
    );

    return (
      <li key={apt.id || index} style={{ marginBottom: 6 }}>
        <Popover content={popoverContent} title={null} trigger="hover" placement="rightTop">
          <div style={{ 
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              padding: '4px 6px', borderRadius: 6, backgroundColor: 'transparent', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f4ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Badge status={item.type} /> 
            <span style={{ fontSize: 12, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#333' }}>
              {item.content}
            </span>
          </div>
        </Popover>
      </li>
    );
  };

  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const listData = getListData(value);

    const dayData = calendarMap[dateStr];
    const totalAppointments = dayData?.total > 0 ? dayData.total : listData.length;
    
    const hasMore = totalAppointments > 3;
    const displayData = hasMore ? listData.slice(0, 2) : listData.slice(0, 3);

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {displayData.map((item, index) => {
          const patientName = item.content.includes('-') ? item.content.split('-')[1].trim() : item.content;
          
          const popoverContent = (
            <div style={{ width: 280 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                 <Avatar 
                    size={48} 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: item.type === 'success' ? '#87d068' : '#1677ff' }} 
                 />
                 <div>
                    <Text strong style={{ display: 'block', fontSize: 16 }}>{patientName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Nam - 32 tuổi • {index % 2 === 0 ? 'Bệnh nhân mới' : 'Tái khám'}</Text>
                 </div>
              </div>    
              
              <div style={{ background: '#f5f7fa', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <FileTextOutlined style={{ color: '#1677ff' }} /> 
                    <Text strong style={{ fontSize: 12 }}>Lý do khám:</Text>
                 </div>
                 <Text style={{ fontSize: 13, color: '#555' }}>
                    Dị ứng da mặt, ngứa nhiều về đêm, đã dùng thuốc bôi nhưng không đỡ.
                 </Text>
              </div>
  
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                  <Tag color={item.type === 'warning' ? 'warning' : item.type === 'error' ? 'red' : 'success'}>
                      {item.type === 'warning' ? 'Chờ khám' : item.type === 'error' ? 'Quan trọng' : 'Đã khám'}
                  </Tag>
                  <Button type="link" size="small" style={{ padding: 0, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => navigate('/doctor/appointments')}>
                      Xem hồ sơ <ArrowRightOutlined />
                  </Button>
              </div>
            </div>
          );

          return (
            <li key={index} style={{ marginBottom: 6 }}>
               <Popover content={popoverContent} title={null} trigger="hover" placement="rightTop">
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    cursor: 'pointer',
                    borderRadius: 6,
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f4ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Badge status={item.type} /> 
                
                  <span style={{ fontSize: 12, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#333' }}>
                    {item.content}
                  </span>
                </div>
              </Popover>
            </li>
          );
        })}
        {hasMore && (
           <li style={{ textAlign: 'center', marginTop: -4 }}>
               <Text type="secondary" style={{ fontSize: 16, lineHeight: 1 }}>.........</Text>
           </li>
        )}
      </ul>
    );
  };

  const monthCellRender = (value) => {
    const monthStr = value.format('YYYY-MM');
    let totalMonthAppointments = 0;
    
    Object.keys(calendarMap).forEach(dateKey => {
        if (dateKey.startsWith(monthStr)) {
            totalMonthAppointments += (calendarMap[dateKey].appointments?.length || 0);
        }
    });

    return totalMonthAppointments > 0 ? (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Badge count={totalMonthAppointments} color="#1677ff" />
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>ca khám</Text>
        </div>
    ) : null;
  };

  const renderStatusTag = (status) => {
    switch(status) {
      case 'EXAMINING': return <Tag color="processing" icon={<ClockCircleOutlined />}>Đang khám</Tag>;
      case 'SCHEDULED': return <Tag color="warning">Chờ khám</Tag>;
      case 'EXAMINED': return <Tag color="success">Đã khám</Tag>;
      case 'CANCELLED': return <Tag color="error">Đã hủy</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const renderWeekView = () => {
    const startOfWeek = currentDate.startOf('week'); 
    const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

    return (
      <div style={{ padding: 24 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
             <Button icon={<LeftOutlined />} onClick={() => setCurrentDate(currentDate.subtract(1, 'week'))} />
             <Text strong style={{ fontSize: 16 }}>
                Tuần từ {startOfWeek.format('DD/MM/YYYY')} đến {startOfWeek.add(6, 'day').format('DD/MM/YYYY')}
             </Text>
             <Button icon={<RightOutlined />} onClick={() => setCurrentDate(currentDate.add(1, 'week'))} />
         </div>

         <Row gutter={[12, 12]}>
           {weekDays.map((day, i) => {
             const listData = getListData(day);
             const isToday = day.isSame(dayjs(), 'day');
             return (
               <Col key={i} span={24} md={3} style={{ flex: 1, minWidth: 120 }}> 
                 <div 
                    onClick={() => setCurrentDate(day)}
                    style={{ 
                        height: '100%', minHeight: 400,
                        border: isToday ? '1px solid #1677ff' : '1px solid #f0f0f0',
                        borderRadius: 8,
                        backgroundColor: isToday ? '#e6f4ff' : '#fff'
                    }}>
                    <div style={{ 
                        padding: '12px 0', textAlign: 'center', 
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: isToday ? '#1677ff' : 'transparent',
                        color: isToday ? '#fff' : 'inherit',
                        borderRadius: '8px 8px 0 0'
                    }}>
                        <Text strong style={{ display: 'block', fontSize: 16, color: isToday ? '#fff' : '#333' }}>{day.format('DD')}</Text>
                        <Text style={{ fontSize: 12, color: isToday ? '#fff' : '#888' }}>{day.format('dddd')}</Text>
                    </div>
                    <div style={{ padding: 8 }}>
                        {listData.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {listData.map((item, idx) => renderAppointmentItem(item, idx))}
                            </ul>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Trống</Text>
                            </div>
                        )}
                    </div>
                 </div>
               </Col>
             );
           })}
         </Row>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1; 
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8; 
        }
      `}</style>

      <DoctorHeader selectedKey="1" />

      <Content style={{ padding: "30px 40px" }}>
        
        <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Tổng quan hoạt động</Title>
            <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Row gutter={[24, 24]}>
                  {statsData.map((stat, index) => (
                      <Col xs={24} sm={12} key={index}>
                          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: '100%',cursor: stat.clickable ? 'pointer' : 'default' }} 
                                onClick={stat.onClick ? stat.onClick : undefined} 
                                hoverable={stat.clickable}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                      <Text type="secondary" style={{ fontSize: 14 }}>{stat.title}</Text>
                                      
                                      <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                          <Text strong style={{ fontSize: 28 }}>{stat.value}</Text>
                                          <Text type="secondary" style={{ fontSize: 14 }}>{stat.suffix}</Text>
                                      </div>

                                      <div style={{ marginTop: 8 }}>
                                          {stat.progress !== undefined && (
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginTop: 8 }}>
                                                  <Progress 
                                                      percent={stat.progress} 
                                                      showInfo={false} 
                                                      size="small" 
                                                      strokeColor={stat.color} 
                                                      style={{ margin: 0, flex: 1 }} 
                                                  />
                                                  <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                                                      {stat.progressDetail}
                                                  </Text>
          
                                              </div>
                                          )}

                                          {stat.trend && (
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                  <span style={{ 
                                                      color: stat.trend === 'up' ? '#52c41a' : '#ff4d4f', 
                                                      background: stat.trend === 'up' ? '#f6ffed' : '#fff1f0',
                                                      padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                                                      display: 'flex', alignItems: 'center', gap: 2
                                                  }}>
                                                      {stat.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                                      {stat.trendValue}
                                                  </span>
                                                  <Text type="secondary" style={{ fontSize: 12 }}>{stat.subText}</Text>
                                              </div>
                                          )}
                                          {!stat.progress && !stat.trend && stat.subText && (
                                              <Text type="secondary" style={{ fontSize: 12 }}>{stat.subText}</Text>
                                          )}
                                      </div>
                                  </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 12 }}>
                                  <div style={{ 
                                      width: 48, height: 48, 
                                      background: stat.bg, borderRadius: 12, 
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                      fontSize: 24, color: stat.color,
                                      marginLeft: 12,
                                      marginBottom: 24
                                  }}>
                                      {stat.icon}
                                  </div>
                                  {stat.progress !== undefined && (
                                          <Text  strong style={{ color: stat.color, marginTop: 6, fontSize: 14 }}>
                                              {stat.progress}%
                                          </Text>
                                      )}
                                  </div>
                              </div>
                          </Card>
                      </Col>
                  ))}
              </Row>
            </Col>

            <Col xs={24} lg={8}>
                <Card 
                    title={`Tỷ lệ bệnh lý tháng ${currentMonth}`} 
                    variant="borderless" 
                    style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: '100%' }}
                    styles={{ body: { padding: 0 } }} 
                >
                    <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={diseaseData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {diseaseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                
                                <Tooltip 
                                    formatter={(value, name, item) => [
                                        `${value}% (Số lượng: ${item.payload.count} ca)`, 
                                        'Tỷ lệ'
                                    ]} 
                                />

                                <Legend 
                                    verticalAlign="bottom" 
                                    height={60} 
                                    iconType="circle"
                                    formatter={(value) => {
                                        const MAX_LENGTH = 15; 
                                        const displayText = value.length > MAX_LENGTH 
                                            ? `${value.substring(0, MAX_LENGTH)}...` 
                                            : value;

                                        return (
                                            <AntdTooltip title={value} placement="bottom">
                                                <span style={{ color: '#595959', cursor: 'pointer' }}>
                                                    {displayText}
                                                </span>
                                            </AntdTooltip>
                                        );
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </Col>
            </Row>  
        </div>

        <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
            
            <Col xs={24} lg={16} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>Lịch làm việc</Title>
                        <Segmented 
                            options={[
                                { label: 'Tháng', value: 'month', icon: <CalendarOutlined /> }, 
                                { label: 'Tuần', value: 'week', icon: <TeamOutlined /> }, 
                            ]}
                            value={viewMode}
                            onChange={setViewMode}
                        />
                    </Space>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Badge status="warning" /><Text style={{ fontSize: 12 }}>Chờ khám</Text></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Badge status="success" /><Text style={{ fontSize: 12 }}>Đã khám</Text></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Badge status="processing" /><Text style={{ fontSize: 12 }}>Đang khám</Text></div>
                    </div>
                </div>
                <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} styles={{ body: { padding: 0, height: '100%' } }}>
                  <Spin spinning={loadingCalendar}>
                    {viewMode === 'month' ? (
                        <Calendar 
                            dateCellRender={dateCellRender}
                            monthCellRender={monthCellRender}
                            style={{ padding: 24, borderRadius: 16 }} 
                            value={currentDate}
                            onSelect={(newDate) => setCurrentDate(newDate)}
                            onPanelChange={(newDate) => setCurrentDate(newDate)}
                        />
                    ) : (
                        renderWeekView()
                    )}
                    </Spin>
                </Card>
            </Col>

            <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 32, marginBottom: 16 }}></div>
                <Card 
                    title={
                      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                          <ClockCircleOutlined style={{color: '#1677ff'}}/> 
                          <span>{isTodaySelected ? "Hàng đợi hôm nay" : `Hàng đợi ngày ${currentDate.format('DD/MM/YYYY')}`}</span>
                      </div>
                    }
                    variant="borderless"
                    extra={<a href="#" onClick={() => navigate('/doctor/appointments')}>Xem tất cả</a>}
                    style={{flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    styles={{ body: { padding: '0 16px 16px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }, header: { borderBottom: '1px solid #f0f0f0' } }}
                >
                  <Spin spinning={loadingWaiting} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="custom-scrollbar" style={{ maxHeight: '750px', overflowY: 'auto', paddingRight: 8, height: '100%' }}>
                            {waitingPatients.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={waitingPatients} 
                            renderItem={(item) => (
                                <List.Item 
                                    onClick={() => handlePatientClick(item)}
                                    style={{ 
                                        cursor: 'pointer', 
                                        padding: '12px', 
                                        borderRadius: '8px',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f7fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}

                                    actions={[
                                        (item.status !== 'EXAMINED' && item.status !== 'CANCELLED') ? (
                                            <Button 
                                                type="primary" 
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    handleStartConsultation(item);
                                                }}
                                                disabled={!isTodaySelected}
                                            >
                                                {item.status === 'EXAMINING' ? 'Tiếp tục khám' : 'Bắt đầu khám'}
                                            </Button>
                                        ) : null
                                    ]}
                                  > 
                                    <List.Item.Meta
                                        avatar={<Avatar style={{ backgroundColor: item.gender === 'MALE' ? '#1677ff' : '#f982be', color: '#fff'  }}>{item.name[0]}</Avatar>}
                                        title={<Text strong>{item.name}</Text>}
                                        description={
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{item.time} - {item.reason}</Text>
                                                <div>{renderStatusTag(item.status)}</div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                        ) : (
                          <Empty 
                              description="Không có lịch hẹn nào" 
                              image={Empty.PRESENTED_IMAGE_SIMPLE} 
                              style={{ margin: '40px 0' }}
                          />
                        )}
                      </div>
                  </Spin>
                </Card>
            </Col>
        </Row>
      </Content>

      <Modal
        title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#1677ff', fontSize: 20 }} /> 
                <span style={{ fontSize: 18 }}>Chi tiết ca khám</span>
            </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
            <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
            </Button>,
            <Button 
                key="examine" 
                type="primary" 
                onClick={() => {
                    setIsDetailModalOpen(false);
                    handleStartConsultation(selectedPatient);
                }}
                disabled={!isTodaySelected}
            >
                {selectedPatient?.status === 'EXAMINING' ? 'Tiếp tục khám' : 'Bắt đầu khám'}
            </Button>
        ]}
        centered
        width={500}
      >
        {selectedPatient && (
            <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
                    <Avatar 
                        size={64} 
                        style={{ backgroundColor: selectedPatient.status === 'processing' ? '#1677ff' : '#fde3cf', color: selectedPatient.status === 'processing' ? '#fff' : '#f56a00' }}
                    >
                        {selectedPatient.name[0]}
                    </Avatar>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>{selectedPatient.name}</Title>
                        <Space direction="vertical" size={2} style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>{selectedPatient.gender === 'MALE' ? 'Nam' : 'Nữ'} - {selectedPatient.age} tuổi</Text>
                        </Space>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#f5f7fa', padding: '16px', borderRadius: '8px' }}>
                    <Row>
                        <Col span={8}><Text type="secondary">Trạng thái:</Text></Col>
                        <Col span={16}>{renderStatusTag(selectedPatient.status)}</Col>
                    </Row>
                    <Row>
                        <Col span={8}><Text type="secondary">Thời gian hẹn:</Text></Col>
                        <Col span={16}><Text strong>{selectedPatient.time}</Text> ({currentDate.format('DD/MM/YYYY')})</Col>
                    </Row>
                    <Row>
                        <Col span={8}><Text type="secondary">Lý do khám:</Text></Col>
                        <Col span={16}><Text>{selectedPatient.reason}</Text></Col>
                    </Row>
                    <Row>
                        <Col span={8}><Text type="secondary">Ghi chú thêm:</Text></Col>
                        <Col span={16}><Text type="secondary" style={{ fontStyle: 'italic' }}>Bệnh nhân chưa cung cấp thêm thông tin chi tiết.</Text></Col>
                    </Row>
                </div>
            </div>
        )}
      </Modal>

      <Footer />
      
    </Layout>
  );
}