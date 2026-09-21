import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FeeManager() {
  const [players, setPlayers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'fees', 'expenses', 'history'
  
  // Default to the current month (Format: YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Manual Fee State
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDate, setFeeDate] = useState(new Date().toISOString().split('T')[0]);

  // Expense State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchPlayers();
    fetchPayments();
    fetchExpenses();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/players/all');
      setPlayers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/payments/all');
      setPayments(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expenses/all');
      setExpenses(res.data);
    } catch (err) { console.error(err); }
  };

  // --- CALCULATIONS FOR THE DASHBOARD ---
  const currentMonthPayments = payments.filter(p => p.monthCovered === selectedMonth);
  const currentMonthExpenses = expenses.filter(e => e.monthCovered === selectedMonth);
  
  const expectedRevenue = players.reduce((sum, p) => sum + (p.feeAmount || 0), 0);
  const collectedRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // PROFIT CALCULATION
  const netProfit = collectedRevenue - totalExpenses;
  
  const paidPlayerIds = currentMonthPayments.map(p => p.player?._id).filter(Boolean);
  const pendingPlayers = players.filter(p => !paidPlayerIds.includes(p._id));
  const paidPlayersList = players.filter(p => paidPlayerIds.includes(p._id));

  const displayMonth = new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

  // --- ACTION HANDLERS ---
  const handleQuickPay = async (player) => {
    if (!window.confirm(`Mark ₹${player.feeAmount} as paid for ${player.name} for ${displayMonth}?`)) return;
    try {
      await axios.post('http://localhost:5000/api/payments/add', {
        player: player._id, amount: player.feeAmount, datePaid: new Date().toISOString().split('T')[0], monthCovered: selectedMonth
      });
      fetchPayments();
    } catch (err) { alert('Failed to record payment.'); }
  };

  const handleManualFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/payments/add', {
        player: selectedPlayer, amount: feeAmount, datePaid: feeDate, monthCovered: selectedMonth
      });
      alert('Payment recorded successfully!');
      setSelectedPlayer(''); setFeeAmount(''); fetchPayments();
    } catch (err) { alert('Failed to record payment.'); }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/expenses/add', {
        title: expenseTitle, amount: expenseAmount, date: expenseDate, monthCovered: selectedMonth
      });
      alert('Expense logged successfully!');
      setExpenseTitle(''); setExpenseAmount(''); fetchExpenses();
    } catch (err) { alert('Failed to add expense.'); }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) { alert('Failed to delete expense.'); }
  };

  return (
    <div className="space-y-6">
      
      {/* TOP CONTROL BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 font-bold rounded text-sm transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-yellow-500 text-gray-900 shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            📊 Finance Dashboard
          </button>
          <button onClick={() => setActiveTab('fees')} className={`px-4 py-2 font-bold rounded text-sm transition-colors whitespace-nowrap ${activeTab === 'fees' ? 'bg-yellow-500 text-gray-900 shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            💰 Manage Fees
          </button>
          <button onClick={() => setActiveTab('expenses')} className={`px-4 py-2 font-bold rounded text-sm transition-colors whitespace-nowrap ${activeTab === 'expenses' ? 'bg-yellow-500 text-gray-900 shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            🛒 Manage Expenses
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 font-bold rounded text-sm transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-yellow-500 text-gray-900 shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            📜 Ledger
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Target Month:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            className="p-2 border border-gray-300 rounded font-bold text-gray-800 bg-gray-50 focus:ring-2 focus:ring-yellow-500 w-full"
          />
        </div>
      </div>

      {/* VIEW 1: MONTHLY FINANCE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Main Profit/Loss Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-4xl opacity-10">📈</div>
              <p className="text-sm font-bold text-gray-500 mb-1">Income Collected ({displayMonth})</p>
              <h3 className="text-4xl font-black text-gray-900">₹{collectedRevenue}</h3>
              <p className="text-xs text-green-600 font-bold mt-2">Pending Dues: ₹{expectedRevenue - collectedRevenue}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-red-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-4xl opacity-10">📉</div>
              <p className="text-sm font-bold text-gray-500 mb-1">Total Expenses</p>
              <h3 className="text-4xl font-black text-gray-900">₹{totalExpenses}</h3>
              <p className="text-xs text-red-500 font-bold mt-2">Across {currentMonthExpenses.length} items</p>
            </div>

            <div className={`p-6 rounded-lg shadow-sm border-l-4 relative overflow-hidden ${netProfit >= 0 ? 'bg-slate-900 border-l-yellow-500 text-white' : 'bg-red-900 border-l-red-400 text-white'}`}>
              <div className="absolute top-4 right-4 text-4xl opacity-10">💎</div>
              <p className="text-sm font-bold text-gray-400 mb-1">Net Profit ({displayMonth})</p>
              <h3 className="text-4xl font-black text-white">₹{netProfit}</h3>
              <p className="text-xs font-bold mt-2 text-yellow-400">
                {netProfit >= 0 ? "You're in the green! 🚀" : "Running at a loss this month."}
              </p>
            </div>
          </div>

          {/* Quick Overview Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expense Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                <span>Recent Expenses</span>
                <span className="text-sm text-gray-500">Total: ₹{totalExpenses}</span>
              </h3>
              {currentMonthExpenses.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">No expenses logged for {displayMonth}.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {currentMonthExpenses.map(exp => (
                    <div key={exp._id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                      <div>
                        <p className="font-bold text-gray-900">{exp.title}</p>
                        <p className="text-xs text-gray-500">{exp.date}</p>
                      </div>
                      <span className="text-red-600 font-bold">₹{exp.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paid Roster List */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                <span>Payments Received</span>
                <span className="bg-green-100 text-green-700 text-xs py-1 px-2 rounded-full">{paidPlayersList.length}/{players.length}</span>
              </h3>
              {paidPlayersList.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">No payments logged yet.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {paidPlayersList.map(player => (
                    <div key={player._id} className="flex justify-between items-center p-3 border rounded-lg bg-green-50/50">
                      <p className="font-bold text-gray-900">{player.name}</p>
                      <span className="text-green-600 font-bold text-sm bg-green-100 px-3 py-1 rounded-full">Paid ✔️</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MANAGE FEES (Pending & Custom Entry) */}
      {activeTab === 'fees' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
              <span>Pending Dues</span>
              <span className="bg-red-100 text-red-600 text-xs py-1 px-2 rounded-full">{pendingPlayers.length}</span>
            </h3>
            {pendingPlayers.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">All dues collected! 🎉</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {pendingPlayers.map(player => (
                  <div key={player._id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 hover:bg-red-50 transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-500">Fee: ₹{player.feeAmount}</p>
                    </div>
                    <button onClick={() => handleQuickPay(player)} className="bg-yellow-500 text-gray-900 px-4 py-2 rounded font-bold text-sm hover:bg-yellow-600 shadow-sm">
                      Mark Paid
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Record Custom Payment</h3>
            <form onSubmit={handleManualFeeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Player</label>
                <select required value={selectedPlayer} onChange={(e) => {
                  setSelectedPlayer(e.target.value);
                  const p = players.find(x => x._id === e.target.value);
                  if (p) setFeeAmount(p.feeAmount || '');
                }} className="w-full p-3 border rounded bg-gray-50">
                  <option value="" disabled>-- Choose a player --</option>
                  {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
                  <input type="number" required value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} className="w-full p-3 border rounded bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input type="date" required value={feeDate} onChange={(e) => setFeeDate(e.target.value)} className="w-full p-3 border rounded bg-gray-50" />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded hover:bg-slate-800 shadow-sm">
                Save Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 3: MANAGE EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Log New Expense</h3>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Expense Detail</label>
                <input type="text" required placeholder="e.g., Water Can, Practice Balls, Rent" value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} className="w-full p-3 border rounded bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cost (₹)</label>
                  <input type="number" required value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="w-full p-3 border rounded bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input type="date" required value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="w-full p-3 border rounded bg-gray-50" />
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded hover:bg-red-700 shadow-sm">
                Add Expense
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Expense List ({displayMonth})</h3>
            {currentMonthExpenses.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">No expenses recorded yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {currentMonthExpenses.map(exp => (
                  <div key={exp._id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-900">{exp.title}</p>
                      <p className="text-xs text-gray-500">{exp.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-600 font-bold">₹{exp.amount}</span>
                      <button onClick={() => handleDeleteExpense(exp._id)} className="text-gray-400 hover:text-red-600 font-bold">✖</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: ALL HISTORY (LEDGER) */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Full Payment Ledger</h3>
          {payments.length === 0 ? (
            <p className="text-gray-500 italic">No payments have been recorded yet.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                  <tr className="text-gray-700 text-sm">
                    <th className="p-3 border-b">Player Name</th>
                    <th className="p-3 border-b">Amount</th>
                    <th className="p-3 border-b">Date Paid</th>
                    <th className="p-3 border-b">Month Credited</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => {
                    const formattedCreditedMonth = new Date(payment.monthCovered + '-01').toLocaleString('default', { month: 'short', year: 'numeric' });
                    return (
                      <tr key={payment._id} className="hover:bg-gray-50 border-b border-gray-100">
                        <td className="p-3 font-medium text-gray-900">{payment.player?.name || 'Deleted Player'}</td>
                        <td className="p-3 text-green-600 font-bold">₹{payment.amount}</td>
                        <td className="p-3 text-gray-600 text-sm">{payment.datePaid}</td>
                        <td className="p-3 text-gray-800 font-bold text-sm bg-gray-50/50">{formattedCreditedMonth}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}