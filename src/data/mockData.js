export const rooms = [
  { id: 1, number: 'A-01', type: 'VIP Suite', pcs: 6, status: 'occupied', game: 'CS2', player: 'Alex M.', since: '13:00', revenue: 45 },
  { id: 2, number: 'A-02', type: 'Standard', pcs: 4, status: 'available', game: null, player: null, since: null, revenue: 0 },
  { id: 3, number: 'A-03', type: 'VIP Suite', pcs: 6, status: 'occupied', game: 'Valorant', player: 'Sara K.', since: '12:30', revenue: 60 },
  { id: 4, number: 'B-01', type: 'Standard', pcs: 4, status: 'occupied', game: 'Dota 2', player: 'Tom R.', since: '14:00', revenue: 30 },
  { id: 5, number: 'B-02', type: 'Premium', pcs: 8, status: 'available', game: null, player: null, since: null, revenue: 0 },
  { id: 6, number: 'B-03', type: 'Standard', pcs: 4, status: 'maintenance', game: null, player: null, since: null, revenue: 0 },
  { id: 7, number: 'C-01', type: 'Premium', pcs: 8, status: 'occupied', game: 'FIFA 25', player: 'Mike D.', since: '11:00', revenue: 80 },
  { id: 8, number: 'C-02', type: 'Standard', pcs: 4, status: 'available', game: null, player: null, since: null, revenue: 0 },
  { id: 9, number: 'C-03', type: 'VIP Suite', pcs: 6, status: 'occupied', game: 'Fortnite', player: 'Jay P.', since: '15:00', revenue: 25 },
  { id: 10, number: 'D-01', type: 'Standard', pcs: 4, status: 'available', game: null, player: null, since: null, revenue: 0 },
  { id: 11, number: 'D-02', type: 'Premium', pcs: 8, status: 'occupied', game: 'Warzone', player: 'Nina S.', since: '10:00', revenue: 95 },
  { id: 12, number: 'D-03', type: 'Standard', pcs: 4, status: 'available', game: null, player: null, since: null, revenue: 0 },
];

export const employees = [
  { id: 1, name: 'Adam Johnson', role: 'Manager', department: 'Operations', salary: 2800, status: 'active', shift: 'Morning', joined: '2022-03-15', avatar: 'AJ', color: '#7c3aed' },
  { id: 2, name: 'Sara Kim', role: 'Cashier', department: 'Finance', salary: 1400, status: 'active', shift: 'Evening', joined: '2023-01-10', avatar: 'SK', color: '#06b6d4' },
  { id: 3, name: 'Mike Davis', role: 'Technician', department: 'IT', salary: 1800, status: 'active', shift: 'Morning', joined: '2022-08-20', avatar: 'MD', color: '#10b981' },
  { id: 4, name: 'Lena Park', role: 'Cashier', department: 'Finance', salary: 1400, status: 'off', shift: 'Night', joined: '2023-05-01', avatar: 'LP', color: '#f59e0b' },
  { id: 5, name: 'Tom Reed', role: 'Security', department: 'Safety', salary: 1600, status: 'active', shift: 'Night', joined: '2021-11-30', avatar: 'TR', color: '#ef4444' },
  { id: 6, name: 'Nora Bell', role: 'Technician', department: 'IT', salary: 1750, status: 'active', shift: 'Morning', joined: '2023-07-12', avatar: 'NB', color: '#ec4899' },
  { id: 7, name: 'Jake Fox', role: 'Barista', department: 'Bar', salary: 1300, status: 'active', shift: 'Evening', joined: '2024-01-05', avatar: 'JF', color: '#8b5cf6' },
];

export const spendings = [
  { id: 1, name: 'PC Hardware Upgrade', category: 'Equipment', amount: 4500, date: '2025-05-01', icon: '🖥️', color: 'rgba(124,58,237,0.2)', type: 'expense' },
  { id: 2, name: 'Electricity Bill', category: 'Utilities', amount: 820, date: '2025-05-05', icon: '⚡', color: 'rgba(245,158,11,0.2)', type: 'expense' },
  { id: 3, name: 'Coffee & Snacks Stock', category: 'Bar', amount: 350, date: '2025-05-06', icon: '☕', color: 'rgba(6,182,212,0.2)', type: 'expense' },
  { id: 4, name: 'Gaming Chairs x4', category: 'Furniture', amount: 1200, date: '2025-05-08', icon: '🪑', color: 'rgba(16,185,129,0.2)', type: 'expense' },
  { id: 5, name: 'Internet Subscription', category: 'Utilities', amount: 200, date: '2025-05-10', icon: '🌐', color: 'rgba(6,182,212,0.2)', type: 'expense' },
  { id: 6, name: 'Game Licenses (Steam)', category: 'Software', amount: 680, date: '2025-05-11', icon: '🎮', color: 'rgba(139,92,246,0.2)', type: 'expense' },
  { id: 7, name: 'Staff Salaries', category: 'Payroll', amount: 11050, date: '2025-05-01', icon: '👥', color: 'rgba(239,68,68,0.2)', type: 'expense' },
  { id: 8, name: 'Cleaning Supplies', category: 'Maintenance', amount: 130, date: '2025-05-12', icon: '🧹', color: 'rgba(16,185,129,0.2)', type: 'expense' },
];

export const barItems = [
  { id: 1, name: 'Espresso', category: 'Hot Drinks', price: 2.5, stock: 200, sold: 87, icon: '☕' },
  { id: 2, name: 'Cappuccino', category: 'Hot Drinks', price: 3.5, stock: 150, sold: 65, icon: '☕' },
  { id: 3, name: 'Energy Drink', category: 'Cold Drinks', price: 4.0, stock: 120, sold: 110, icon: '🥤' },
  { id: 4, name: 'Cola', category: 'Cold Drinks', price: 2.0, stock: 200, sold: 143, icon: '🥤' },
  { id: 5, name: 'Burger', category: 'Food', price: 6.5, stock: 50, sold: 32, icon: '🍔' },
  { id: 6, name: 'Hot Dog', category: 'Food', price: 4.0, stock: 80, sold: 55, icon: '🌭' },
  { id: 7, name: 'Chips & Nachos', category: 'Snacks', price: 3.0, stock: 100, sold: 78, icon: '🍟' },
  { id: 8, name: 'Chocolate Bar', category: 'Snacks', price: 1.5, stock: 200, sold: 92, icon: '🍫' },
  { id: 9, name: 'Water Bottle', category: 'Cold Drinks', price: 1.0, stock: 300, sold: 210, icon: '💧' },
  { id: 10, name: 'Juice', category: 'Cold Drinks', price: 2.5, stock: 100, sold: 60, icon: '🧃' },
];

export const historyData = [
  { id: 1, type: 'session', desc: 'Room A-01 session ended', user: 'Alex M.', room: 'A-01', amount: 45, time: '15:30', date: '2025-05-14', status: 'completed' },
  { id: 2, type: 'purchase', desc: 'Bar purchase — Energy Drink x2', user: 'Sara K.', room: 'A-03', amount: 8, time: '15:15', date: '2025-05-14', status: 'completed' },
  { id: 3, type: 'session', desc: 'Room C-01 session started', user: 'Mike D.', room: 'C-01', amount: null, time: '14:50', date: '2025-05-14', status: 'active' },
  { id: 4, type: 'maintenance', desc: 'B-03 marked for maintenance', user: 'Mike Davis (Tech)', room: 'B-03', amount: null, time: '14:30', date: '2025-05-14', status: 'pending' },
  { id: 5, type: 'session', desc: 'Room D-02 session started', user: 'Nina S.', room: 'D-02', amount: null, time: '13:55', date: '2025-05-14', status: 'active' },
  { id: 6, type: 'purchase', desc: 'Bar purchase — Burger + Cola', user: 'Tom R.', room: 'B-01', amount: 8.5, time: '13:45', date: '2025-05-14', status: 'completed' },
  { id: 7, type: 'session', desc: 'Room A-02 session ended', user: 'Guest', room: 'A-02', amount: 22, time: '13:00', date: '2025-05-14', status: 'completed' },
  { id: 8, type: 'session', desc: 'Room A-03 session started', user: 'Sara K.', room: 'A-03', amount: null, time: '12:30', date: '2025-05-14', status: 'active' },
  { id: 9, type: 'purchase', desc: 'Bar purchase — Cappuccino x3', user: 'Group booking', room: 'B-02', amount: 10.5, time: '11:20', date: '2025-05-13', status: 'completed' },
  { id: 10, type: 'session', desc: 'Room C-01 session ended', user: 'Jay P.', room: 'C-01', amount: 60, time: '11:00', date: '2025-05-13', status: 'completed' },
];

export const revenueData = [
  { month: 'Jan', revenue: 8200, expenses: 5100, sessions: 310 },
  { month: 'Feb', revenue: 9400, expenses: 5400, sessions: 360 },
  { month: 'Mar', revenue: 11200, expenses: 6100, sessions: 430 },
  { month: 'Apr', revenue: 10800, expenses: 5800, sessions: 415 },
  { month: 'May', revenue: 13500, expenses: 7200, sessions: 520 },
  { month: 'Jun', revenue: 12100, expenses: 6500, sessions: 470 },
  { month: 'Jul', revenue: 14800, expenses: 7800, sessions: 570 },
  { month: 'Aug', revenue: 15200, expenses: 8100, sessions: 590 },
  { month: 'Sep', revenue: 13900, expenses: 7500, sessions: 540 },
  { month: 'Oct', revenue: 16400, expenses: 8600, sessions: 630 },
  { month: 'Nov', revenue: 15800, expenses: 8200, sessions: 610 },
  { month: 'Dec', revenue: 18200, expenses: 9400, sessions: 710 },
];

export const weeklyData = [
  { day: 'Mon', sessions: 42, bar: 18 },
  { day: 'Tue', sessions: 38, bar: 22 },
  { day: 'Wed', sessions: 55, bar: 30 },
  { day: 'Thu', sessions: 60, bar: 35 },
  { day: 'Fri', sessions: 88, bar: 52 },
  { day: 'Sat', sessions: 95, bar: 64 },
  { day: 'Sun', sessions: 72, bar: 48 },
];

export const topGames = [
  { name: 'CS2', sessions: 312, percent: 28, color: '#f59e0b' },
  { name: 'Valorant', sessions: 258, percent: 23, color: '#ef4444' },
  { name: 'Dota 2', sessions: 196, percent: 18, color: '#7c3aed' },
  { name: 'Warzone', sessions: 152, percent: 14, color: '#06b6d4' },
  { name: 'FIFA 25', sessions: 112, percent: 10, color: '#10b981' },
  { name: 'Others', sessions: 78, percent: 7, color: '#64748b' },
];
