import React, { useState, useEffect } from 'react';
import { Drawer, Table, Row, Col, Typography, Tag, Spin, Empty, Button, Space, Card } from 'antd';
import { RightOutlined, UserOutlined, ClockCircleOutlined, ApiOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import adminService from '../../../services/adminService';

const { Title, Text } = Typography;

export default function DoctorPatientsDrawer({ open, onClose, doctor, month, year }) {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  // Fetch Danh sách bệnh nhân khi mở Drawer
  useEffect(() => {
    if (open && doctor) {
      fetchPatients();
      setSelectedPatient(null);
      setConsultations([]);
    }
  }, [open, doctor, month, year]);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await adminService.getDoctorPatients(doctor.key, { month, year });
      setPatients(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách bệnh nhân:", error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchConsultations = async (patient) => {
    setSelectedPatient(patient);
    setLoadingConsultations(true);
    try {
      const res = await adminService.getPatientConsultations(doctor.key, patient.patientId, { month, year });
      setConsultations(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Lỗi lấy lịch sử khám:", error);
    } finally {
      setLoadingConsultations(false);
    }
  };

  const patientColumns = [
    {
      title: 'Tên Bệnh Nhân',
      dataIndex: 'patientName',
      render: (text) => <Text strong>{text || 'Chưa cập nhật'}</Text>
    },
    {
      title: 'Số lần khám',
      dataIndex: 'totalExaminations',
      align: 'center',
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Button 
          type={selectedPatient?.patientId === record.patientId ? "primary" : "text"} 
          icon={<RightOutlined />} 
          onClick={() => fetchConsultations(record)} 
        />
      )
    }
  ];

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <UserOutlined style={{ marginRight: 8, color: '#1677ff' }} />
            Bệnh nhân của BS. {doctor?.name}
          </span>
          <Tag color="cyan">Tháng {month}/{year}</Tag>
        </div>
      }
      width="60%"
      placement="right"
      onClose={onClose}
      open={open}
      styles={{ body: { padding: 0, overflow: 'hidden' } }}
    >
      <Row style={{ height: '100%' }}>
        {/* CỘT TRÁI (40%): Danh sách bệnh nhân */}
        <Col xs={24} md={10} style={{ borderRight: '1px solid #f0f0f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
            <Text strong>Danh sách Bệnh nhân ({patients.length})</Text>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Table
              loading={loadingPatients}
              columns={patientColumns}
              dataSource={patients}
              rowKey="patientId"
              pagination={false}
              size="middle"
              rowClassName={(record) => record.patientId === selectedPatient?.patientId ? 'ant-table-row-selected' : ''}
              onRow={(record) => ({
                onClick: () => fetchConsultations(record),
                style: { cursor: 'pointer' }
              })}
            />
          </div>
        </Col>

        {/* CỘT PHẢI (60%): Chi tiết lịch sử khám */}
        <Col xs={24} md={14} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {!selectedPatient ? (
            <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Empty description="Chọn một bệnh nhân để xem chi tiết các ca khám" />
            </div>
          ) : (
            <>
              <div style={{ padding: '16px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <Title level={5} style={{ margin: 0, color: '#1677ff' }}>Lịch sử khám: {selectedPatient.patientName}</Title>
                <Space style={{ marginTop: 8 }}>
                  <Text type="secondary">CCCD: {selectedPatient.citizenCode || 'N/A'}</Text>
                  <Text type="secondary">|</Text>
                  <Text type="secondary">SĐT: {selectedPatient.phoneNumber || 'N/A'}</Text>
                </Space>
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                <Spin spinning={loadingConsultations}>
                  {consultations.length === 0 ? (
                    <Empty description="Không có dữ liệu ca khám" />
                  ) : (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                      {consultations.map((c, index) => (
                        <Card 
                          key={c.consultationId || index} 
                          size="small" 
                          variant="borderless"
                          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}
                          title={
                            <span><ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} /> {dayjs(c.date).format('DD/MM/YYYY HH:mm')}</span>
                          }
                          extra={
                            c.hasAiUsage ? <Tag color="purple" icon={<ApiOutlined />}>AI Supported</Tag> : <Tag color="default">Standard</Tag>
                          }
                        >
                          <Text strong style={{ display: 'block', marginBottom: 4 }}><CheckCircleOutlined style={{ color: '#1677ff', marginRight: 6 }}/>Kết luận của Bác sĩ:</Text>
                          <Text style={{ whiteSpace: 'pre-wrap' }}>{c.diagnosis}</Text>
                        </Card>
                      ))}
                    </Space>
                  )}
                </Spin>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Drawer>
  );
}