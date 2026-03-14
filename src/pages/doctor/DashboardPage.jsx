
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Dropdown,
  Calendar,
  List,
  Tag,
  Button,
  Popover, 
  Segmented, 
  Space,
  Empty,
  Modal
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
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
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function DoctorDashboardPage() {
  const navigate = useNavigate();

  const diseaseData = [
    { name: 'Mụn trứng cá', value: 45 },
    { name: 'Viêm da cơ địa', value: 25 },
    { name: 'Nấm da', value: 15 },
    { name: 'Vảy nến', value: 10 },
    { name: 'Khác', value: 5 },
  ];

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const canceledPatients = [
    { id: 1, name: "Hoàng Thị M", time: "14:00 - 14:30" },
    { id: 2, name: "Đinh Văn N", time: "15:30 - 16:00" },
  ];

  const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#9e9e9e'];

  const [viewMode, setViewMode] = useState('month'); 
  const [currentDate, setCurrentDate] = useState(dayjs());
  
  const user = { name: "BS. CK2 Trần Thị Hoa", role: "doctor" };

  const getWaitingPatients = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const todayStr = dayjs().format('YYYY-MM-DD');

    if (dateStr === todayStr) {
        return [
            { id: 1, name: "Nguyễn Văn A", time: "09:00 - 09:30", status: "processing", reason: "Dị ứng da mặt" },
            { id: 2, name: "Trần Thị B", time: "09:30 - 10:00", status: "waiting", reason: "Tái khám mụn" },
            { id: 3, name: "Lê Văn C", time: "10:00 - 10:30", status: "waiting", reason: "Ngứa phát ban" },
            { id: 4, name: "Phạm Thị D", time: "10:30 - 11:00" , status: "waiting", reason: "Tư vấn thẩm mỹ" },
            { id: 5, name: "Đào Văn E", time: "11:00 - 11:30", status: "waiting", reason: "Viêm da cơ địa" },
            { id: 6, name: "Ngô F", time: "11:30 - 12:00", status: "waiting", reason: "Nấm da chân" },
            { id: 7, name: "Vũ Thị G", time: "13:00 - 13:30", status: "waiting", reason: "Khám tổng quát" },
            { id: 8, name: "Trịnh Văn H", time: "13:30 - 14:00", status: "waiting", reason: "Mụn trứng cá" },
            { id: 9, name: "Lý Thị I", time: "14:00 - 14:30", status: "waiting", reason: "Rụng tóc" },
            { id: 10, name: "Hoàng Văn K", time: "14:30 - 15:00", status: "waiting", reason: "Khám da liễu" },
        ];
    }

    const day = date.date();
    if (day % 2 === 0) { 
        return [
            { id: 11, name: "Nguyễn Văn M", time: "08:00 - 08:30", status: "waiting", reason: "Khám viêm da" },
            { id: 12, name: "Dương Thị N", time: "09:30 - 10:00", status: "waiting", reason: "Tái khám nấm da" },
            { id: 13, name: "Bạch Xuân L", time: "14:00 - 14:30", status: "waiting", reason: "Dị ứng phấn hoa" }
            
        ];
    } else if (day % 3 === 0) { 
        return [
            { id: 13, name: "Bạch Xuân L", time: "14:00 - 14:30", status: "waiting", reason: "Dị ứng phấn hoa" }
        ];
    }
    
    return []; 
};

const currentWaitingPatients = getWaitingPatients(currentDate);
const isTodaySelected = currentDate.isSame(dayjs(), 'day');

const statsData = [
    { 
      title: "Bệnh nhân hôm nay", 
      value: 8, 
      suffix: "ca",
      icon: <ClockCircleOutlined />, 
      color: "#1677ff", 
      bg: "#e6f4ff", 
      progress: Math.round((5/8) * 100), 
      progressDetail: "Đã khám: 5/8 ca", 
    },
    { 
      title: "Bệnh nhân tuần này", 
      value: 42, 
      suffix: "người",
      icon: <TeamOutlined />, 
      color: "#52c41a", 
      bg: "#f6ffed", 
      trend: "up",
      trendValue: "15%",
      subText: "So với tuần trước"
    },
    { 
      title: "Tổng khám tháng này", 
      value: 156, 
      suffix: "lượt",
      icon: <RiseOutlined />, 
      color: "#722ed1", 
      bg: "#f9f0ff", 
      trend: "down",
      trendValue: "5%",
      subText: "So với tháng trước"
    },
    { 
      title: "Lịch bị hủy", 
      value: 2, 
      suffix: "ca",
      icon: <UserDeleteOutlined />, 
      color: "#ff4d4f", 
      bg: "#fff1f0", 
      subText: "Trống lịch lúc 14:00 và 15:30",
      clickable: true, 
      onClick: () => setIsCancelModalOpen(true)
    },
  ];

  const getListData = (value) => {
    const patients = getWaitingPatients(value);
    return patients.map(p => {
        let type = 'success'; 
        if (p.status === 'processing' || p.status === 'waiting') type = 'warning';
        return { 
            type, 
            content: `${p.time.split(' - ')[0]} - ${p.name}`, 
            reason: p.reason 
        };
    });
  };

  const renderAppointmentItem = (item, index) => {
    const patientName = item.content.includes('-') ? item.content.split('-')[1].trim() : item.content;
    const popoverContent = (
      <div style={{ width: 280 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
           <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: item.type === 'success' ? '#87d068' : '#1677ff' }} />
           <div>
              <Text strong style={{ display: 'block', fontSize: 16 }}>{patientName}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>Nam - 32 tuổi • {index % 2 === 0 ? 'Bệnh nhân mới' : 'Tái khám'}</Text>
           </div>
        </div>
        <div style={{ background: '#f5f7fa', padding: 10, borderRadius: 8, marginBottom: 12 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <FileTextOutlined style={{ color: '#1677ff' }} /> <Text strong style={{ fontSize: 12 }}>Lý do khám:</Text>
           </div>
           <Text style={{ fontSize: 13, color: '#555' }}>Dị ứng da mặt, ngứa nhiều về đêm, đã dùng thuốc bôi nhưng không đỡ.</Text>
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
    const listData = getListData(value);
    const hasMore = listData.length > 3;
    const displayData = hasMore ? listData.slice(0, 2) : listData;
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

  const renderStatusTag = (status) => {
    switch(status) {
      case 'processing': return <Tag color="processing" icon={<ClockCircleOutlined />}>Đang khám</Tag>;
      case 'waiting': return <Tag color="warning">Đang chờ</Tag>;
      default: return <Tag>N/A</Tag>;
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
                 <div style={{ 
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

  const handleSignOut = () => {
      console.log("Đã đăng xuất!");
      navigate('/');
  };

  const menuUserItems = [
    {
      key: '1',
      label: (<a onClick={() => navigate('/doctor/profile')}>Hồ sơ bác sĩ</a>),
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

      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/doctor/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" },
            { key: "3", label: "Khám bệnh" },
          ]}
          onClick ={({ key }) => {
            switch (key) {
              case "1": navigate('/doctor/dashboard'); break;
              case "2": navigate('/doctor/appointments'); break;
              case "3": navigate('/doctor/consulting'); break;
              default: break;
            }
          }}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
        />
         <Dropdown menu={{ items: menuUserItems }} placement="bottomRight" arrow>
           <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                 <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.name}</span>
                 <span style={{ fontSize: 12, color: '#888' }}>Khoa Da liễu</span>
             </div>
             <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
           </div>
         </Dropdown>
      </Header>

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
                        title="Tỷ lệ bệnh lý tháng 11" 
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
                                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
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
                    </div>
                </div>
                <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} styles={{ body: { padding: 0, height: '100%' } }}>
                    {viewMode === 'month' ? (
                        <Calendar 
                            cellRender={dateCellRender} 
                            style={{ padding: 24, borderRadius: 16 }} 
                            value={currentDate}
                            onSelect={setCurrentDate}
                            onPanelChange={(date) => setCurrentDate(date)}
                        />
                    ) : (
                        renderWeekView()
                    )}
                </Card>
            </Col>

            <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 32, marginBottom: 16 }}></div>
                <Card 
                    title={
                      <div style={{display: 'flex', alignItems: 'center', gap: 8}}><ClockCircleOutlined style={{color: '#1677ff'}}/> 
                      <span>{isTodaySelected ? "Hàng đợi hôm nay" : `Hàng đợi ngày ${currentDate.format('DD/MM/YYYY')}`}</span>
                      </div>
                    }
                    variant="borderless"
                    extra={<a href="#" onClick={() => navigate('/doctor/appointments')}>Xem tất cả</a>}
                    style={{flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    styles={{ body: { padding: '0 16px 16px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }, header: { borderBottom: '1px solid #f0f0f0' } }}
                >
                  <div className="custom-scrollbar" style={{ maxHeight: '750px', overflowY: 'auto', paddingRight: 8,  }}>
                        {currentWaitingPatients.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={currentWaitingPatients}
                        renderItem={(item) => (
                            <List.Item > 
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: item.status === 'processing' ? '#1677ff' : '#fde3cf', color: item.status === 'processing' ? '#fff' : '#f56a00' }}>{item.name[0]}</Avatar>}
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
                </Card>
            </Col>
        </Row>
      </Content>

      <Modal
        title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserDeleteOutlined style={{ color: '#ff4d4f', fontSize: 20 }} /> 
                <span style={{ fontSize: 18 }}>Danh sách ca khám bị hủy</span>
            </div>
        }
        open={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        footer={[
            <Button key="close" onClick={() => setIsCancelModalOpen(false)}>
                Đóng
            </Button>
        ]}
        centered
      >
        <List
            itemLayout="horizontal"
            dataSource={canceledPatients}
            renderItem={(item) => (
                <List.Item>
                    <List.Item.Meta
                        avatar={<Avatar style={{ backgroundColor: '#fff1f0', color: '#ff4d4f' }}>{item.name[0]}</Avatar>}
                        title={<Text strong>{item.name}</Text>}
                        description={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 13 }}><ClockCircleOutlined /> Khung giờ: {item.time}</Text>
                            </div>
                        }
                    />
                </List.Item>
            )}
        />
      </Modal>

      <Footer />
      
    </Layout>
  );
}