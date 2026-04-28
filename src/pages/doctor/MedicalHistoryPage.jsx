import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Row, Col, Card, Table, 
  Tag, Space, Button, Input, DatePicker, Select, Dropdown, 
  Tooltip, Modal, Descriptions, Divider, message, List,
  Spin, Image
} from "antd";
import { 
  UserOutlined, LogoutOutlined, SearchOutlined, EyeOutlined, 
  MedicineBoxOutlined,
  FileTextOutlined, RobotOutlined, CheckCircleOutlined, PhoneOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import Footer from "../../components/common/Footer"; 
import { getConsultationHistoryAPI, getConsultationDetailAPI } from '../../services/doctorService'; 
import useAuth from "../../hooks/useAuth";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker; 

export default function DoctorMedicalHistoryPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
  const [sortDirection, setSortDirection] = useState('DESC');
  
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, showSizeChanger: false });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false); 

  const fetchHistory = async (page = 1) => {
      setLoading(true);
      try {
          const params = {
              page: page,
              take: pagination.pageSize,
              sort: 'createdAt', 
              sortDirection: sortDirection
          };

          if (searchText) params.keyword = searchText;
          
          if (dateRange && dateRange[0] && dateRange[1]) {
              params.startDate = dateRange[0].startOf('day').toISOString();
              params.endDate = dateRange[1].endOf('day').toISOString();
          }

          const res = await getConsultationHistoryAPI(params); 
          
          if (res.data?.success) {
              const rawData = res.data.data.data || res.data.data; 
              
              const mappedData = rawData.map((item, index) => {
                  const fromTime = item.startTime ? item.startTime.substring(0, 5) : '';
                  const toTime = item.endTime ? item.endTime.substring(0, 5) : '';
                  const result = item.diagnosisResult || {};

                  return {
                      key: item.id || index.toString(), 
                      createdAt: item.createdAt,
                      time: `${fromTime} - ${toTime}`,
                      patientName: item.patientName,
                      aiSuggested: item.aiSuggestedDiagnosis,
                      diagnosis: result.description || 'Chưa cập nhật',
                      symptoms: result.symstomsText,
                      advices: result.advices,
                      feedBackAI: result.feedBackAI,
                      prescription: result.prescription || []
                  };
              });

              setHistoryList(mappedData);
              
              if (res.data.data.meta) {
                  setPagination((prev) => ({
                      ...prev,
                      current: res.data.data.meta.page,
                      total: res.data.data.meta.itemCount
                  }));
              }
          }
      } catch (error) {
          console.error("Lỗi lấy lịch sử khám:", error);
          message.error("Không thể tải lịch sử khám bệnh.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchHistory();
  }, []);

  const handleSearch = (val) => setSearchText(val.toLowerCase());
  const handleDateRangeChange = (dates) => setDateRange(dates);
  const handleSortChange = (val) => setSortDirection(val);
  const handleFilterClick = () => fetchHistory(1);
  const handleTableChange = (newPagination) => fetchHistory(newPagination.current);

  const handleViewDetail = async (record) => {
    setIsModalOpen(true);
    setSelectedRecord(record); 
    setDetailLoading(true);

    try {
        const res = await getConsultationDetailAPI(record.key); 
        
        if (res.data?.success && res.data?.data) {
            const data = res.data.data;
            const apt = data.appointment || {};
            const pat = data.patient || {};
            const result = data.diagnosisResult || {};

            const fromTime = apt.from ? apt.from.substring(0, 5) : '';
            const toTime = apt.to ? apt.to.substring(0, 5) : '';

            const imageUrls = apt.images 
                ? Object.values(apt.images)
                    .map((img) => typeof img === 'string' ? img : (img.base64 || img.dataUrl || img.url))
                    .filter(Boolean)
                : [];

            setSelectedRecord({
                ...record,
                patientName: pat.name || record.patientName,
                patientAge: pat.dateOfBirth ? dayjs().diff(dayjs(pat.dateOfBirth), 'year') : null,
                patientGender: pat.gender === 'MALE' ? 'Nam' : (pat.gender === 'FEMALE' ? 'Nữ' : null),
                patientPhone: pat.phoneNumber,
                time: fromTime && toTime ? `${fromTime} - ${toTime}` : record.time,
                createdAt: apt.date || record.createdAt,
                symptoms: result.symstomsText || record.symptoms,
                feedBackAI: result.feedBackAI || record.feedBackAI,
                diagnosis: result.description || record.diagnosis,
                advices: result.advices || record.advices,
                prescription: result.prescription || record.prescription || [],
                images: imageUrls
            });
        }
    } catch (error) {
        console.error("Lỗi lấy chi tiết ca khám:", error);
        message.error("Không thể tải chi tiết hồ sơ.");
    } finally {
        setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const columns = [
    {
        title: 'Ngày khám',
        dataIndex: 'createdAt',
        width: 130,
        render: (text) => (
            <Tag color="green" style={{ fontSize: 13, padding: '2px 8px' }}>
                {dayjs(text).format('DD/MM/YYYY')}
            </Tag>
        )
    },
    {
        title: 'Thời gian',
        dataIndex: 'time',
        width: 140,
        render: (text) => (
            <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>
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
          <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
          <Text strong>{record.patientName}</Text>
        </div>
      ),
    },
    {
      title: 'Chẩn đoán',
      dataIndex: 'diagnosis',
      render: (text) => <Text strong style={{ color: '#333' }}>{text}</Text>,
    },
    {
      title: 'Đơn thuốc',
      key: 'prescription',
      width: 120,
      render: (_, record) => (
          <Tag color={record.prescription.length > 0 ? "cyan" : "default"}>
              {record.prescription.length > 0 ? `${record.prescription.length} loại thuốc` : 'Không kê đơn'}
          </Tag>
      )
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết bệnh án">
          <Button 
              type="default" 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}  
          >
            Chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ];
  
  const handleSignOut = () => {logout(); navigate('/')};
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
          defaultSelectedKeys={['4']} 
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
             <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{"BS. "+ user?.firstName + " " + user?.lastName}</span>
                <span style={{ fontSize: 12, color: '#888' }}>Khoa Da liễu</span>
            </div>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "30px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>Lịch sử khám bệnh</Title>
          <Text type="secondary">Tra cứu danh sách các ca bệnh đã hoàn tất, xem lại chẩn đoán và đơn thuốc đã kê.</Text>
        </div>

        <Card variant="borderless" style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} md={8}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Khoảng thời gian (Ngày khám):</Text>
                    <RangePicker 
                        value={dateRange}
                        format="DD/MM/YYYY"
                        onChange={handleDateRangeChange}
                        style={{ width: '100%' }}
                        allowClear={true}
                    />
                </Col>
                <Col xs={24} md={8}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Tên bệnh nhân:</Text>
                    <Input 
                        placeholder="Nhập tên bệnh nhân cần tìm..." 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                        onChange={(e) => handleSearch(e.target.value)} 
                        onPressEnter={handleFilterClick}
                        allowClear 
                    />
                </Col>
                <Col xs={24} md={4}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Sắp xếp theo:</Text>
                    <Select value={sortDirection} style={{ width: '100%' }} onChange={handleSortChange}>
                        <Option value="DESC">Mới nhất trước</Option>
                        <Option value="ASC">Cũ nhất trước</Option>
                    </Select>
                </Col>
                <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<SearchOutlined />} style={{ marginTop: 22, width: '100%' }} onClick={handleFilterClick} loading={loading}>Tìm kiếm</Button>
                </Col>
            </Row>
        </Card>

        <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} styles={{ body: { padding: 0 } }}>
             <Table 
                columns={columns} 
                dataSource={historyList} 
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
                <FileTextOutlined style={{ color: '#1677ff', fontSize: 24 }} />
                <span style={{ fontSize: 20 }}>Chi tiết Hồ sơ Bệnh án</span>
            </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
            <Button key="close" type="primary" onClick={handleCloseModal}>Đóng</Button>
        ]}
        width={750}
        centered
      >
        <Spin spinning={detailLoading}>
            {selectedRecord && (
                <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Avatar 
                              size={80} 
                              icon={<UserOutlined />} 
                              style={{ 
                                backgroundColor: selectedRecord.patientGender === 'Nữ' ? '#eb2f96' : '#1677ff',
                                fontSize: 36
                              }} 
                          />
                          <div>
                              <Title level={4} style={{ margin: 0, marginBottom: 8 }}>{selectedRecord.patientName}</Title>
                              <Space direction="vertical" size={4}>
                                  <Text type="secondary" style={{ fontSize: 14 }}>
                                      <UserOutlined style={{ marginRight: 6 }}/> 
                                      Giới tính: {selectedRecord.patientGender || 'Không rõ'} 
                                      {selectedRecord.patientAge ? ` - ${selectedRecord.patientAge} tuổi` : ''}
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 14 }}>
                                      <PhoneOutlined style={{ marginRight: 6 }}/> 
                                      SĐT: {selectedRecord.patientPhone || 'Chưa cập nhật'}
                                  </Text>
                              </Space>
                          </div>
                      </div>

                    <Descriptions title="Nội dung Khám & Chẩn đoán" column={1} bordered size="small" labelStyle={{ width: '160px', fontWeight: 'bold', background: '#fafafa' }}>
                        <Descriptions.Item label="Triệu chứng">
                            {selectedRecord.symptoms || "Không ghi nhận triệu chứng"}
                        </Descriptions.Item>
                        
                        {selectedRecord.feedBackAI && (
                            <Descriptions.Item label={<span style={{ color: '#722ed1' }}><RobotOutlined /> AI Phân tích</span>}>
                                <Text style={{ color: '#722ed1', fontWeight: 500 }}>{selectedRecord.feedBackAI}</Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Chẩn đoán">
                            <Text strong style={{ color: '#cf1322', fontSize: 16 }}>{selectedRecord.diagnosis}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Lời khuyên">
                            {selectedRecord.advices || "Không có lời khuyên thêm"}
                        </Descriptions.Item>
                    </Descriptions>

                    {selectedRecord.images && selectedRecord.images.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <Title level={5} style={{ marginBottom: 12 }}>Hình ảnh đính kèm</Title>
                            <Image.PreviewGroup>
                                <Space size={8} wrap>
                                    {selectedRecord.images.map((img, idx) => {
                                        const validSrc = img.startsWith('http') || img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
                                        return <Image key={idx} width={60} height={60} src={validSrc} style={{ borderRadius: 6, objectFit: 'cover', border: '1px solid #f0f0f0' }} />
                                    })}
                                </Space>
                            </Image.PreviewGroup>
                        </div>
                    )}

                    <div style={{ marginTop: 24 }}>
                        <Title level={5} style={{ marginBottom: 12 }}><MedicineBoxOutlined /> Đơn thuốc chỉ định</Title>
                        {selectedRecord.prescription && selectedRecord.prescription.length > 0 ? (
                            <List
                                bordered
                                dataSource={selectedRecord.prescription}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<CheckCircleOutlined style={{ color: '#52c41a', marginTop: 4 }} />}
                                            title={<Text strong>{item.medicineName || item.name}</Text>}
                                            description={
                                                <Space split={<Divider type="vertical" />} wrap>
                                                    <span>Liều dùng: <Text strong>{item.dosage}</Text></span>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: 8, textAlign: 'center', color: '#999' }}>
                                Bác sĩ không kê đơn thuốc cho ca khám này.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Spin>
      </Modal>

      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}