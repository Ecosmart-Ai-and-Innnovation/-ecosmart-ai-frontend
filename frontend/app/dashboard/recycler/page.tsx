"use client";

import React, { useState, useEffect } from 'react';
import {
  Bell, Menu, X, Leaf, Shield, BarChart2, Zap,
  ArrowUpRight, Lightbulb, Bot, Home, User,
  CheckCircle2, Clock, Wallet, Star, Scale,
  TrendingUp, Truck, Settings, HelpCircle, LogOut, Package, Activity,
  ListTree, Layers, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { dashboardApi } from '@/lib/api';

// --- TYPESCRIPT INTERFACES ---
export interface RecyclerRequest {
  id: string | number;
  initials: string;
  name: string;
  material: string;
  time: string;
  weight: string;
  distance: string;
  colorClass: string;
}

export interface RecentActivity {
  id: string | number;
  type: string;
  time: string;
  amount: string;
  status: 'Completed' | 'Pending';
  emoji: string;
  colorClass: string;
}

export interface DashboardData {
  user: {
    businessName: string;
    isOnline: boolean;
    dateString: string;
  };
  wallet: {
    balance: number;
    todayPayments: number;
    weekPurchases: number;
    pendingSettlements: number;
  };
  stats: {
    activeListings: number;
    avgRating: number;
    totalKgCollected: number;
    ecoPoints: number;
  };
  requests: RecyclerRequest[];
  activities: RecentActivity[];
  ecoImpact: {
    wasteRecycledKg: number;
    co2ReducedKg: number;
    individualsRewarded: number;
    communitiesServed: number;
  };
}

// --- API DATA HOOK ---
const useDashboardData = (): DashboardData | null => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (!token) {
          // Fallback demo data if no token exists yet (for previewing UI seamlessly)
          setData(getMockData());
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://ecosmart-ai-backend.onrender.com/api'}/dashboard/recycler`,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        const json = await res.json();
        const d = json.data || json;

        setData({
          user: d.user || { businessName: 'Musa Waste Collection', isOnline: true, dateString: 'Tuesday • July 28' },
          wallet: d.wallet || { balance: 8500, todayPayments: 1200, weekPurchases: 24800, pendingSettlements: 5400 },
          stats: d.stats || { activeListings: 6, avgRating: 4.8, totalKgCollected: 184, ecoPoints: 2340 },
          requests: d.requests?.length ? d.requests : getMockRequests(),
          activities: d.activities?.length ? d.activities : getMockActivities(),
          ecoImpact: d.ecoImpact || { wasteRecycledKg: 1200, co2ReducedKg: 1200, individualsRewarded: 54, communitiesServed: 4800 },
        });
      } catch (err) {
        console.error('Failed to fetch recycler dashboard:', err);
        setData(getMockData());
      }
    })();
  }, []);

  return data;
};

// Fallback mock data mirroring your exact visual specs
function getMockData(): DashboardData {
  return {
    user: {
      businessName: 'Musa Waste Collection',
      isOnline: true,
      dateString: 'Tuesday • July 28',
    },
    wallet: {
      balance: 8500,
      todayPayments: 1200,
      weekPurchases: 24800,
      pendingSettlements: 5400,
    },
    stats: {
      activeListings: 6,
      avgRating: 4.8,
      totalKgCollected: 184,
      ecoPoints: 2340,
    },
    requests: getMockRequests(),
    activities: getMockActivities(),
    ecoImpact: {
      wasteRecycledKg: 1200,
      co2ReducedKg: 1200,
      individualsRewarded: 54,
      communitiesServed: 4800,
    }
  };
}

function getMockRequests(): RecyclerRequest[] {
  return [
    { id: 1, initials: 'AO', name: 'Amaka Obi', material: 'Plastic Bottles', time: '5 min ago', weight: '2.5 kg', distance: '1.2 km', colorClass: 'bg-emerald-100 text-emerald-800' },
    { id: 2, initials: 'BU', name: 'Bello Usman', material: 'Aluminium Cans', time: '12 min ago', weight: '4.0 kg', distance: '0.8 km', colorClass: 'bg-emerald-100 text-emerald-800' },
    { id: 3, initials: 'CE', name: 'Chidi Eze', material: 'Paper & Cardboard', time: '25 min ago', weight: '6.2 kg', distance: '2.1 km', colorClass: 'bg-amber-100 text-amber-800' },
  ];
}

function getMockActivities(): RecentActivity[] {
  return [
    { id: 1, type: 'Plastic Bottles', time: 'Today, 10:33 AM', amount: '₦1,250', status: 'Completed', emoji: '♻️', colorClass: 'bg-white border border-slate-100' },
    { id: 2, type: 'Aluminium Cans', time: 'Yesterday, 2:15 PM', amount: '₦2,400', status: 'Completed', emoji: '🥫', colorClass: 'bg-white border border-slate-100' },
    { id: 3, type: 'Paper & Cardboard', time: 'Mon, Jun 26', amount: '₦680', status: 'Pending', emoji: '📦', colorClass: 'bg-white border border-slate-100' },
  ];
}

export default function RecyclerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const data = useDashboardData();

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSidebarOpen]);

  // Loading state while API fetches
  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7F4]">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleRequestAction = async (id: string | number, action: 'accept' | 'decline') => {
    try {
      await dashboardApi.requestAction(id, action);
      window.location.reload();
    } catch (err) {
      console.error('Request action failed:', err);
    }
  };

  const navItems = [
    { id: 'Home', icon: Home },
    { id: 'Requests', icon: Truck },
    { id: 'Collections', icon: Package },
    { id: 'Wallet', icon: Wallet },
    { id: 'Boost', icon: Zap, badge: 'Coming Soon' },
    { id: 'Analytics', icon: BarChart2, badge: 'Coming Soon' },
  ];

  const userMenuItems = [
    { id: 'Settings', icon: Settings },
    { id: 'Help & Support', icon: HelpCircle },
    { id: 'Logout', icon: LogOut, className: 'text-red-600 hover:bg-red-50' },
  ];

  // --- DESKTOP SIDEBAR COMPONENT ---
  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-white w-64 border-r border-slate-100 overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
            <span className="text-sm">🌱</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">EcoSmart AI</span>
        </div>
        {isSidebarOpen && <X onClick={() => setIsSidebarOpen(false)} className="w-6 h-6 lg:hidden text-slate-500 cursor-pointer" />}
      </div>

      <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-50">
        <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
          {(data.user.businessName || 'R')[0].toUpperCase()}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm truncate max-w-[130px]">{data.user.businessName}</h4>
          <p className="text-xs text-slate-500 font-medium">Recycler</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
              activeTab === item.id
                ? 'bg-emerald-50 text-emerald-900'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'}`} />
            {item.id}
            {item.badge && (
              <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50 mt-auto flex flex-col gap-1">
        {userMenuItems.map((item) => (
          <button
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 ${item.className || ''}`}
          >
            <item.icon className="w-5 h-5 text-slate-400" />
            {item.id}
          </button>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#F4F7F4] font-sans text-slate-800 overflow-hidden selection:bg-emerald-100">

      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 animate-in slide-in-from-left duration-300" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* MAIN LAYOUT CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative items-center">

        {/* Central App Card Container (Spreads on desktop, fits mobile width perfectly) */}
        <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative pb-24 shadow-2xl md:max-w-4xl md:my-6 md:rounded-3xl md:overflow-hidden overflow-y-auto">

          {/* Top Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                <span className="text-sm">🌱</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">EcoSmart AI</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-600 hover:text-slate-900 relative">
                <Shield className="w-5 h-5" />
              </button>
              <button className="text-slate-600 hover:text-slate-900 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="text-slate-600 hover:text-slate-900 lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <main className="flex-1 px-4 py-6 space-y-6">

            {/* Greeting Banner */}
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Hi {data.user.businessName} <span className="inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
                <span>{data.user.dateString}</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              </p>
            </div>

            {/* Collection Wallet Card */}
            <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-600/30 rounded-full blur-2xl"></div>

              <div className="flex justify-between items-center mb-3 relative z-10">
                <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold tracking-wider uppercase">
                  <Wallet className="w-4 h-4" /> Collection Wallet
                </div>
                <span className="bg-emerald-600/60 backdrop-blur-md text-emerald-100 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-500/30 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Verified
                </span>
              </div>

              <div className="mb-5 relative z-10">
                <p className="text-xs text-emerald-200 font-medium">Available to spend on pickups</p>
                <h2 className="text-3xl font-black tracking-tight mt-0.5">₦{data.wallet.balance.toLocaleString()}</h2>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-t border-emerald-700/60 text-center relative z-10">
                <div>
                  <p className="text-[10px] text-emerald-300 font-medium">Today's Payments</p>
                  <p className="text-xs font-bold mt-0.5">₦{data.wallet.todayPayments.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-300 font-medium">This Week's Purchases</p>
                  <p className="text-xs font-bold mt-0.5">₦{data.wallet.weekPurchases.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-300 font-medium">Pending Settlements</p>
                  <p className="text-xs font-bold mt-0.5 text-amber-300">₦{data.wallet.pendingSettlements.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-2 pt-3 flex items-center justify-between border-t border-emerald-700/60 relative z-10">
                <span className="text-[10px] text-emerald-300 font-medium">Min. ₦2,000 to withdraw</span>
                <button className="bg-white text-emerald-900 text-xs font-bold px-4 py-2 rounded-xl shadow hover:bg-emerald-50 transition flex items-center gap-1">
                  Request Payout <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ListTree className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{data.stats.activeListings}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Active Collections</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{data.stats.avgRating}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Avg Rating</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{data.stats.totalKgCollected} Kg</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Total kg Collected</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{data.stats.ecoPoints.toLocaleString()}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Eco Points</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <button className="flex flex-col items-center justify-center p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl hover:bg-emerald-100/50 transition">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Requests</span>
                </button>

                <button className="flex flex-col items-center justify-center p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl hover:bg-emerald-100/50 transition">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Collections</span>
                </button>

                <button className="flex flex-col items-center justify-center p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl hover:bg-emerald-100/50 transition">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Wallet</span>
                </button>

                <button className="flex flex-col items-center justify-center p-3 bg-amber-50/60 border border-amber-100 rounded-2xl hover:bg-amber-100/50 transition">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Boost ⚡</span>
                </button>
              </div>
            </div>

            {/* New Requests Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">New Requests</h3>
                  <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">{data.requests.length}</span>
                </div>
                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {data.requests.map((req) => (
                  <div key={req.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/dashboard/recyclers/details?id=${req.id}`)}>
                        <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-xs ${req.colorClass}`}>
                          {req.initials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{req.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">{req.material}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{req.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900">{req.weight}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{req.distance}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button onClick={() => handleRequestAction(req.id, 'accept')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition shadow-sm">
                        Accept
                      </button>
                      <button onClick={() => handleRequestAction(req.id, 'decline')} className="bg-white border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold py-2 rounded-xl transition">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Ticker Bar */}
            <div className="bg-emerald-50/70 border border-emerald-100 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-emerald-900">
                <span className="text-emerald-700">🍃</span>
                <span>Glass</span>
                <span className="text-slate-400">•</span>
                <span>4.8 kg</span>
                <span className="text-slate-400">•</span>
                <span>Buying ₦10</span>
                <span className="text-slate-400">•</span>
                <span>Mkt ₦12</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" /> 1%
              </div>
            </div>

            {/* Eco Tip Box */}
            <div className="bg-[#F4F9F4] border border-emerald-100 p-4 rounded-2xl flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Eco Tip</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Accepting requests within 30 minutes increases your rating by 40%.
                </p>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Activity</h3>
                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {data.activities.map((act) => (
                  <div key={act.id} className="bg-white border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm">
                        {act.emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{act.type}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">{act.amount}</p>
                      <span className={`inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${act.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant Banner */}
            <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Eco Tip</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Need help identifying materials, estimating payments, checking market prices, or planning pickup routes?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                  🤖
                </div>
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 cursor-pointer hover:underline">
                  Ask Mina <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button className="bg-white border border-emerald-200/80 text-emerald-900 text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-xs hover:bg-emerald-50/50 text-center">
                  Estimate Payment
                </button>
                <button className="bg-white border border-emerald-200/80 text-emerald-900 text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-xs hover:bg-emerald-50/50 text-center">
                  Identify Material
                </button>
                <button className="bg-white border border-emerald-200/80 text-emerald-900 text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-xs hover:bg-emerald-50/50 text-center">
                  Market Prices
                </button>
                <button className="bg-white border border-emerald-200/80 text-emerald-900 text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-xs hover:bg-emerald-50/50 text-center">
                  Nearby Pickups
                </button>
              </div>
              <div>
                <button className="w-full bg-white border border-emerald-200/80 text-emerald-900 text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-xs hover:bg-emerald-50/50 text-center">
                  Optimize Route
                </button>
              </div>
            </div>

            {/* Your Eco Impact Section */}
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">🌱</span>
                  <h4 className="text-xs font-bold text-slate-900">Your Eco Impact</h4>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> Coming Soon
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <h5 className="text-base font-black text-slate-900">{data.ecoImpact.wasteRecycledKg} kg</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">CO₂ Avoided</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <h5 className="text-base font-black text-slate-900">{data.ecoImpact.individualsRewarded} trees</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Trees Equivalent</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <h5 className="text-base font-black text-slate-900">{data.stats.totalKgCollected * 10} kg</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Waste Diverted</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <h5 className="text-base font-black text-slate-900">{data.ecoImpact.communitiesServed} L</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Water Saved</p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed italic pt-1">
                🌱 Live impact data coming soon. These estimates are based on your collection history.
              </p>
            </div>

          </main>

          {/* Bottom Nav Bar */}
          <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-3 px-6 flex items-center justify-around z-40 shadow-lg">
            <button onClick={() => setActiveTab('Home')} className={`flex flex-col items-center gap-1 ${activeTab === 'Home' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button onClick={() => setActiveTab('Requests')} className={`flex flex-col items-center gap-1 ${activeTab === 'Requests' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Truck className="w-5 h-5" />
              <span className="text-[10px] font-medium">Requests</span>
            </button>
            <button onClick={() => setActiveTab('Collections')} className={`flex flex-col items-center gap-1 ${activeTab === 'Collections' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-medium">Collections</span>
            </button>
            <button onClick={() => setActiveTab('Profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'Profile' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </nav>

        </div>
      </div>
    </div>
  );
}