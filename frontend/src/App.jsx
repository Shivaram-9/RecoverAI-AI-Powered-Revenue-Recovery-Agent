import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { 
  LayoutDashboard, List, Activity, AlertCircle, 
  CheckCircle2, ChevronRight, MessageSquare, Sparkles, 
  Search, ShieldAlert, ArrowUpRight, TrendingDown, DollarSign
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

const api = {
  getMetrics: () => axios.get(`${API_URL}/dashboard/metrics`),
  getTransactions: () => axios.get(`${API_URL}/transactions`),
  getTransaction: (id) => axios.get(`${API_URL}/transactions/${id}`),
  analyzeTransaction: (id) => axios.post(`${API_URL}/analyze/${id}`),
  generateMessage: (id) => axios.post(`${API_URL}/generate-message/${id}`)
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type }) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    failed: 'bg-rose-100 text-rose-700 border-rose-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    High: 'bg-rose-100 text-rose-700 border-rose-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[type] || styles.Low}`}>
      {children}
    </span>
  );
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.getMetrics().then(res => setMetrics(res.data)).catch(console.error);
  }, []);

  if (!metrics) return <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center"><Activity className="w-8 h-8 animate-pulse text-blue-500 mb-4" /> Loading metrics...</div>;

  const chartData = [
    { name: 'Recoverable', value: metrics.recoverable_payments, color: '#3b82f6' },
    { name: 'Unlikely', value: metrics.failed_payments - metrics.recoverable_payments, color: '#e2e8f0' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome to RecoverAI</h1>
        <p className="text-slate-500 mt-1 text-lg">Your AI-powered revenue recovery command center.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-t-4 border-t-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Value at Risk</div>
              <div className="mt-2 text-4xl font-extrabold text-slate-900">₹{metrics.total_value.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg"><DollarSign className="w-6 h-6 text-slate-600" /></div>
          </div>
        </Card>
        <Card className="p-6 border-t-4 border-t-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Failed Payments</div>
              <div className="mt-2 text-4xl font-extrabold text-slate-900">{metrics.failed_payments}</div>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg"><TrendingDown className="w-6 h-6 text-rose-500" /></div>
          </div>
        </Card>
        <Card className="p-6 border-t-4 border-t-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recovery Opportunities</div>
              <div className="mt-2 text-4xl font-extrabold text-blue-600">{metrics.recoverable_payments}</div>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg"><Activity className="w-6 h-6 text-blue-500" /></div>
          </div>
        </Card>
        <Card className="p-6 border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Est. Recoverable</div>
              <div className="mt-2 text-4xl font-extrabold text-emerald-600">₹{metrics.estimated_recoverable_revenue.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg"><ArrowUpRight className="w-6 h-6 text-emerald-500" /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Opportunity Breakdown</h2>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-900">{metrics.recovery_rate.toFixed(0)}%</span>
              <span className="text-sm text-slate-500 font-medium">Recovery Rate</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center text-sm font-medium"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>Recoverable</div>
            <div className="flex items-center text-sm font-medium"><div className="w-3 h-3 rounded-full bg-slate-200 mr-2"></div>Unlikely</div>
          </div>
        </Card>
        
        <Card className="p-6 lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-48 h-48" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-center">
            <Badge type="success">AI Engine Active</Badge>
            <h2 className="text-3xl font-bold mt-4 mb-2">Automate Your Revenue Recovery</h2>
            <p className="text-indigo-200 max-w-md text-lg mb-8">
              RecoverAI uses advanced machine learning to analyze failure reasons, customer history, and transaction context to predict recovery likelihood.
            </p>
            <div>
              <Link to="/transactions" className="inline-flex items-center px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-colors">
                View Failed Transactions <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getTransactions().then(res => setTransactions(res.data)).catch(console.error);
  }, []);

  const filtered = transactions.filter(t => t.status === 'failed' && (
    t.customer.toLowerCase().includes(search.toLowerCase()) || 
    t.id.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Failed Transactions</h1>
          <p className="text-slate-500 mt-1">Review and action payments that need your attention.</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customer or ID..." 
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <Card className="overflow-hidden border-none shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-5">Transaction ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Reason</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    No transactions found.
                  </td>
                </tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5 font-mono text-slate-600">{t.id}</td>
                  <td className="px-6 py-5 font-semibold text-slate-900">{t.customer}</td>
                  <td className="px-6 py-5 font-bold text-slate-900">₹{t.amount.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-slate-600">
                      <AlertCircle className="w-4 h-4 mr-2 text-rose-500" />
                      {t.reason}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge type={t.status}>{t.status.toUpperCase()}</Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link to={`/transactions/${t.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 hover:border-blue-200 transition-all group-hover:shadow-sm">
                      Analyze <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const TransactionDetail = () => {
  const { id } = useParams();
  const [txn, setTxn] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);

  useEffect(() => {
    api.getTransaction(id).then(res => setTxn(res.data)).catch(console.error);
  }, [id]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await api.analyzeTransaction(id);
      setTimeout(() => {
        setAnalysis(res.data);
        setLoading(false);
      }, 600); // Artificial delay for effect
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleGenerateMessage = async () => {
    setMsgLoading(true);
    try {
      const res = await api.generateMessage(id);
      setTimeout(() => {
        setMessage(res.data.message);
        setMsgLoading(false);
      }, 800); // Artificial delay for effect
    } catch (err) {
      console.error(err);
      setMessage('Failed to generate message.');
      setMsgLoading(false);
    }
  };

  if (!txn) return <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center"><Activity className="w-8 h-8 animate-spin text-blue-500 mb-4" /> Loading details...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1 flex items-center">
            <Link to="/transactions" className="hover:text-blue-600 transition-colors">Transactions</Link> 
            <ChevronRight className="w-4 h-4 mx-1" /> {txn.id}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transaction Details</h1>
        </div>
        <Badge type={txn.status}>{txn.status.toUpperCase()}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 border-none shadow-md">
            <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" /> Transaction Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase">Amount</div>
                <div className="font-extrabold text-2xl text-slate-900 mt-1">₹{txn.amount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase">Reason</div>
                <div className="font-semibold text-rose-600 mt-2 text-sm bg-rose-100 inline-block px-2 py-1 rounded">
                  {txn.reason}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase">Attempts</div>
                <div className="font-bold text-xl text-slate-900 mt-1">{txn.attempts}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase">Date</div>
                <div className="font-semibold text-slate-700 mt-1">{txn.date}</div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-md overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
            <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" /> AI Recovery Analysis
            </h3>
            
            {!analysis ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h4 className="text-lg font-semibold text-slate-700 mb-2">Analyze this transaction</h4>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">Let RecoverAI determine the best strategy to recover this revenue based on contextual data.</p>
                <button 
                  onClick={handleAnalyze} 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 flex items-center mx-auto"
                >
                  {loading ? (
                    <><Activity className="animate-spin w-5 h-5 mr-2" /> Processing...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 mr-2" /> Run AI Analysis</>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Recovery Score</div>
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * analysis.score) / 100} className="text-blue-600 transition-all duration-1000 ease-out" />
                      </svg>
                      <span className="absolute text-3xl font-extrabold text-slate-900">{analysis.score}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <span className="font-semibold text-slate-600">Priority Level</span>
                      <Badge type={analysis.priority}>{analysis.priority.toUpperCase()}</Badge>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                      <div className="text-xs font-bold text-emerald-600 uppercase mb-1 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Recommended Action</div>
                      <div className="font-semibold text-emerald-900">{analysis.recommended_action}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center"><DollarSign className="w-4 h-4 mr-1" /> Est. Recoverable</div>
                      <div className="font-semibold text-blue-900">₹{analysis.estimated_amount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-2">AI Reasoning:</span>
                  {analysis.explanation}
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-800">Customer Communication</h3>
                    {!message && (
                      <button 
                        onClick={handleGenerateMessage}
                        disabled={msgLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center shadow-md"
                      >
                        {msgLoading ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />} 
                        {msgLoading ? 'Generating...' : 'Draft Message'}
                      </button>
                    )}
                  </div>
                  
                  {message && (
                    <div className="bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden animate-in slide-in-from-bottom-4">
                      <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        <span className="ml-4 text-xs font-semibold text-slate-500 font-mono">New Message to {txn.customer}</span>
                      </div>
                      <div className="p-6 bg-white text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                        {message}
                      </div>
                      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                        <button className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Discard</button>
                        <button className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Send Now</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card className="p-8 border-none shadow-md bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            <h3 className="font-bold text-lg mb-6 text-slate-100">Customer Profile</h3>
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-700">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-2xl font-bold shadow-lg mb-4">
                {txn.customer.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="font-bold text-xl">{txn.customer}</div>
              <div className="text-slate-400 text-sm mt-1">Customer since 2024</div>
            </div>
            <div className="pt-6 space-y-4">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Payment History</div>
                <Badge type={txn.history === 'excellent' ? 'success' : txn.history === 'good' ? 'success' : txn.history === 'fair' ? 'warning' : 'failed'}>
                  {txn.history.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Contact Info</div>
                <div className="text-sm font-medium flex items-center text-slate-300">
                  {txn.customer.toLowerCase().replace(' ', '.')}@example.com
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-50/50 selection:bg-blue-200 selection:text-blue-900 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 hidden md:flex">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 text-slate-900 font-extrabold text-2xl tracking-tight hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-500/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            RecoverAI
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${location.pathname === '/' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/transactions" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${location.pathname.startsWith('/transactions') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            <List className="w-5 h-5" /> Transactions
          </Link>
        </nav>
        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
                AI
              </div>
              <div className="text-sm font-bold">Demo User</div>
            </div>
            <div className="text-xs text-slate-500 font-medium">Razorpay AI Builder Intern 2026</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-8 sticky top-0 z-20">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
             <Badge type="success"><span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>System Online</span></Badge>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
