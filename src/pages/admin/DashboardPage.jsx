import { useEffect, useMemo, useState } from "react";
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
  Dropdown, 
  Select,
  Spin,
  Empty,
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  ApiOutlined,
  RiseOutlined,
  FallOutlined,
  MessageOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Footer from "../../components/common/Footer"; 
import adminService from "../../services/adminService";
import DoctorPatientsDrawer from "./components/DoctorPatientsDrawer";
import MonthlyDiseasesChart from "./components/MonthlyDiseasesChart";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  
  const user = { name: "Administrator", role: "admin" };

  const menuItems = [
    { 
      key: 'dashboard', 
      label: 'Trang chủ', 
    },
    { 
      key: 'users', 
      label: 'Quản lý tài khoản', 
    },
    { 
      key: 'AI', 
      label: 'Quản lý Model AI', 
    },
  ];

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [topLimit, setTopLimit] = useState(5);
  const [loadingDoctorStats, setLoadingDoctorStats] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [topDoctors, setTopDoctors] = useState([]);
  const [departmentDistribution, setDepartmentDistribution] = useState([]);
  const [topDiseases, setTopDiseases] = useState([]);
  const [loadingDiseases, setLoadingDiseases] = useState(false);
  
  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDoctorForDrawer, setSelectedDoctorForDrawer] = useState(null);

  const [totalExaminations, setTotalExaminations] = useState(0);
  const [systemOverview, setSystemOverview] = useState({
    totalAiUsage: 0,
    aiUsageGrowth: 0,
    totalExaminations: 0,
    examinationGrowth: 0,
    newPatients: 0,
    patientGrowth: 0,
    chatbotUsage: 0,
    chatbotUsageGrowth: 0,
  });

  const DEPARTMENT_LABELS = {
    dermatology: 'Da liễu',
    general_medicine: 'Đa khoa',
    endocrinology: 'Nội tiết',
    ent: 'Tai mũi họng',
    gastroenterology: 'Tiêu hoá',
    cardiology: 'Tim mạch',
    dentomaxillofacial: 'Răng hàm mặt',
    ophthalmology: 'Mắt',
  };

  const PIE_COLORS = ['#1677ff', '#52c41a', '#faad14', '#13c2c2', '#722ed1', '#eb2f96', '#2f54eb', '#fa8c16'];

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => ({
      value: index + 1,
      label: `Tháng ${index + 1}`,
    })),
    [],
  );

  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 6 }, (_, index) => {
      const year = currentYear - index;
      return { value: year, label: `${year}` };
    });
  }, [now]);

  const topLimitOptions = [
    { value: 5, label: 'Top 5' },
    { value: 10, label: 'Top 10' },
    { value: 20, label: 'Top 20' },
    { value: 50, label: 'Top 50' },
  ];

  const toDepartmentLabel = (departmentCode) => DEPARTMENT_LABELS[departmentCode] || departmentCode || 'Khác';

  const fetchDoctorPerformance = async () => {
    setLoadingDoctorStats(true);
    try {
      const response = await adminService.getDoctorPerformanceStatistics({
        month: selectedMonth,
        year: selectedYear,
        limit: topLimit,
      });
      const payload = response.data?.data || response.data || {};

      const doctors = (payload.topDoctors || []).map((item, index) => ({
        key: item.doctorId || `${item.doctorName}-${index}`,
        name: item.doctorName,
        dept: toDepartmentLabel(item.department),
        patients: item.totalExaminations,
        uniquePatients: item.uniquePatients,
        aiUsageRate: item.aiUsageRate,
      }));

      const distribution = (payload.departmentDistribution || []).map((item, index) => ({
        name: toDepartmentLabel(item.department),
        value: item.totalExaminations,
        percentage: item.percentage,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }));

      setTopDoctors(doctors);
      setDepartmentDistribution(distribution);
      setTotalExaminations(payload.totalExaminations || 0);
    }
    catch (error) {
      setTopDoctors([]);
      setDepartmentDistribution([]);
      setTotalExaminations(0);
    }
    finally {
      setLoadingDoctorStats(false);
    }
  };

  const fetchSystemOverview = async () => {
    setLoadingOverview(true);
    try {
      const response = await adminService.getSystemOverview({
        month: selectedMonth,
        year: selectedYear,
      });
      const data = response.data?.data || response.data || {};
      setSystemOverview({
        totalAiUsage: data.totalAiUsage || 0,
        aiUsageGrowth: data.aiUsageGrowth || 0,
        totalExaminations: data.totalExaminations || 0,
        examinationGrowth: data.examinationGrowth || 0,
        newPatients: data.newPatients || 0,
        patientGrowth: data.patientGrowth || 0,
        chatbotUsage: data.chatbotUsage || 0,
        chatbotUsageGrowth: data.chatbotUsageGrowth || 0,
      });
    } catch (error) {
      console.error('Error fetching system overview:', error);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchTopDiseases = async () => {
    setLoadingDiseases(true);
    try {
      const response = await adminService.getTopDiseases({ month: selectedMonth, year: selectedYear });
      setTopDiseases(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching top diseases:", error);
    } finally {
      setLoadingDiseases(false);
    }
  };

  useEffect(() => {
    fetchSystemOverview();
    fetchTopDiseases();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDoctorPerformance();
  }, [selectedMonth, selectedYear, topLimit]);

  const getTrendType = (growth) => {
    if (growth > 0) return "up";
    if (growth < 0) return "down";
    return "stable";
  };

  const getTrendIcon = (growth) => {
    if (growth > 0) return <RiseOutlined />;
    if (growth < 0) return <FallOutlined />;
    return null;
  };

  const statsData = [
    {
      title: "Sử dụng Chatbot (Bệnh nhân)",
      value: systemOverview.chatbotUsage,
      prefix: <MessageOutlined />,
      color: "#722ed1",
      bg: "#f9f0ff",
      trend: getTrendType(systemOverview.chatbotUsageGrowth),
      trendVal: `${Math.abs(systemOverview.chatbotUsageGrowth)}%`
    },
    {
      title: "Bệnh nhân mới",
      value: systemOverview.newPatients,
      prefix: <TeamOutlined />,
      color: "#faad14",
      bg: "#fffbe6",
      trend: getTrendType(systemOverview.patientGrowth),
      trendVal: `${Math.abs(systemOverview.patientGrowth)}%`
    },
    {
      title: "Tổng lượt khám",
      value: systemOverview.totalExaminations,
      prefix: <MedicineBoxOutlined />,
      color: "#52c41a",
      bg: "#f6ffed",
      trend: getTrendType(systemOverview.examinationGrowth),
      trendVal: `${Math.abs(systemOverview.examinationGrowth)}%`
    },
    {
      title: "Lượt dùng AI chẩn đoán (Bác sĩ)",
      value: systemOverview.totalAiUsage,
      prefix: <ApiOutlined />,
      color: "#1677ff",
      bg: "#e6f4ff",
      trend: getTrendType(systemOverview.aiUsageGrowth),
      trendVal: `${Math.abs(systemOverview.aiUsageGrowth)}%`
    },
  ];

  const columns = [
    {
      title: 'Bác sĩ',
      dataIndex: 'name',
      width: 200,
      render: (text, record) => (
        <a onClick={() => {
          setSelectedDoctorForDrawer(record);
          setDrawerOpen(true);
        }}>
          <Text strong style={{ color: '#1677ff', cursor: 'pointer' }}>{text}</Text>
        </a>
      )
    },
    {
      title: 'Chuyên khoa',
      dataIndex: 'dept',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Lượt khám',
      dataIndex: 'patients',
      width: 120,
      sorter: (a, b) => a.patients - b.patients,
    },
    {
      title: 'Số người khám',
      dataIndex: 'uniquePatients',
      width: 160,
    },
    {
      title: 'Tỷ lệ dùng AI',
      dataIndex: 'aiUsageRate',
      width: 130,
      render: (rate) => <Text strong>{rate}%</Text>
    },
  ];

  const handleSignOut = () => navigate('/');

  const menuUserItems = [
    { key: '1', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  const handleMenuClick = ({ key }) => {
    switch (key) {
        case 'dashboard': navigate('/admin/dashboard'); break;
        case 'users': navigate('/admin/user-management'); break;
        case 'AI': navigate('/admin/model-ai'); break;
        default: break;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
        
        <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>
                <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
            </div>

            <Menu
                mode="horizontal"
                defaultSelectedKeys={['dashboard']}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ 
                    fontSize: 15, 
                    fontWeight: 500, 
                    color: '#555', 
                    borderBottom: 'none', 
                    flex: 1, 
                    justifyContent: 'center',
                    marginLeft: 20
                }}
            />

            <Dropdown menu={{ items: menuUserItems }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
                    <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.name}</span>
                        <span style={{ fontSize: 12, color: '#888' }}>Quản trị hệ thống</span>
                    </div>
                    <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#001529' }} />
                </div>
            </Dropdown>
        </Header>

        <Content style={{ padding: "30px 40px" }}>
            
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>Tổng quan hệ thống</Title>
                <Row gutter={[24, 24]}>
                    {statsData.map((stat, index) => (
                        <Col xs={24} sm={12} xl={6} key={index}>
                            <Card variant="borderless" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 13 }}>{stat.title}</Text>
                                        <Title level={3} style={{ margin: '4px 0' }}>{stat.value}</Title>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Tag color={stat.trend === 'up' ? 'green' : stat.trend === 'down' ? 'red' : 'default'} style={{ margin: 0 }}>
                                                {stat.trend === 'up' ? <RiseOutlined /> : stat.trend === 'down' ? <FallOutlined /> : '-'} {stat.trendVal}
                                            </Tag>
                                            <Text type="secondary" style={{ fontSize: 12 }}>so với tháng trước</Text>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        width: 48, height: 48, 
                                        background: stat.bg, borderRadius: 12, 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontSize: 24, color: stat.color 
                                    }}>
                                        {stat.prefix}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <Row gutter={[24, 24]} align="stretch">
                
                <Col xs={24} lg={16}>
                    <Card 
                        title={
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, width: '100%' }}>
                                <span style={{ whiteSpace: 'normal', wordBreak: 'break-word', flex: 1, minWidth: '200px' }}>
                                    Top bác sĩ có lượt khám cao nhất - Tháng {selectedMonth}/{selectedYear}
                                </span>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <Select
                                        value={topLimit}
                                        style={{ width: 100 }}
                                        options={topLimitOptions}
                                        onChange={setTopLimit}
                                    />
                                    <Select
                                        value={selectedMonth}
                                        style={{ width: 120 }}
                                        options={monthOptions}
                                        onChange={setSelectedMonth}
                                    />
                                    <Select
                                        value={selectedYear}
                                        style={{ width: 100 }}
                                        options={yearOptions}
                                        onChange={setSelectedYear}
                                    />
                                </div>
                            </div>
                        }
                        variant="borderless" 
                        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: '100%', display: 'flex', flexDirection: 'column' }}
                        styles={{ body: { flex: 1, padding: 0 } }} 
                    >
                    <Table
                      loading={loadingDoctorStats}
                      columns={columns}
                      dataSource={topDoctors}
                      pagination={false}
                      size="middle"
                      scroll={{ y: 380, x: 800 }}
                      locale={{ emptyText: 'Không có dữ liệu khám trong tháng đã chọn' }}
                      style={{ padding: '0 24px 24px 24px' }}
                    />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card 
                        title="Phân bổ kết quả khám theo chuyên khoa" 
                        variant="borderless" 
                        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: '100%' }}
                    >
                    {loadingDoctorStats ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                        <Spin />
                      </div>
                    ) : departmentDistribution.length === 0 ? (
                      <Empty description="Không có dữ liệu" />
                    ) : (
                      <>
                        <div style={{ width: '100%', height: 280 }}>
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={departmentDistribution}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={50}
                                outerRadius={95}
                                paddingAngle={2}
                              >
                                {departmentDistribution.map((entry, index) => (
                                  <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value, name, props) => [
                                `${value} ca`,
                                `${name} (${props?.payload?.percentage ?? 0}%)`,
                              ]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                          {departmentDistribution.map((item) => (
                            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>{item.name}</Text>
                              <Text strong>{item.value} ca ({item.percentage}%)</Text>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} align="stretch" style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card 
                        title={`Top 10 Bệnh lý phổ biến nhất - Tháng ${selectedMonth}/${selectedYear}`}
                        variant="borderless" 
                        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: '100%' }}
                    >
                        <MonthlyDiseasesChart data={topDiseases} loading={loadingDiseases} />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card 
                        title="Tỷ lệ Đồng thuận AI" 
                        variant="borderless" 
                        style={{ borderRadius: 12, height: '100%', boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    >
                        <div style={{ display: 'flex', height: '100%', minHeight: 300, justifyContent: 'center', alignItems: 'center' }}>
                            <Text type="secondary">Đang thiết kế tính năng...</Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Content>        
        <Footer />

        <DoctorPatientsDrawer 
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          doctor={selectedDoctorForDrawer}
          month={selectedMonth}
          year={selectedYear}
        />

        <style>{`
          @media (max-width: 576px) {
            .hide-on-mobile { display: none !important; }

            .ant-card-head-title {
              white-space: normal !important;
            }
          }
        `}</style>
    </Layout>
  );
}