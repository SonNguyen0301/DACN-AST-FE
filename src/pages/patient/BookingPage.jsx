import { 
  Layout, Menu, Avatar, Typography, Card, Button,
  Space, List, Dropdown, Row, Col,
  Collapse, Checkbox, Spin, message, Input, Radio
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  CalendarOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  AppstoreOutlined,       
  UnorderedListOutlined  
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 
import { useState, useEffect } from 'react';

import { getDoctorsAPI } from '../../services/doctorService';
import useAuth from '../../hooks/useAuth';


const { Header, Content } = Layout; 
const { Title, Text , Paragraph} = Typography;
const { Panel } = Collapse;
const { Search } = Input;


export default function BookingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout(); 
    navigate('/login');
  };
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); 

  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const [searchKeyword, setSearchKeyword] = useState('');

  const [viewMode, setViewMode] = useState('list');

  const fetchDoctors = async () => {
    setLoading(true);
      try {
          const params = {
              page: currentPage,
              take: pageSize,
              sortDirection: 'DESC', 
          };

          if (selectedDepartments.length > 0) {
              params.department = selectedDepartments[0]; 
          }

          if (searchKeyword) {
              params.keyword = searchKeyword; 
          }

          const res = await getDoctorsAPI(params);
          
          if (res.data.data) {
              let dataArray = [];
              
              if (Array.isArray(res.data.data)) {
                  dataArray = res.data.data; 
              } else if (Array.isArray(res.data.data.data)) {
                  dataArray = res.data.data.data;
              } else if (Array.isArray(res.data.data.items)) {
                    dataArray = res.data.data.items;
                }

              setDoctors(dataArray);
              
              setTotalDoctors(res.data.data.meta.itemCount); 
          }
      } catch (error) {
          console.error("Lỗi lấy danh sách bác sĩ:", error);
          message.error("Không thể tải danh sách bác sĩ lúc này.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchDoctors();
  }, [currentPage, pageSize, selectedDepartments, searchKeyword]);  

  const handleDepartmentChange = (checkedValues) => {
      setSelectedDepartments(checkedValues);
      setCurrentPage(1); 
  };
  const handleSearch = (value) => {
      setSearchKeyword(value);
      setCurrentPage(1); 
  };

  const handleResetFilters = () => {
      setSelectedDepartments([]);
      setSearchKeyword('');
      setCurrentPage(1);
  };

  const menuItems = [
    { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          position: 'sticky', top: 0, zIndex: 1000
        }}
      >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
                   <img 
            src="/ASTCare1.png" 
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['3']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Thông tin cá nhân" },
            { key: "3", label: "Đặt lịch khám" },
            { key: "4", label: "Lịch khám của bản thân" },
          ]}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', flex: 1, justifyContent: 'center' }}
          onClick={({ key }) => {
            switch (key) {
              case "1": navigate('/patient/dashboard'); break;
              case "2": navigate('/patient/personal'); break;
              case "3": navigate('/patient/booking'); break;
              case "4": navigate('/patient/appointments'); break;
              default: break;
            }
          }}
        />
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#555' }} className="hide-on-mobile">{user.firstName + ' ' + user.lastName}</span>
            <Avatar size={36} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "40px 60px" }}>
        <Row gutter={[24, 24]}>
          
          <Col xs={24} md={8} lg={6} xl={5}>
            <div style={{ marginTop: 24 }}>
              <Search 
                  placeholder="Tìm kiếm theo tên bác sĩ..." 
                  allowClear 
                  onSearch={handleSearch} 
                  style={{ width: '100%', marginBottom: 16 }} 
              />
            </div>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong style={{ fontSize: 16 }}>Lọc</Text>
                <Button type="link" icon={<ReloadOutlined />} style={{ padding: 0 }} onClick={handleResetFilters}>
                  Xoá bộ lọc
                </Button>
              </div>
              <Collapse defaultActiveKey={['1']} ghost>
                <Panel header={<Text strong>Chuyên khoa</Text>} key="1">
                  <Checkbox.Group value={selectedDepartments} onChange={handleDepartmentChange} style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Checkbox value="dermatology">Da liễu</Checkbox>
                      <Checkbox value="cardiology">Tim mạch</Checkbox>
                      <Checkbox value="pediatrics">Nhi khoa</Checkbox>
                      <Checkbox value="gastroenterology">Tiêu hóa</Checkbox>
                      <Checkbox value="ent">Tai Mũi Họng</Checkbox>
                      <Checkbox value="orthopedics">Cơ Xương Khớp</Checkbox>
                    </Space>
                  </Checkbox.Group>
                </Panel>
              </Collapse>
            </div>
          </Col>

          <Col xs={24} md={16} lg={18} xl={19}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
              <Title level={4} style={{ marginBottom: 0 }}>
                Danh sách Bác sĩ ({totalDoctors})
              </Title>
              <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)} buttonStyle="solid">
                  <Radio.Button value="list"><UnorderedListOutlined /> Danh sách</Radio.Button>
                  <Radio.Button value="grid"><AppstoreOutlined /> Lưới</Radio.Button>
                </Radio.Group>
              </div>
            
            <Spin spinning={loading} size="large">
            <List
              grid={viewMode === 'list' ? { gutter: 16, column: 1 } : { gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }} 
              dataSource={doctors}
              pagination={{
                    current: currentPage,
                    pageSize: pageSize, 
                    total: totalDoctors,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    style: { textAlign: 'center', marginTop: 30 } 
                }}
              renderItem={(doctor) => (
                <List.Item style={{ height: viewMode === 'grid' ? '100%' : 'auto' }}>
                  <Card 
                    style={{ width: '100%', borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}
                    styles={{ body: { height: '100%' } }}
                    variant="borderless"
                    hoverable
                  >
                    {viewMode === 'list' ? (
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} sm={8} md={6} lg={4} style={{ textAlign: 'center' }}>
                        <Avatar size={{ xs: 100, sm: 120, md: 140, lg: 160 }} src={doctor.avatarUrl} icon={<UserOutlined />} />
                      </Col>
                      
                      <Col xs={24} sm={16} md={18} lg={20}>
                        <Title level={5} style={{ color: '#1677ff', cursor: 'pointer', margin: 0, fontSize: 20 }}>
                                {doctor.lastName} {doctor.firstName}
                            </Title>
                            <Space style={{ margin: '8px 0' }}>
                                <Text type="secondary" style={{ marginLeft: 8 }}>Mã BS: {doctor.doctorCode}</Text>
                            </Space>
                            
                            <Text strong style={{ display: 'block', marginTop: 10, fontSize: 15 }}>
                                <MedicineBoxOutlined style={{ color: '#1677ff', marginRight: 8 }}/> 
                                Khoa: {doctor.department == "dermatology" ? "Da liễu" : doctor.department == "cardiology" ? "Tim mạch" : doctor.department == "pediatrics" ? "Nhi khoa" : doctor.department == "gastroenterology" ? "Tiêu hóa" : doctor.department == "ent" ? "Tai Mũi Họng" : doctor.department == "orthopedics" ? "Cơ Xương Khớp" : doctor.department}
                            </Text>

                            <Paragraph type="secondary" style={{ marginTop: 10, marginBottom: 0 }}>
                                <InfoCircleOutlined style={{ marginRight: 8 }}/>
                                {doctor.experience || "Nhiều năm kinh nghiệm trong nghề."}
                            </Paragraph>

                            {doctor.description && (
                                <Paragraph type="secondary" style={{ marginTop: 4, fontStyle: 'italic' }}>
                                    {doctor.description}
                                </Paragraph>
                            )}
                        
                        <div style={{ marginTop: 16 }}>
                          <Button 
                            type="primary" 
                            icon={<CalendarOutlined />}
                            onClick={() => navigate(`/patient/booking/${doctor.id}`)}
                          >
                            Đặt khám ngay
                          </Button>
                        </div>
                      </Col>
                    </Row>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', textAlign: 'center' }}>
                            <Avatar size={100} src={doctor.avatarUrl} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
                            
                            <Title level={5} style={{ color: '#1677ff', margin: 0, fontSize: 18, minHeight: 44 }}>
                                {doctor.lastName} {doctor.firstName}
                            </Title>
                            
                            <Text type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>Mã BS: {doctor.doctorCode}</Text>
                            
                            <Text strong style={{ fontSize: 14, marginBottom: 8 }}>
                                <MedicineBoxOutlined style={{ color: '#1677ff', marginRight: 4 }}/> 
                                {doctor.department == "dermatology" ? "Da liễu" : doctor.department == "cardiology" ? "Tim mạch" : doctor.department == "pediatrics" ? "Nhi khoa" : doctor.department == "gastroenterology" ? "Tiêu hóa" : doctor.department == "ent" ? "Tai Mũi Họng" : doctor.department == "orthopedics" ? "Cơ Xương Khớp" : doctor.department}
                            </Text>

                            <Paragraph 
                                type="secondary" 
                                style={{ fontSize: 13, marginBottom: 16, flex: 1 }} 
                                ellipsis={{ rows: 2 }} 
                            >
                                {doctor.experience || "Nhiều năm kinh nghiệm trong nghề."}
                            </Paragraph>

                            <Button 
                                type="primary" 
                                icon={<CalendarOutlined />}
                                onClick={() => navigate(`/patient/booking/${doctor.id}`)}
                                style={{ width: '100%', borderRadius: 8 }}
                            >
                                Đặt khám
                            </Button>
                        </div>
                    )}
                  </Card>
                </List.Item>
              )}
            />
            </Spin>
          </Col>
        </Row>
      </Content>
      
      <Footer /> 

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>

      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}