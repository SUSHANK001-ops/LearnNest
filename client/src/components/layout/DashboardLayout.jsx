import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout = ({ children, role }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch (e) { /* ignore */ }
    }
  }, []);

  // On mobile, collapsed means hidden. On desktop, collapsed means narrow.
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={role}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Main content area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <TopBar user={user} onMenuToggle={toggleSidebar} />

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
