import { useState, useEffect } from 'react';
import {
  Layout, Avatar, Typography, Row, Col, Card, Table,
  Tag, Space, Button, Input, DatePicker, Select,
  Tooltip, Modal, Descriptions, Divider, message, List,
  Spin, Image, Progress, Alert
} from "antd";
import {
  UserOutlined, SearchOutlined, EyeOutlined,
  MedicineBoxOutlined, CameraOutlined,
  FileTextOutlined, RobotOutlined, CheckCircleOutlined, PhoneOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import Footer from "../../components/common/Footer";
import { getConsultationHistoryAPI, getConsultationDetailAPI, getAiDiagnosisResultAPI } from '../../services/doctorService';
import useAuth from "../../hooks/useAuth";
import DoctorHeader from './components/DoctorHeader';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker; 

const HAM10000_MAPPING = {
  'akiec': 'Dày sừng quang hóa / K nội biểu bì (AKIEC)',
  'bcc': 'Ung thư biểu mô tế bào đáy (BCC)',
  'bkl': 'Tổn thương giống dày sừng lành tính (BKL)',
  'df': 'U xơ da (Dermatofibroma)',
  'mel': 'Ung thư hắc tố (Melanoma)',
  'nv': 'Nốt ruồi hắc tố (Melanocytic nevi)',
  'vasc': 'Tổn thương mạch máu (Vascular lesions)'
};

export default function DoctorMedicalHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
  const [sortDirection, setSortDirection] = useState('DESC');
  
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, showSizeChanger: false });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [aiDiagnosisResult, setAiDiagnosisResult] = useState(null);
  const [aiDiagnosisLoading, setAiDiagnosisLoading] = useState(false);
  const [activeLesionIndex, setActiveLesionIndex] = useState(0);

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
                      prescription: result.prescription || [],
                      clinicalInfo: result.clinicalInfo || null
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

  const toDataUrl = (img) => {
    if (!img) return null;
    return img.startsWith('http') || img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
  };

  const handleViewDetail = async (record) => {
    setIsModalOpen(true);
    setSelectedRecord(record);
    setDetailLoading(true);
    setAiDiagnosisResult(null);
    setActiveLesionIndex(0);

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
                clinicalInfo: result.clinicalInfo || record.clinicalInfo || null,
                images: imageUrls,
                consultationImages: data.consultationImages || []
            });
        }
    } catch (error) {
        console.error("Lỗi lấy chi tiết ca khám:", error);
        message.error("Không thể tải chi tiết hồ sơ.");
    } finally {
        setDetailLoading(false);
    }

    // Load AI result separately (silently — not all consultations have AI)
    try {
        setAiDiagnosisLoading(true);
        const aiRes = await getAiDiagnosisResultAPI(record.key);
        if (aiRes.data?.success && aiRes.data?.data) {
            const d = aiRes.data.data;
            setAiDiagnosisResult({
                suggestedDiagnosis: d.suggestedDiagnosis,
                severityLevel: d.severityLevel,
                imageWithAllBboxes: toDataUrl(d.imageWithAllBboxes),
                aiAdvice: d.aiAdvice,
                lesions: (d.lesions || []).map(l => ({
                    lesionIndex: l.lesionIndex,
                    topDisease: l.topDisease,
                    severity: l.severity || 'MINOR',
                    croppedImage: toDataUrl(l.croppedImage),
                    diseases: (l.diseases || [])
                        .map(dis => {
                            const prob = dis.accuracy > 1 ? dis.accuracy : dis.accuracy * 100;
                            return { name: dis.diseaseName, probability: Math.round(prob) };
                        })
                        .filter(dis => dis.probability >= 10)
                        .slice(0, 4),
                })),
            });
        }
    } catch {
        // 404 = no AI used for this consultation, silently ignore
    } finally {
        setAiDiagnosisLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setAiDiagnosisResult(null);
    setActiveLesionIndex(0);
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
  
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <DoctorHeader selectedKey="4" />

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
                <div style={{ marginTop: 20, maxHeight: '65vh', overflowY: 'auto', overflowX: 'hidden', paddingRight: 8 }}>
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

                    {/* AI Diagnosis Section */}
                    {aiDiagnosisLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <Spin size="small" tip="Đang tải kết quả AI..." />
                        </div>
                    ) : aiDiagnosisResult ? (
                        <div style={{ marginTop: 20 }}>
                            <Divider orientation="left">
                                <RobotOutlined style={{ color: '#722ed1' }} /> Kết quả phân tích AI
                            </Divider>

                            {aiDiagnosisResult.imageWithAllBboxes && (
                                <div style={{ textAlign: 'center', marginBottom: 16, position: 'relative' }}>
                                    <Image
                                        src={aiDiagnosisResult.imageWithAllBboxes}
                                        style={{ borderRadius: 8, maxHeight: 200, objectFit: 'contain', border: '1px solid #e8e8e8' }}
                                    />
                                    <Tag color="cyan" style={{ position: 'absolute', top: 8, right: 8 }}>
                                        {aiDiagnosisResult.lesions?.length || 1} tổn thương
                                    </Tag>
                                </div>
                            )}

                            {aiDiagnosisResult.lesions?.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, borderBottom: '1px solid #f0f0f0', marginBottom: 12 }}>
                                        {aiDiagnosisResult.lesions.map((_, i) => (
                                            <Button
                                                key={i}
                                                size="small"
                                                type={i === activeLesionIndex ? 'primary' : 'default'}
                                                onClick={() => setActiveLesionIndex(i)}
                                            >
                                                Tổn thương #{i + 1}
                                            </Button>
                                        ))}
                                    </div>

                                    {(() => {
                                        const lesion = aiDiagnosisResult.lesions[activeLesionIndex];
                                        if (!lesion) return null;
                                        const severityMap = { MINOR: 'THẤP', MODERATE: 'TRUNG BÌNH', SEVERE: 'NGHIÊM TRỌNG', CRITICAL: 'NGUY HIỂM' };
                                        const severityType = { MINOR: 'success', MODERATE: 'warning', SEVERE: 'error', CRITICAL: 'error' };
                                        return (
                                            <Row gutter={[12, 12]}>
                                                {lesion.croppedImage && (
                                                    <Col span={8}>
                                                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Ảnh cận cảnh</Text>
                                                        <Image src={lesion.croppedImage} style={{ borderRadius: 6, width: '100%', maxHeight: 120, objectFit: 'contain', border: '1px solid #e8e8e8' }} />
                                                    </Col>
                                                )}
                                                <Col span={lesion.croppedImage ? 16 : 24}>
                                                    <Alert
                                                        message={`Mức độ: ${severityMap[lesion.severity] ?? 'CHƯA XÁC ĐỊNH'}`}
                                                        type={severityType[lesion.severity] ?? 'info'}
                                                        showIcon
                                                        style={{ marginBottom: 8 }}
                                                    />
                                                    <List
                                                        size="small"
                                                        dataSource={lesion.diseases}
                                                        renderItem={item => {
                                                            const mappedItemName = HAM10000_MAPPING[(item.name || '').toLowerCase()] || item.name;
                                                            
                                                            return (
                                                                <List.Item style={{ display: 'block', padding: '4px 0', borderBottom: '1px dashed #f0f0f0' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                                                        <Text style={{ fontSize: 12 }}>{mappedItemName}</Text>
                                                                        <Tag color={item.probability > 50 ? 'green' : 'orange'} style={{ fontSize: 11 }}>{item.probability}%</Tag>
                                                                    </div>
                                                                    <Progress percent={item.probability} showInfo={false} size="small" status={item.probability > 50 ? 'success' : 'normal'} />
                                                                </List.Item>
                                                            );
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        );
                                    })()}
                                </div>
                            )}

                            {aiDiagnosisResult.aiAdvice && (
                                <>
                                    <Text strong style={{ fontSize: 13, color: '#722ed1' }}>Tư vấn AI:</Text>
                                    <div style={{ background: '#f9f0ff', padding: 12, borderRadius: 8, borderLeft: '4px solid #722ed1', marginTop: 8 }}>
                                        <ReactMarkdown>{aiDiagnosisResult.aiAdvice}</ReactMarkdown>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}

                    {selectedRecord.images && selectedRecord.images.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <Title level={5} style={{ marginBottom: 12 }}>Hình ảnh đính kèm ban đầu (Từ bệnh nhân)</Title>
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

                    {selectedRecord.consultationImages && selectedRecord.consultationImages.length > 0 && (
                        <div style={{ marginTop: 20, background: '#fcfcfc', padding: '16px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                            <Title level={5} style={{ marginBottom: 16 }}>Hình ảnh trong quá trình khám</Title>
                            
                            {selectedRecord.consultationImages.filter(img => img.description === 'DOCTOR_UPLOADED').length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                        <CameraOutlined style={{ marginRight: 6, color: '#52c41a' }} />
                                        Ảnh thực tế từ bác sĩ:
                                    </Text>
                                    <Image.PreviewGroup>
                                        <Space size={8} wrap>
                                            {selectedRecord.consultationImages.filter(img => img.description === 'DOCTOR_UPLOADED').map((img, idx) => {
                                                const validSrc = img.base64 || img.dataUrl || img.url || '';
                                                return <Image key={`doc-${idx}`} width={80} height={80} src={validSrc} style={{ borderRadius: 6, objectFit: 'cover', border: '1px solid #d9f7be' }} />
                                            })}
                                        </Space>
                                    </Image.PreviewGroup>
                                </div>
                            )}

                            {selectedRecord.consultationImages.filter(img => img.description === 'AI_GENERATED').length > 0 && (
                                <div>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                        <RobotOutlined style={{ marginRight: 6, color: '#1677ff' }} />
                                        Ảnh phân tích từ AI:
                                    </Text>
                                    <Image.PreviewGroup>
                                        <Space size={8} wrap>
                                            {selectedRecord.consultationImages.filter(img => img.description === 'AI_GENERATED').map((img, idx) => {
                                                const validSrc = img.base64 || img.dataUrl || img.url || '';
                                                return <Image key={`ai-${idx}`} width={100} height={100} src={validSrc} style={{ borderRadius: 6, objectFit: 'contain', border: '1px solid #91caff', background: '#e6f4ff' }} />
                                            })}
                                        </Space>
                                    </Image.PreviewGroup>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: 24 }}>
                        <Title level={5}>Thông tin lâm sàng</Title>
                        {selectedRecord.clinicalInfo ? (
                            <Descriptions bordered size="small" column={1} labelStyle={{ width: '160px', background: '#fafafa', fontWeight: 'bold' }}>
                                {selectedRecord.clinicalInfo.symptom && <Descriptions.Item label="Triệu chứng">{selectedRecord.clinicalInfo.symptom}</Descriptions.Item>}
                                {selectedRecord.clinicalInfo.location && <Descriptions.Item label="Vị trí">{selectedRecord.clinicalInfo.location}</Descriptions.Item>}
                                {selectedRecord.clinicalInfo.duration && <Descriptions.Item label="Thời gian">{selectedRecord.clinicalInfo.duration}</Descriptions.Item>}
                                {selectedRecord.clinicalInfo.skinType?.length > 0 && (
                                    <Descriptions.Item label="Đặc điểm tổn thương">
                                        {selectedRecord.clinicalInfo.skinType.map(type => {
                                            const typeMap = {
                                                'surface': 'Ngoài da',
                                                'deep': 'Dưới da/Sâu',
                                            };
                                            return typeMap[type] || type;
                                        }).join(', ')}
                                    </Descriptions.Item>
                                )}
                                {selectedRecord.clinicalInfo.severity && <Descriptions.Item label="Mức độ lan rộng">{selectedRecord.clinicalInfo.severity === 'local' ? 'Khu trú' : selectedRecord.clinicalInfo.severity === 'spread' ? 'Lan rộng' : 'Toàn thân'}</Descriptions.Item>}
                                {selectedRecord.clinicalInfo.allergy && <Descriptions.Item label="Dị ứng">{selectedRecord.clinicalInfo.allergy}</Descriptions.Item>}
                                {selectedRecord.clinicalInfo.history && <Descriptions.Item label="Tiền sử">{selectedRecord.clinicalInfo.history}</Descriptions.Item>}
                                {selectedRecord.clinicalInfo.gender && <Descriptions.Item label="Giới tính">{selectedRecord.clinicalInfo.gender === 'MALE' ? 'Nam' : 'Nữ'}</Descriptions.Item>}
                                {selectedRecord.clinicalInfo.age && <Descriptions.Item label="Tuổi">{selectedRecord.clinicalInfo.age}</Descriptions.Item>}
                                {selectedRecord.clinicalInfo.genetic && <Descriptions.Item label="Di truyền">{selectedRecord.clinicalInfo.genetic === 'yes' ? 'Có' : 'Không'}</Descriptions.Item>}
                            </Descriptions>
                        ) : (
                            <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: 8, textAlign: 'center', color: '#999' }}>Không có thông tin lâm sàng</div>
                        )}
                    </div>

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
                                            title={<Text strong>{item.name}</Text>}
                                            description={
                                                <Space split={<Divider type="vertical" />} wrap>
                                                    {item.concentration && <span>Hàm lượng: <Text strong>{item.concentration}</Text></span>}
                                                    <span>Số lượng: <Text strong>{item.quantity}</Text></span>
                                                    {item.dosage && <span>Liều lượng: <Text strong>{item.dosage}</Text></span>}
                                                    {item.duration && <span>Cách dùng: <Text strong>{item.duration}</Text></span>}
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