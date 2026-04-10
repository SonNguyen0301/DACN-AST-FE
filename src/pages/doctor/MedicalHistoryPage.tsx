import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Row, Col, Card, Table, 
  Tag, Space, Button, Input, DatePicker, Select, Dropdown, 
  Tooltip, Modal, Descriptions, Divider, message, List 
} from "antd";
import { 
  UserOutlined, LogoutOutlined, SearchOutlined, EyeOutlined, 
  MedicineBoxOutlined, CalendarOutlined, ClockCircleOutlined,
  FileTextOutlined, RobotOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import Footer from "../../components/common/Footer"; 
import { getConsultationHistoryAPI } from '../../services/doctorService'; 

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker; 

export default function DoctorMedicalHistoryPage() {
  const navigate = useNavigate();
  
  const [searchText, setSearchText] = useState<string>('');
  const [dateRange, setDateRange] = useState<any>([dayjs().startOf('month'), dayjs()]);
  const [sortDirection, setSortDirection] = useState<string>('DESC');
  
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<any>({ current: 1, pageSize: 10, total: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const doctorInfo = { name: "BS. CK2 Trần Thị Hoa", specialty: "Da liễu" };

  const fetchHistory = async (page: number = 1) => {
      setLoading(true);
      try {
          const params: any = {
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
              
              const mappedData = rawData.map((item: any, index: any) => {
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
                  setPagination((prev: any) => ({
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

  const handleSearch = (val: any) => setSearchText(val.toLowerCase());
  const handleDateRangeChange = (dates: any) => setDateRange(dates);
  const handleSortChange = (val: any) => setSortDirection(val);
  const handleFilterClick = () => fetchHistory(1);
  const handleTableChange = (newPagination: any) => fetchHistory(newPagination.current);

  const handleViewDetail = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const columns: any[] = [
    {
        title: 'Ngày khám',
        dataIndex: 'createdAt',
        width: 130,
        render: (text: any) => (
            <Tag color="green" style={{ fontSize: 14 }}>
                {dayjs(text).format('DD/MM/YYYY')}
            </Tag>
        )
    },
    {
        title: 'Thời gian',
        dataIndex: 'time',
        width: 140,
        render: (text: any) => (
            <Tag color="blue" style={{ fontSize: 14 }}>
                {text}
            </Tag>
        )
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: 220,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
          <Text strong>{record.patientName}</Text>
        </div>
      ),
    },
    {
      title: 'Chẩn đoán',
      dataIndex: 'diagnosis',
      render: (text: any) => <Text strong style={{ color: '#333' }}>{text}</Text>,
    },
    {
      title: 'Đơn thuốc',
      key: 'prescription',
      width: 120,
      render: (_: any, record: any) => (
          <Tag color={record.prescription.length > 0 ? "cyan" : "default"}>
              {record.prescription.length > 0 ? `${record.prescription.length} loại thuốc` : 'Không kê đơn'}
          </Tag>
      )
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
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
  
  const handleSignOut = () => navigate('/');
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
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{doctorInfo.name}</span>
                <span style={{ fontSize: 12, color: '#888' }}>Khoa {doctorInfo.specialty}</span>
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
        {selectedRecord && (
            <div style={{ marginTop: 20 }}>
                <Row gutter={24} style={{ marginBottom: 20 }}>
                    <Col span={12}>
                        <Text type="secondary"><UserOutlined /> Bệnh nhân</Text>
                        <Title level={5} style={{ margin: '4px 0' }}>{selectedRecord.patientName}</Title>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <Text type="secondary"><CalendarOutlined /> Thời gian khám</Text>
                        <div style={{ fontWeight: 500, marginTop: 4 }}>
                            {dayjs(selectedRecord.createdAt).format('DD/MM/YYYY')} <Divider type="vertical" /> {selectedRecord.time}
                        </div>
                    </Col>
                </Row>

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

                <div style={{ marginTop: 24 }}>
                    <Title level={5} style={{ marginBottom: 12 }}><MedicineBoxOutlined /> Đơn thuốc chỉ định</Title>
                    {selectedRecord.prescription && selectedRecord.prescription.length > 0 ? (
                        <List
                            bordered
                            dataSource={selectedRecord.prescription}
                            renderItem={(item: any) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<CheckCircleOutlined style={{ color: '#52c41a', marginTop: 4 }} />}
                                        title={<Text strong>{item.medicineName}</Text>}
                                        description={
                                            <Space split={<Divider type="vertical" />}>
                                                <span>Liều dùng: <Text strong>{item.dosage}</Text></span>
                                                <span>Thời gian: <Text strong>{item.durationDays}</Text></span>
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
      </Modal>

    </Layout>
  );
}