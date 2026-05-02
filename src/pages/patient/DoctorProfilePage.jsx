import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Card, Button, Select,
  Space, Dropdown, Row, Col, Tag, Tabs, Input, Upload, message, Calendar, Empty, Divider , Spin, Modal, Image
} from "antd";
import { 
  UserOutlined, LogoutOutlined, SafetyOutlined,
  BookOutlined, ReadOutlined, TeamOutlined,
  LeftOutlined, InboxOutlined, SunOutlined, 
  CalendarOutlined, ClockCircleOutlined, CloudOutlined, MoonOutlined, DeleteOutlined
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 
import dayjs from 'dayjs'; 

import { getDoctorInfoAPI, getDoctorShiftsAPI, bookAppointmentAPI } from '../../services/doctorService';
import { getUserInfoAPI } from '../../services/userService';
import useAuth from '../../hooks/useAuth';


const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth(); 

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  const [scheduleMap, setScheduleMap] = useState({});
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [calendarValue, setCalendarValue] = useState(dayjs());
  const [selectedDateStr, setSelectedDateStr] = useState(null); 
  const [selectedShift, setSelectedShift] = useState(null); 
  
  const [notes, setNotes] = useState("");
  const [fileList, setFileList] = useState([]); 

  useEffect(() => {
    const fetchDoctorAndShifts = async () => {
      if (!id) return;
      setLoadingDoctor(true);
      setLoadingShifts(true);
      
      try {
        const docRes = await getDoctorInfoAPI(id);
        if (docRes.data?.data) {
          const d = docRes.data.data;
         
          setDoctor({
            id: d.id,
            name: `${d.lastName} ${d.firstName}`,
            title: "Bác sĩ", 
            rating: 5,
            isVerified: true,
            experienceYears: d.experience, 
            specialty: d.department,
            role: d.role,
            workplace: "Đang cập nhật...", 
            address: "Đang cập nhật...", 
            avatarUrl: d.avatarUrl || "/doctor_default.png",
            introduction: d.description || "Bác sĩ chưa cập nhật thông tin giới thiệu.",
            education: ["Đang cập nhật..."], 
            experience: [d.experience || "Nhiều năm kinh nghiệm"] 
          });
        }

      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        message.error("Không thể tải thông tin lúc này.");
      } finally {
        setLoadingDoctor(false);
        setLoadingShifts(false);
      }
    };

    fetchDoctorAndShifts();
  }, [id]);

  useEffect(() => {
    const fetchShifts = async () => {
      if (!id) return;
      setLoadingShifts(true);
      
      try {
        const startDate = dayjs(calendarValue).format('YYYY-MM-DD');
        const endDate = startDate;
        const res = await getDoctorShiftsAPI(id, { startDate, endDate });
        const rawData = res.data?.data || [];
        
        const map = {};

        rawData.forEach(dayItem => {
            const dateStr = dayjs(dayItem.date).format('DD-MM-YYYY');
            map[dateStr] = [];

            dayItem.shift.forEach(shiftItem => {
                const startTimeStr = shiftItem.from.substring(0, 5);
                const endTimeStr = shiftItem.to.substring(0, 5);
                const startHour = parseInt(startTimeStr.substring(0, 2));

                map[dateStr].push({
                    shiftId: shiftItem.id, 
                    status: shiftItem.status,
                    displayTime: `${startTimeStr} - ${endTimeStr}`,
                    startHour: startHour
                });
            });
        });

        setScheduleMap(map);

        const clickedDateStr = dayjs(calendarValue).format('DD-MM-YYYY');
        if (map[clickedDateStr] && map[clickedDateStr].length > 0) {
            setSelectedDateStr(clickedDateStr);
        } else {
            message.info("Bác sĩ không có lịch khám vào ngày này.");
            setSelectedDateStr(null);
        }
        setSelectedShift(null); 

      } catch (error) {
        console.error("Lỗi lấy lịch khám:", error);
        message.error("Không thể tải lịch khám lúc này.");
      } finally {
        setLoadingShifts(false);
      }
    };

    fetchShifts();
  }, [calendarValue.format('YYYY-MM-DD'), id]);
  
  const currentScheduleSlots = selectedDateStr ? scheduleMap[selectedDateStr] : [];

  const categorizeSlots = (slots) => {
    const morning = [];
    const afternoon = [];
    const evening = [];
    if (!slots) return { morning, afternoon, evening };

    slots.forEach(shift => {
      if (shift.startHour < 12) morning.push(shift);
      else if (shift.startHour < 18) afternoon.push(shift);
      else evening.push(shift);
    });
    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = categorizeSlots(currentScheduleSlots);

  const onDateSelect = (value) => {
    setCalendarValue(value);
  };

  const disabledDate = (current) => {
    return current && current.isBefore(dayjs().startOf('day'));
  };

  const handleSignOut = () => { logout(); navigate('/login'); };
  
  const handleConfirmBooking = async () => {
    
    if (!user?.id) {
            message.warning("Vui lòng đăng nhập để đặt lịch.");
            return;
        }
    if (!selectedShift) {
        message.warning("Vui lòng chọn khung giờ khám.");
        return;
    }
    setBookingLoading(true);
    try {
      const profileRes = await getUserInfoAPI();
      const patientData = profileRes.data?.data;

      if (patientData && (patientData.folk === null || patientData.dateOfBirth === null || patientData.citizenCode === null || patientData.address === null || patientData.medicalInsurance === null)) {
        Modal.warning({
            title: 'Yêu cầu hoàn thiện hồ sơ',
            content: 'Hồ sơ y tế của bạn chưa đầy đủ. Vui lòng cập nhật thông tin cá nhân (Ngày sinh, Giới tính, BHYT...) để có thể sử dụng các tính năng của ứng dụng.',
            okText: 'Cập nhật ngay',
            cancelText : 'Để sau',
            centered: true,
            onOk: () => {
              Modal.destroyAll();
              navigate('/patient/personal', { state: { openEditModal: true } }); 
            }
        });
      } else {
        
        const formData = new FormData();
        formData.append('doctorId', id);
        formData.append('shiftId', selectedShift.shiftId);
        formData.append('patientId', user.id);
        
        const [dd, mm, yyyy] = selectedDateStr.split('-');
        formData.append('date', `${yyyy}-${mm}-${dd}`); 
        
        if (notes) formData.append('description', notes);

        if (fileList && fileList.length > 0) {
            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                } 
            });
        }

        const res = await bookAppointmentAPI(formData);
        
        if (res.data?.success) {
            message.success("Đặt lịch khám thành công!");
            navigate('/patient/appointments'); 
        } else {
            message.error(res.data?.message || "Đặt lịch thất bại.");
        }
      }
    } catch (error) {
        console.error("Lỗi đặt lịch chi tiết:", error.response?.data || error);
        const errorMsg = error.response?.data?.message || "Có lỗi hệ thống, vui lòng thử lại sau.";
        message.error(`Lỗi: ${errorMsg}`);
    } finally {
        setBookingLoading(false);
    }
  };

  const handleRemoveFile = (fileToRemove) => {
      setFileList(prevList => prevList.filter(file => file.uid !== fileToRemove.uid));
  };

  const menuItems = [
    { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
  ];

  const uploadProps = {
    name: 'file', 
    multiple: true, 
    maxCount: 5,
    accept: 'image/png, image/jpeg, image/jpg', 
    
    beforeUpload: (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
            return Upload.LIST_IGNORE; 
        }
        return false; 
    },
    
    fileList: fileList,
    onChange: (info) => {
        setFileList(info.fileList);
    },
    onPreview: async (file) => {
        let src = file.url || file.thumbUrl;
        if (!src && file.originFileObj) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const image = new window.Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(image.outerHTML);
    }
  };

  const renderSlotSection = (title, icon, slots) => {
    if (!slots || slots.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{icon} {title}</Text>
        <Row gutter={[8, 8]}>
          {slots.map(shift => {
            const isAvailable = shift.status === 'AVAILABLE';
            return (
                <Col key={shift.shiftId} xs={12} sm={8} lg={6}> 
                <Button
                    block
                    size="large"
                    type={shift.shiftId === selectedShift?.shiftId ? 'primary' : 'default'}
                    onClick={() => setSelectedShift(shift)}
                    disabled={!isAvailable} 
                    style={{ textDecoration: !isAvailable ? 'line-through' : 'none' }}
                >
                    {shift.displayTime}
                </Button>
                </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  if (!doctor) return <div style={{padding: 50, textAlign: 'center'}}>Không tìm thấy bác sĩ</div>;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)",position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
          <img 
            src="/ASTCare1.png" 
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </div>

        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']} 
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
            <span className="hide-on-mobile" style={{ fontSize: 16, fontWeight: 500, color: '#555' }}>{user?.firstName + ' ' + user?.lastName}</span>
            <Avatar size={36} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "24px 40px" }}>
        
        <Button type="link" icon={<LeftOutlined />} style={{ padding: 0, marginBottom: 16 }} onClick={() => navigate('/patient/booking')}>
          Quay lại danh sách
        </Button>

        <Spin spinning={loadingDoctor}>
          {doctor ? (
              <Card style={{ borderRadius: 12, marginBottom: 24 }}>
                  <Row gutter={[24, 24]}>
                      <Col className="doctor-avatar-col" style ={{ marginRight: 24 }}>
                          <Avatar size={120} src={doctor.avatarUrl} icon={<UserOutlined />} />
                      </Col>

                      <Col className="doctor-info-col">
                          <Title level={3} style={{ margin: 0 }}>{doctor.name}</Title>
                          <Space style={{ marginTop: 8 }} wrap>
                              <Tag color="blue">{doctor.title}</Tag>
                              {doctor.isVerified && <Tag color="green" icon={<SafetyOutlined />}>Đã xác minh</Tag>}
                              <Text>{doctor.experienceYears}</Text>
                          </Space>
                          <div style={{ marginTop: 12 }}>
                              <Text strong>Chuyên khoa:</Text> <Text>{doctor.specialty}</Text> <br/>
                              <Text strong>Nơi công tác:</Text> <Text>{doctor.workplace}</Text>
                          </div>
                      </Col>
                  </Row>

                  <div style={{ borderTop: '1px solid #f0f0f0', margin: '24px 0 12px 0' }} />

                  <Tabs defaultActiveKey="1">
                      <TabPane tab={<Space><BookOutlined /> Giới thiệu</Space>} key="1">
                          <Paragraph style={{ maxWidth: 800 }}>{doctor.introduction}</Paragraph>
                      </TabPane>
                      <TabPane tab={<Space><ReadOutlined /> Đào tạo</Space>} key="2">
                          <ul>{doctor.education.map((e, i) => <li key={i}>{e}</li>)}</ul>
                      </TabPane>
                      <TabPane tab={<Space><TeamOutlined /> Kinh nghiệm</Space>} key="3">
                          <ul>{doctor.experience.map((e, i) => <li key={i}>{e}</li>)}</ul>
                      </TabPane>
                  </Tabs>
              </Card>
          ) : (
              <Empty description="Không tìm thấy dữ liệu bác sĩ" />
          )}
          </Spin>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={17}>
            <Card title={<Title level={4} style={{margin:0}}>1. Chọn lịch khám</Title>} style={{ borderRadius: 12, marginBottom: 24 }}>
              
              <Spin spinning={loadingShifts}>
                <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
                    <Col xs={24} lg={12} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 4 , flex: 1, display: 'flex', flexDirection: 'column'}}>
                        <Calendar 
                        fullscreen={false} 
                        value={calendarValue}
                        disabledDate={disabledDate}
                        onSelect={onDateSelect}
                        onPanelChange={(newDate) => setCalendarValue(newDate)}
                        style={{ flex: 1 }}
                        headerRender={({ value, onChange }) => {
                            const start = 0;
                            const end = 12;
                            const monthOptions = [];

                            for (let i = start; i < end; i++) {
                            monthOptions.push(
                                <Select.Option key={i} value={i}>
                                Tháng {i + 1}
                                </Select.Option>,
                            );
                            }

                            const year = value.year();
                            const month = value.month();
                            const yearOptions = [];
                            
                            for (let i = year - 1; i < year + 3; i++) {
                            yearOptions.push(
                                <Select.Option key={i} value={i}>
                                {i}
                                </Select.Option>,
                            );
                            }

                            return (
                            <div style={{ padding: 8, display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
                                <Select
                                size="small"
                                dropdownMatchSelectWidth={false}
                                value={month}
                                onChange={(newMonth) => {
                                    const now = value.clone().month(newMonth);
                                    onChange(now);
                                }}
                                >
                                {monthOptions}
                                </Select>

                                <Select
                                size="small"
                                dropdownMatchSelectWidth={false}
                                value={year}
                                onChange={(newYear) => {
                                    const now = value.clone().year(newYear);
                                    onChange(now);
                                }}
                                >
                                {yearOptions}
                                </Select>
                            </div>
                            );
                        }}
                        />
                    </div>
                    </Col>

                    <Col xs={24} lg={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 16 }}>
                            Lịch khám ngày: <span style={{ color: '#1677ff' }}>{selectedDateStr || "Chưa chọn"}</span>
                        </Text>
                    </div>

                    {currentScheduleSlots && currentScheduleSlots.length > 0 ? (
                        <div style={{ maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
                        {renderSlotSection("Buổi Sáng", <SunOutlined style={{ color: '#faad14' }}/>, morning)}
                        {morning.length > 0 && (afternoon.length > 0 || evening.length > 0) && <Divider style={{ margin: '12px 0' }} />}
                        
                        {renderSlotSection("Buổi Chiều", <CloudOutlined style={{ color: '#1890ff' }}/>, afternoon)}
                        {afternoon.length > 0 && evening.length > 0 && <Divider style={{ margin: '12px 0' }} />}

                        {renderSlotSection("Buổi Tối", <MoonOutlined style={{ color: '#722ed1' }}/>, evening)}
                        </div>
                    ) : (
                        <Empty description="Không có ca khám vào ngày này" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                    </Col>
                </Row>
              </Spin>

            </Card>

            <Card title={<Title level={4} style={{margin:0}}>2. Thông tin bổ sung</Title>} style={{ borderRadius: 12, marginBottom: 24 }}>
               <div style={{ marginBottom: 16 }}>
                  <Text strong>Ghi chú cho bác sĩ:</Text>
                  <TextArea 
                    rows={3} 
                    placeholder="Mô tả triệu chứng, thuốc đang dùng..." 
                    style={{ marginTop: 8 }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
               </div>
               <div>
                  <Text strong>Tệp đính kèm ({fileList.length}/5):</Text>
                  <Dragger {...uploadProps} style={{ marginTop: 8, background: '#fafafa' }}>
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">Chọn tệp tin hoặc kéo thả vào đây</p>
                    <p className="ant-upload-hint">Hỗ trợ ảnh định dạng PNG, JPG, JPEG</p>
                  </Dragger>
                  {fileList.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                          <Image.PreviewGroup>
                              <Space size={[8, 8]} wrap>
                                  {fileList.map((file, index) => {
                                      const imgSrc = file.url || file.thumbUrl;
                                      
                                      if (!imgSrc) return null;

                                      return (
                                          <div key={file.uid || index} style={{ position: 'relative', display: 'inline-block' }}>
                                              <Image
                                                  width={80}
                                                  height={80}
                                                  src={imgSrc}
                                                  alt={`preview-${index}`}
                                                  style={{ 
                                                      objectFit: 'cover', 
                                                      borderRadius: 8, 
                                                      border: '1px solid #d9d9d9',
                                                      cursor: 'pointer'
                                                  }}
                                              />
                                              <Button 
                                                  type="primary" 
                                                  danger 
                                                  shape="circle" 
                                                  size="small" 
                                                  icon={<DeleteOutlined />} 
                                                  style={{ 
                                                      position: 'absolute', 
                                                      top: -6, 
                                                      right: -6, 
                                                      zIndex: 10,
                                                      width: 24,
                                                      height: 24,
                                                      minWidth: 24
                                                  }}
                                                  onClick={(e) => {
                                                      e.stopPropagation(); 
                                                      handleRemoveFile(file);
                                                  }}
                                              />
                                          </div>
                                      );
                                  })}
                              </Space>
                          </Image.PreviewGroup>
                      </div>
                  )}
               </div>
            </Card>
          </Col>

          <Col xs={24} lg={7}>
            <Card 
              title={<Title level={4} style={{margin: 0, color: '#1677ff'}}>Phiếu đặt khám</Title>}
              style={{ borderRadius: 12, position: 'sticky', top: 80, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                   <Avatar size={48} src={doctor?.avatarUrl || "/doctor_default.png"} />
                   <div>
                      <Text strong>{doctor?.name || "..."}</Text><br/>
                      <Text type="secondary" style={{fontSize: 12}}>{doctor?.workplace || "..."}</Text>
                   </div>
                </div>

                <div>
                  <Row justify="space-between" style={{ marginBottom: 8 }}>
                    <Text type="secondary"><CalendarOutlined /> Ngày khám:</Text>
                    {selectedDateStr ? (
                      <Text strong>{selectedDateStr}</Text> 
                    ) : <Text type="danger">Chưa chọn</Text>}
                  </Row>
                  <Row justify="space-between" align="middle">
                    <Text type="secondary"><ClockCircleOutlined /> Khung giờ:</Text>
                    {selectedShift ? (
                      <Tag color="blue" style={{ margin: 0, fontSize: 14, padding: '4px 8px' }}>
                        {selectedShift.displayTime}
                      </Tag>
                    ) : (
                      <Text type="danger">Chưa chọn</Text>
                    )}
                  </Row>
                </div>

                <Button 
                  type="primary" 
                  block 
                  size="large"
                  loading={bookingLoading}
                  disabled={!selectedShift || !doctor} 
                  onClick={handleConfirmBooking}
                  style={{ height: 48, fontWeight: 'bold', fontSize: 16, marginTop: 8 }}
                >
                  XÁC NHẬN ĐẶT KHÁM
                </Button>
                
                <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
                  Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
                </Text>
              </Space>
            </Card>
          </Col>

        </Row>
      </Content>
      
      <Footer /> 

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ChatBotIcon />
      </div>

      <style>{`
        .doctor-avatar-col {
              flex: 0 0 120px;
              max-width: 120px;
          }
          .doctor-info-col {
              flex: 1 1 0%;
              max-width: 100%;
          }
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }

          .doctor-avatar-col {
                flex: 0 0 100%;
                max-width: 100%;
                display: flex;
                justify-content: center;
            }
            .doctor-info-col {
                flex: 0 0 100%;
                max-width: 100%;
            }
        }
      `}</style>
    </Layout>
  );
}