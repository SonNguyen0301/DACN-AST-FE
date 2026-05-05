import { Avatar, Dropdown, Layout, Menu } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const { Header } = Layout;

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Trang chủ' },
  { key: 'users',     label: 'Quản lý tài khoản' },
  { key: 'AI',        label: 'Quản lý Model AI' },
];

const ROUTE_MAP = {
  dashboard: '/admin/dashboard',
  users:     '/admin/user-management',
  AI:        '/admin/model-ai',
};

export default function AdminHeader({ selectedKey = '' }) {
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
      label: <a onClick={() => navigate('/admin/profile')}>Hồ sơ của tôi</a>,
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
        onClick={() => navigate('/admin/dashboard')}
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

      <Dropdown menu={{ items: userMenuItems }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div
            className="hide-on-mobile"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>
              {user?.firstName} {user?.lastName}
            </span>
            <span style={{ fontSize: 12, color: '#888' }}>Quản trị hệ thống</span>
          </div>
          <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#001529' }} />
        </div>
      </Dropdown>
    </Header>
  );
}
