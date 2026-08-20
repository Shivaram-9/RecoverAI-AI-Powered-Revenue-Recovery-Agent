import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, List, Activity, AlertCircle, 
  CheckCircle2, Clock, ChevronRight, Mail, RotateCcw, MessageSquare, Phone
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

// API Service
const api = {
  getMetrics: () => axios.get(`${API_URL}/dashboard/metrics`),
  getTransactions: () => axios.get(`${API_URL}/transactions`),
  getTransaction: (id) => axios.get(`${API_URL}/transactions/${id}`),
  analyzeTransaction: (id) => axios.post(`${API_URL}/analyze/${id}`),
  generateMessage: (id) => axios.post(`${API_URL}/generate-message/${id}`)
};

// Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type }) => {
  const styles = {
    success: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[type] || styles.Low}`}>
      {children}
    </span>
  );
};

// Pages
const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.getMetrics().then(res => setMetrics(res.data)).catch(console.error);
  }, []);

  if (!metrics) return <div className="p-8 text-center text-slate-500">Loading metrics...</div>;

  const chartData = [
    { name: 'Recoverable', value: metrics.recoverable_payments, color: '#3b82f6' },
    { name: 'Unlikely', value: metrics.failed_payments - metrics.recoverable_payments, color: '#94a3b8' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Revenue Recovery Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-500">Total Failed Value</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">₹{metrics.total_value.toLocaleString()}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-500">Failed Payments</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{metrics.failed_payments}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-500">Recoverable Opportunities</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{metrics.recoverable_payments}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-500">Est. Recoverable Revenue</div>
          <div className="mt-2 text-3xl font-bold text-green-600">₹{metrics.estimated_recoverable_revenue.toLocaleString()}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recovery Opportunity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm mt-4">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>Recoverable</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-slate-400 mr-2"></div>Unlikely</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.getTransactions().then(res => setTransactions(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Failed Transactions</h1>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.filter(t => t.status === 'failed').map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{t.id}</td>
                  <td className="px-6 py-4">{t.customer}</td>
                  <td className="px-6 py-4 font-medium">₹{t.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500">{t.reason}</td>
                  <td className="px-6 py-4">
                    <Badge type={t.status}>{t.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/transactions/${t.id}`} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-end">
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

  useEffect(() => {
    api.getTransaction(id).then(res => setTxn(res.data)).catch(console.error);
  }, [id]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await api.analyzeTransaction(id);
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMessage = async () => {
    setMessage('Generating...');
    try {
      const res = await api.generateMessage(id);
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage('Failed to generate message.');
    }
  };

  if (!txn) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Transaction {txn.id}</h1>
        <Badge type={txn.status}>{txn.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500">Customer Name</div>
              <div className="font-medium text-lg">{txn.customer}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Amount</div>
              <div className="font-medium text-lg">₹{txn.amount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Failure Reason</div>
              <div className="font-medium text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                {txn.reason}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Failed Attempts</div>
              <div className="font-medium">{txn.attempts}</div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-lg mb-4">AI Recovery Analysis</h3>
            {!analysis ? (
              <button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {loading ? 'Analyzing...' : 'Run AI Analysis'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm text-slate-500">Recovery Score</div>
                    <div className="text-3xl font-bold text-blue-600">{analysis.score}/100</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500 mb-1">Priority</div>
                    <Badge type={analysis.priority}>{analysis.priority} Priority</Badge>
                  </div>
                </div>
                
                <div>
                  <div className="font-medium mb-1">Analysis Explanation</div>
                  <p className="text-slate-600 text-sm leading-relaxed">{analysis.explanation}</p>
                </div>
                
                <div className="p-4 bg-blue-50 text-blue-900 rounded-lg flex items-start">
                  <CheckCircle2 className="w-5 h-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Recommended Action</div>
                    <div>{analysis.recommended_action}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Customer Communication</h3>
                    <button 
                      onClick={handleGenerateMessage}
                      className="text-sm bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded flex items-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" /> Generate Message
                    </button>
                  </div>
                  
                  {message && (
                    <div className="p-4 border border-slate-200 rounded-lg bg-white whitespace-pre-wrap text-sm text-slate-700 font-mono">
                      {message}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-slate-900">Customer Profile</h3>
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-600 font-medium">
                  {txn.customer.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{txn.customer}</div>
                  <div className="text-slate-500 text-xs">Customer since 2024</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Payment History</div>
                <Badge type={txn.history === 'excellent' ? 'success' : txn.history === 'good' ? 'success' : txn.history === 'fair' ? 'warning' : 'failed'}>
                  {txn.history.charAt(0).toUpperCase() + txn.history.slice(1)}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Layout
const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex bg-slate-50">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-slate-300 flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
              <Activity className="text-blue-500" />
              RecoverAI
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <Link to="/transactions" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <List className="w-5 h-5" /> Transactions
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
            RecoverAI Demo &copy; 2026
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8">
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium">
                AI
              </div>
            </div>
          </header>
          <main className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/:id" element={<TransactionDetail />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
