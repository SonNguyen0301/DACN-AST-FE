import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Avatar, Typography, Card, Button,
  Space, Dropdown, Tabs, Tag, Popconfirm,
  Modal, Form, Input, Upload, Row, Col, message, Spin, Image, Pagination
} from "antd";
import { 
  UserOutlined, LogoutOutlined, CalendarOutlined,
  HomeOutlined, ScheduleOutlined, EditOutlined, 
  DeleteOutlined, InboxOutlined, PaperClipOutlined, FormOutlined
} from "@ant-design/icons";
import ChatBotIcon from "../../components/common/ChatBotIcon";
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer'; 
import dayjs from 'dayjs';

import { getPatientAppointmentsAPI, cancelAppointmentAPI, updateAppointmentAPI } from '../../services/appointmentService';
import useAuth from '../../hooks/useAuth';

const { Header, Content } = Layout;
const { Text, Paragraph } = Typography;
const { TextArea } = Input; 
const { Dragger } = Upload; 

const formatFileName = (fileName) => {
  if (!fileName) return '';
  const parts = fileName.split('.');
  
  if (parts.length >= 3) {
    const extension = parts.pop(); 
    parts.pop(); 
    return `${parts.join('.')}.${extension}`;
  }
  
  return fileName; 
}

export default function AppointmentPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const [appointments, setAppointments] = useState({
    '1': { data: [], total: 0 },
    '2': { data: [], total: 0 },
    '3': { data: [], total: 0 },
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fileList, setFileList] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null); 
  const [form] = Form.useForm();

  const [tabPages, setTabPages] = useState({ '1': 1, '2': 1, '3': 1 });
  const pageSize = 5;

  const getStatusByKey = (key) => {
    switch(key) {
      case '1': return 'SCHEDULED';
      case '2': return 'CANCELLED';
      case '3': return 'EXAMINED';
      default: return 'SCHEDULED';
    }
  };

  const fetchTab = async (tabKey, page) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const sortDirection = tabKey === '1' ? 'ASC' : 'DESC';
      const res = await getPatientAppointmentsAPI(user.id, {
        sort: 'date', sortDirection, page, take: pageSize, status: getStatusByKey(tabKey)
      });
      if (res.data?.data) {
        setAppointments(prev => ({
          ...prev,
          [tabKey]: {
            data: res.data.data.data || [],
            total: res.data.data.meta?.itemCount || 0
          }
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const fetchPromises = ['1', '2', '3'].map(key => {
        const sortDirection = key === '1' ? 'ASC' : 'DESC';
        return getPatientAppointmentsAPI(user.id, {
          sort: 'date', sortDirection, page: tabPages[key], take: pageSize, status: getStatusByKey(key)
        });
      });
      const responses = await Promise.all(fetchPromises);
      
      const newAppointments = { ...appointments };
      responses.forEach((res, index) => {
        const key = String(index + 1);
        if (res.data?.data) {
          newAppointments[key] = {
            data: res.data.data.data || [],
            total: res.data.data.meta?.itemCount || 0
          };
        }
      });
      setAppointments(newAppointments);
    } catch (error) {
        console.error("Lỗi lấy lịch hẹn:", error);
        message.error("Không thể tải danh sách lịch hẹn.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchAppointments();
  }, [user?.id]);

  const handleSignOut = () => { logout(); navigate('/login'); };
  
  const menuItems = [
    { key: '1', label: (<a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>), icon: <UserOutlined />},
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true}
  ];

  const renderStatusTag = (status) => {
    const tagStyle = { fontSize: '14px', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold' };
    switch (status) {
      case 'SCHEDULED': return <Tag color="blue" style={tagStyle}>Sắp tới</Tag>;
      case 'PENDING': return <Tag color="orange" style={tagStyle}>Chờ duyệt</Tag>;
      case 'EXAMINED': return <Tag color="green" style={tagStyle}>Đã khám</Tag>;
      case 'CANCELLED': return <Tag color="red" style={tagStyle}>Đã hủy</Tag>;
      case 'LATE': return <Tag color="purple" style={tagStyle}>Đã trễ</Tag>;
      default: return <Tag style={tagStyle}>{status}</Tag>;
    }
  };

  const showEditModal = (apt) => {
      setEditingAppointment(apt); 
      form.setFieldsValue({
        notes: apt.description || "", 
      });
      
      const existingFiles = (apt.images || []).map((img, index) => ({
          uid: `old-${index}`, 
          name: formatFileName(img.fileName), 
          status: 'done',
          url: img.base64,
          thumbUrl: img.base64,
      }));
      setFileList(existingFiles);
      setIsEditModalOpen(true);
  };

    const handleEditOk = async () => {
        setSubmitting(true);
        try {
            const values = form.getFieldsValue();
            const formData = new FormData();
            
            if (values.notes) formData.append('description', values.notes);
            
            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                } else if (file.url || file.thumbUrl) {
                    const dataUrl = file.url || file.thumbUrl;
                    const arr = dataUrl.split(',');
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while(n--){
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    const newFile = new File([u8arr], file.name, {type:mime});
                    formData.append('images', newFile);
                }
            });

            const res = await updateAppointmentAPI(editingAppointment.id, formData);
            if(res.data) {
                message.success("Cập nhật thông tin thành công!");
                setIsEditModalOpen(false);
                setEditingAppointment(null);
                setFileList([]);
                fetchAppointments(); 
            }
        } catch (error) {
            message.error("Cập nhật thất bại.");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setEditingAppointment(null);
        setFileList([]); 
    };
    
    const uploadProps = {
        name: 'file', multiple: true, maxCount: 5, accept: '.png,.jpg,.jpeg', listType: 'picture',
        beforeUpload: () => false, 
        fileList: fileList,
        onChange(info) { 
            setFileList(info.fileList); 
        },
        onPreview: async (file) => { 
            let src = file.url || file.thumbUrl;
            if (!src) {
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

    const handleCancelAppointment = async (aptId) => {
      setSubmitting(true);
      try {
          const res = await cancelAppointmentAPI(aptId);
          if(res.data?.data.isSuccess) { 
            message.success("Đã hủy lịch khám thành công.");
            fetchAppointments(); 
          }
      } catch (error) {
          console.error("Lỗi hủy lịch hẹn:", error);
          message.error("Hủy lịch thất bại.");
      } finally {
          setSubmitting(false);
      }
  };

  const renderActionButtons = (apt, isUpcomingTab = false) => {
      if (isUpcomingTab && (apt.status === 'SCHEDULED' || apt.status === 'PENDING')) {
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(apt)} style={{ minWidth: 120 }}>Chỉnh sửa</Button>
            <Popconfirm 
              title="Hủy lịch hẹn?" 
              description="Bạn có chắc muốn hủy lịch hẹn này?" 
              onConfirm={() => handleCancelAppointment(apt.id)} 
              okText="Đồng ý" cancelText="Không"
              okButtonProps={{ loading: submitting }}
            >
              <Button danger icon={<DeleteOutlined />} style={{ minWidth: 120 }}>Hủy lịch</Button>
            </Popconfirm>
          </div>
        );
      }
      if (!isUpcomingTab) return renderStatusTag(apt.status);
      return null;
    };

  const handlePageChange = (page, tabKey) => {
    setTabPages(prev => ({ ...prev, [tabKey]: page }));
    fetchTab(tabKey, page);
  };

  const renderAppointmentList = (tabData, tabKey, isUpcomingTab = false) => {
    const { data, total } = tabData;
    if (data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CalendarOutlined style={{ fontSize: 48, color: '#ccc' }} />
          <Text block type="secondary" style={{ marginTop: 16 }}>Không có lịch hẹn nào.</Text>
        </div>
      );
    }
  const currentPage = tabPages[tabKey] || 1;
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {data.map(apt => {
           const hasNotesOrFiles = isUpcomingTab && (apt.description || (apt.images && apt.images.length > 0));

           return (
            <Card key={apt.id} variant="borderless" style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" ,height: '100%', display: 'flex', flexDirection: 'column'}}>
              <Row gutter={[24, 24]} align="stretch" style={{ flex: 1 }}> 
                
                <Col xs={24} md={9} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Space align="start" size="middle">
                    <Avatar size={80} src={apt.avatarUrl} icon={<UserOutlined />} />
                    <div style={{ width: '100%' }}>
                      <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{apt.doctorName}</Text>
                      <div style={{ marginBottom: 6 }}><Text type="secondary" style={{ fontStyle: 'italic' }}>{apt.type}</Text></div>
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 13 }}><CalendarOutlined /> {dayjs(apt.date).format('DD/MM/YYYY')}</Text>
                        <Text type="secondary" style={{ fontSize: 13 }}><ScheduleOutlined /> {apt.from?.substring(0,5)} - {apt.to?.substring(0,5)}</Text>
                        <Text type="secondary" style={{ fontSize: 13 }}><HomeOutlined /> {apt.room}</Text>
                      </Space> 
                    </div>
                  </Space>
                </Col>

                <Col xs={24} md={11}>
                  {hasNotesOrFiles ? (
                    <div style={{ 
                      background: '#f0f5ff', 
                      borderRadius: 8, 
                      padding: '12px 16px',
                      border: '1px solid #d6e4ff', 
                      height: '100%', 
                      minHeight: isUpcomingTab ? '140px' : 'auto', 
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                        {apt.description && (
                            <div style={{ marginBottom: (apt.files && apt.files.length > 0) ? 8 : 0 }}>
                                <Space size={6} style={{ marginBottom: 2 }}>
                                    <FormOutlined style={{ color: '#1677ff', fontSize: 12 }} />
                                    <Text strong style={{ color: '#1677ff', fontSize: 12 }}>GHI CHÚ:</Text>
                                </Space>
                                <Paragraph 
                                  ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }} 
                                  style={{ margin: 0, color: '#595959', fontSize: 13, paddingLeft: 20 }}
                                >
                                    {apt.description}
                                </Paragraph>
                            </div>
                        )}

                        {apt.images && apt.images.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <Space size={6} style={{ marginBottom: 4 }}>
                                    <PaperClipOutlined style={{ color: '#1677ff', fontSize: 12 }} />
                                    <Text strong style={{ color: '#1677ff', fontSize: 12 }}>TỆP ĐÍNH KÈM:</Text>
                                </Space>
                                
                                <div style={{ paddingLeft: 20 }}>
                                  <Image.PreviewGroup>
                                      <Space size={[8, 8]} wrap>
                                          {apt.images.map((f, idx) => (
                                              <Image
                                                  key={idx}
                                                  width={60}
                                                  height={60}
                                                  src={f.base64} 
                                                  alt={f.description || 'Hình ảnh đính kèm'}
                                                  fallback="https://via.placeholder.com/60?text=L%E1%BB%97i"
                                                  loading="lazy"
                                                  style={{ 
                                                      borderRadius: 6, 
                                                      objectFit: 'cover', 
                                                      border: '1px solid #d9d9d9',
                                                      cursor: 'pointer',
                                                      background: '#fff'
                                                  }}
                                              />
                                          ))}
                                      </Space>
                                  </Image.PreviewGroup>
                                </div>
                            </div>
                        )}
                    </div>
                  ) : (
                      isUpcomingTab && <div style={{ border: '1px dashed #d9d9d9', borderRadius: 8, padding: 16, textAlign: 'center', color: '#bfbfbf', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chưa có ghi chú thêm</div>
                  )}
                </Col>
                
                <Col xs={24} md={4} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                   {renderActionButtons(apt, isUpcomingTab)} 
                </Col>

              </Row>
            </Card>
          );
        })}

        {total > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
                <Pagination 
                    current={currentPage} 
                    pageSize={pageSize} 
                    total={total} 
                    onChange={(page) => handlePageChange(page, tabKey)} 
                    showSizeChanger={false}
                />
            </div>
        )}

      </Space>
    );
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
          <img 
            src="/ASTCare1.png" 
            alt="ATSCare Logo" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </div>
        <Menu 
          mode="horizontal" 
          defaultSelectedKeys={['4']}          
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
            <Avatar size={36} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }}/>
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "24px 40px" }}>
        <Spin spinning={loading} size="large" tip="Đang chuẩn bị dữ liệu...">
        <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <Tabs 
            defaultActiveKey="1" 
            size="large"
            destroyInactiveTabPane={true} 
            items={[
              {
                key: '1',
                label: `Lịch hẹn sắp tới (${appointments['1'].total})`,
                children: renderAppointmentList(appointments['1'], '1', true)
              },
              {
                key: '2',
                label: `Đã hủy (${appointments['2'].total})`,
                children: renderAppointmentList(appointments['2'], '2', false)
              },
              {
                key: '3',
                label: `Đã khám (${appointments['3'].total})`,
                children: renderAppointmentList(appointments['3'], '3', false)
              }
            ]}
          />
        </Card>
        </Spin>
      </Content>

      <Footer /> 
      
      <Modal title="Chỉnh sửa thông tin đặt khám" open={isEditModalOpen} onOk={handleEditOk} onCancel={handleEditCancel} okText="Lưu thay đổi" cancelText="Hủy" width={700} confirmLoading={submitting}>
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="notes" label="Ghi chú" style={{ marginTop: 8 }}>
            <TextArea rows={4} placeholder="Triệu chứng, thuốc đang dùng, tiền sử, ..." />
          </Form.Item>
          <Form.Item label="Tệp đính kèm (Tối đa 5 file)" style={{ marginTop: 16 }}>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Chọn tệp tin hoặc kéo thả vào đây</p>
              <p className="ant-upload-hint">Hỗ trợ ảnh định dạng PNG, JPG, JPEG</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}><ChatBotIcon /></div>

      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }

          .ant-tabs-nav-list {
            display: flex !important;
            flex-wrap: wrap !important;
            width: 100%;
          }
            
          
          .ant-tabs-tab {
            width: 50% !important;
            margin: 0 !important;
            justify-content: center !important;
            padding: 12px 0 !important;
            border-bottom: 1px solid #f0f0f0;
          }

          .ant-tabs-ink-bar {
            display: none !important;
          }

          .ant-tabs-tab-active {
            border-bottom: 2px solid #1677ff !important;
            background-color: #e6f4ff; 
          }
        }
      `}</style>
    </Layout>
  );
}