import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Typography, Empty, Spin } from 'antd';

const { Text } = Typography;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16', '#a0d911', '#1890ff'];

export default function MonthlyDiseasesChart({ data, loading }) {
  if (loading) {
    return (
      <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin tip="Đang tải dữ liệu bệnh lý...">
           <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="Không có dữ liệu bệnh lý trong tháng này" />
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map(item => ({
    name: item.diseaseName,
    count: item.count
  }));

  return (
    <div style={{ width: '100%', height: 350, minHeight: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={120} 
            tick={{ fontSize: 12, fill: '#555' }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            formatter={(value) => [`${value} ca khám`, 'Số lượng']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
