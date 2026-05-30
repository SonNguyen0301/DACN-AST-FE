import { useState, useEffect, useRef } from 'react';
import {
  Layout, Avatar, Typography, Card, Button, Row, Col, Image,
  Space, Select, Modal, Form, Input, DatePicker, Descriptions, Tag, Pagination, message, Spin, Divider
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  ScheduleOutlined,
  SmileOutlined,
  TeamOutlined,
  LeftOutlined,
  CameraOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Footer from '../../components/common/Footer';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getUserInfoAPI, updateUserInfoAPI, getHistoryConsultationsAPI, getAiDiagnosisResultAPI } from '../../services/userService';
import useAuth from '../../hooks/useAuth';
import PatientHeader from './components/PatientHeader';

dayjs.extend(customParseFormat);
const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const genderDisplayMap = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác"
};

export default function PersonalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form] = Form.useForm();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dateRange, setDateRange] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); 

  const [consultations, setConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; 

  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState(null);
  
  useEffect(() => {
    fetchUserProfile();
  }, []);

useEffect(() => {
    if (userData?.id) {
        fetchUserConsulations();
    }
  }, [userData?.id, currentPage, dateRange, selectedDept, sortOrder]);

  useEffect(() => {
      if (userData && location.state?.openEditModal) {
        showModal(userData);  
        navigate(location.pathname, { replace: true, state: {} });
      }
  }, [userData, location.state]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await getUserInfoAPI();
      if (res.data?.success) {
        setUserData(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin:", error);
      message.error("Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConsulations = async () => {
    setLoadingConsultations(true);
    try {
      const params = { 
          page: currentPage, 
          take: pageSize,
          sortDirection: sortOrder === 'newest' ? 'DESC' : 'ASC' 
      };

      if (selectedDept && selectedDept !== 'all') {
          params.department = selectedDept; 
      }

      if (dateRange && dateRange[0] && dateRange[1]) {
          params.startDate = dateRange[0].format('YYYY-MM-DD');
          params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const res = await getHistoryConsultationsAPI(userData.id, params);
      
      if (res.data?.success) {
        setConsultations(res.data.data.data || []);
        setTotalConsultations(res.data.data.meta?.itemCount || 0);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử tư vấn:", error);
      message.error("Không thể tải danh sách hồ sơ khám bệnh.");
    } finally {
        setLoadingConsultations(false);
    }
  };

  const toDataUrl = (img) => {
    if (!img) return null;
    return img.startsWith('http') || img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
  };

  const handleViewDetail = async (apt) => {
    setSelectedConsultation(apt);
    setAiDiagnosisResult(null);

    try {
      const aiRes = await getAiDiagnosisResultAPI(apt.id);
      if (aiRes.data?.success && aiRes.data?.data) {
        const d = aiRes.data.data;
        setAiDiagnosisResult({
          suggestedDiagnosis: d.suggestedDiagnosis,
          severityLevel: d.severityLevel,
          imageWithAllBboxes: toDataUrl(d.imageWithAllBboxes),
          aiAdvice: d.aiAdvice,
          lesionCount: (d.lesions || []).length,
        });
      }
    } catch {
      // 404 = no AI used for this consultation
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      message.error('Chỉ chấp nhận file JPG hoặc PNG');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      message.error('Ảnh không được vượt quá 2MB');
      return;
    }
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      try {
        await updateUserInfoAPI({ avatarUrl: base64 });
        setUserData(prev => ({ ...prev, avatarUrl: base64 }));
        updateUser({ avatarUrl: base64 });
        message.success('Cập nhật ảnh đại diện thành công!');
      } catch {
        message.error('Lỗi khi cập nhật ảnh đại diện');
      } finally {
        setUploadingAvatar(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const showModal = (dataToEdit = userData) => {
    if (!dataToEdit) return;

    const dobDate = dataToEdit.dateOfBirth ? dayjs(dataToEdit.dateOfBirth, 'YYYY-MM-DD') : null;
    
    form.setFieldsValue({
      firstName: dataToEdit.firstName,
      lastName: dataToEdit.lastName,
      email: dataToEdit.email,
      phoneCode: dataToEdit.phoneCode || '+84',
      phoneNumber: dataToEdit.phoneNumber,
      dateOfBirth: dobDate,
      gender: dataToEdit.gender,
      folk: dataToEdit.folk,
      citizenCode: dataToEdit.citizenCode,
      medicalInsurance: dataToEdit.medicalInsurance,
      address: dataToEdit.address,
    });
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setUpdating(true);

      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        phoneCode: values.phoneCode,
        phoneNumber: values.phoneNumber,
        avatarUrl: userData.avatarUrl, 
        isOnBoardingCompleted: true,
        folk: values.folk,
        citizenCode: values.citizenCode,
        medicalInsurance: values.medicalInsurance,
        address: values.address
      };

      const res = await updateUserInfoAPI(payload);
      
      if (res.data?.success) {
        message.success("Cập nhật hồ sơ thành công!");
        fetchUserProfile();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      message.error(error.response?.data?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  
  const renderInfoItem = (icon, label, value) => (
    <div style={{ marginBottom: 12 }}>
      <Space align="start">
        {icon}
        <div>
          <Text strong>{label}</Text><br />
          <Text type="secondary">{value}</Text>
        </div>
      </Space>
    </div>
  );


  if (loading) {
      return (
          <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f7fa' }}>
              <Spin size="large" tip="Đang tải hồ sơ..." />
          </div>
      );
  }

  if (!userData) return null;

  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
  
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <PatientHeader selectedKey="2" />

      <Content style={{ padding: "40px 60px" }}>
        <Row gutter={[24, 24]}>
          
          <Col xs={24} md={8} lg={7} xl={6}>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: '30px 0', height: '100%' }}>
              <div style={{ padding: '0 24px 24px 24px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar size={100} src={userData.avatarUrl} icon={<UserOutlined />} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <input type="file" accept="image/jpeg,image/png" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
                  <Button
                    shape="circle"
                    icon={<CameraOutlined />}
                    size="small"
                    loading={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ position: 'absolute', bottom: 0, right: 0, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
                  <Title level={4} style={{ margin: 0 }}>{fullName}</Title>
                  <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => showModal(userData)} size="middle" />
                </div>
              </div>
              
              <div style={{ padding: '0 30px' }}>
                {renderInfoItem(<ScheduleOutlined />, "Ngày sinh", userData.dateOfBirth ? dayjs(userData.dateOfBirth).format('DD/MM/YYYY') : null)}
                {renderInfoItem(<SmileOutlined />, "Giới tính", genderDisplayMap[userData.gender])}
                {renderInfoItem(<PhoneOutlined />, "Số điện thoại", userData.phoneNumber ? `${userData.phoneCode} ${userData.phoneNumber}` : null)}
                {renderInfoItem(<MailOutlined />, "Email", userData.email)}
                {renderInfoItem(<UserOutlined />, "CCCD/CMND", userData.citizenCode)}
                {renderInfoItem(<IdcardOutlined />, "Mã BHYT", userData.medicalInsurance)}
                {renderInfoItem(<TeamOutlined />, "Dân tộc", userData.folk)}
                {renderInfoItem(<HomeOutlined />, "Địa chỉ", userData.address)}
              </div>
            </div>
          </Col>

          <Col xs={24} md={16} lg={17} xl={18}>
            <div style={{ position: 'relative' }}>
              
              {selectedConsultation === null ? (
                <>
                  <div style={{ 
                    marginBottom: 24, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: 16 
                  }}>
                    <Title level={3} style={{ margin: 0, color: '#1677ff', whiteSpace: 'nowrap' }}>
                        Hồ sơ khám bệnh
                    </Title>
                    
                    <Space wrap size="small">
                      <DatePicker.RangePicker 
                          placeholder={['Từ ngày', 'Đến ngày']}
                          style={{ width: 240, maxWidth: '100%' }} 
                          value={dateRange}
                          onChange={(dates) => {
                              setDateRange(dates);
                              setCurrentPage(1); 
                          }}
                      />

                      <Select
                          placeholder="Chuyên khoa"
                          style={{ width: 180, maxWidth: '100%' }}
                          value={selectedDept}
                          onChange={(val) => {
                              setSelectedDept(val);
                              setCurrentPage(1);
                          }}
                          options={[
                              { value: 'all', label: 'Tất cả chuyên khoa' },
                              { value: 'pediatrics', label: 'Nhi khoa' },
                              { value: 'Dermatology', label: 'Da liễu' },
                              { value: 'internal-medicine', label: 'Nội khoa'},
                              { value: 'surgery', label: 'Ngoại khoa'},
                          ]}
                          allowClear
                      />

                      <Select
                          style={{ width: 160, maxWidth: '100%' }}
                          value={sortOrder}
                          onChange={(val) => {
                              setSortOrder(val);
                              setCurrentPage(1);
                          }}
                          options={[
                              { value: 'newest', label: 'Mới nhất trước' },
                              { value: 'oldest', label: 'Cũ nhất trước' },
                          ]}
                      />
                  </Space>
                  </div>

                  <Spin spinning={loadingConsultations}>
                    <Space direction="vertical" style={{ width: '100%', minHeight: 600 }} size="large">
                      {consultations.length === 0 && !loadingConsultations ? (
                          <div style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>Chưa có hồ sơ khám bệnh nào.</div>
                        ) : (
                            consultations.map(apt => (
                                <Card 
                                key={apt.id} 
                                hoverable
                                variant="borderless" 
                                style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: 'all 0.3s', border: '1px solid #f0f0f0',cursor: 'pointer' }}
                                onClick={() => handleViewDetail(apt)}
                                >
                                <Row gutter={24} align="middle">
                                    <Col xs={24} md={10}>
                                        <Space align="start">
                                        <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }} />
                                        <div>
                                            <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{apt.doctorName}</Text>
                                            <div style={{ marginBottom: 6, marginTop: 6 }}><Tag color="blue" >{apt.department}</Tag></div>

                                            <Space direction="vertical" size={0}>
                                              <Space size="small" split={<Text type="secondary">|</Text>} wrap>
                                                  <Text type="secondary" style={{ fontSize: 14 }}><CalendarOutlined /> {dayjs(apt.date).format('DD/MM/YYYY')}</Text>
                                                  <Text type="secondary" style={{ fontSize: 14 }}><ScheduleOutlined /> {apt.from?.substring(0,5)} - {apt.to?.substring(0,5)}</Text>
                                                  <Text type="secondary" style={{ fontSize: 14 }}><HomeOutlined /> {apt.room}</Text>  
                                              </Space>
                                            </Space>
                                        </div>
                                        </Space>
                                    </Col>
                                    <Col xs={24} md={10}>
                                        <div style={{ 
                                        background: '#f5f7fa', padding: '10px 16px', borderRadius: 8, 
                                        borderLeft: '4px solid #1677ff', height: '100%', marginTop: '12px',
                                        display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                        }}>
                                        <Text strong style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>
                                            Chẩn đoán sơ bộ:
                                        </Text>
                                        <Text strong style={{ color: '#333', fontSize: 15 }}>
                                            {/* {apt.diseases && apt.diseases.length > 0 ? apt.diseases.join(', ') : 'Chưa cập nhật'} */}
                                            {apt.symptoms}
                                        </Text>
                                        </div>
                                    </Col>
                                    <Col xs={24} md={4} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                        <Button 
                                        type="primary" 
                                        shape="round"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetail(apt);
                                        }}
                                        style={{ minWidth: 110 }}
                                        >
                                        Xem chi tiết
                                        </Button>
                                    </Col>
                                </Row>
                                </Card>
                            ))
                        )}
                    </Space>

                    {totalConsultations > 0 && (
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={totalConsultations}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false} 
                            />
                        </div>
                    )}
                  </Spin>
                </>

              ) : (

                <>
                  <Button 
                    type="link" 
                    icon={<LeftOutlined />} 
                    style={{ padding: 0, marginBottom: 16 }}
                    onClick={() => { setSelectedConsultation(null); setAiDiagnosisResult(null); }}
                  >
                    Quay lại danh sách
                  </Button>
                  <Spin spinning={loadingDetail}>
                  {selectedConsultation && (
                          <Card variant="borderless" style={{ border: '1px solid #f0f0f0', borderRadius: 12 }}>
                          <Title level={4} style={{marginTop: 0, marginBottom: 24}}>
                              Chi tiết hồ sơ khám bệnh
                          </Title>
                          <Descriptions bordered column={1} labelStyle={{ width: '30%', background: '#fafafa', fontWeight: 500 }}>
                              <Descriptions.Item label="Bác sĩ">
                              <Space>
                                  <Avatar icon={<UserOutlined />} />
                                  <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{selectedConsultation.doctorName}</Text>
                              </Space>
                              </Descriptions.Item>
                              <Descriptions.Item label="Chuyên khoa">{selectedConsultation.department}</Descriptions.Item>
                              <Descriptions.Item label="Ngày khám">{dayjs(selectedConsultation.date).format('DD/MM/YYYY')}</Descriptions.Item>
                              <Descriptions.Item label="Giờ khám">{selectedConsultation.from?.substring(0,5)} - {selectedConsultation.to?.substring(0,5)}</Descriptions.Item>
                              <Descriptions.Item label="Phòng khám">{selectedConsultation.room}</Descriptions.Item>
                              
                              <Descriptions.Item label="Kết luận bác sĩ">
                              {/* <Text strong>Chẩn đoán: {selectedConsultation.diseases?.join(', ') || 'Chưa cập nhật'}</Text> */}
                              <Text strong>Chẩn đoán: {selectedConsultation.symptoms}</Text>
                              <br />
                              <Text type="primary" style={{ whiteSpace: 'pre-wrap' }}>
                                  Mô tả triệu chứng: {selectedConsultation.description || 'Không có mô tả'}
                              </Text>
                              </Descriptions.Item>

                              <Descriptions.Item label="Thông tin lâm sàng">
                                {selectedConsultation.clinicalInfo ? (
                                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                        {selectedConsultation.clinicalInfo.symptom && <Text>Triệu chứng: <Text strong>{selectedConsultation.clinicalInfo.symptom}</Text></Text>}
                                        {selectedConsultation.clinicalInfo.location && <Text>Vị trí: <Text strong>{selectedConsultation.clinicalInfo.location}</Text></Text>}
                                        {selectedConsultation.clinicalInfo.duration && <Text>Thời gian: <Text strong>{selectedConsultation.clinicalInfo.duration}</Text></Text>}
                                        {selectedConsultation.clinicalInfo.skinType?.length > 0 && <Text>Đặc điểm tổn thương: <Text strong>{selectedConsultation.clinicalInfo.skinType.join(', ')}</Text></Text>}
                                        {selectedConsultation.clinicalInfo.severity && <Text>Mức độ: <Text strong>{selectedConsultation.clinicalInfo.severity === 'local' ? 'Khu trú' : selectedConsultation.clinicalInfo.severity === 'spread' ? 'Lan rộng' : 'Toàn thân'}</Text></Text>}
                                        {selectedConsultation.clinicalInfo.allergy && <Text>Dị ứng: <Text strong>{selectedConsultation.clinicalInfo.allergy}</Text></Text>}
                                        {selectedConsultation.clinicalInfo.history && <Text>Tiền sử: <Text strong>{selectedConsultation.clinicalInfo.history}</Text></Text>}
                                        {selectedConsultation.clinicalInfo.gender && <Text>Giới tính: <Text strong>{selectedConsultation.clinicalInfo.gender === 'MALE' ? 'Nam' : 'Nữ'}</Text></Text>}
                                        {selectedConsultation.clinicalInfo.age && <Text>Tuổi: <Text strong>{selectedConsultation.clinicalInfo.age}</Text></Text>}
                                        {selectedConsultation.clinicalInfo.genetic && <Text>Di truyền: <Text strong>{selectedConsultation.clinicalInfo.genetic === 'yes' ? 'Có' : 'Không'}</Text></Text>}
                                    </Space>
                                ) : (
                                    <Text type="secondary" style={{ fontStyle: 'italic' }}>Không có thông tin lâm sàng</Text>
                                )}
                              </Descriptions.Item>

                              <Descriptions.Item label="Đơn thuốc">
                                {selectedConsultation.prescription && selectedConsultation.prescription.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedConsultation.prescription.map((item, index) => (
                                            <div 
                                                key={index} 
                                                style={{ 
                                                    background: '#fafafa', 
                                                    padding: '8px 12px', 
                                                    borderRadius: '6px', 
                                                    border: '1px solid #f0f0f0' 
                                                }}
                                            >
                                                <Text strong style={{ color: '#1677ff', display: 'block', marginBottom: 4 }}>
                                                    {index + 1}. {item.name || 'Tên thuốc'}
                                                    {item.concentration && <><Divider type="vertical" />Hàm lượng: <Text strong style={{ color: '#555' }}>{item.concentration}</Text></>}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                                    Số lượng: <Text strong style={{ color: '#555' }}>{item.quantity || '-'}</Text>
                                                    {item.dosage && <><Divider type="vertical" />Liều lượng: <Text strong style={{ color: '#555' }}>{item.dosage}</Text></>}
                                                    {item.duration && <><Divider type="vertical" />Cách dùng: <Text strong style={{ color: '#555' }}>{item.duration}</Text></>}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Text type="secondary" style={{ fontStyle: 'italic' }}>Không có đơn thuốc</Text>
                                )}
                            </Descriptions.Item>

                              <Descriptions.Item label="Lời khuyên">
                              <Text type="primary" style={{ whiteSpace: 'pre-wrap' }}>{selectedConsultation.advices || 'Không có lời khuyên'}</Text>
                              </Descriptions.Item>

                              {aiDiagnosisResult && (
                                <Descriptions.Item label={<span style={{ color: '#1677ff' }}><RobotOutlined /> Kết quả AI</span>}>
                                  <Space size={8} wrap style={{ marginBottom: 12 }}>
                                    <Tag color="blue" style={{ fontSize: 13, padding: '3px 10px' }}>
                                      {aiDiagnosisResult.suggestedDiagnosis}
                                    </Tag>
                                    {aiDiagnosisResult.severityLevel && (
                                      <Tag color={
                                        aiDiagnosisResult.severityLevel === 'MINOR' ? 'green' :
                                        aiDiagnosisResult.severityLevel === 'MODERATE' ? 'orange' : 'red'
                                      }>
                                        {{ MINOR: 'Mức độ thấp', MODERATE: 'Mức độ trung bình', SEVERE: 'Nghiêm trọng', CRITICAL: 'Nguy hiểm' }[aiDiagnosisResult.severityLevel]}
                                      </Tag>
                                    )}
                                    {aiDiagnosisResult.lesionCount > 0 && (
                                      <Tag color="cyan">{aiDiagnosisResult.lesionCount} tổn thương phát hiện</Tag>
                                    )}
                                  </Space>

                                  {aiDiagnosisResult.imageWithAllBboxes && (
                                    <div style={{ marginBottom: 12 }}>
                                      <Image
                                        src={aiDiagnosisResult.imageWithAllBboxes}
                                        style={{ borderRadius: 8, maxHeight: 220, objectFit: 'contain', border: '1px solid #e8e8e8' }}
                                      />
                                    </div>
                                  )}
                                </Descriptions.Item>
                              )}

                              <Descriptions.Item label="Hình ảnh khám bệnh">
                                  {selectedConsultation.images && selectedConsultation.images.length > 0 ? (
                                      <div style={{ background: '#fcfcfc', padding: '16px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                                          {selectedConsultation.images.filter(img => img.description === 'DOCTOR_UPLOADED').length > 0 && (
                                              <div style={{ marginBottom: 16 }}>
                                                  <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                                      <CameraOutlined style={{ marginRight: 6, color: '#52c41a' }} />
                                                      Ảnh từ bác sĩ:
                                                  </Text>
                                                  <Image.PreviewGroup>
                                                      <Space size={8} wrap>
                                                          {selectedConsultation.images.filter(img => img.description === 'DOCTOR_UPLOADED').map((img, idx) => (
                                                              <Image
                                                                  key={`doc-${idx}`}
                                                                  width={80} 
                                                                  height={80}
                                                                  src={img.base64 || img.dataUrl || img.url || ''} 
                                                                  fallback="https://via.placeholder.com/150?text=L%E1%BB%97i"
                                                                  style={{ borderRadius: 6, objectFit: 'cover', border: '1px solid #d9f7be' }}
                                                              />
                                                          ))}
                                                      </Space>
                                                  </Image.PreviewGroup>
                                              </div>
                                          )}

                                          {selectedConsultation.images.filter(img => img.description === 'AI_GENERATED').length > 0 && (
                                              <div>
                                                  <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                                      <RobotOutlined style={{ marginRight: 6, color: '#1677ff' }} />
                                                      Ảnh phân tích AI:
                                                  </Text>
                                                  <Image.PreviewGroup>
                                                      <Space size={8} wrap>
                                                          {selectedConsultation.images.filter(img => img.description === 'AI_GENERATED').map((img, idx) => (
                                                              <Image
                                                                  key={`ai-${idx}`}
                                                                  width={100} 
                                                                  height={100}
                                                                  src={img.base64 || img.dataUrl || img.url || ''} 
                                                                  fallback="https://via.placeholder.com/150?text=L%E1%BB%97i"
                                                                  style={{ borderRadius: 6, objectFit: 'contain', border: '1px solid #91caff', background: '#e6f4ff' }}
                                                              />
                                                          ))}
                                                      </Space>
                                                  </Image.PreviewGroup>
                                              </div>
                                          )}
                                      </div>
                                  ) : (
                                      <Text type="secondary" style={{ fontStyle: 'italic' }}>Không có hình ảnh đính kèm</Text>
                                  )}
                              </Descriptions.Item>
                          </Descriptions> 
                          </Card>
                      )}
                  </Spin>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Content>

      <Modal 
        title={<Title level={4} style={{ margin: 0 }}>Cập nhật hồ sơ cá nhân</Title>} 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={handleCancel}
        confirmLoading={updating}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={800} 
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="lastName" label="Họ" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}>
                <Input placeholder="Nguyễn Văn" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="firstName" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input placeholder="A" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email" tooltip="Email dùng để đăng nhập, không thể thay đổi.">
                <Input readOnly style={{ background: '#f5f5f5', color: '#595959', cursor: 'not-allowed' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item label="Số điện thoại" required>
                    <Input.Group compact style={{ display: 'flex' }}>
                        <Form.Item name="phoneCode" noStyle>
                            <Select style={{ width: '35%' }}>
                                <Option value="+84">+84</Option>
                                <Option value="+1">+1</Option>
                                <Option value="+44">+44</Option>
                                <Option value="+81">+81</Option>
                                <Option value="+82">+82</Option>
                                <Option value="+86">+86</Option>
                                <Option value="+65">+65</Option>
                                <Option value="+66">+66</Option>
                                <Option value="+61">+61</Option>
                                <Option value="+49">+49</Option>
                                <Option value="+33">+33</Option>
                                <Option value="+855">+855</Option>
                                <Option value="+856">+856</Option>
                                <Option value="+886">+886</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="phoneNumber" noStyle rules={[{ required: true, message: 'Nhập SĐT!' }]}>
                            <Input style={{ width: '65%' }} placeholder="Nhập SĐT" />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="dateOfBirth" label="Ngày sinh"
                rules={[
                    { required: true, message: 'Vui lòng chọn ngày sinh' },
                    () => ({
                        validator(_, value) {
                            if (value && value.isAfter(dayjs(), 'day')) {
                                return Promise.reject(new Error('Ngày sinh không thể ở trong tương lai!'));
                            }
                            return Promise.resolve();
                        },
                    }),
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="gender" label="Giới tính" rules={[{  message: 'Vui lòng chọn giới tính!' , required: true }]}>
                <Select placeholder="Chọn giới tính">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="citizenCode" label="Số CCCD/CMND" rules={[{  message: 'Vui lòng nhập số CCCD/CMND!' }]}>
                <Input placeholder="Nhập mã định danh" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="medicalInsurance" label="Mã BHYT" rules={[{  message: 'Vui lòng nhập mã BHYT!' }]}>
                <Input placeholder="Mã bảo hiểm y tế" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="folk" label="Dân tộc" rules={[{  message: 'Vui lòng nhập dân tộc!' }]}>
                <Input placeholder="Ví dụ: Kinh" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="address" label="Địa chỉ liên hệ" rules={[{  message: 'Vui lòng nhập địa chỉ liên hệ!' }]}>
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ đầy đủ (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)" />
          </Form.Item>

        </Form>
      </Modal>
      
      <Footer /> 

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>
      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }

          .ant-picker-dropdown .ant-picker-panels {
            flex-direction: column !important;
          }
          .ant-picker-dropdown {
            max-width: 100vw !important;
          }
          .ant-picker-panel-container {
            max-width: 100vw;
            overflow-x: auto;
          }
        }
      `}</style>
    </Layout>
  );
}