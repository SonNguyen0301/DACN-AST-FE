import { Avatar, Dropdown, Layout, Menu } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const { Header } = Layout;

const MENU_ITEMS = [
  { key: '1', label: 'Trang chủ' },
  { key: '2', label: 'Thông tin cá nhân' },
  { key: '3', label: 'Đặt lịch khám' },
  { key: '4', label: 'Lịch khám của bản thân' },
];

const ROUTE_MAP = {
  '1': '/patient/dashboard',
  '2': '/patient/personal',
  '3': '/patient/booking',
  '4': '/patient/appointments',
};

export default function PatientHeader({ selectedKey = '' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    sessionStorage.removeItem('profileWarningShown');
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <a onClick={() => navigate('/patient/personal')}>Thông tin cá nhân</a>,
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
        onClick={() => navigate('/patient/dashboard')}
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
          <span
            className="hide-on-mobile"
            style={{ fontSize: 15, fontWeight: 600, color: '#333' }}
          >
            {user?.firstName} {user?.lastName}
          </span>
          <Avatar
            size={36}
            src={user?.avatarUrl}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1677ff' }}
          />
        </div>
      </Dropdown>
    </Header>
  );
}
