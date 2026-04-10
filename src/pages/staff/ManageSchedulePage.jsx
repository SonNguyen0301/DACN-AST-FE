import  { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Typography, 
  Card, 
  Calendar, 
  Badge, 
  Button, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  TimePicker, 
  InputNumber, 
  Upload, 
  message, 
  List, 
  Tooltip,
  Dropdown,
  Space,
  Tag,
  Divider,
  Popover, 
} from "antd";
import { 
  UserOutlined, 
  LogoutOutlined,
  CalendarOutlined, 
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  ClockCircleOutlined,
  HomeOutlined,       
  FilePdfOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import Footer from "../../components/common/Footer"; 
import { getStaffScheduleAPI, createStaffScheduleAPI, importStaffScheduleCSVAPI, exportStaffScheduleCSVAPI, updateStaffScheduleAPI, deleteStaffScheduleAPI } from '../../services/staffService';
import { getDoctorsAPI } from '../../services/doctorService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

export default function ManageStaffSchedulePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm(); 

  const [scheduleData, setScheduleData] = useState({});
  const [currentMonthView, setCurrentMonthView] = useState(dayjs());
  const [doctorOptions, setDoctorOptions] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateShifts, setSelectedDateShifts] = useState([]);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  const [exporting, setExporting] = useState(false); 

  const fetchSchedule = async (dateObj) => {
      try {
          const startDate = dateObj.startOf('month').startOf('week').format('YYYY-MM-DD');
          const endDate = dateObj.endOf('month').endOf('week').format('YYYY-MM-DD');

          const res = await getStaffScheduleAPI(startDate, endDate);
          
          if (res.data?.success) {
              const rawData = res.data.data || [];
              const map = {};

              rawData.forEach((item) => {
                  const dateStr = item.date;
                  if (!map[dateStr]) map[dateStr] = [];

                  const fromTime = item.from ? item.from.substring(0, 5) : '';
                  const toTime = item.to ? item.to.substring(0, 5) : '';

                  map[dateStr].push({
                      id: item.id, 
                      doctor: item.doctorName,
                      doctorId: item.doctorId || item.doctorCode,
                      dept: 'Da liễu', 
                      time: `${fromTime} - ${toTime}`,
                      room: item.room
                  });
              });
              setScheduleData(map);
          }
      } catch (error) {
          console.error("Lỗi lấy lịch trực:", error);
          message.error("Không thể tải lịch trực.");
      }
  };

  useEffect(() => {
      fetchSchedule(currentMonthView);
  }, [currentMonthView.format('YYYY-MM')]);

  useEffect(() => {
      const fetchDoctorsList = async () => {
          try {
              const res = await getDoctorsAPI({ page: 1, take: 50, sortDirection: 'ASC' });
              
              if (res.data?.success) {
                  const docs = res.data.data.data || res.data.data;
                  setDoctorOptions(docs);
              }
          } catch (error) {
              console.error("Lỗi tải danh sách bác sĩ:", error);
          }
      };

      fetchDoctorsList();
  }, []);

    const handleExportCSV = async () => {
      setExporting(true);
      try {
          const startDate = currentMonthView.startOf('month').format('YYYY-MM-DD');
          const endDate = currentMonthView.endOf('month').format('YYYY-MM-DD');

          message.loading({ content: `Đang tải file CSV tháng ${currentMonthView.format('MM/YYYY')}...`, key: 'exportCsv' });

          const response = await exportStaffScheduleCSVAPI(startDate, endDate);

          const blob = new Blob([response.data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          const contentDisposition = response.headers['content-disposition'];
          const fileName = contentDisposition
            ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
            : `schedule_${startDate}_${endDate}.csv`;

          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          
          link.remove();
          window.URL.revokeObjectURL(url);

          message.success({ content: 'Xuất file CSV thành công!', key: 'exportCsv', duration: 3 });
      } catch (error) {
          console.error("Lỗi xuất file CSV:", error);
          message.error({ content: 'Có lỗi xảy ra khi xuất file CSV.', key: 'exportCsv', duration: 3 });
      } finally {
          setExporting(false);
      }
  };


  const user = { name: "Lê Thị Bích", role: "admission" };

//   const [scheduleData, setScheduleData] = useState({
//     '2026-01-01': [
//       { id: 1, doctor: 'BS. CK2 Trần Thị Hoa', dept: 'Da liễu', time: '08:00 - 12:00', room: 'P.201', },
//       { id: 2, doctor: 'BS. Nguyễn Văn Nam', dept: 'Nội khoa', time: '13:00 - 17:00', room: 'P.305' },
//     ],
//     '2026-01-12': [
//       { id: 3, doctor: 'BS. Lê Thị Tú', dept: 'Nhi khoa', time: '08:00 - 16:00', room: 'P.102' },
//     ],
//     '2026-01-13': [
//        { id: 4, doctor: 'BS. Phạm Minh', dept: 'Tai Mũi Họng', time: '08:00 - 12:00', room: 'P.401' },
//     ]
//   });

  const getListData = (value) => {
    const dateString = value.format('YYYY-MM-DD');
    return scheduleData[dateString] || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    
    if (!listData || listData.length === 0) return null;

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item) => {
          const content = (
            <div style={{ width: 280 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                <Avatar 
                  size={48} 
                  style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}
                  icon={<UserOutlined />}
                >
                  {item.doctor[0]}
                </Avatar>
                <div>
                  <Text strong style={{ fontSize: 15, display: 'block', lineHeight: 1.2, marginBottom: 4 }}>
                    {item.doctor}
                  </Text>
                  <Tag color="cyan" style={{ margin: 0, fontSize: 11 }}>
                     Khoa {item.dept}
                  </Tag>
                </div>
              </div>

              <div style={{ background: '#f7f9fc', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                 <div style={{ display: 'flex', marginBottom: 8 }}>
                    <ClockCircleOutlined style={{ color: '#1677ff', marginTop: 3, marginRight: 8 }} />
                    <div>
                      <Text strong >Thời gian trực :  {item.time}</Text>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex' }}>
                    <HomeOutlined style={{ color: '#1677ff', marginTop: 3, marginRight: 8 }} />
                    <div>
                      <Text strong >Địa điểm :  {item.room} </Text>
                    </div>
                 </div>
              </div>
            </div>
          );

          return (
            <li key={item.id} style={{ marginBottom: 4 }}>
              <Popover content={content} title={null} trigger="hover" placement="rightTop">
                  <div style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: 4,
                      transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                      <Badge status="success" /> 
                      <Text style={{ fontSize: 11, width: '100%' }} ellipsis>
                          {item.time.split(' - ')[0]} - {item.doctor}
                      </Text>
                  </div>
              </Popover>
            </li>
          );
        })}
      </ul>
    );
  };

  const onSelectDate = (date, { source }) => {
    if (source === 'date') {
        const dateString = date.format('YYYY-MM-DD');
        setSelectedDate(date);
        setSelectedDateShifts(scheduleData[dateString] || []);
        setViewDetailsOpen(true);
    }
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingScheduleId(null);
    form.resetFields();
    form.setFieldsValue({ date: selectedDate });
    setIsModalOpen(true);
  };

  const handleUploadSubmit =  async () => {
    try {
          const values = await uploadForm.validateFields();
          const fileList = values.file;
          
          if (!fileList || fileList.length === 0) {
              message.error("Vui lòng chọn một file CSV để tải lên.");
              return;
          }

          const file = fileList[0].originFileObj;
          
          const formData = new FormData();
          formData.append('file', file);
          
          message.loading({ content: 'Đang xử lý file CSV...', key: 'uploadCsv' });

          const res = await importStaffScheduleCSVAPI(formData);
          
          if (res.data?.success) {
              const { successes, errors } = res.data.data;
              
              setIsUploadModalOpen(false);
              uploadForm.resetFields();
              fetchSchedule(currentMonthView); 

              if (errors && errors.length > 0) {
                  message.warning({ 
                      content: `Thành công ${successes?.length || 0} ca. Thất bại ${errors.length} ca (VD: ${errors[0].message})`, 
                      key: 'uploadCsv', 
                      duration: 6 
                  });
              } else {
                  message.success({ content: `Đã nhập thành công ${successes?.length || 0} ca trực!`, key: 'uploadCsv', duration: 3 });
              }
          }
      } catch (error) {
          console.error("Lỗi upload CSV:", error);
          message.error({ content: error.response?.data?.message || 'Có lỗi xảy ra khi upload file.', key: 'uploadCsv', duration: 3 });
      }
  };

  const handleFormSubmit = async (values) => {
    try {
          const fromTime = values.time[0].format('HH:mm:00+07');
          const toTime = values.time[1].format('HH:mm:00+07');
          const dateStr = values.date.format('YYYY-MM-DD');
          
          let roomStr = values.room.toString();
          if (!roomStr.toUpperCase().startsWith('P')) {
              roomStr = `P${roomStr}`;
          }

          const payload = {
              doctorId: values.doctor, 
              room: roomStr,
              date: dateStr,
              from: fromTime,
              to: toTime
          };

          let res;
          if (isEditMode) {
              res = await updateStaffScheduleAPI(editingScheduleId, payload);
          } else {
              res = await createStaffScheduleAPI(payload);
          }
          
          if (res.data?.success) {
              message.success(isEditMode ? "Đã cập nhật lịch trực!" : "Đã thêm lịch trực thành công!");
              setIsModalOpen(false);
              fetchSchedule(currentMonthView); 
          }
      } catch (error) {
          console.error("Lỗi thêm lịch:", error);
          message.error("Có lỗi xảy ra khi lưu lịch.");
      }
  };

  const handleDeleteShift = (scheduleId) => {
    Modal.confirm({
        title: 'Xác nhận xóa ca trực',
        content: 'Bạn có chắc chắn muốn xóa lịch làm việc này không?',
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
              try {
                  const res = await deleteStaffScheduleAPI(scheduleId);
                  if (res.data?.success) {
                      message.success('Đã xóa ca trực thành công');
                      fetchSchedule(currentMonthView); 
                      
                      setSelectedDateShifts(prev => prev.filter(item => item.id !== scheduleId));
                  }
              } catch (error) {
                  console.error("Lỗi xóa ca trực:", error);
                  message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa ca trực.');
              }
          }
    });
  };
  const handleEditShift = (shift) => {
      const [fromStr, toStr] = shift.time.split(' - ');
      const fromTime = dayjs(fromStr, 'HH:mm:ss+07');
      const toTime = dayjs(toStr, 'HH:mm:ss+07');

      form.setFieldsValue({
          doctor: shift.doctorId || shift.doctor, 
          date: dayjs(selectedDate),
          time: [fromTime, toTime],
          room: shift.room.replace('Room ', '').replace('P', '')
      });

      setEditingScheduleId(shift.id);
      setIsEditMode(true);
      setViewDetailsOpen(false); 
      setIsModalOpen(true); 
  };

  const handleSignOut = () => navigate('/');
  const menuUserItems = [
    { key: '1', label: (<a onClick={() => navigate('/staff/profile')}>Hồ sơ nhân viên</a>), icon: <UserOutlined /> },
    { key: '2', label: (<a onClick={handleSignOut}>Đăng xuất</a>), icon: <LogoutOutlined />, danger: true }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header style={{ background: "#fff", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/staff/dashboard')}>
            <img src="/ASTCare1.png" alt="ATSCare Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['3']} 
          items={[
            { key: "1", label: "Trang chủ" },
            { key: "2", label: "Lịch đặt khám" },
            { key: "3", label: "Quản lý lịch" },
          ]}
          style={{ fontSize: 16, fontWeight: 500, color: '#555', borderBottom: 'none', flex: 1, justifyContent: 'center' }}
          onClick={({ key }) => {
            if(key === '1') navigate('/staff/dashboard');
            if(key === '2') navigate('/staff/appointments');
            if(key === '3') navigate('/staff/manage-schedule');
          }}
        />
        <Dropdown menu={{ items: menuUserItems }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: 'pointer' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{user.name}</span>
                <span style={{ fontSize: 12, color: '#888' }}>Phòng Tiếp nhận</span>
            </div>
            <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#faad14' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: "30px 40px" }}>
        
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <Title level={3} style={{ margin: 0 }}>Quản lý lịch làm việc</Title>
                <Text type="secondary">Xem, chỉnh sửa và phân bổ lịch trực cho bác sĩ</Text>
            </div>
            <Space>
                <Button 
                    icon={<FilePdfOutlined />} 
                    onClick={handleExportCSV}
                    loading={exporting}
                >
                    Xuất CSV
                </Button>

                <Button 
                    icon={<UploadOutlined />} 
                    onClick={() => setIsUploadModalOpen(true)}
                >
                    Nhập từ CSV
                </Button>

                <Button 
                    type="primary"
                    icon={<PlusOutlined />} 
                    onClick={handleAddNew}
                >
                    Thêm lịch thủ công
                </Button>
                
            </Space>
        </div>

        {/* CALENDAR */}
        <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Calendar 
                dateCellRender={dateCellRender} 
                onSelect={onSelectDate}
                onPanelChange={(date) => setCurrentMonthView(date)}
                headerRender={({ value, onChange }) => {
                    return (
                        <div style={{ padding: '10px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={4} style={{ margin: 0 }}>Tháng {value.format('MM/YYYY')}</Title>
                            <Space>
                                <Select
                                    size="small"
                                    popupMatchSelectWidth={false}
                                    value={value.month()}
                                    onChange={(newMonth) => {
                                        const now = value.clone().month(newMonth);
                                        onChange(now);
                                        setCurrentMonthView(now);
                                    }}
                                >
                                    {Array.from({ length: 12 }, (_, i) => <Select.Option key={i} value={i}>Tháng {i + 1}</Select.Option>)}
                                </Select>
                                <Select
                                    size="small"
                                    popupMatchSelectWidth={false}
                                    value={value.year()}
                                    onChange={(newYear) => {
                                        const now = value.clone().year(newYear);
                                        onChange(now);
                                        setCurrentMonthView(now);
                                    }}
                                >
                                    {Array.from({ length: 10 }, (_, i) => <Select.Option key={i} value={dayjs().year() - 5 + i}>{dayjs().year() - 5 + i}</Select.Option>)}
                                </Select>
                            </Space>
                        </div>
                    );
                }}
            />
        </Card>

      </Content>
      <Footer />

      <Modal
        title={`Lịch trực ngày ${selectedDate.format('DD/MM/YYYY')}`}
        open={viewDetailsOpen}
        onCancel={() => setViewDetailsOpen(false)}
        footer={[
            <Button key="add" icon={<PlusOutlined />} onClick={() => { setViewDetailsOpen(false); handleAddNew(); }}>Thêm ca vào ngày này</Button>,
            <Button key="close" type="primary" onClick={() => setViewDetailsOpen(false)}>Đóng</Button>
        ]}
        width={700}
      >
        {selectedDateShifts.length > 0 ? (
            <List
                itemLayout="horizontal"
                dataSource={selectedDateShifts}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Tooltip key="edit" title="Chỉnh sửa"><Button type="text" icon={<EditOutlined />} onClick={() => handleEditShift(item)} /></Tooltip>,
                            <Tooltip key="delete" title="Xóa"><Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteShift(item.id)} /></Tooltip>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#1677ff' }}>{item.doctor[0]}</Avatar>} 
                            title={
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Text strong>{item.doctor}</Text>
                                    <Tag color="blue">{item.dept}</Tag>
                                </div>
                            }
                            description={
                                <div style={{ marginTop: 4 }}>
                                    <Space split={<Divider type="vertical" />}>
                                        <Text style={{ fontSize: 13 }}><ClockCircleOutlined /> {item.time}</Text>
                                        <Text style={{ fontSize: 13 }}><UserOutlined /> Phòng: {item.room}</Text>
                                    </Space>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        ) : (
            <div style={{ textAlign: 'center', padding: '30px', background: '#f5f5f5', borderRadius: 8 }}>
                <CalendarOutlined style={{ fontSize: 32, color: '#d9d9d9', marginBottom: 12 }} />
                <p style={{ color: '#999', margin: 0 }}>Không có lịch trực nào trong ngày này.</p>
            </div>
        )}
      </Modal>

      <Modal
        title={isEditMode ? "Chỉnh sửa ca trực" : "Thêm lịch làm việc mới"}
        open={isModalOpen}
        onCancel={() => {
            setIsModalOpen(false);
            setIsEditMode(false);
            setEditingScheduleId(null);
            form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item label="Chọn Bác sĩ" name="doctor" rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}>
                <Select 
                    placeholder="Tìm kiếm bác sĩ..." 
                    showSearch 
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {doctorOptions.map(doc => (
                        <Option 
                            key={doc.id} 
                            value={doc.id}
                            label={`${doc.lastName} ${doc.firstName}`} 
                        >
                            BS. {doc.lastName} {doc.firstName} ({doc.department || 'Chưa rõ'})
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            
                    <Form.Item label="Ngày trực" name="date" rules={[{ required: true, message: 'Chọn ngày' }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item label="Khung giờ (Bắt đầu - Kết thúc)" name="time" rules={[{ required: true, message: 'Chọn giờ' }]}>
                        <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>



                    <Form.Item label="Phòng khám" name="room" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} placeholder="VD: 201" prefix="P." />
                    </Form.Item>
 
   
        </Form>
      </Modal>

      <Modal
        title="Nhập lịch từ file CSV"
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        onOk={handleUploadSubmit}
        okText="Tiến hành nhập liệu"
      >
        <Form form={uploadForm} layout="vertical">
            {/* <Form.Item 
                label="Áp dụng cho tháng" 
                name="month" 
                rules={[{ required: true, message: 'Vui lòng chọn tháng cần nhập lịch' }]}
                initialValue={dayjs()}
            >
                <DatePicker picker="month" format="MM/YYYY" style={{ width: '100%' }} />
            </Form.Item> */}

            <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Vui lòng tải lên file theo mẫu quy định (.csv). </Text>
            </div>
            
            <Form.Item name="file" valuePropName="fileList" getValueFromEvent={(e) => {
                if (Array.isArray(e)) return e;
                return e && e.fileList;
            }}>
                <Dragger 
                    name="file" 
                    multiple={false} 
                    height={200}
                    beforeUpload={() => false}
                    maxCount={1}
                >
                    <p className="ant-upload-drag-icon">
                        <FileExcelOutlined style={{ color: '#52c41a' }} />
                    </p>
                    <p className="ant-upload-text">Kéo thả file vào đây hoặc click để chọn</p>
                    <p className="ant-upload-hint">
                        Hệ thống sẽ tự động đối chiếu mã bác sĩ và xếp lịch theo ngày trong file.
                    </p>
                </Dragger>
            </Form.Item>
        </Form>
      </Modal>

    </Layout>
  );
}