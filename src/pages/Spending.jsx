import { useState, useEffect } from 'react';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, X, Trash2, Wallet, Calendar, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

const categories = ['Jihozlar', 'Kommunal', 'Bar', 'Mebel', 'Dasturiy ta\'minot', 'Xodimlar (Kassa)', 'Texnik xizmat', 'Boshqa'];
const catColors = { 
  Jihozlar: '#7c3aed', 
  Kommunal: '#f59e0b', 
  Bar: '#06b6d4', 
  Mebel: '#10b981', 
  'Dasturiy ta\'minot': '#8b5cf6', 
  'Xodimlar (Kassa)': '#ef4444', 
  'Texnik xizmat': '#ec4899', 
  Boshqa: '#64748b' 
};

const categoryIcons = {
  Jihozlar: '🖥️',
  Kommunal: '⚡',
  Bar: '☕',
  Mebel: '🪑',
  'Dasturiy ta\'minot': '🎮',
  'Xodimlar (Kassa)': '👥',
  'Texnik xizmat': '🧹',
  Boshqa: '💰'
};

const defaultSpendings = [
  { id: 1, name: 'Kompyuter qismlarini yangilash', category: 'Jihozlar', amount: 45000000, date: '2025-05-01', icon: '🖥️', color: 'rgba(124,58,237,0.2)', type: 'expense' },
  { id: 2, name: 'Elektr energiyasi to\'lovi', category: 'Kommunal', amount: 8200000, date: '2025-05-05', icon: '⚡', color: 'rgba(245,158,11,0.2)', type: 'expense' },
  { id: 3, name: 'Kofe va yeguliklar zaxirasi', category: 'Bar', amount: 3500000, date: '2025-05-06', icon: '☕', color: 'rgba(6,182,212,0.2)', type: 'expense' },
  { id: 4, name: 'O\'yin o\'rindiqlari x4', category: 'Mebel', amount: 12000000, date: '2025-05-08', icon: '🪑', color: 'rgba(16,185,129,0.2)', type: 'expense' },
  { id: 5, name: 'Internet obunasi', category: 'Kommunal', amount: 2000000, date: '2025-05-10', icon: '🌐', color: 'rgba(6,182,212,0.2)', type: 'expense' },
  { id: 6, name: 'O\'yin litsenziyalari (Steam)', category: 'Dasturiy ta\'minot', amount: 6800000, date: '2025-05-11', icon: '🎮', color: 'rgba(139,92,246,0.2)', type: 'expense' },
  { id: 7, name: 'Xodimlar oyligi', category: 'Xodimlar (Kassa)', amount: 110500000, date: '2025-05-01', icon: '👥', color: 'rgba(239,68,68,0.2)', type: 'expense' },
  { id: 8, name: 'Tozalash vositalari', category: 'Texnik xizmat', amount: 1300000, date: '2025-05-12', icon: '🧹', color: 'rgba(16,185,129,0.2)', type: 'expense' },
];

import { supabase } from '../config/supabase';

export default function Spending() {
  const [spendings, setSpendings] = useState(() => {
    const saved = localStorage.getItem('gaming_club_spendings_list');
    return saved ? JSON.parse(saved) : defaultSpendings;
  });

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  const [localDescriptions, setLocalDescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('gaming_club_spendings_descriptions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getSpendings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spendings')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const localDescs = JSON.parse(localStorage.getItem('gaming_club_spendings_descriptions') || '{}');
        const mergedData = data.map(s => ({
          ...s,
          description: s.description || localDescs[s.id] || null
        }));
        setSpendings(mergedData);
        localStorage.setItem('gaming_club_spendings_list', JSON.stringify(mergedData));
      }
    } catch (err) {
      console.error("Error fetching spendings from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data) {
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmployeeId(data[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Error fetching employees in Spending:", err);
    }
  };

  useEffect(() => {
    getSpendings();
    fetchEmployees();
  }, []);

  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txType, setTxType] = useState('expense'); // 'expense', 'employee_kasa'
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Jihozlar', amount: '', date: new Date().toISOString().slice(0, 10), icon: '🖥️', description: '' });
  const [filterCat, setFilterCat] = useState('All');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);

  const saveSpendings = (updated) => {
    setSpendings(updated);
    localStorage.setItem('gaming_club_spendings_list', JSON.stringify(updated));
  };

  const handleAdd = async () => {
    if (!form.amount) return;
    setSubmitting(true);

    let finalName = form.name;
    let finalCategory = form.category;
    let finalIcon = form.icon;

    if (txType === 'employee_kasa') {
      const emp = employees.find(e => e.id === Number(selectedEmployeeId));
      finalName = `Kassadan olindi: ${emp ? emp.name : 'Xodim'}`;
      finalCategory = 'Xodimlar (Kassa)';
      finalIcon = '👤';
    } else {
      if (!finalName) {
        setSubmitting(false);
        return;
      }
    }

    const newTx = {
      name: finalName,
      category: finalCategory,
      amount: Number(form.amount),
      date: form.date,
      icon: finalIcon,
      color: 'rgba(124,58,237,0.2)',
      type: 'expense',
      description: form.description || null
    };

    try {
      const { data, error } = await supabase
        .from('spendings')
        .insert([newTx])
        .select();
      
      if (error) {
        if (error.message.includes('description') || error.message.includes('column')) {
          const { description, ...retryTx } = newTx;
          const { data: retryData, error: retryError } = await supabase
            .from('spendings')
            .insert([retryTx])
            .select();
          if (retryError) throw retryError;
          
          const inserted = retryData && retryData[0] ? retryData[0] : { id: Date.now(), ...retryTx };
          if (form.description) {
            const newLocalDescs = { ...localDescriptions, [inserted.id]: form.description };
            localStorage.setItem('gaming_club_spendings_descriptions', JSON.stringify(newLocalDescs));
            setLocalDescriptions(newLocalDescs);
            inserted.description = form.description;
          }
          saveSpendings([inserted, ...spendings]);
        } else {
          throw error;
        }
      } else {
        const inserted = data && data[0] ? data[0] : { id: Date.now(), ...newTx };
        if (form.description && !inserted.description) {
          const newLocalDescs = { ...localDescriptions, [inserted.id]: form.description };
          localStorage.setItem('gaming_club_spendings_descriptions', JSON.stringify(newLocalDescs));
          setLocalDescriptions(newLocalDescs);
          inserted.description = form.description;
        }
        saveSpendings([inserted, ...spendings]);
      }
    } catch (err) {
      console.error("Failed to add spending to Supabase:", err);
      const inserted = { id: Date.now(), ...newTx };
      if (form.description) {
        const newLocalDescs = { ...localDescriptions, [inserted.id]: form.description };
        localStorage.setItem('gaming_club_spendings_descriptions', JSON.stringify(newLocalDescs));
        setLocalDescriptions(newLocalDescs);
      }
      saveSpendings([inserted, ...spendings]);
    } finally {
      setSubmitting(false);
      setShowAdd(false);
      setForm({ name: '', category: 'Jihozlar', amount: '', date: new Date().toISOString().slice(0, 10), icon: '🖥️', description: '' });
      setTxType('expense');
      setCatDropdownOpen(false);
      setEmpDropdownOpen(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('spendings')
        .delete()
        .eq('id', id);
      if (error) throw error;

      const newLocalDescs = { ...localDescriptions };
      delete newLocalDescs[id];
      localStorage.setItem('gaming_club_spendings_descriptions', JSON.stringify(newLocalDescs));
      setLocalDescriptions(newLocalDescs);

      const updated = spendings.filter(s => s.id !== id);
      saveSpendings(updated);
    } catch (err) {
      console.error("Failed to delete spending from Supabase:", err);

      const newLocalDescs = { ...localDescriptions };
      delete newLocalDescs[id];
      localStorage.setItem('gaming_club_spendings_descriptions', JSON.stringify(newLocalDescs));
      setLocalDescriptions(newLocalDescs);

      const updated = spendings.filter(s => s.id !== id);
      saveSpendings(updated);
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dateStr);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const filtered = spendings.filter(s => {
    const matchCat = filterCat === 'All' || s.category === filterCat;
    const matchDate = !selectedDateFilter || s.date === selectedDateFilter;
    return matchCat && matchDate;
  });

  const getLocalDateString = (offsetDays = 0) => {
    const d = new Date();
    if (offsetDays !== 0) {
      d.setDate(d.getDate() + offsetDays);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarCells = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysInCurrentMonth = getDaysInMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const cells = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({ dayNum, dateStr, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({ dayNum: i, dateStr, isCurrentMonth: true });
    }

    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({ dayNum: i, dateStr, isCurrentMonth: false });
    }

    return cells;
  };

  const getDaySpendingTotal = (dateStr) => {
    return spendings
      .filter(s => s.date === dateStr)
      .reduce((sum, s) => sum + s.amount, 0);
  };

  const formatCompactAmount = (amount) => {
    if (amount >= 1000000) {
      return `-${(amount / 1000000).toFixed(1).replace('.0', '')}M`;
    }
    if (amount >= 1000) {
      return `-${(amount / 1000).toFixed(0)}K`;
    }
    return `-${amount}`;
  };

  const monthsUz = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
    setSelectedDateFilter(getLocalDateString(0));
  };
  const total = spendings.reduce((a, s) => a + s.amount, 0);

  const todaySpendings = spendings.filter(s => {
    const d = parseDate(s.date);
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  });
  const todayTotal = todaySpendings.reduce((a, s) => a + s.amount, 0);

  const yesterdaySpendings = spendings.filter(s => {
    const d = parseDate(s.date);
    return d.getFullYear() === yesterday.getFullYear() &&
           d.getMonth() === yesterday.getMonth() &&
           d.getDate() === yesterday.getDate();
  });
  const yesterdayTotal = yesterdaySpendings.reduce((a, s) => a + s.amount, 0);

  const weeklySpendings = spendings.filter(s => {
    const d = parseDate(s.date);
    const diffTime = today.getTime() - d.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 7;
  });
  const weeklyTotal = weeklySpendings.reduce((a, s) => a + s.amount, 0);

  const monthlySpendings = spendings.filter(s => {
    const d = parseDate(s.date);
    const diffTime = today.getTime() - d.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 30;
  });
  const monthlyTotal = monthlySpendings.reduce((a, s) => a + s.amount, 0);

  const byCategory = categories.map(cat => ({
    name: cat,
    value: spendings.filter(s => s.category === cat).reduce((a, s) => a + s.amount, 0),
    color: catColors[cat],
  })).filter(c => c.value > 0);

  const renderKpiSkeletons = () => (
    <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="stat-card skeleton" style={{ minHeight: 90, display: 'flex', alignItems: 'center' }}>
          <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.03)', color: 'transparent', width: 40, height: 40, borderRadius: '50%' }} />
          <div className="stat-info" style={{ flex: 1, marginLeft: 12 }}>
            <div className="skeleton-text" style={{ width: '50%', height: 10, marginBottom: 0 }} />
            <div className="skeleton-text" style={{ width: '80%', height: 16, marginTop: 6, marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderChartsSkeletons = () => (
    <div className="grid-2 mb-20">
      <div className="card skeleton" style={{ height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
        <div className="skeleton-text header" style={{ width: '40%' }} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <div style={{ width: 130, height: 130, borderRadius: '50%', border: '8px solid rgba(255,255,255,0.03)' }} />
        </div>
      </div>
      <div className="card skeleton" style={{ height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
        <div className="skeleton-text header" style={{ width: '50%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="skeleton-text" style={{ width: '20%', height: 10, marginBottom: 0 }} />
              <div style={{ flex: 1, height: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCalendarListSkeletons = () => (
    <div className="grid-7-3 mb-20">
      <div className="card skeleton" style={{ minHeight: 380, padding: 20 }}>
        <div className="flex-between mb-20">
          <div className="skeleton-text header" style={{ width: '30%', marginBottom: 0 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ width: 80, height: 30, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12 }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="skeleton-text" style={{ height: 12, width: '60%', margin: '0 auto' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {[...Array(35)].map((_, i) => (
            <div key={i} style={{ height: 46, background: 'rgba(255,255,255,0.02)', borderRadius: 6 }} />
          ))}
        </div>
      </div>
      <div className="card skeleton" style={{ minHeight: 380, padding: 20 }}>
        <div className="skeleton-text header" style={{ width: '50%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-text" style={{ width: '70%', height: 12 }} />
                <div className="skeleton-text short" style={{ width: '40%', height: 9 }} />
              </div>
              <div style={{ width: 60, height: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const currentEmployee = employees.find(e => e.id === Number(selectedEmployeeId)) || employees[0];

  return (
    <div className="page-content fade-in">
      <div className="page-header-row mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22 }}>Xarajatlar Tahlili</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Barcha xarajatlar va budjet taqsimotini nazorat qiling</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Yangi qo'shish</button>
      </div>

      {/* KPI Cards */}
      {loading ? renderKpiSkeletons() : (
        <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {[
            { icon: Wallet, label: 'Jami Xarajatlar', value: `${total.toLocaleString('uz-UZ')} so'm`, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
            { icon: Calendar, label: 'Bugungi Chiqim', value: `${todayTotal.toLocaleString('uz-UZ')} so'm`, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
            { icon: Clock, label: 'Kechagi Chiqim', value: `${yesterdayTotal.toLocaleString('uz-UZ')} so'm`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
            { icon: TrendingUp, label: 'Haftalik Chiqim', value: `${weeklyTotal.toLocaleString('uz-UZ')} so'm`, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
            { icon: Wallet, label: 'Oylik Chiqim', value: `${monthlyTotal.toLocaleString('uz-UZ')} so'm`, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ borderColor: s.color + '33' }}>
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={20} /></div>
              <div className="stat-info">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 15, color: s.color, wordBreak: 'break-word' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? renderChartsSkeletons() : (
        <div className="grid-2 mb-20">
          {/* Pie chart */}
          <div className="card">
            <div className="card-header"><div className="card-title">Toifalar bo'yicha</div></div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                    {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v.toLocaleString('uz-UZ')} so'm`, '']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {byCategory.map((c, i) => (
                <div key={i} className="flex-gap" style={{ gap: 6 }}>
                  <div className="color-dot" style={{ background: c.color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.name}: <strong style={{ color: c.color }}>{c.value.toLocaleString('uz-UZ')} so'm</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="card">
            <div className="card-header"><div className="card-title">Xarajatlar Diagrammasi</div></div>
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => `${(v/1000000).toFixed(0)}M`} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip formatter={v => [`${v.toLocaleString('uz-UZ')} so'm`, 'Chiqim']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {loading ? renderCalendarListSkeletons() : (
        <div className="grid-7-3 mb-20">
          {/* Left Column: Spending Calendar */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div className="card-title">Xarajatlar Tqvimi</div>
                <div className="card-subtitle">Kunlik chiqimlar taqsimoti</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  onClick={handlePrevMonth} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 13, fontWeight: 700, minWidth: 100, textAlign: 'center' }}>
                  {monthsUz[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button 
                  onClick={handleNextMonth} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronRight size={16} />
                </button>
                <button 
                  onClick={handleGoToday} 
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, fontWeight: 700 }}
                >
                  Bugun
                </button>
              </div>
            </div>

            {/* Calendar Grid Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: 6 }}>
              {['Dsh', 'Esh', 'Chsh', 'Psh', 'Jsh', 'Shb', 'Ysh'].map((day, idx) => (
                <div key={idx} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 0' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {generateCalendarCells().map((cell, idx) => {
                const daySpendings = spendings.filter(s => s.date === cell.dateStr);
                const dayTotal = daySpendings.reduce((sum, s) => sum + s.amount, 0);
                const isSelected = selectedDateFilter === cell.dateStr;
                const isToday = cell.dateStr === getLocalDateString(0);

                const tooltipText = daySpendings.length > 0 
                  ? `${cell.dateStr} xarajatlari:\n` + daySpendings.map(s => `• ${s.name} (${s.amount.toLocaleString('uz-UZ')} so'm)${s.description ? ` - "${s.description}"` : ''}`).join('\n')
                  : 'Xarajat yo\'q';

                return (
                  <div
                    key={idx}
                    title={tooltipText}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDateFilter(null);
                      } else {
                        setSelectedDateFilter(cell.dateStr);
                      }
                    }}
                    style={{
                      minHeight: 52,
                      padding: '6px',
                      borderRadius: 8,
                      background: isSelected ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : (isToday ? 'var(--cyan)' : 'var(--border)')}`,
                      opacity: cell.isCurrentMonth ? 1 : 0.3,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-accent)';
                        e.currentTarget.style.background = 'var(--bg-card-hover)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = isToday ? 'var(--cyan)' : 'var(--border)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isToday ? 'var(--cyan)' : 'var(--text-primary)' }}>
                        {cell.dayNum}
                      </span>
                      {isToday && (
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
                      )}
                    </div>
                    {dayTotal > 0 && (
                      <span style={{ 
                        fontSize: 9, 
                        fontWeight: 800, 
                        color: 'var(--red)', 
                        textAlign: 'right',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatCompactAmount(dayTotal)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Spendings List */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', maxHeight: 480 }}>
            <div className="card-header mb-16" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10, margin: 0, paddingBottom: 10 }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title" style={{ fontSize: 14 }}>
                  {selectedDateFilter ? `${selectedDateFilter}` : 'Barcha xarajatlar'}
                </div>
                {selectedDateFilter && (
                  <button 
                    onClick={() => setSelectedDateFilter(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    Filtrni tozalash
                  </button>
                )}
              </div>
              {/* Horizontal Scrollable Category Filter */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', whiteSpace: 'nowrap', width: '100%', paddingBottom: 6 }}>
                <button 
                  onClick={() => setFilterCat('All')} 
                  className={`btn btn-sm ${filterCat === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flexShrink: 0, padding: '4px 10px', fontSize: 11 }}
                >
                  Barchasi
                </button>
                {categories.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setFilterCat(c)} 
                    className={`btn btn-sm ${filterCat === c ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flexShrink: 0, padding: '4px 10px', fontSize: 11 }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  Xarajatlar topilmadi
                </div>
              ) : (
                filtered.map(s => (
                  <div key={s.id} className="spending-item" style={{ padding: '10px 0' }}>
                    <div className="spending-icon" style={{ background: s.color, width: 34, height: 34, borderRadius: 8, fontSize: 15 }}>{s.icon}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="spending-name" style={{ fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div className="spending-cat" style={{ fontSize: 11 }}>{s.category} • {s.date}</div>
                      {s.description && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={s.description}>
                          "{s.description}"
                        </div>
                      )}
                    </div>
                    <div className="spending-amount" style={{ color: 'var(--red)', fontSize: 13, fontWeight: 700, marginLeft: 8, whiteSpace: 'nowrap' }}>
                      -{s.amount.toLocaleString('uz-UZ')}
                    </div>
                    <button 
                      onClick={() => handleDelete(s.id)} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 8, padding: 4 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.7)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 200
          }} 
          onClick={() => {
            setShowAdd(false);
            setCatDropdownOpen(false);
            setEmpDropdownOpen(false);
          }}
        >
          <div 
            style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border)', 
              borderRadius: 16, 
              padding: 28, 
              width: 420,
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-between mb-20">
              <h3 style={{ fontFamily: 'Orbitron, sans-serif' }}>Yangi tranzaksiya</h3>
              <button onClick={() => {
                setShowAdd(false);
                setCatDropdownOpen(false);
                setEmpDropdownOpen(false);
              }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div className="section-gap">
              {/* Type Selection */}
              <div className="form-group">
                <label className="form-label">Tranzaksiya turi</label>
                <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 8 }}>
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: txType === 'expense' ? 'var(--accent)' : 'none',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Oddiy chiqim
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('employee_kasa')}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: txType === 'employee_kasa' ? 'var(--red)' : 'none',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Kassadan olish (Ishchi)
                  </button>
                </div>
              </div>

              {txType === 'employee_kasa' ? (
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Ishchini tanlang</label>
                  <div 
                    onClick={() => setEmpDropdownOpen(!empDropdownOpen)}
                    className="form-input"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div 
                        style={{ 
                          width: 22, 
                          height: 22, 
                          borderRadius: '50%', 
                          background: currentEmployee?.color || 'var(--accent)', 
                          color: '#fff', 
                          fontSize: 9, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: 700
                        }}
                      >
                        {currentEmployee?.avatar || '👤'}
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{currentEmployee?.name} ({currentEmployee?.role})</span>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{empDropdownOpen ? '▲' : '▼'}</span>
                  </div>

                  {empDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        zIndex: 210,
                        maxHeight: 180,
                        overflowY: 'auto',
                        padding: 4,
                      }}
                    >
                      {employees.map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => {
                            setSelectedEmployeeId(emp.id);
                            setEmpDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: Number(selectedEmployeeId) === emp.id ? 'var(--accent-glow)' : 'transparent',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = Number(selectedEmployeeId) === emp.id ? 'var(--accent-glow)' : 'transparent'}
                        >
                          <div 
                            style={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '50%', 
                              background: emp.color || 'var(--accent)', 
                              color: '#fff', 
                              fontSize: 9, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontWeight: 700
                            }}
                          >
                            {emp.avatar}
                          </div>
                          <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{emp.name} ({emp.role})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Nomi</label>
                    <input className="form-input" placeholder="Xarajat nomi" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Izoh (Komentariya)</label>
                    <input className="form-input" placeholder="Xarajat haqida qo'shimcha izoh..." value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Kategoriya</label>
                    <div 
                      onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                      className="form-input"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{categoryIcons[form.category] || '💰'}</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{form.category}</span>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{catDropdownOpen ? '▲' : '▼'}</span>
                    </div>

                    {catDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                          zIndex: 210,
                          maxHeight: 180,
                          overflowY: 'auto',
                          padding: 4,
                        }}
                      >
                        {categories
                          .filter(c => c !== 'Xodimlar (Kassa)')
                          .map(c => (
                            <div
                              key={c}
                              onClick={() => {
                                setForm(p => ({ ...p, category: c, icon: categoryIcons[c] || '💰' }));
                                setCatDropdownOpen(false);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 12px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                background: form.category === c ? 'var(--accent-glow)' : 'transparent',
                                transition: 'background 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = form.category === c ? 'var(--accent-glow)' : 'transparent'}
                            >
                              <span>{categoryIcons[c] || '💰'}</span>
                              <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{c}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Suma (so'mda)</label>
                <input className="form-input" type="number" placeholder="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Sana</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                onClick={handleAdd} 
                disabled={submitting}
              >
                {submitting ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : "Qo'shish"}
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setShowAdd(false);
                setCatDropdownOpen(false);
                setEmpDropdownOpen(false);
              }} disabled={submitting}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

