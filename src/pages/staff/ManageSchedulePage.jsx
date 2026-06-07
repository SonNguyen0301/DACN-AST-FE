import { useState, useEffect, useMemo } from 'react';
import {
  Layout,
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
  Space,
  Tag,
  Divider,
  Popover, 
  Checkbox,
  Row,
  Col,
  Tabs,
  Table
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  ClockCircleOutlined,
  HomeOutlined,       
  FilePdfOutlined,
  FilterOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);
import Footer from "../../components/common/Footer"; 
import { getStaffScheduleAPI, createStaffScheduleAPI, importStaffScheduleCSVAPI, exportStaffScheduleCSVAPI, updateStaffScheduleAPI, deleteStaffScheduleAPI } from '../../services/staffService';
import { getDoctorsAPI } from '../../services/doctorService';
import useAuth from "../../hooks/useAuth";
import StaffHeader from './components/StaffHeader';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

export default function ManageStaffSchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm(); 

  const [scheduleData, setScheduleData] = useState({});
  const [currentMonthView, setCurrentMonthView] = useState(dayjs());
  const [doctorOptions, setDoctorOptions] = useState([]);
  
  const [filterDoctorId, setFilterDoctorId] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateShifts, setSelectedDateShifts] = useState([]);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  const [exporting, setExporting] = useState(false); 
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchSchedule = async (dateObj) => {
      try {
          const startDate = dateObj.startOf('month').format('YYYY-MM-DD');
          const endDate = dateObj.endOf('month').format('YYYY-MM-DD');

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
                      id: item.scheduleId, 
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
              const res = await getDoctorsAPI({ page: 1, take: 50, sortDirection: 'ASC', department: 'Dermatology' });
              
              if (res.data?.success) {
                  const docs = res.data.data.data || res.data.data;
                  setDoctorOptions(docs);
              }
          } catch (error) {
              console.error("Lỗi tải danh sách bác sĩ:", error);
                message.error("Không thể tải danh sách bác sĩ.");
          }
      };

      fetchDoctorsList();
  }, []);

  const allRooms = useMemo(() => {
      const rooms = new Set();
      Object.values(scheduleData).flat().forEach(shift => {
          if (shift.room) rooms.add(shift.room);
      });
      return Array.from(rooms).sort();
  }, [scheduleData]);

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

  const getFilteredListData = (value) => {
    const dateString = value.format('YYYY-MM-DD');
    let list = scheduleData[dateString] || [];
    
    if (filterDoctorId !== 'all') {
        list = list.filter(item => item.doctorId === filterDoctorId);
    }
    if (filterRoom !== 'all') {
        list = list.filter(item => item.room === filterRoom);
    }
    return list;
  };

  const dateCellRender = (value) => {
    const listData = getFilteredListData(value);
    
    if (!listData || listData.length === 0) return null;

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item) => {
          const content = (
            <div style={{ width: 280, maxWidth: '100%' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                <Avatar 
                  size={48} 
                  style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}
                  icon={<UserOutlined />}
                >
                  {item.doctor?.[0] || 'BS'}
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
        setSelectedDate(date);
        setSelectedDateShifts(getFilteredListData(date));
        setSelectedIds([]);
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
                      content: `Nhập ca trực thất bại!`, 
                      key: 'uploadCsv', 
                      duration: 6 
                  });
              } else {
                  message.success({ content: `Đã nhập thành công các ca trực!`, key: 'uploadCsv', duration: 3 });
              }
          }
      } catch (error) {
          const apiMessage = error.response?.data?.message || '';
        let displayMessage = 'Có lỗi xảy ra khi upload file.'; 

        if (apiMessage) {
            let match;
            
            if ((match = apiMessage.match(/CSV file is missing required columns:\s*(.*)/))) {
                displayMessage = `File CSV bị thiếu cột cần thiết sau: ${match[1]}`;
            } 
            else if ((match = apiMessage.match(/Duplicate CSV row\s*-\s*(.*)/))) {
                displayMessage = `Dòng sau trong CSV đã bị trùng: ${match[1]}`;
            } 
            else if ((match = apiMessage.match(/Invalid date format \(YYYY-mm-dd required\)\s*-\s*(.*)/))) {
                displayMessage = `Định dạng ngày của dòng này sai, cần theo định dạng YYYY-mm-dd: ${match[1]}`;
            } 
            else if ((match = apiMessage.match(/Invalid '(from|to)' time format \(HH:mm required\)\s*-\s*(.*)/))) {
                displayMessage = `Định dạng thời gian sai ở dòng sau, cần theo định dạng HH:mm: ${match[2]}`;
            } 
            else if ((match = apiMessage.match(/Doctor not found with code (.*?)\s*-\s*(.*)/))) {
                displayMessage = `Bác sĩ không tồn tại với mã bác sĩ ${match[1]} ở dòng sau: ${match[2]}`;
            } 
            else {
                displayMessage = apiMessage;
            }
        }

        message.error({ content: displayMessage, key: 'uploadCsv', duration: 4 });
    }
  };

  const handleFormSubmit = async (values) => {
    try {
          const fromTime = values.time[0].format('HH:mm:00+07');
          const toTime = values.time[1].format('HH:mm:00+07');
          const dateStr = values.date.format('YYYY-MM-DD'); 
          const currentDate = dayjs().format('YYYY-MM-DD');
          const startWeekDate = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
          const endWeekDate = dayjs().endOf('isoWeek').format('YYYY-MM-DD');
          
          let roomStr = values.room.toString();
          if (!roomStr.toUpperCase().startsWith('P')) {
              roomStr = `P${roomStr}`;
          }

          const payload = {
              doctorId: values.doctor, 
              room: roomStr,
              date: dateStr,
              from: fromTime,
              to: toTime    ,
                currentDate,
                startWeekDate,
                endWeekDate
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
          const apiMessage = error.response?.data?.message || '';
          let displayMessage = isEditMode ? 'Có lỗi xảy ra khi cập nhật ca trực.' : 'Có lỗi xảy ra khi thêm ca trực.';

          if (apiMessage.includes('Schedule already exists, existing schedule:')) {
              displayMessage = 'Lịch làm việc này đã tồn tại trong hệ thống';
          } 
          else if (apiMessage.includes('Schedule not found with list of id')) {
              displayMessage = 'Thông tin lịch hẹn không tìm thấy trong danh sách cần hủy';
          } 
          else if (apiMessage.includes('Schedule not found with id')) {
              displayMessage = 'Không thể tìm thấy lịch làm việc';
          } 
          else if (apiMessage.includes('Staff not found with id')) {
              displayMessage = 'Thông tin của nhân viên không tìm thấy trong hệ thống';
          } 
          else if (apiMessage.includes('Schedule date is in the past, the schedule cannot be adjust for schedule with id')) {
              displayMessage = 'Lịch làm việc trong quá khứ không thể được điều chỉnh';
          } 
          else if (apiMessage.includes('Schedule date is in the week, the schedule cannot be deleted for schedule with id')) {
              displayMessage = 'Đang trong tuần làm việc, không thể hủy lịch hẹn này';
          } 
          else if (apiMessage.includes('Schedule has appointments, the schedule with id') && apiMessage.includes('cannot be deleted')) {
              displayMessage = 'Lịch làm việc đã có bệnh nhân đặt hẹn, không thể hủy';
          } else if (apiMessage === 'Invalid time range') {
              displayMessage = 'Thời gian kết thúc không được trước thời gian bắt đầu';
          } 
          else if (apiMessage === 'Time must be on the hour (XX:00:00) or half hour (XX:30:00)') {
              displayMessage = 'Thời gian được định phải theo định dạng (XX:00:00) hoặc (XX:30:00)';
          } 
          else if (apiMessage === 'In a request period that has a schedule with an internal time period, please reselects the time period') {
              displayMessage = 'Trong lịch làm việc được đặt có khoảng thời gian đã được đặt bởi bác sĩ khác, hãy điều chỉnh lại thời gian đặt';
          } 
          else if (apiMessage === 'Invalid time range or the time range after adjust is invalid') {
              displayMessage = 'Thời gian đặt được hiệu chỉnh nhằm tránh xung đột xảy ra lỗi, hãy điều chỉnh lại thời gian đặt';
          } 
          else if (apiMessage === 'You cannot update schedule at date that is in the past') {
              displayMessage = 'Không thể cập nhật lại lịch làm việc ở quá khứ';
          } 
          else if (apiMessage === 'Cannot delete schedule from other department') {
              displayMessage = 'Không thể hủy cuộc hẹn của chuyên khoa khác';
          } 
          else if (apiMessage === 'Schedule is not assigned to any doctor') {
              displayMessage = 'Lịch làm việc không có bác sĩ phụ trách';
          } else if (apiMessage) {
              displayMessage = apiMessage;
          }

          message.error(displayMessage);
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
                  const payload = {
                      scheduleIds: [scheduleId],
                      startWeekDate: dayjs().startOf('week').format('YYYY-MM-DD'),
                      endWeekDate: dayjs().endOf('week').format('YYYY-MM-DD'),
                      currentDate: dayjs().format('YYYY-MM-DD')
                  };

                  const res = await deleteStaffScheduleAPI(payload);
                  
                  if (res.data?.success) {
                      message.success('Đã xóa ca trực thành công');
                      fetchSchedule(currentMonthView); 
                      setSelectedDateShifts(prev => prev.filter(item => item.id !== scheduleId));
                  }
              } catch (error) {
                  const apiMessage = error.response?.data?.message || '';
                  let displayMessage = 'Có lỗi xảy ra khi xóa ca trực.';

                  if (apiMessage.includes('Staff not found with id')) {
                      displayMessage = 'Thông tin của nhân viên không tìm thấy trong hệ thống';
                  } else if (apiMessage.includes('Schedule not found with list of id')) {
                      displayMessage = 'Thông tin lịch hẹn không tìm thấy trong danh sách cần hủy';
                  } else if (apiMessage.includes('Schedule date is in the past, the schedule cannot be adjust for schedule with id')) {
                      displayMessage = 'Lịch làm việc trong quá khứ không thể được điều chỉnh';
                  } else if (apiMessage.includes('Schedule date is in the week, the schedule cannot be deleted for schedule with id')) {
                      displayMessage = 'Đang trong tuần làm việc, không thể hủy lịch hẹn này';
                  } else if (apiMessage.includes('Schedule has appointments, the schedule with id') && apiMessage.includes('cannot be deleted')) {
                      displayMessage = 'Lịch làm việc đã có bệnh nhân đặt hẹn, không thể hủy';
                  } else if (apiMessage === 'Cannot delete schedule from other department') {
                      displayMessage = 'Không thể hủy cuộc hẹn của chuyên khoa khác';
                  } else if (apiMessage === 'Schedule is not assigned to any doctor') {
                      displayMessage = 'Lịch làm việc không có bác sĩ phụ trách';
                  } else if (apiMessage) {
                      displayMessage = apiMessage;
                  }

                  message.error(displayMessage);
              }
          }
    });
  };

  const handleEditShift = (shift) => {
      const [fromStr, toStr] = shift.time.split(' - ');
      const fromTime = dayjs(fromStr, 'HH:mm');
      const toTime = dayjs(toStr, 'HH:mm');

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

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    Modal.confirm({
        title: `Xác nhận xóa ${selectedIds.length} ca trực`,
        content: `Bạn có chắc chắn muốn xóa tất cả các ca trực đã chọn trong ngày ${selectedDate.format('DD/MM/YYYY')} không?`,
        okText: 'Xóa hàng loạt',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
            try {
                message.loading({ content: 'Đang xóa...', key: 'bulkDelete' });
                
                const payload = {
                    scheduleIds: selectedIds, 
                    startWeekDate: dayjs().startOf('week').format('YYYY-MM-DD'),
                    endWeekDate: dayjs().endOf('week').format('YYYY-MM-DD'),
                    currentDate: dayjs().format('YYYY-MM-DD')
                };

                await deleteStaffScheduleAPI(payload);

                message.success({ content: 'Đã xóa các ca trực thành công', key: 'bulkDelete' });
                fetchSchedule(currentMonthView);
                
                const remainingShifts = selectedDateShifts.filter(s => !selectedIds.includes(s.id));
                setSelectedDateShifts(remainingShifts);
                setSelectedIds([]);
                
                if (remainingShifts.length === 0) setViewDetailsOpen(false);
            } catch (error) {
                const apiMessage = error.response?.data?.message || '';
                let displayMessage = 'Có lỗi xảy ra khi xóa hàng loạt';

                if (apiMessage.includes('Staff not found with id')) {
                    displayMessage = 'Thông tin của nhân viên không tìm thấy trong hệ thống';
                } else if (apiMessage.includes('Schedule not found with list of id')) {
                    displayMessage = 'Thông tin lịch hẹn không tìm thấy trong danh sách cần hủy';
                } else if (apiMessage.includes('Schedule date is in the past, the schedule cannot be adjust for schedule with id')) {
                    displayMessage = 'Lịch làm việc trong quá khứ không thể được điều chỉnh';
                } else if (apiMessage.includes('Schedule date is in the week, the schedule cannot be deleted for schedule with id')) {
                    displayMessage = 'Đang trong tuần làm việc, không thể hủy lịch hẹn này';
                } else if (apiMessage.includes('Schedule has appointments, the schedule with id') && apiMessage.includes('cannot be deleted')) {
                    displayMessage = 'Lịch làm việc đã có bệnh nhân đặt hẹn, không thể hủy';
                } else if (apiMessage === 'Cannot delete schedule from other department') {
                    displayMessage = 'Không thể hủy cuộc hẹn của chuyên khoa khác';
                } else if (apiMessage === 'Schedule is not assigned to any doctor') {
                    displayMessage = 'Lịch làm việc không có bác sĩ phụ trách';
                } else if (apiMessage) {
                    displayMessage = apiMessage;
                }

                message.error({ content: displayMessage, key: 'bulkDelete' });
            }
        }
    });
  };

  const displayRooms = filterRoom === 'all' ? allRooms : [filterRoom];
  const timeSlots = [
      "07:30 - 08:00", "08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", 
      "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30",
      "13:00 - 13:30", "13:30 - 14:00", "14:00 - 14:30", "14:30 - 15:00", 
      "15:00 - 15:30", "15:30 - 16:00", "16:00 - 16:30", "16:30 - 17:00"
  ];

  const gridColumns = [
      { title: 'Khung giờ', dataIndex: 'time', key: 'time', fixed: 'left', width: 130, render: (t) => <Text strong>{t}</Text> },
      ...displayRooms.map(room => ({
          title: `Phòng ${room.replace('P', '')}`,
          dataIndex: room,
          key: room,
          minWidth: 150,
          render: (shift) => {
              if (!shift) return <Text type="secondary" style={{ fontStyle: 'italic' }}>Trống</Text>;
              return (
                  <div style={{ padding: '6px 8px', background: '#e6f4ff', borderRadius: 4, borderLeft: '3px solid #1677ff' }}>
                      <Text strong style={{ fontSize: 13, color: '#1677ff', display: 'block' }}>{shift.doctor}</Text>
                  </div>
              );
          }
      }))
  ];

  const gridData = timeSlots.map(slot => {
      const row = { time: slot, key: slot };
      const [slotStart, slotEnd] = slot.split(' - ');
      
      displayRooms.forEach(room => {
          const overlappingShift = selectedDateShifts.find(s => {
              if (s.room !== room) return false;
              const [sStart, sEnd] = s.time.split(' - ');
              return slotStart < sEnd && slotEnd > sStart;
          });
          row[room] = overlappingShift || null;
      });
      return row;
  });

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <StaffHeader selectedKey="3" />

      <Content style={{ padding: "30px 40px" }}>
        
        <Row style={{ marginBottom: 24 }} align="middle" justify="space-between" gutter={[16, 16]}>
            <Col xs={24} md={12}>
                <Title level={3} style={{ margin: 0 }}>Quản lý lịch làm việc</Title>
                <Text type="secondary">Xem, chỉnh sửa và phân bổ lịch trực cho bác sĩ</Text>
            </Col>
            <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
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
                    Thêm lịch
                </Button>
            </Col>
        </Row>

        <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}><FilterOutlined /> Lọc lịch theo Bác sĩ:</Text>
                    <Select
                        showSearch
                        value={filterDoctorId}
                        onChange={setFilterDoctorId}
                        style={{ width: '100%' }}
                        optionFilterProp="children"
                    >
                        <Option value="all">Tất cả Bác sĩ</Option>
                        {doctorOptions.map(doc => (
                            <Option key={doc.id} value={doc.id}>
                                BS. {doc.lastName} {doc.firstName}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} md={12}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}><HomeOutlined /> Lọc theo Phòng khám:</Text>
                    <Select
                        showSearch
                        value={filterRoom}
                        onChange={setFilterRoom}
                        style={{ width: '100%' }}
                    >
                        <Option value="all">Tất cả Phòng</Option>
                        {allRooms.map(room => (
                            <Option key={room} value={room}>Phòng {room}</Option>
                        ))}
                    </Select>
                </Col>
            </Row>
        </Card>

        {/* CALENDAR */}
        <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Calendar 
                dateCellRender={dateCellRender} 
                onSelect={onSelectDate}
                onPanelChange={(date) => setCurrentMonthView(date)}
                headerRender={({ value, onChange }) => {
                    return (
                        <div style={{ padding: '10px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
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
        footer={null}
        width={900} 
        styles={{ body: { padding: '16px 0' } }}
      >
        <Tabs 
            defaultActiveKey="1" 
            centered
            items={[
                {
                    key: '1',
                    label: (<span><AppstoreOutlined /> Danh sách ca trực</span>),
                    children: (
                        <div style={{ padding: '0 24px' }}>
                            {selectedDateShifts.length > 0 ? (
                                <>
                                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Checkbox 
                                            indeterminate={selectedIds.length > 0 && selectedIds.length < selectedDateShifts.length}
                                            checked={selectedIds.length > 0 && selectedIds.length === selectedDateShifts.length}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setSelectedIds(checked ? selectedDateShifts.map(s => s.id) : []);
                                            }}
                                        >
                                            Chọn tất cả ({selectedDateShifts.length} ca)
                                        </Checkbox>

                                        <Space>
                                            {selectedIds.length > 0 && (
                                                <Button danger type="primary" size="small" icon={<DeleteOutlined />} onClick={handleBulkDelete}>
                                                    Xóa ({selectedIds.length})
                                                </Button>
                                            )}
                                            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => { setViewDetailsOpen(false); handleAddNew(); }}>
                                                Thêm ca
                                            </Button>
                                        </Space>
                                    </div>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={selectedDateShifts}
                                        renderItem={(item) => {
                                            const isPastDate = selectedDate.isBefore(dayjs().startOf('day'));
                                            return (
                                                <List.Item
                                                    actions={[
                                                        <Tooltip key="edit" title="Chỉnh sửa"><Button type="text" disabled={isPastDate} icon={<EditOutlined />} onClick={() => handleEditShift(item)} /></Tooltip>,
                                                        <Tooltip key="delete" title="Xóa"><Button type="text" danger disabled={isPastDate} icon={<DeleteOutlined />} onClick={() => handleDeleteShift(item.id)} /></Tooltip>
                                                    ]}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 16, flexWrap: 'nowrap', overflow: 'hidden' }}>
                                                        <Checkbox 
                                                            checked={selectedIds.includes(item.id)}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                setSelectedIds(prev => checked ? [...prev, item.id] : prev.filter(id => id !== item.id));
                                                            }}
                                                        />
                                                        <List.Item.Meta
                                                            avatar={<Avatar style={{ backgroundColor: '#1677ff' }}>{item.doctor?.[0] || 'BS'}</Avatar>} 
                                                            title={
                                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                                    <Text strong>{item.doctor}</Text>
                                                                    <Tag color="blue">{item.dept}</Tag>
                                                                </div>
                                                            }
                                                            description={
                                                                <Space split={<Divider type="vertical" />} wrap>
                                                                    <Text style={{ fontSize: 13 }}><ClockCircleOutlined /> {item.time}</Text>
                                                                    <Text style={{ fontSize: 13 }}><HomeOutlined /> Phòng: {item.room}</Text>
                                                                </Space>
                                                            }
                                                        />
                                                    </div>
                                                </List.Item>
                                            );
                                        }}
                                    />
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', background: '#f5f5f5', borderRadius: 8 }}>
                                    <CalendarOutlined style={{ fontSize: 32, color: '#d9d9d9', marginBottom: 12 }} />
                                    <p style={{ color: '#999', margin: 0, marginBottom: 16 }}>Không có lịch trực nào trong ngày này.</p>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setViewDetailsOpen(false); handleAddNew(); }}>
                                        Thêm ca trực mới
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                },
                {
                    key: '2',
                    label: (<span><ClockCircleOutlined /> Trạng thái khung giờ (Ma trận)</span>),
                    children: (
                        <div style={{ padding: '0 24px' }}>
                            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text type="secondary">
                                    Hiển thị chi tiết tình trạng phòng <strong>Trống / Có người trực</strong> theo từng block 30 phút. 
                                    {filterRoom !== 'all' && <span style={{ color: '#1677ff' }}> (Đang lọc: Phòng {filterRoom})</span>}
                                </Text>
                            </div>
                            <Table 
                                columns={gridColumns}
                                dataSource={gridData}
                                pagination={false}
                                size="small"
                                bordered
                                scroll={{ x: 'max-content', y: 400 }}
                            />
                        </div>
                    )
                }
            ]}
        />
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
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"  disabledDate={(current) => current && current < dayjs().startOf('day')} />
            </Form.Item>

            <Form.Item label="Khung giờ (Bắt đầu - Kết thúc)" name="time" rules={[{ required: true, message: 'Chọn giờ' }]}>
                <TimePicker.RangePicker format="HH:mm" minuteStep={30} style={{ width: '100%' }} />
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

      <style>{`
        @media (max-width: 576px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}