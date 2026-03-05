import { 
  Layout, Menu, Avatar, Typography, Card, Button,
  Space, List, Dropdown, Row, Col,
  Collapse, Checkbox, Rate, Spin, message, Input 
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  CalendarOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 
import { useState, useEffect } from 'react';

import { getDoctorsAPI } from '../../services/doctorService';
import useAuth from '../../hooks/useAuth';


const { Header, Content, Sider } = Layout;
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
  const fetchDoctors = async () => {
    setLoading(true);
    // console.log("Fetching doctors with params:", { currentPage, pageSize, selectedDepartments, searchKeyword });
      try {
          const params = {
              page: currentPage,
              take: pageSize,
              sortDirection: 'DESC', 
          };

          // Nếu có chọn chuyên khoa thì gửi lên (API đang nhận chuỗi string)
          if (selectedDepartments.length > 0) {
              // Tạm thời lấy chuyên khoa đầu tiên nếu API chỉ hỗ trợ 1, hoặc join(',') nếu hỗ trợ mảng
              params.department = selectedDepartments[0]; 
          }

          if (searchKeyword) {
              params.keyword = searchKeyword; 
          }

          const res = await getDoctorsAPI(params);
        //  console.log("API response for doctors:", res);
          
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
              
              setTotalDoctors(res.data.data.total || res.data.data.totalItems || dataArray.length || 0); 
          }
      } catch (error) {
          console.error("Lỗi lấy danh sách bác sĩ:", error);
          message.error("Không thể tải danh sách bác sĩ lúc này.");
      } finally {
          setLoading(false);
      }
  };

  // --- SỬA: Gọi API mỗi khi page, pageSize hoặc filter thay đổi ---
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
          style={{ fontSize: 16, fontWeight: 500, color: '#555' }}
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
            <span style={{ fontSize: 16, fontWeight: 500, color: '#555' }}>{user.firstName + ' ' + user.lastName}</span>
            <Avatar size={36} icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "40px 60px" }}>
        <Layout style={{ background: '#f5f7fa' }}>
          
          <Sider width={280} theme="light" style={{ background: '#f5f7fa', paddingRight: 24 }}>
            <div style={{ marginTop: 24 }}>
              <Search 
                    placeholder="Tìm kiếm theo tên bác sĩ..." 
                    allowClear 
                    onSearch={handleSearch} 
                    style={{ width: 250, marginBottom: 16 }} 
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
                      <Checkbox value="Da liễu">Da liễu</Checkbox>
                      <Checkbox value="Tim mạch">Tim mạch</Checkbox>
                      <Checkbox value="Nhi khoa">Nhi khoa</Checkbox>
                      <Checkbox value="Tiêu hóa">Tiêu hóa</Checkbox>
                      <Checkbox value="Tai Mũi Họng">Tai Mũi Họng</Checkbox>
                      <Checkbox value="Cơ Xương Khớp">Cơ Xương Khớp</Checkbox>
                    </Space>
                  </Checkbox.Group>
                </Panel>
                {/* <Panel header={<Text strong>Giới tính bác sĩ</Text>} key="2">
                   
                  <Checkbox.Group>
                    <Space direction="vertical">
                      <Checkbox value="MALE">Nam</Checkbox>
                      <Checkbox value="FEMALE">Nữ</Checkbox>
                    </Space>
                  </Checkbox.Group>
                </Panel> */}
              </Collapse>
            </div>
            

          </Sider>

          <Content>
            <Title level={4} style={{ marginBottom: 16 }}>
              Danh sách Bác sĩ ({totalDoctors})

            </Title>
            <Spin spinning={loading} size="large">
            <List
              grid={{ gutter: 16, column: 1 }} 
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
                <List.Item>
                  <Card 
                    style={{ width: '100%', borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    variant="borderless"
                  >
                    <Row gutter={16}>
                      <Col span={4} style={{ textAlign: 'center' }}>
                        <Avatar size={160} src={doctor.avatarUrl} icon={<UserOutlined />} />
                      </Col>
                      
                      <Col span={20}>
                        <Title level={5} style={{ color: '#1677ff', cursor: 'pointer', margin: 0, fontSize: 20 }}>
                                {doctor.lastName} {doctor.firstName}
                            </Title>
                            <Space style={{ margin: '8px 0' }}>
                                {/* API không có rating, tạm thời để mặc định 5 sao cho đẹp giao diện */}
                                <Rate disabled defaultValue={5} style={{ fontSize: 14 }} />
                                <Text type="secondary" style={{ marginLeft: 8 }}>Mã BS: {doctor.doctorCode}</Text>
                            </Space>
                            
                            <Text strong style={{ display: 'block', marginTop: 10, fontSize: 15 }}>
                                <MedicineBoxOutlined style={{ color: '#1677ff', marginRight: 8 }}/> 
                                Khoa: {doctor.department}
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
                  </Card>
                </List.Item>
              )}
            />
            </Spin>
          </Content>
        </Layout>
      </Content>
      
      <Footer /> 

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>
    </Layout>
  );
}