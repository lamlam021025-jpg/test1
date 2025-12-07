import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TripData } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<{ data: TripData }> = ({ data }) => {
  // Calculate category spend
  const categoryData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.items.forEach(item => {
        if (item.cost) {
            counts[item.category] = (counts[item.category] || 0) + item.cost;
        }
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [data]);

  // Daily spend
  const dailyData = React.useMemo(() => {
      const daily: Record<number, number> = {};
      data.items.forEach(item => {
          if (item.cost) {
              daily[item.dayIndex] = (daily[item.dayIndex] || 0) + item.cost;
          }
      });
      return Object.keys(daily).map(d => ({ name: `Day ${d}`, amount: daily[Number(d)] }));
  }, [data]);

  const totalSpent = categoryData.reduce((acc, curr) => acc + curr.value, 0);
  const budgetProgress = Math.min((totalSpent / data.budget) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto h-full">
      {/* Budget Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 md:col-span-2">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Budget Overview</h2>
        <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-slate-900">${totalSpent.toLocaleString()}</span>
            <span className="text-slate-500 mb-1">/ ${data.budget.toLocaleString()}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
            <div 
                className={`h-3 rounded-full transition-all duration-500 ${budgetProgress > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${budgetProgress}%` }}
            ></div>
        </div>
      </div>

      {/* Category Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
        <h3 className="font-semibold text-slate-700 mb-4">Spending by Category</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value}`} />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
        <h3 className="font-semibold text-slate-700 mb-4">Daily Expenses</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip formatter={(value: number) => `$${value}`} cursor={{fill: 'transparent'}} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bookings List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 md:col-span-2">
         <h3 className="font-semibold text-slate-700 mb-4">Key Bookings</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.filter(i => i.bookingLink).map(item => (
                <div key={item.id} className="border border-slate-100 p-4 rounded-lg hover:border-blue-300 transition-colors bg-slate-50">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">{item.category}</div>
                    <div className="font-medium text-slate-800 truncate">{item.title}</div>
                    <div className="text-sm text-slate-500 mt-1">{item.startTime} - Day {item.dayIndex}</div>
                    <a href={item.bookingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-medium mt-3 block hover:underline">
                        Open Voucher &rarr;
                    </a>
                </div>
            ))}
            {data.items.filter(i => i.bookingLink).length === 0 && (
                <div className="text-slate-400 text-sm italic">No bookings linked yet.</div>
            )}
         </div>
      </div>
    </div>
  );
};