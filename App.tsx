import React, { useState, useEffect } from 'react';
import { 
  Layout, Calendar, PieChart, Users, Sparkles, 
  Settings, Menu, X 
} from 'lucide-react';
import { Itinerary } from './components/Itinerary';
import { Dashboard } from './components/Dashboard';
import { ExpenseSplitter } from './components/ExpenseSplitter';
import { TripData, ItineraryItem, TransportType, MetroCity } from './types';
import { generateItinerary } from './services/geminiService';

// Mock Initial Data
const INITIAL_DATA: TripData = {
  title: "Taiwan Adventure 2024",
  startDate: "2024-10-10",
  durationDays: 5,
  budget: 50000,
  travelers: [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' }
  ],
  items: [
    {
      id: '101',
      dayIndex: 1,
      startTime: '09:00',
      endTime: '10:00',
      title: 'Arrival at TPE',
      category: 'TRANSPORT',
      transportDetails: {
        type: TransportType.FLIGHT,
        identifier: 'BR123',
        terminal: '2',
        gate: 'C5'
      },
      location: { name: 'Taoyuan International Airport' },
      cost: 0
    },
    {
        id: '102',
        dayIndex: 1,
        startTime: '10:30',
        endTime: '11:15',
        title: 'Airport MRT to Taipei Main',
        category: 'TRANSPORT',
        transportDetails: {
            type: TransportType.METRO,
            metroCity: MetroCity.TAOYUAN,
            metroLineColor: 'purple'
        },
        location: { name: 'Taipei Main Station' },
        cost: 150
    },
    {
        id: '103',
        dayIndex: 1,
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch at Din Tai Fung',
        category: 'FOOD',
        location: { name: 'Din Tai Fung Xinyi' },
        cost: 1500,
        description: 'Famous Xiao Long Bao'
    },
    {
        id: '104',
        dayIndex: 1,
        startTime: '14:00',
        title: 'Check-in Hotel',
        category: 'ACCOMMODATION',
        location: { name: 'W Hotel Taipei' },
        bookingLink: 'https://www.marriott.com',
        cost: 8000
    }
  ],
  expenses: [
      {
          id: 'e1', amount: 1500, currency: 'TWD', category: 'Food',
          payerId: '1', splitBetween: ['1','2','3'], description: 'Lunch at DTF', date: '2024-10-10'
      },
      {
          id: 'e2', amount: 300, currency: 'TWD', category: 'Transport',
          payerId: '2', splitBetween: ['1','2','3'], description: 'Taxi to Hotel', date: '2024-10-10'
      }
  ]
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'dashboard' | 'expenses'>('itinerary');
  const [tripData, setTripData] = useState<TripData>(INITIAL_DATA);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle Gemini Auto-Plan
  const handleAutoPlan = async () => {
    const destination = prompt("Where do you want to go?", "Taipei, Taiwan");
    if (!destination) return;
    
    setIsGenerating(true);
    try {
        const newItems = await generateItinerary(destination, tripData.durationDays, "Food, Culture, Shopping");
        if (newItems.length > 0) {
            setTripData(prev => ({ ...prev, items: newItems }));
        } else {
            alert("Could not generate itinerary. Check console or API key.");
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const updateItems = (newItems: ItineraryItem[] | ((prev: ItineraryItem[]) => ItineraryItem[])) => {
      setTripData(prev => ({
          ...prev,
          items: typeof newItems === 'function' ? newItems(prev.items) : newItems
      }));
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/20 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                WanderPlan
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
                <X />
            </button>
        </div>

        <nav className="p-4 space-y-2">
            <button 
                onClick={() => { setActiveTab('itinerary'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'itinerary' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                <Calendar className="w-5 h-5" />
                <span>Itinerary</span>
            </button>
            <button 
                onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                <PieChart className="w-5 h-5" />
                <span>Overview & Stats</span>
            </button>
            <button 
                onClick={() => { setActiveTab('expenses'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'expenses' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                <Users className="w-5 h-5" />
                <span>Expense Split</span>
            </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
            <button 
                onClick={handleAutoPlan}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Planning...' : 'AI Auto-Plan'}
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-600">
                    <Menu />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">{tripData.title}</h2>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{tripData.startDate}</span>
                        <span>•</span>
                        <span>{tripData.durationDays} Days</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 {/* Top right actions could go here (e.g. Export PDF, Settings) */}
                 <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                    <Settings className="w-5 h-5" />
                 </button>
                 <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                    YO
                 </div>
            </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'itinerary' && (
                <Itinerary 
                    items={tripData.items} 
                    setItems={updateItems} 
                    dayCount={tripData.durationDays} 
                />
            )}
            {activeTab === 'dashboard' && <Dashboard data={tripData} />}
            {activeTab === 'expenses' && <ExpenseSplitter data={tripData} />}
        </div>
      </main>
    </div>
  );
};

export default App;