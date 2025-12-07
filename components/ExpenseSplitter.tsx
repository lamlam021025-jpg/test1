import React from 'react';
import { TripData, Traveler, Expense } from '../types';
import { User, PlusCircle, DollarSign } from 'lucide-react';

export const ExpenseSplitter: React.FC<{ data: TripData }> = ({ data }) => {
  // Simple calculation: Total spent by each person
  const balances = React.useMemo(() => {
      const spent: Record<string, number> = {}; // How much they paid
      const share: Record<string, number> = {}; // How much they should have paid

      // Initialize
      data.travelers.forEach(t => { spent[t.id] = 0; share[t.id] = 0; });

      data.expenses.forEach(exp => {
          if (spent[exp.payerId] !== undefined) {
              spent[exp.payerId] += exp.amount;
          }
          const splitCount = exp.splitBetween.length;
          if (splitCount > 0) {
              const perPerson = exp.amount / splitCount;
              exp.splitBetween.forEach(uid => {
                  if (share[uid] !== undefined) share[uid] += perPerson;
              });
          }
      });

      return data.travelers.map(t => ({
          ...t,
          paid: spent[t.id],
          owed: share[t.id],
          balance: spent[t.id] - share[t.id] // Positive means they get money back
      }));
  }, [data]);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Trip Expenses</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <PlusCircle className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Balances */}
         <div className="lg:col-span-1 space-y-4">
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="font-semibold text-slate-700 mb-4">Balances</h3>
                 <div className="space-y-3">
                     {balances.map(t => (
                         <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                     {t.name.substring(0,2).toUpperCase()}
                                 </div>
                                 <span className="font-medium text-slate-700">{t.name}</span>
                             </div>
                             <div className={`font-bold ${t.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                 {t.balance >= 0 ? '+' : ''}${Math.round(t.balance)}
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Settlement Plan</h4>
                <p className="text-sm text-blue-600">
                    {/* Simple settlement logic visualization would go here. For now just a placeholder. */}
                    Based on current balances, {balances.reduce((p, c) => p.balance < c.balance ? p : c).name} needs to pay.
                </p>
             </div>
         </div>

         {/* Transactions List */}
         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-600 flex justify-between">
                <span>Recent Transactions</span>
                <span className="text-sm font-normal text-slate-500">Total: {data.expenses.length}</span>
             </div>
             <div className="divide-y divide-slate-100">
                 {data.expenses.map(exp => {
                     const payer = data.travelers.find(t => t.id === exp.payerId)?.name || 'Unknown';
                     return (
                         <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                     <DollarSign className="w-5 h-5" />
                                 </div>
                                 <div>
                                     <div className="font-medium text-slate-800">{exp.description}</div>
                                     <div className="text-xs text-slate-500">Paid by <strong>{payer}</strong> • {exp.date}</div>
                                 </div>
                             </div>
                             <div className="font-bold text-slate-700">
                                 ${exp.amount}
                             </div>
                         </div>
                     );
                 })}
                 {data.expenses.length === 0 && (
                     <div className="p-8 text-center text-slate-400">No expenses recorded yet.</div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};