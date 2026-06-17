import React, { useState, useMemo, useEffect } from 'react';

// ==========================================
// CONSTANTS & SEED DATA
// ==========================================

const DEFAULT_CUSTOMERS = [
  { id: 'C001', name: 'Rahul Sharma', daily_amount: 100 },
  { id: 'C002', name: 'Sita Verma', daily_amount: 50 },
  { id: 'C003', name: 'Amit Patel', daily_amount: 100 },
  { id: 'C004', name: 'Sneha Reddy', daily_amount: 150 },
  { id: 'C005', name: 'Vikram Singh', daily_amount: 200 },
  { id: 'C006', name: 'Deepak Gupta', daily_amount: 100 },
  { id: 'C007', name: 'Sunita Rao', daily_amount: 50 },
  { id: 'C008', name: 'Manoj Bajpayee', daily_amount: 250 },
  { id: 'C009', name: 'Anjali Desai', daily_amount: 100 },
  { id: 'C010', name: 'Kabir Mehta', daily_amount: 300 },
  { id: 'C011', name: 'Pooja Hegde', daily_amount: 50 },
  { id: 'C012', name: 'Ajay Devgan', daily_amount: 500 },
  { id: 'C013', name: 'Meena Kumari', daily_amount: 100 },
  { id: 'C014', name: 'Sanjay Dutt', daily_amount: 150 },
  { id: 'C015', name: 'Ritu Joshi', daily_amount: 100 },
  { id: 'C016', name: 'Gagan Narang', daily_amount: 200 },
  { id: 'C017', name: 'Rohit Sharma', daily_amount: 100 },
  { id: 'C018', name: 'Neha Kakkar', daily_amount: 150 },
  { id: 'C019', name: 'Suresh Raina', daily_amount: 50 },
  { id: 'C020', name: 'Ramesh Powar', daily_amount: 100 },
  { id: 'C021', name: 'Kiran Bedi', daily_amount: 200 },
  { id: 'C022', name: 'Arjun Kapoor', daily_amount: 100 },
  { id: 'C023', name: 'Vijay Mallya', daily_amount: 500 },
  { id: 'C024', name: 'Divya Spandana', daily_amount: 150 },
  { id: 'C025', name: 'Anil Kumble', daily_amount: 100 },
  { id: 'C026', name: 'Jyoti Basu', daily_amount: 50 },
  { id: 'C027', name: 'Harish Rawat', daily_amount: 100 },
  { id: 'C028', name: 'Karan Johar', daily_amount: 150 },
  { id: 'C029', name: 'Preity Zinta', daily_amount: 100 },
  { id: 'C030', name: 'Yuvraj Singh', daily_amount: 250 }
];

// Generates simulated historical payments for June 2026
const generateHistoricalTransactions = (customers) => {
  const transactions = [];
  let txIdCounter = 1;
  const year = 2026;
  
  // June 1 to June 16, 2026
  for (let day = 1; day <= 16; day++) {
    const dateStr = `2026-06-${day.toString().padStart(2, '0')}`;
    
    // Each customer has an 80% chance of paying on any historical day
    customers.forEach(customer => {
      if (Math.random() < 0.8) {
        transactions.push({
          id: `T${txIdCounter.toString().padStart(5, '0')}`,
          customer_id: customer.id,
          transaction_date: dateStr,
          amount: customer.daily_amount
        });
        txIdCounter++;
      }
    });
  }
  
  // Seed some transactions for TODAY (June 17, 2026) to demonstrate active daily tracking
  const todayStr = '2026-06-17';
  customers.slice(0, 12).forEach(customer => {
    transactions.push({
      id: `T${txIdCounter.toString().padStart(5, '0')}`,
      customer_id: customer.id,
      transaction_date: todayStr,
      amount: customer.daily_amount
    });
    txIdCounter++;
  });

  return transactions;
};

export default function App() {
  // State Initialization (Simulated Device Database)
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('dcl_customers');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('dcl_transactions');
    return saved ? JSON.parse(saved) : generateHistoricalTransactions(DEFAULT_CUSTOMERS);
  });

  // UI Navigation & Filters
  const [activeTab, setActiveTab] = useState('collect'); // Default to fast collection
  const [searchQuery, setSearchQuery] = useState('');
  const [collectFilter, setCollectFilter] = useState('all'); // all | pending | collected
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // Monthly Ledger Selection (Default: June 2026)
  const [selectedLedgerMonth, setSelectedLedgerMonth] = useState('2026-06');

  // Customer Management Form States
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerAmount, setNewCustomerAmount] = useState('');
  
  // Editing Customer State
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Undo System state
  const [lastAction, setLastAction] = useState(null); // { type: 'collect' | 'uncollect', tx: {...} }
  const [toastMessage, setToastMessage] = useState('');

  // Fixed Date for Version 1 Demo Environment (June 17, 2026)
  const TODAY_DATE = '2026-06-17';

  // Save changes locally to retain progress between simulated reloads
  useEffect(() => {
    localStorage.setItem('dcl_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('dcl_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Timeout for toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // ==========================================
  // TRANSACTION LOGIC (ONE-TAP EXCELLENCE)
  // ==========================================

  // Fast check: Has customer paid today?
  const getTodayTransaction = (customerId) => {
    return transactions.find(
      t => t.customer_id === customerId && t.transaction_date === TODAY_DATE
    );
  };

  const handleToggleCollection = (customer) => {
    const existingTx = getTodayTransaction(customer.id);

    if (existingTx) {
      // Uncollect (Delete transaction)
      setTransactions(prev => prev.filter(t => t.id !== existingTx.id));
      
      // Save for Undo
      setLastAction({
        type: 'uncollect',
        transaction: existingTx,
        customerName: customer.name
      });
      setToastMessage(`Cancelled collection for ${customer.name}`);
      
      // Haptic Feedback Simulation
      triggerHapticFeedback();
    } else {
      // Collect (Create transaction)
      const newTx = {
        id: `T${Date.now()}`,
        customer_id: customer.id,
        transaction_date: TODAY_DATE,
        amount: Number(customer.daily_amount)
      };

      setTransactions(prev => [newTx, ...prev]);

      // Save for Undo
      setLastAction({
        type: 'collect',
        transaction: newTx,
        customerName: customer.name
      });
      setToastMessage(`Collected ₹${customer.daily_amount} from ${customer.name}`);
      
      triggerHapticFeedback();
    }
  };

  const handleUndo = () => {
    if (!lastAction) return;

    if (lastAction.type === 'collect') {
      // Revert collection: Delete the newly added transaction
      setTransactions(prev => prev.filter(t => t.id !== lastAction.transaction.id));
      setToastMessage(`Undone: Collection for ${lastAction.customerName} removed.`);
    } else if (lastAction.type === 'uncollect') {
      // Revert cancellation: Put the deleted transaction back
      setTransactions(prev => [lastAction.transaction, ...prev]);
      setToastMessage(`Undone: Re-collected ₹${lastAction.transaction.amount} from ${lastAction.customerName}`);
    }

    setLastAction(null);
  };

  // Mock phone vibration
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // ==========================================
  // COMPUTED METRICS
  // ==========================================

  // Dashboard Stats
  const dashboardStats = useMemo(() => {
    const todayTxs = transactions.filter(t => t.transaction_date === TODAY_DATE);
    const amountToday = todayTxs.reduce((sum, t) => sum + t.amount, 0);
    const paidCount = todayTxs.length;
    const totalCustomers = customers.length;
    const pendingCount = totalCustomers - paidCount;

    return {
      totalCollected: amountToday,
      customersPaid: paidCount,
      customersPending: pendingCount,
      totalActive: totalCustomers
    };
  }, [transactions, customers]);

  // Customer List filtering & sorting
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const hasPaidToday = getTodayTransaction(c.id) !== undefined;
      
      if (collectFilter === 'pending') {
        return matchesSearch && !hasPaidToday;
      }
      if (collectFilter === 'collected') {
        return matchesSearch && hasPaidToday;
      }
      return matchesSearch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, searchQuery, collectFilter, transactions]);

  // Monthly Ledger Data Generator
  const ledgerReport = useMemo(() => {
    const [year, month] = selectedLedgerMonth.split('-');
    const prefix = `${year}-${month}`;

    // Filter transactions for chosen month
    const monthlyTxs = transactions.filter(t => t.transaction_date.startsWith(prefix));

    // Aggregate by customer
    const customerMap = {};
    customers.forEach(c => {
      customerMap[c.id] = {
        id: c.id,
        name: c.name,
        daily_amount: c.daily_amount,
        daysPaid: 0,
        totalCollected: 0
      };
    });

    monthlyTxs.forEach(t => {
      if (customerMap[t.customer_id]) {
        customerMap[t.customer_id].daysPaid += 1;
        customerMap[t.customer_id].totalCollected += t.amount;
      }
    });

    const rows = Object.values(customerMap).sort((a, b) => b.totalCollected - a.totalCollected);

    const totalCollected = monthlyTxs.reduce((sum, t) => sum + t.amount, 0);
    const uniquePaidCount = Object.values(customerMap).filter(c => c.daysPaid > 0).length;
    const totalTxCount = monthlyTxs.length;

    return {
      rows,
      summary: {
        totalCollected,
        uniquePaidCount,
        totalTxCount
      }
    };
  }, [transactions, customers, selectedLedgerMonth]);

  // Individual Customer View
  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return null;

    // Filter and sort customer history
    const history = transactions
      .filter(t => t.customer_id === selectedCustomerId)
      .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));

    const totalCollected = history.reduce((sum, t) => sum + t.amount, 0);

    return {
      ...customer,
      history,
      totalCollected,
      totalCount: history.length
    };
  }, [selectedCustomerId, customers, transactions]);

  // ==========================================
  // CUSTOMER ADD / EDIT ACTION HANDLERS
  // ==========================================

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerAmount) return;

    const nextId = `C${(customers.length + 1).toString().padStart(3, '0')}`;
    const newCustomer = {
      id: nextId,
      name: newCustomerName,
      daily_amount: Number(newCustomerAmount)
    };

    setCustomers(prev => [...prev, newCustomer]);
    setNewCustomerName('');
    setNewCustomerAmount('');
    setToastMessage(`Added new customer: ${newCustomerName}`);
    setActiveTab('collect');
  };

  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    if (!editingCustomer.name || !editingCustomer.daily_amount) return;

    setCustomers(prev => prev.map(c => 
      c.id === editingCustomer.id 
        ? { ...c, name: editingCustomer.name, daily_amount: Number(editingCustomer.daily_amount) }
        : c
    ));
    setToastMessage(`Updated customer details`);
    setSelectedCustomerId(editingCustomer.id);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}? All transaction history for this customer will also be removed.`)) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      setTransactions(prev => prev.filter(t => t.customer_id !== id));
      setSelectedCustomerId(null);
      setToastMessage(`Deleted ${name} and history.`);
    }
  };

  // Helper to quickly generate 100 random customers for performance testing
  const handleBulkGenerate = () => {
    const firstNames = ['Amit', 'Sunil', 'Vijay', 'Rajesh', 'Priya', 'Komal', 'Sonia', 'Ravi', 'Vikram', 'Rohan', 'Neelam', 'Harish', 'Preeti', 'Yash', 'Siddharth'];
    const lastNames = ['Sharma', 'Verma', 'Patel', 'Joshi', 'Singh', 'Gupta', 'Rao', 'Kumar', 'Narang', 'Reddy', 'Mehta', 'Kapoor', 'Desai', 'Chawla', 'Gill'];
    
    const generated = [];
    const baseCount = customers.length;
    for (let i = 1; i <= 100; i++) {
      const randFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randLast = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randAmount = [50, 100, 150, 200, 500][Math.floor(Math.random() * 5)];
      
      generated.push({
        id: `C${(baseCount + i).toString().padStart(3, '0')}`,
        name: `${randFirst} ${randLast}`,
        daily_amount: randAmount
      });
    }

    setCustomers(prev => [...prev, ...generated]);
    setToastMessage('Added 100 high-performance test customers!');
  };

  // Helper to reset databases to seed defaults
  const handleResetDatabase = () => {
    if (confirm('Are you sure you want to restore original mock data? All your edits will be overwritten.')) {
      setCustomers(DEFAULT_CUSTOMERS);
      setTransactions(generateHistoricalTransactions(DEFAULT_CUSTOMERS));
      setToastMessage('Database restored to default demonstration state.');
    }
  };

  // ==========================================
  // VIEW RENDER PARTS
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-center items-center py-0 md:py-8 px-0 md:px-4">
      
      {/* Decorative Brand Header for Desktop screens */}
      <div className="hidden md:flex flex-col items-center mb-4 text-center max-w-lg">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">
          Daily Collection Ledger
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          High-performance replacement for physical registers. Built for field agents.
        </p>
      </div>

      {/* Main App Frame (Simulated Mobile Device / Native Flex view) */}
      <div className="w-full md:max-w-[430px] h-screen md:h-[860px] bg-slate-900 md:rounded-3xl md:shadow-2xl md:border-8 md:border-slate-800 flex flex-col overflow-hidden relative">
        
        {/* Device Notch & Status bar simulation for premium look */}
        <div className="hidden md:flex justify-between items-center px-6 pt-3 pb-2 bg-slate-950 text-slate-400 text-xs font-mono select-none">
          <span>DCL System v1.0</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full border border-slate-800"></div>
          <span>100% Online</span>
        </div>

        {/* Global Agent Header Info */}
        <header className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Active Agent Session</p>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">Ramesh Kumar</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Collection Date</span>
            <span className="text-sm font-bold text-emerald-400 tracking-wide">17-Jun-2026</span>
          </div>
        </header>

        {/* Dynamic Screen Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-900 pb-20 relative">
          
          {/* ==========================================
              TAB 1: TODAY'S STATISTICS (DASHBOARD)
              ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="p-4 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">Today's Summary</h3>
                <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full font-medium">Realtime Tracker</span>
              </div>

              {/* Main Total Callout Card */}
              <div className="bg-gradient-to-br from-emerald-900/60 to-teal-950/40 rounded-2xl p-5 border border-emerald-500/20 shadow-lg shadow-emerald-950/20 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
                <p className="text-sm font-semibold text-emerald-400/90 tracking-wide uppercase">Today's Total Collection</p>
                <h4 className="text-4xl font-black text-white mt-1.5 tracking-tight">
                  ₹{dashboardStats.totalCollected.toLocaleString('en-IN')}
                </h4>
                <div className="mt-3 flex justify-center items-center space-x-1.5 text-xs text-emerald-300/80 bg-emerald-950/60 w-max mx-auto px-3 py-1 rounded-full border border-emerald-500/10">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>100% Verified in Local Register</span>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 gap-3">
                {/* Metric 1 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-medium">Paid Customers</span>
                    <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-100 mt-2">
                    {dashboardStats.customersPaid}
                  </p>
                  <div className="mt-1.5 text-[11px] text-slate-500">
                    {Math.round((dashboardStats.customersPaid / dashboardStats.totalActive) * 100) || 0}% Completion rate
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-medium">Pending Today</span>
                    <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-amber-400 mt-2">
                    {dashboardStats.customersPending}
                  </p>
                  <div className="mt-1.5 text-[11px] text-slate-500">
                    Action required to clear
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-400">Today's Progress</span>
                  <span className="text-slate-200">
                    {dashboardStats.customersPaid} / {dashboardStats.totalActive} Customers
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 ease-out"
                    style={{ width: `${(dashboardStats.customersPaid / dashboardStats.totalActive) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Base Customer Count Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h5 className="text-sm font-bold text-slate-200">Total Active Customers</h5>
                  <p className="text-xs text-slate-500 mt-0.5">Assigned ledger accounts</p>
                </div>
                <span className="text-xl font-black text-emerald-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                  {dashboardStats.totalActive}
                </span>
              </div>

              {/* Quick Action Navigation Shortcuts */}
              <div className="pt-4 space-y-2.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Shortcuts</p>
                <button 
                  onClick={() => setActiveTab('collect')} 
                  className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700/80 p-3.5 rounded-xl text-left flex items-center justify-between font-semibold text-sm transition"
                >
                  <span className="flex items-center text-slate-100">
                    <span className="mr-2.5 text-emerald-400">⚡</span>
                    Go to One-Tap Collections
                  </span>
                  <span className="text-slate-500">→</span>
                </button>
                <button 
                  onClick={() => setActiveTab('ledger')} 
                  className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700/80 p-3.5 rounded-xl text-left flex items-center justify-between font-semibold text-sm transition"
                >
                  <span className="flex items-center text-slate-100">
                    <span className="mr-2.5 text-indigo-400">📊</span>
                    View Monthly Ledger Reports
                  </span>
                  <span className="text-slate-500">→</span>
                </button>
              </div>

              {/* Mini Disclaimer */}
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-center">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Version 1 Digital Ledger. Offline-ready state storage simulates live secure synchronization.
                </p>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: ONE-TAP COLLECTION (PRIMARY SCREEN)
              ========================================== */}
          {activeTab === 'collect' && (
            <div className="p-0 animate-fade-in flex flex-col h-full">
              
              {/* Sticky Top Filter Panel inside content */}
              <div className="bg-slate-950 border-b border-slate-800 p-3 sticky top-0 z-10 space-y-2.5">
                
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, phone or ID..."
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm rounded-xl placeholder-slate-500 text-slate-100 outline-none transition"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Sub-Tabs for Fast Filtering */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setCollectFilter('all')}
                    className={`flex-1 text-center py-2 font-bold rounded-lg transition-colors ${
                      collectFilter === 'all' 
                        ? 'bg-slate-800 text-slate-100 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({customers.length})
                  </button>
                  <button
                    onClick={() => setCollectFilter('pending')}
                    className={`flex-1 text-center py-2 font-bold rounded-lg transition-colors ${
                      collectFilter === 'pending' 
                        ? 'bg-slate-800 text-slate-100 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Pending ({dashboardStats.customersPending})
                  </button>
                  <button
                    onClick={() => setCollectFilter('collected')}
                    className={`flex-1 text-center py-2 font-bold rounded-lg transition-colors ${
                      collectFilter === 'collected' 
                        ? 'bg-slate-800 text-slate-100 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Paid ({dashboardStats.customersPaid})
                  </button>
                </div>
              </div>

              {/* Fast Scrollable Customer List */}
              <div className="divide-y divide-slate-850 px-1">
                {filteredCustomers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <p className="text-sm font-medium">No customers found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search terms</p>
                  </div>
                ) : (
                  filteredCustomers.map(customer => {
                    const todayTx = getTodayTransaction(customer.id);
                    const isCollected = todayTx !== undefined;

                    return (
                      <div 
                        key={customer.id} 
                        className={`flex items-center justify-between p-3.5 transition-all duration-150 ${
                          isCollected ? 'bg-slate-950/20' : 'bg-transparent'
                        }`}
                      >
                        {/* Left Side: Avatar & Details (Click for detail modal) */}
                        <div 
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className="flex-1 min-w-0 pr-3 cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-bold text-sm tracking-wide shrink-0 transition-colors ${
                              isCollected 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {customer.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <h4 className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                                  {customer.name}
                                </h4>
                                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400 font-mono">
                                  {customer.id}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-emerald-400/90 mt-0.5">
                                ₹{customer.daily_amount} <span className="text-slate-500 font-normal">/ day</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: High Impact Collect Tap Target */}
                        <div className="shrink-0">
                          <button
                            onClick={() => handleToggleCollection(customer)}
                            className={`w-[100px] py-2 px-3 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center transition-all active:scale-95 ${
                              isCollected
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 hover:bg-emerald-400'
                                : 'bg-slate-800 hover:bg-slate-755 text-slate-100 border border-slate-700/60'
                            }`}
                          >
                            {isCollected ? (
                              <span className="flex items-center space-x-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>PAID</span>
                              </span>
                            ) : (
                              <span>COLLECT</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Mass Add Floating Helper */}
              <div className="p-4 flex justify-center text-center">
                <button
                  onClick={() => {
                    setNewCustomerName('');
                    setNewCustomerAmount('');
                    setActiveTab('manage');
                  }}
                  className="inline-flex items-center space-x-1.5 bg-slate-955 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:text-white transition"
                >
                  <span>+</span>
                  <span>Add New Customer Account</span>
                </button>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 3: MONTHLY LEDGER REPORTS
              ========================================== */}
          {activeTab === 'ledger' && (
            <div className="p-4 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">Monthly Ledger</h3>
                
                {/* Year/Month Selector Dropdown */}
                <select
                  value={selectedLedgerMonth}
                  onChange={(e) => setSelectedLedgerMonth(e.target.value)}
                  className="bg-slate-955 border border-slate-800 text-emerald-400 font-bold text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="2026-06">June 2026</option>
                  <option value="2026-05">May 2026</option>
                  <option value="2026-04">April 2026</option>
                  <option value="2026-03">March 2026</option>
                </select>
              </div>

              {/* Monthly Stats Summary Board */}
              <div className="bg-slate-955 border border-slate-800/80 rounded-2xl p-4 space-y-3.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Month Summary Ledger</p>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900 p-2.5 rounded-xl text-center border border-slate-800/50">
                    <span className="text-[10px] font-medium text-slate-400 block">Total Collected</span>
                    <span className="text-sm font-black text-emerald-400 block mt-1 font-mono">
                      ₹{ledgerReport.summary.totalCollected.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl text-center border border-slate-800/50">
                    <span className="text-[10px] font-medium text-slate-400 block">Unique Paid</span>
                    <span className="text-sm font-black text-slate-100 block mt-1 font-mono">
                      {ledgerReport.summary.uniquePaidCount}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl text-center border border-slate-800/50">
                    <span className="text-[10px] font-medium text-slate-400 block">Total Days Paid</span>
                    <span className="text-sm font-black text-slate-100 block mt-1 font-mono">
                      {ledgerReport.summary.totalTxCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Aggregated Customers Ledger Table */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ledger Breakdown</p>
                
                <div className="bg-slate-955 border border-slate-800 rounded-xl overflow-hidden">
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-12 bg-slate-900/80 border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase p-3 select-none tracking-wider">
                    <div className="col-span-6">Customer</div>
                    <div className="col-span-3 text-center">Days Paid</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-slate-850 max-h-[420px] overflow-y-auto">
                    {ledgerReport.rows.map(row => (
                      <div 
                        key={row.id} 
                        onClick={() => setSelectedCustomerId(row.id)}
                        className="grid grid-cols-12 text-xs p-3 items-center hover:bg-slate-900/40 cursor-pointer transition-colors"
                      >
                        <div className="col-span-6 min-w-0 pr-1.5">
                          <p className="font-bold text-slate-200 truncate">{row.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Rate: ₹{row.daily_amount}/day</p>
                        </div>
                        <div className="col-span-3 text-center font-bold text-slate-300 font-mono">
                          {row.daysPaid}
                        </div>
                        <div className="col-span-3 text-right font-black text-emerald-400 font-mono">
                          ₹{row.totalCollected.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}

                    {ledgerReport.rows.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        No ledger transactions recorded for this month.
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 4: MANAGE & SIMULATOR TOOLS
              ========================================== */}
          {activeTab === 'manage' && (
            <div className="p-4 space-y-4 animate-fade-in">
              
              {/* Form Add Customer */}
              <div className="bg-slate-955 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center">
                  <span className="mr-1.5 text-emerald-400">👤</span>
                  Create New Customer Profile
                </h3>

                <form onSubmit={handleAddCustomer} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Customer Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm rounded-xl py-2 px-3 text-slate-100 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Fixed Daily Collection Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min="10"
                      placeholder="e.g. 100"
                      value={newCustomerAmount}
                      onChange={(e) => setNewCustomerAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm rounded-xl py-2 px-3 text-slate-100 outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs tracking-wider transition"
                  >
                    ADD CUSTOMER TO REGISTER
                  </button>
                </form>
              </div>

              {/* Performance & Stress-testing Simulation Controls */}
              <div className="bg-slate-955 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center">
                  <span className="mr-1.5 text-indigo-400">⚡</span>
                  Scale & Performance Controls
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Test Version 1 with a full production-scale database. Create 100 more virtual clients with simulated data instantaneously to check rendering speeds.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleBulkGenerate}
                    className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold p-2.5 rounded-xl transition"
                  >
                    +100 Test Customers
                  </button>
                  <button
                    onClick={handleResetDatabase}
                    className="bg-red-950/40 hover:bg-red-950/60 border border-red-900/40 text-red-400 text-xs font-bold p-2.5 rounded-xl transition"
                  >
                    Reset Register
                  </button>
                </div>
              </div>

              {/* Version Info & Structure Spec */}
              <div className="bg-slate-955 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-slate-200">Data Schema & Migration Support</h4>
                <p className="text-slate-400 leading-relaxed">
                  This application utilizes clean, modular local registers aligned exactly to flat PostgreSQL, Google Sheets, or Firebase structures.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono space-y-1 text-slate-400">
                  <p className="text-emerald-400 font-bold">// Customers Table</p>
                  <p>id: TEXT (PK)</p>
                  <p>name: TEXT</p>
                  <p>daily_amount: INTEGER</p>
                  <p className="text-emerald-400 font-bold mt-2">// Transactions Table</p>
                  <p>id: TEXT (PK)</p>
                  <p>customer_id: TEXT (FK)</p>
                  <p>transaction_date: DATE (YYYY-MM-DD)</p>
                  <p>amount: INTEGER</p>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* ==========================================
            PERSISTENT SMART RE-TAP UNDO TOAST
            ========================================== */}
        {toastMessage && (
          <div className="absolute bottom-16 left-3 right-3 z-50 bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl p-3 shadow-2xl flex items-center justify-between animate-slide-up">
            <div className="flex items-center space-x-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <p className="font-medium text-slate-200">{toastMessage}</p>
            </div>
            {lastAction && (
              <button
                onClick={handleUndo}
                className="bg-emerald-500 text-slate-950 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-400 transition"
              >
                Undo
              </button>
            )}
          </div>
        )}

        {/* ==========================================
            MOBILE BOTTOM NAVIGATION BAR
            ========================================== */}
        <nav className="absolute bottom-0 inset-x-0 bg-slate-950 border-t border-slate-800/90 h-[68px] px-2 flex justify-around items-center select-none shrink-0 z-20">
          
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedCustomerId(null); }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-colors ${
              activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            <span className="text-[10px] font-bold mt-1 tracking-wide">Today's stats</span>
          </button>

          <button 
            onClick={() => { setActiveTab('collect'); setSelectedCustomerId(null); }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-colors relative ${
              activeTab === 'collect' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-bold mt-1 tracking-wide">Collect</span>
            {dashboardStats.customersPending > 0 && (
              <span className="absolute top-1.5 right-[25%] bg-amber-500 text-slate-950 font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-slate-950">
                {dashboardStats.customersPending}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('ledger'); setSelectedCustomerId(null); }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-colors ${
              activeTab === 'ledger' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold mt-1 tracking-wide">Ledger</span>
          </button>

          <button 
            onClick={() => { setActiveTab('manage'); setSelectedCustomerId(null); }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-colors ${
              activeTab === 'manage' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-bold mt-1 tracking-wide">Settings</span>
          </button>

        </nav>

        {/* ==========================================
            POPUP: CUSTOMER DETAIL PANEL
            ========================================== */}
        {selectedCustomerId && selectedCustomer && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-end">
            <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85%] flex flex-col overflow-hidden animate-slide-up">
              
              {/* Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex justify-between items-center shrink-0">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Account Details</span>
                  <h3 className="text-base font-black text-slate-100 truncate mt-0.5">{selectedCustomer.name}</h3>
                </div>
                <button 
                  onClick={() => { setSelectedCustomerId(null); setEditingCustomer(null); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Detail Content (Scrollable) */}
              <div className="p-4 overflow-y-auto space-y-4">
                
                {editingCustomer ? (
                  /* EDIT SUB-FORM */
                  <form onSubmit={handleUpdateCustomer} className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs font-bold text-indigo-400">Editing Profile Parameters</p>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Full Name</label>
                      <input
                        type="text"
                        required
                        value={editingCustomer.name}
                        onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 text-sm rounded-xl py-2 px-3 text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Fixed Rate (₹)</label>
                      <input
                        type="number"
                        required
                        value={editingCustomer.daily_amount}
                        onChange={(e) => setEditingCustomer({...editingCustomer, daily_amount: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 text-sm rounded-xl py-2 px-3 text-slate-100 outline-none"
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs"
                      >
                        SAVE CHANGES
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCustomer(null)}
                        className="bg-slate-800 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                ) : (
                  /* GENERAL VIEW */
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-955 p-3 rounded-xl border border-slate-800 text-center col-span-1">
                      <span className="text-[9px] text-slate-500 block">Rate / Day</span>
                      <span className="text-sm font-black text-emerald-400 block mt-1 font-mono">
                        ₹{selectedCustomer.daily_amount}
                      </span>
                    </div>
                    <div className="bg-slate-955 p-3 rounded-xl border border-slate-800 text-center col-span-1">
                      <span className="text-[9px] text-slate-500 block">Total Collected</span>
                      <span className="text-sm font-black text-slate-100 block mt-1 font-mono">
                        ₹{selectedCustomer.totalCollected.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-slate-955 p-3 rounded-xl border border-slate-800 text-center col-span-1">
                      <span className="text-[9px] text-slate-500 block">Payments</span>
                      <span className="text-sm font-black text-slate-100 block mt-1 font-mono">
                        {selectedCustomer.totalCount} days
                      </span>
                    </div>
                  </div>
                )}

                {/* Ledger Log Panel */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction History</p>
                    <span className="text-[10px] text-slate-400">{selectedCustomer.history.length} transactions</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-900 max-h-[180px] overflow-y-auto">
                    {selectedCustomer.history.map(tx => (
                      <div key={tx.id} className="p-2.5 flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="font-mono">{tx.transaction_date}</span>
                        </div>
                        <div className="font-extrabold text-emerald-400 font-mono">
                          +₹{tx.amount}
                        </div>
                      </div>
                    ))}

                    {selectedCustomer.history.length === 0 && (
                      <div className="p-6 text-center text-slate-500 text-xs">
                        No transactions registered yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Account Actions */}
                {!editingCustomer && (
                  <div className="pt-2 flex justify-between space-x-2">
                    <button
                      onClick={() => setEditingCustomer(selectedCustomer)}
                      className="flex-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition"
                    >
                      ✏️ Edit Profile
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(selectedCustomer.id, selectedCustomer.name)}
                      className="bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-red-400 text-xs font-bold py-2.5 px-4 rounded-xl transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}