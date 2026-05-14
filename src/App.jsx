import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <BrowserRouter>
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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
