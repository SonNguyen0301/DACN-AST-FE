import { Avatar, Dropdown, Layout, Menu } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const { Header } = Layout;

const MENU_ITEMS = [
  { key: '1', label: 'Trang chủ' },
  { key: '2', label: 'Lịch đặt khám' },
  { key: '3', label: 'Quản lý lịch' },
];

const ROUTE_MAP = {
  '1': '/staff/dashboard',
  '2': '/staff/appointments',
  '3': '/staff/manage-schedule',
};

export default function StaffHeader({ selectedKey = '' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <a onClick={() => navigate('/staff/profile')}>Hồ sơ nhân viên</a>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <a onClick={handleSignOut}>Đăng xuất</a>,
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => navigate('/staff/dashboard')}
      >
        <img src="/ASTCare1.png" alt="ASTCare Logo" style={{ height: 40, objectFit: 'contain' }} />
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={selectedKey ? [selectedKey] : []}
        items={MENU_ITEMS}
        onClick={({ key }) => ROUTE_MAP[key] && navigate(ROUTE_MAP[key])}
        style={{
          fontSize: 15,
          fontWeight: 500,
          borderBottom: 'none',
          flex: 1,
          justifyContent: 'center',
          marginLeft: 20,
        }}
      />

      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div
            className="hide-on-mobile"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <Avatar
            size={40}
            src={user?.avatarUrl}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#faad14' }}
          />
        </div>
      </Dropdown>
    </Header>
  );
}
