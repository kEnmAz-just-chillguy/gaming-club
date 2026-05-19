import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Statistics from './pages/Statistics';
import Employees from './pages/Employees';
import Spending from './pages/Spending';
import Bars from './pages/Bars';
import History from './pages/History';
import Appearance from './pages/Appearance';
import Settings from './pages/Settings';
import RoomDetail from './pages/RoomDetail';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function ProtectedLayout() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/spending" element={<Spending />} />
          <Route path="/bars" element={<Bars />} />
          <Route path="/history" element={<History />} />
          <Route path="/appearance" element={<Appearance />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/room/:id" element={<RoomDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
