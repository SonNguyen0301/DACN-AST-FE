import { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Form, 
  Input, 
  Select, 
  Radio, 
  InputNumber, 
  Upload, 
  Button, 
  Divider, 
  Space, 
  Tag, 
  message,
  Dropdown,
  Breadcrumb,
  Image,
  Progress,
  List,
  Alert,
  Spin,
  Table,
  Checkbox
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  InboxOutlined, 
  SaveOutlined,
  MedicineBoxOutlined,
  ArrowLeftOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  FileProtectOutlined,
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import Footer from "../../components/common/Footer"; 
import { getAppointmentsByDateAPI, createAiDiagnosisAPI, getAiDiagnosisResultAPI, finishExaminationAPI, startExaminationAPI, getConsultationDetailAPI } from '../../services/doctorService';
import useAuth from '../../hooks/useAuth';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

export default function ExaminationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [form] = Form.useForm();
  const [resultForm] = Form.useForm();

  const [viewState, setViewState] = useState('input'); 
  const [useAI, setUseAI] = useState(true);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const [activePatient, setActivePatient] = useState(location.state?.patient || null);
  const [consultationId, setConsultationId] = useState(location.state?.consultationId || null);
  const [clinicalInfo, setClinicalInfo] = useState(null);

  const [todayPatients, setTodayPatients] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
      const fetchTodayPatients = async () => {
          if (activePatient || !user?.id) return;
          setLoadingList(true);
          try {
              const todayStr = dayjs().format('YYYY-MM-DD');
              
               const res = await getAppointmentsByDateAPI(user.id, todayStr);

              if (res.data?.success && res.data.data?.appointments) {
                  const mapped = res.data.data.appointments.map((apt, index) => {
                      const fromTime = apt.from ? apt.from.substring(0, 5) : '';
                      const toTime = apt.to ? apt.to.substring(0, 5) : '';
                      
                      const imageUrls = apt.images 
                          ? Object.values(apt.images)
                              .map(img => typeof img === 'string' ? img : (img.base64 || img.dataUrl || img.url))
                              .filter(Boolean)
                          : [];

                      return {
                          key: apt.id || index,
                          patientId: apt.patientId, 
                          patientName: apt.patientName,
                          age: apt.dateOfBirth ? dayjs().diff(dayjs(apt.dateOfBirth), 'year') : 'N/A',
                          gender: apt.gender === 'MALE' ? 'MALE' : 'FEMALE',
                          phone: apt.phoneNumber || 'Không có',
                          time: `${fromTime} - ${toTime}`,
                          reason: apt.description || 'Không có ghi chú',
                          detailedSymptoms: apt.description || 'Chưa có mô tả chi tiết',
                          history: apt.previousDiseases?.length > 0 ? apt.previousDiseases.join(', ') : 'Không có ghi nhận',
                          images: imageUrls,
                          status: apt.status
                      };
                  });
                  const activeAppointments = mapped.filter(a => a.status === 'SCHEDULED' || a.status === 'EXAMINING');
                  setTodayPatients(activeAppointments);
              }
          } catch (error) {
              console.error("Lỗi lấy danh sách hôm nay:", error);
              message.error("Không thể tải danh sách bệnh nhân hôm nay.");
          } finally {
              setLoadingList(false);
          }
      };

      fetchTodayPatients();
  }, [activePatient, user?.id]);

  useEffect(() => {
      const fetchConsultationDetail = async () => {
          if (consultationId) {
              try {
                  const res = await getConsultationDetailAPI(consultationId);

                  if (res.data?.success && res.data?.data) {
                      const data = res.data.data;
                      const apt = data.appointment;
                      const pat = data.patient;

                      const fromTime = apt.from ? apt.from.substring(0, 5) : '';
                      const toTime = apt.to ? apt.to.substring(0, 5) : '';
                      
                      const imageUrls = apt.images 
                          ? Object.values(apt.images)
                              .map(img => typeof img === 'string' ? img : (img.base64 || img.dataUrl || img.url))
                              .filter(Boolean)
                          : [];

                        const pastDiseases = data.pastConsultations
                          ? [...new Set(data.pastConsultations
                              .map(c => c.diagnosisResult?.description)
                              .filter(Boolean))] 
                          : [];

                      const patientData = {
                          key: apt.id,
                          patientId: pat.id,
                          patientName: pat.name,
                          age: pat.dateOfBirth ? dayjs().diff(dayjs(pat.dateOfBirth), 'year') : 'N/A',
                          gender: pat.gender,
                          phone: pat.phoneNumber || 'Không có',
                          time: `${fromTime} - ${toTime}`,
                          reason: apt.description || 'Không có ghi chú',
                          detailedSymptoms: apt.description || 'Chưa có mô tả chi tiết',
                          history: pastDiseases.length > 0 ? pastDiseases.join(', ') : 'Không có ghi nhận',
                          images: imageUrls,
                          status: apt.status,
                          pastConsultations: data.pastConsultations 
                      };

                      setActivePatient(patientData);

                      form.setFieldsValue({
                          gender: patientData.gender,
                          age: patientData.age,
                          history: patientData.history,
                          symptom: patientData.reason, 
                          description: patientData.detailedSymptoms,
                          genetic: 'no' 
                      });
                  }
              } catch (error) {
                  console.error("Lỗi lấy chi tiết ca khám:", error);
                  message.error("Không thể lấy thông tin chi tiết ca khám.");
              }
          }
      };

      fetchConsultationDetail();
  }, [consultationId, form]);

  useEffect(() => {
      if (activePatient && form) {
          form.setFieldsValue({
              gender: activePatient.gender,
              age: activePatient.age,
              history: activePatient.history,
              symptom: activePatient.reason, 
              description: activePatient.detailedSymptoms,
              genetic: 'no'
          });
      }
  }, [activePatient, form]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const menuUserItems = [
    { key: '1', label: (<a onClick={() => navigate('/doctor/profile')}>Hồ sơ bác sĩ</a>), icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  const extractClinicalInfo = (values) => ({
    symptom: values.symptom,
    location: values.location,
    duration: values.duration,
    skinType: values.skinType,
    skinTypeNote: values.skinTypeNote,
    severity: values.severity,
    allergy: values.allergy,
    history: values.history,
    gender: values.gender,
    age: values.age,
    genetic: values.genetic,
  });

  const handleAIAssist = () => {
    form.validateFields().then(async values => {
          setClinicalInfo(extractClinicalInfo(values));
          setUseAI(true);
          setViewState('result');
          setIsAILoading(true);
          
          try {
              if (!consultationId) {
                  message.error("Lỗi: Không tìm thấy phiên khám bệnh.");
                  setViewState('input');
                  setIsAILoading(false);
                  return;
              }

              const formData = new FormData();
              formData.append('consultationId', consultationId);
              formData.append('description', values.description || values.symptom || "Không có mô tả");

              let hasImage = false;
              let imageUrl = '';
              if (values.images && values.images.fileList && values.images.fileList.length > 0) {
                  const file = values.images.fileList[0].originFileObj;
                  formData.append('file', file);
                  hasImage = true;
                  imageUrl = URL.createObjectURL(file);
              }

              if (!hasImage) {
                 message.error("AI yêu cầu ít nhất 1 hình ảnh tổn thương để phân tích.");
                 setViewState('input');
                 setIsAILoading(false);
                 return;
              }

              await createAiDiagnosisAPI(formData);

              const pollResult = setInterval(async () => {
                  try {
                      const res = await getAiDiagnosisResultAPI(consultationId);
                      if (res.data?.success && res.data?.data) {
                          clearInterval(pollResult);
                          setIsAILoading(false);
                          message.success("AI đã hoàn tất phân tích!");
                          
                          const aiResData = res.data.data;

                          const formattedImages = (aiResData.images || []).map(img => {
                              if (img && !img.startsWith('http') && !img.startsWith('data:')) {
                                  return `data:image/jpeg;base64,${img}`;
                              }
                              return img;
                          });
                          
                          setAiResult({
                              diagnoses: (aiResData.diseases || []).map(d => {
                                  // Chống lỗi nhân lố 100%: 
                                  // Nếu accuracy > 1 (ví dụ 49.92), giữ nguyên. 
                                  // Nếu accuracy <= 1 (ví dụ 0.4992), nhân 100.
                                  const prob = d.accuracy > 1 ? d.accuracy : d.accuracy * 100;
                                  return {
                                      name: d.diseaseName,
                                      probability: Math.round(prob),
                                      severity: "Tiềm năng"
                                  };
                              }),
                              explanation: aiResData.suggestedDiagnosis || "Chẩn đoán hình ảnh AI",
                              severityLevel: aiResData.severityLevel || "medium",
                              analyzedImage: imageUrl,
                              aiImages: formattedImages, 
                              advice: aiResData.aiAdvice || "Cần theo dõi thêm và kết hợp chỉ định y khoa."
                          });

                          resultForm.setFieldsValue({
                              finalDiagnosis: aiResData.suggestedDiagnosis || aiResData.diseases?.[0]?.diseaseName || "",
                              department: "dermatology",
                              doctorAdvice: aiResData.aiAdvice || "",
                              currentCondition: values.description || values.symptom
                          });
                      }
                  } catch (e) {
                      if (e.response?.status !== 404) {
                          clearInterval(pollResult);
                          setIsAILoading(false);
                          setViewState('input');
                          message.error("Lỗi khi chờ kết quả AI.");
                      }
                  }
              }, 3000); 

          } catch (error) {
              console.error("Lỗi chạy AI:", error);
              message.error("Không thể gửi yêu cầu phân tích AI.");
              setIsAILoading(false);
              setViewState('input');
          }
      }).catch(info => {
          console.log('Validate Failed:', info);
      });
  };

  const handleManualDiagnose = () => {
      form.validateFields().then(values => {
          setClinicalInfo(extractClinicalInfo(values));
          setUseAI(false);
          setViewState('result');
          resultForm.resetFields(); 
          resultForm.setFieldsValue({
              department: "dermatology",
              currentCondition: values.description || values.symptom || ""
          });
      }).catch(info => {
          console.log('Validate Failed:', info);
      });
  };
  const onFinishResult = async (values) => {
      try {
          if (!consultationId) {
             message.error("Lỗi: Không tìm thấy phiên khám bệnh.");
             return;
          }
          await finishExaminationAPI({
              consultationId: consultationId,
              finalDiagnosis: values.finalDiagnosis,
              department: values.department,
              currentCondition: values.currentCondition,
              medicines: values.medicines,
              clinicalInfo: clinicalInfo ?? undefined,
          });
          message.success("Đã lưu hồ sơ khám bệnh và gửi toa thuốc!");
          setActivePatient(null);
          setViewState('input');
      } catch (error) {
          console.error("Lỗi khi kết thúc khám:", error);
          message.error("Không thể lưu kết quả khám bệnh.");
      }
  };

  const columns = [
      { title: 'Khung giờ', dataIndex: 'time', key: 'time', render: (text) => <Tag color="blue">{text}</Tag> },
      { title: 'Họ và tên', dataIndex: 'patientName', key: 'patientName', render: (text) => <Text strong>{text}</Text> },
      { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
      { title: 'Tiền sử bệnh', dataIndex: 'history', key: 'history' , render: (history) => <Tag color={history !== 'Không có' ? 'orange' : 'green'}>{history}</Tag>},
      { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'EXAMINING' ? 'processing' : 'warning'}>{status === 'EXAMINING' ? 'Đang khám' : 'Chờ khám'}</Tag> },
      { 
          title: '', 
          key: 'action', 
          render: (_, record) => (
              <Button type="primary" onClick={async () => {
                  try {
                      const res = await startExaminationAPI({
                          appointmentId: record.key,
                          patientId: record.patientId
                      });
                      if (res.data?.success || res.status === 201 || res.status === 200) {
                          const id = res.data?.data?.consultationId || res.data?.consultationId;
                          setConsultationId(id);
                          setActivePatient(record);
                      }
                  } catch (error) {
                      console.error("Lỗi khi bắt đầu khám:", error);
                      message.error(error.response?.data?.message || "Không thể bắt đầu ca khám.");
                  }
              }}>
                  {record.status === 'EXAMINING' ? 'Tiếp tục khám' : 'Bắt đầu khám'}
              </Button>
          ) 
      }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/doctor/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['3']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" },
            { key: "3", label: "Khám bệnh" },
            { key: "4", label: "Lịch sử khám bệnh" },
          ]}
          onClick={({ key }) => {
             if (key === '1') navigate('/doctor/dashboard');
             if (key === '2') navigate('/doctor/appointments');
             if (key === '3') {
                 setActivePatient(null);
                 setViewState('input');
                 navigate('/doctor/consulting');
             }
             if (key === '4') {
                 navigate('/doctor/medical-history');
             }
          }}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
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

        {!activePatient ? (
            <Card 
                title={<><ClockCircleOutlined style={{ color: '#1677ff', marginRight: 8 }}/> Danh sách ca khám hôm nay ({dayjs().format('DD/MM/YYYY')})</>}
                style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
                <Table 
                    dataSource={todayPatients} 
                    columns={columns} 
                    loading={loadingList}
                    pagination={false}
                    scroll={{ x: 800 }}
                    locale={{ emptyText: 'Hôm nay không có ca khám nào đang chờ.' }}
                />
            </Card>
        ) : (
            <>
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Lịch đặt khám' }, { title: 'Khám bệnh' }]} style={{ marginBottom: 8 }} />
                        <Title level={3} style={{ margin: 0 }}>
                            <MedicineBoxOutlined /> {viewState === 'result' ? 'Kết quả chẩn đoán & Kê đơn' : 'Phiếu khám bệnh'}
                        </Title>
                    </div>
                    {viewState === 'result' ? (
                        <Button icon={<ArrowLeftOutlined />} onClick={() => setViewState('input')}>Quay lại nhập liệu</Button>
                    ) : (
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => {
                                if (location.state?.patient) {
                                    navigate('/doctor/appointments');
                                } else {
                                    setActivePatient(null);
                                }
                            }}
                        >
                            Quay lại danh sách
                        </Button>
                    )}
                </div>

                {viewState === 'input' && (
                    <Form form={form} layout="vertical">
                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={6}>
                                <Card title="Hồ sơ bệnh nhân" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: 'sticky', top: 90 }}>
                                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                        <Avatar size={80} icon={<UserOutlined />} src={activePatient.avatar} style={{ backgroundColor: activePatient.gender === 'MALE' ? '#1677ff' : '#eb2f96', marginBottom: 12 }} />
                                        <Title level={4} style={{ margin: 0 }}>{activePatient.patientName}</Title>
                                        <Text type="secondary">{activePatient.phone}</Text>
                                    </div>
                                    <Divider />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div><Text type="secondary" style={{ fontSize: 12 }}>Tuổi & Giới tính</Text><div style={{ fontWeight: 500 }}>{activePatient.age} tuổi - {activePatient.gender === 'MALE' ? 'Nam' : 'Nữ'}</div></div>
                                        <div><Text type="secondary" style={{ fontSize: 12 }}>Tiền sử bệnh ghi nhận</Text><div style={{ fontWeight: 500 }}>{activePatient.history ? <Tag color="orange" style={{ whiteSpace: 'normal', height: 'auto', padding: '4px' }}>{activePatient.history}</Tag> : 'Không có'}</div></div>
                                        {activePatient.images && activePatient.images.length > 0 && (
                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Ảnh bệnh nhân gửi:</Text>
                                                <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
                                                    <Image.PreviewGroup>
                                                        {activePatient.images.map((img, idx) => {
                                                            const validSrc = img.startsWith('http') || img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
                                                            return <Image key={idx} width={50} height={50} src={validSrc} style={{ borderRadius: 4, objectFit: 'cover' }} />
                                                        })}
                                                    </Image.PreviewGroup>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Col>

                            <Col xs={24} lg={18}>
                                <Card title={<span style={{ color: '#1677ff' }}>1. Thông tin lâm sàng </span>} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 24 }}>
                                    <Row gutter={[24, 24]}>
                                        <Col xs={24} sm={12}><Form.Item label="Triệu chứng chính" name="symptom" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                        <Col xs={24} sm={12}><Form.Item label="Vị trí trên cơ thể" name="location" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                        <Col xs={24} sm={8}><Form.Item label="Thời gian kéo dài" name="duration"><Input /></Form.Item></Col>
                                        <Col xs={24} sm={8}>
                                          <Form.Item label="Đặc điểm tổn thương" name="skinType">
                                            <Checkbox.Group>
                                              <Checkbox value="surface">Ngoài da</Checkbox>
                                              <Checkbox value="deep">Dưới da/Sâu</Checkbox>
                                              <Checkbox value="other">Ghi chú khác</Checkbox>
                                            </Checkbox.Group>
                                          </Form.Item>
                                          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.skinType !== cur.skinType}>
                                            {({ getFieldValue }) =>
                                              getFieldValue('skinType')?.includes('other') ? (
                                                <Form.Item name="skinTypeNote" style={{ marginTop: -8 }}>
                                                  <TextArea rows={2} placeholder="Mô tả thêm đặc điểm tổn thương..." />
                                                </Form.Item>
                                              ) : null
                                            }
                                          </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}><Form.Item label="Mức độ lan rộng" name="severity"><Select><Option value="local">Khu trú</Option><Option value="spread">Lan rộng</Option><Option value="whole">Toàn thân</Option></Select></Form.Item></Col>
                                        <Col xs={24} sm={12}><Form.Item label="Dị ứng" name="allergy"><Input /></Form.Item></Col>
                                        <Col xs={24} sm={12}><Form.Item label="Tiền sử bệnh lý" name="history"><Input /></Form.Item></Col>
                                        <Col xs={24} sm={8}><Form.Item label="Giới tính" name="gender"><Select><Option value="MALE">Nam</Option><Option value="FEMALE">Nữ</Option></Select></Form.Item></Col>
                                        <Col xs={24} sm={8}><Form.Item label="Tuổi" name="age"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                                        <Col xs={24} sm={8}><Form.Item label="Yếu tố di truyền" name="genetic"><Radio.Group><Radio value="yes">Có</Radio><Radio value="no">Không</Radio></Radio.Group></Form.Item></Col>
                                    </Row>
                                </Card>

                                <Card title={<span style={{ color: '#1677ff' }}>2. Mô tả chi tiết & Hình ảnh</span>} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                    <Form.Item label="Mô tả thêm (Ghi chú bác sĩ)" name="description"><TextArea rows={4} /></Form.Item>
                                    <Form.Item label="Hình ảnh tổn thương thực tế" name="images">
                                        <Dragger multiple listType="picture" height={200}><p className="ant-upload-drag-icon"><InboxOutlined style={{ color: '#1677ff' }} /></p><p className="ant-upload-text">Kéo thả hoặc click để tải ảnh lên</p><p className="ant-upload-hint">Hỗ trợ định dạng: JPG, PNG.</p></Dragger>
                                    </Form.Item>
                                    <Divider />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
                                        <Button size="large">Lưu nháp</Button>
                                        <Button size="large" onClick={handleManualDiagnose}>Tự chẩn đoán (Bỏ qua AI)</Button>
                                        <Button type="primary" size="large" icon={<RobotOutlined />} onClick={handleAIAssist}>Hoàn tất & AI hỗ trợ chẩn đoán</Button>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Form>
                )}

                {viewState === 'result' && (
                    <Row gutter={[24, 24]} justify={!useAI ? "center" : "start"}>
                        {useAI && (
                        <Col xs={24} lg={10}>
                            <Card 
                                title={<><RobotOutlined style={{ color: '#1677ff', marginRight: 8 }} /> Kết quả phân tích AI</>}
                                style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: '100%', borderTop: '4px solid #1677ff' }}
                            >
                                {isAILoading ? (
                                    <div style={{ textAlign: 'center', padding: "80px 0", minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                        <Spin size="large" tip="AI đang phân tích hình ảnh và dữ liệu, vui lòng đợi..." />
                                    </div>
                                ) : aiResult ? (
                                    <>
                                        {aiResult.aiImages && aiResult.aiImages.length > 0 ? (
                                            <div style={{ marginBottom: 20 }}>
                                                <Row gutter={[12, 12]}>
                                                    <Col span={12}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Vùng tổn thương</Text>
                                                            <Image 
                                                                src={aiResult.aiImages[0]} 
                                                                style={{ borderRadius: 8, maxHeight: 180, objectFit: 'contain', border: '1px solid #e8e8e8' }} 
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col span={12}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Ảnh cận cảnh</Text>
                                                            <Image 
                                                                src={aiResult.aiImages[1]} 
                                                                style={{ borderRadius: 8, maxHeight: 180, objectFit: 'contain', border: '1px solid #e8e8e8' }} 
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Divider style={{ margin: '12px 0' }} />
                                            </div>
                                        ) : aiResult.analyzedImage && (
                                            <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
                                                <Image 
                                                    src={aiResult.analyzedImage} 
                                                    style={{ borderRadius: 8, maxHeight: 250, objectFit: 'contain' }} 
                                                />
                                                <Tag color="cyan" style={{ position: 'absolute', top: 10, right: 10 }}>AI Analyzed</Tag>
                                            </div>
                                        )}

                                        <Alert 
                                            message={`Mức độ nghiêm trọng: ${aiResult.severityLevel === 'medium' ? 'TRUNG BÌNH' : aiResult.severityLevel === 'high' ? 'CAO' : 'CHƯA XÁC ĐỊNH'}`}
                                            type={aiResult.severityLevel === 'medium' ? 'warning' : aiResult.severityLevel === 'high' ? 'error' : 'info'}
                                            showIcon
                                            style={{ marginBottom: 20, fontWeight: 'bold' }}
                                        />

                                        <Title level={5}>Chẩn đoán hình ảnh AI:</Title>
                                        <div style={{ marginBottom: 16 }}>
                                            <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>{aiResult.explanation}</Tag>
                                        </div>

                                        <Title level={5}>Xác suất chi tiết:</Title>
                                        <List
                                            dataSource={aiResult.diagnoses}
                                            renderItem={item => (
                                                <List.Item style={{ display: 'block', borderBottom: '1px dashed #f0f0f0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                        <Text strong>{item.name}</Text>
                                                        <Tag color={item.probability > 80 ? 'green' : 'orange'}>{item.probability}%</Tag>
                                                    </div>
                                                    <Progress percent={item.probability} showInfo={false} size="small" status={item.probability > 80 ? 'success' : 'normal'} />
                                                </List.Item>
                                            )}
                                        />
                                        
                                        <div style={{ marginTop: 20 }}>
                                            <Title level={5}>Tư vấn AI chuyên sâu:</Title>
                                            <div className="ai-advice-container" style={{ background: '#f5f7fa', padding: 16, borderRadius: 8, borderLeft: '4px solid #1677ff' }}>
                                                <ReactMarkdown>
                                                    {aiResult.advice}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: "80px 0", color: '#888' }}>
                                        Chưa có kết quả AI
                                    </div>
                                )}
                            </Card>
                        </Col>
                        )}
                        <Col xs={24} lg={useAI ? 14 : 16}>
                            <Card 
                                title={<><FileProtectOutlined style={{ color: '#52c41a', marginRight: 8 }} /> Kết luận & Kê đơn của Bác sĩ</>}
                                style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                            >
                                <Form 
                                    form={resultForm} 
                                    layout="vertical"
                                    onFinish={onFinishResult}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={16}>
                                            <Form.Item label="Chẩn đoán xác định" name="finalDiagnosis" rules={[{ required: true }]}>
                                                <Input size="large" style={{ fontWeight: 600, color: '#1677ff' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item label="Chuyên khoa" name="department" rules={[{ required: true }]}>
                                                <Select size="large" placeholder="Chọn chuyên khoa" options={[
                                                    { value: 'dermatology', label: 'Da liễu' },
                                                    { value: 'general_medicine', label: 'Đa khoa' },
                                                ]} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item label="Mô tả tình trạng bệnh" name="currentCondition">
                                        <TextArea rows={2} />
                                    </Form.Item>

                                    <Divider orientation="left">Toa thuốc</Divider>
                                    <Form.List name="medicines" initialValue={[{ name: '', quantity: 1, usage: '' }]}>
                                        {(fields, { add, remove }) => (
                                            <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <div key={key} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                                                    <Row gutter={[8, 8]} align="middle">
                                                        <Col xs={24} md={10}>
                                                            <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Nhập tên' }]} style={{ margin: 0 }}>
                                                                <Input placeholder="Tên thuốc" style={{ width: '100%' }} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={12} md={4}>
                                                            <Form.Item {...restField} name={[name, 'quantity']} style={{ margin: 0 }}>
                                                                <InputNumber min={1} placeholder="SL" style={{ width: '100%' }} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={12} md={9}>
                                                            <Form.Item {...restField} name={[name, 'usage']} style={{ margin: 0 }}>
                                                                <Input placeholder="Cách dùng (Sáng/Chiều...)" style={{ width: '100%' }} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={1} style={{ textAlign: 'right' }}>
                                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))}
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm thuốc</Button>
                                            </>
                                        )}
                                    </Form.List>

                                    <Form.Item label="Lời khuyên / Dặn dò" name="doctorAdvice">
                                        <TextArea rows={3} />
                                    </Form.Item>

                                    <Divider />

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
                                        <Button size="large" disabled={isAILoading}>In toa thuốc</Button>
                                        <Button type="primary" size="large" icon={<SaveOutlined />} htmlType="submit" disabled={isAILoading}>
                                            Lưu hồ sơ & Kết thúc
                                        </Button>
                                    </div>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                )}
            </>
        )}
      </Content>
      <Footer />
      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }
        .ai-advice-container h1, .ai-advice-container h2, .ai-advice-container h3 {
            color: #1677ff;
            margin-top: 16px;
            font-size: 16px;
        }
        .ai-advice-container p {
            margin-bottom: 8px;
            line-height: 1.6;
        }
        .ai-advice-container ul, .ai-advice-container ol {
            padding-left: 20px;
            margin-bottom: 12px;
        }
      `}</style>
    </Layout>
  );
}