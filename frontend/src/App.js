import React, { useState } from 'react';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.role === 'manager') {
    return <ManagerDashboard user={user} onLogout={handleLogout} />;
  }

  return <EmployeeDashboard user={user} onLogout={handleLogout} />;
}

export default App;
