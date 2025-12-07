import React, { useState } from 'react';
import { ItineraryItem, TransportType, MetroCity } from '../types';
import { 
  Train, Bus, Plane, MapPin, Coffee, Bed, Camera, 
  ArrowRight, Clock, MoreVertical, Trash2, Edit2, 
  Map, ExternalLink, RefreshCw, Plus
} from 'lucide-react';
import { estimateTravelTime } from '../services/geminiService';

interface ItineraryProps {
  items: ItineraryItem[];
  setItems: React.Dispatch<React.SetStateAction<ItineraryItem[]>>;
  dayCount: number;
}

const TransportIcon = ({ type, className }: { type: TransportType; className?: string }) => {
  switch (type) {
    case TransportType.FLIGHT: return <Plane className={className} />;
    case TransportType.TRAIN_HSR: return <Train className={`text-orange-600 ${className}`} />;
    case TransportType.TRAIN_TRA: return <Train className={`text-blue-700 ${className}`} />;
    case TransportType.METRO: return <Train className={`text-green-600 ${className}`} />;
    case TransportType.BUS: return <Bus className={className} />;
    case TransportType.TAXI: return <div className={`font-bold border-2 border-current rounded px-1 text-[10px] ${className}`}>TAXI</div>;
    case TransportType.WALK: return <div className={`font-bold ${className}`}>🚶</div>;
    default: return <ArrowRight className={className} />;
  }
};

const CategoryIcon = ({ category, transportType }: { category: string; transportType?: TransportType }) => {
  if (category === 'TRANSPORT' && transportType) return <TransportIcon type={transportType} className="w-5 h-5" />;
  switch (category) {
    case 'FOOD': return <Coffee className="w-5 h-5 text-orange-500" />;
    case 'ACCOMMODATION': return <Bed className="w-5 h-5 text-indigo-500" />;
    case 'ACTIVITY': return <Camera className="w-5 h-5 text-emerald-500" />;
    default: return <MapPin className="w-5 h-5 text-gray-500" />;
  }
};

export const Itinerary: React.FC<ItineraryProps> = ({ items, setItems, dayCount }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const days = Array.from({ length: dayCount }, (_, i) => i + 1);
  const dayItems = items.filter(i => i.dayIndex === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const moveItem = (id: string, direction: 'up' | 'down') => {
    // Simple time adjustment or re-ordering logic could go here.
    // For this prototype, we'll just swap times if close, or re-order in array.
    // In a real app, this would be complex DND. Here we simulate re-sorting by index.
    const currentIndex = items.findIndex(i => i.id === id);
    if (currentIndex === -1) return;
    
    const newItems = [...items];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newItems.length) {
       // Swap time slightly to effect sort
       const temp = newItems[currentIndex];
       newItems[currentIndex] = newItems[targetIndex];
       newItems[targetIndex] = temp;
       
       // Swap day index if moving across boundaries (not implemented for simplicity here)
       // Just update state
       setItems(newItems);
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const calculateRoute = async (item: ItineraryItem) => {
     if (item.category === 'TRANSPORT' && item.transportDetails) {
        // Mocking 'from' as previous item location
        const idx = items.findIndex(i => i.id === item.id);
        const prev = items[idx-1];
        if (prev) {
            const result = await estimateTravelTime(prev.location?.name || "", item.location?.name || "", item.transportDetails.type);
            alert(`Estimated: ${result.duration} (${result.distance})`);
        }
     }
  }

  const openGoogleMaps = (item: ItineraryItem) => {
      // If transport, create directions
      if (item.category === 'TRANSPORT' && item.location?.name) {
          // Ideally would need origin. Assume User Current or Previous Item
          const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.location.name)}&travelmode=transit`;
          window.open(url, '_blank');
      } else if (item.location?.name) {
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location.name)}`;
          window.open(url, '_blank');
      }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Day Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
              selectedDay === day 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            Day {day}
          </button>
        ))}
        <button className="px-4 py-4 text-slate-400 hover:text-blue-600">
            <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div className="space-y-4 max-w-3xl mx-auto">
          {dayItems.length === 0 && (
            <div className="text-center py-20 text-slate-400">
                <p>No plans for this day yet.</p>
                <p className="text-sm">Use "AI Auto Plan" or add items manually.</p>
            </div>
          )}

          {dayItems.map((item, index) => (
            <div key={item.id} className="relative pl-8 group">
              {/* Timeline Line */}
              {index !== dayItems.length - 1 && (
                <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-slate-200 group-hover:bg-blue-200 transition-colors" />
              )}
              
              {/* Timeline Dot */}
              <div className={`absolute left-0 top-2 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 
                ${item.category === 'TRANSPORT' ? 'border-blue-500' : 'border-slate-300'}`}>
                <div className={`w-2 h-2 rounded-full ${item.category === 'TRANSPORT' ? 'bg-blue-500' : 'bg-slate-300'}`} />
              </div>

              {/* Card */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.startTime}
                        </span>
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                           <CategoryIcon category={item.category} transportType={item.transportDetails?.type} />
                           {item.title}
                        </h3>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => calculateRoute(item)} title="Calc Route Time" className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => openGoogleMaps(item)} title="Maps" className="p-1.5 text-slate-400 hover:text-green-600 rounded hover:bg-green-50">
                            <Map className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Details Section */}
                <div className="text-sm text-slate-600 pl-2 border-l-2 border-slate-100 ml-1">
                    {item.location?.name && (
                        <div className="flex items-center gap-1 mb-1 text-slate-500">
                            <MapPin className="w-3 h-3" /> {item.location.name}
                        </div>
                    )}
                    
                    {/* Transport Specifics */}
                    {item.category === 'TRANSPORT' && item.transportDetails && (
                        <div className="mt-2 bg-slate-50 p-2 rounded text-xs space-y-1">
                            <div className="flex items-center gap-2 font-medium">
                                <span className="uppercase tracking-wider text-slate-400">{item.transportDetails.type}</span>
                                {item.transportDetails.provider && <span className="text-blue-600">{item.transportDetails.provider}</span>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                {item.transportDetails.metroCity !== MetroCity.NONE && (
                                    <div className="flex items-center gap-1">
                                        <span className={`w-2 h-2 rounded-full ${
                                            item.transportDetails.metroLineColor === 'red' ? 'bg-red-500' :
                                            item.transportDetails.metroLineColor === 'blue' ? 'bg-blue-500' :
                                            item.transportDetails.metroLineColor === 'green' ? 'bg-green-500' : 
                                            item.transportDetails.metroLineColor === 'orange' ? 'bg-orange-500' : 'bg-gray-400'
                                        }`}></span>
                                        <span>Line</span>
                                    </div>
                                )}
                                {item.transportDetails.identifier && <div>No: {item.transportDetails.identifier}</div>}
                                {item.transportDetails.seat && <div>Seat: {item.transportDetails.seat}</div>}
                                {item.transportDetails.terminal && <div>Term: {item.transportDetails.terminal}</div>}
                                {item.transportDetails.gate && <div>Gate: {item.transportDetails.gate}</div>}
                            </div>
                        </div>
                    )}

                    {/* Booking Link */}
                    {item.bookingLink && (
                        <a href={item.bookingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-500 hover:underline">
                            <ExternalLink className="w-3 h-3" /> View Booking
                        </a>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};