export enum TransportType {
  METRO = 'METRO',
  BUS = 'BUS',
  TRAIN_HSR = 'TRAIN_HSR', // High Speed Rail
  TRAIN_TRA = 'TRAIN_TRA', // Taiwan Railways
  FLIGHT = 'FLIGHT',
  TAXI = 'TAXI',
  WALK = 'WALK',
  OTHER = 'OTHER'
}

export enum MetroCity {
  TAIPEI = 'TAIPEI',
  TAICHUNG = 'TAICHUNG',
  KAOHSIUNG = 'KAOHSIUNG',
  TAOYUAN = 'TAOYUAN',
  NONE = 'NONE'
}

export interface TransportDetails {
  type: TransportType;
  provider?: string; // e.g., "Kenting Express", "Eva Air"
  identifier?: string; // e.g., Flight No., Train No., Bus Route
  seat?: string;
  terminal?: string;
  gate?: string;
  platform?: string;
  metroCity?: MetroCity;
  metroLineColor?: string; // Hex code or tailwind class
}

export interface Location {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

export interface ItineraryItem {
  id: string;
  dayIndex: number;
  startTime: string; // HH:mm
  endTime?: string;
  title: string;
  description?: string;
  location?: Location;
  category: 'TRANSPORT' | 'ACTIVITY' | 'FOOD' | 'ACCOMMODATION';
  transportDetails?: TransportDetails;
  cost?: number;
  bookingLink?: string; // Klook/Official site
  isLocked?: boolean; // If true, time is fixed
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  payerId: string;
  splitBetween: string[]; // User IDs
  description: string;
  date: string;
}

export interface Traveler {
  id: string;
  name: string;
  avatar?: string;
}

export interface TripData {
  title: string;
  startDate: string; // YYYY-MM-DD
  durationDays: number;
  travelers: Traveler[];
  items: ItineraryItem[];
  expenses: Expense[];
  budget: number;
}