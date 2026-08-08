"use client";

import React, { useState, useEffect } from 'react';
import {
  Bell, Menu, X, Leaf, Shield, Grid, BarChart2, Zap,
  ArrowUpRight, Lightbulb, Bot, Home, User,
  CheckCircle2, Clock, Check, X as XIcon, Wallet, Star, Scale,
  TrendingUp, Truck, Settings, HelpCircle, LogOut, Package, Activity
} from 'lucide-react';
import { getToken } from '@/lib/auth';
import { dashboardApi } from '@/lib/api';

// --- TYPESCRIPT INTERFACES (Preparing for Backend) ---
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

// --- API DATA HOOK (Fetches from backend, falls back for endpoints not built) ---
const useDashboardData = (): DashboardData | null => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://ecosmart-ai-backend.onrender.com/api'}/dashboard/recycler`,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        const json = await res.json();
        const d = json.data || json;

        setData({
          user: d.user || { businessName: 'Recycler', isOnline: true, dateString: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) },
          wallet: d.wallet || { balance: 0, todayPayments: 0, weekPurchases: 0, pendingSettlements: 0 },
          stats: d.stats || { activeListings: 0, avgRating: 0, totalKgCollected: 0, ecoPoints: 0 },
          requests: d.requests || [],
          activities: d.activities || [],
          ecoImpact: d.ecoImpact || { wasteRecycledKg: 0, co2ReducedKg: 0, individualsRewarded: 0, communitiesServed: 0 },
        });
      } catch (err) {
        console.error('Failed to fetch recycler dashboard:', err);
        setData(null);
      }
    })();
  }, []);

  return data;
};

export default function RecyclerDashboard() {
  const [activeTab, setActiveTab] = useState('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const data = useDashboardData();

  // Lock body scroll when sidebar is open on mobile
  // Must run before the `!data` early return below — hooks can't be conditional //Ese's fix
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
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <div className="w-12 h-12 border-4 border-[#eaf4e7] border-t-[#549B45] rounded-full animate-spin" />
      </div>
    );
  }

  // Accept or decline a pickup request
  const handleRequestAction = async (id: string | number, action: 'accept' | 'decline') => {
    try {
      await dashboardApi.requestAction(id, action);
      // Refresh data after action
      window.location.reload();
    } catch (err) {
      console.error('Request action failed:', err);
    }
  };

  const navItems = [
    { id: 'Dashboard', icon: Home },
    { id: 'Requests', icon: Truck },
    { id: 'Collections', icon: Package },
    { id: 'Wallet', icon: Wallet },
    { id: 'Boost', icon: Zap, badge: 'Coming Soon' },
    { id: 'Analytics', icon: BarChart2, badge: 'Coming Soon' },
    { id: 'Language', icon: Leaf },
  ];

  const userMenuItems = [
    { id: 'Settings', icon: Settings },
    { id: 'Help & Support', icon: HelpCircle },
    { id: 'Logout', icon: LogOut, className: 'text-red-600 hover:bg-red-50' },
  ];

  // --- SUB-COMPONENTS ---

  // The Permanent Desktop Sidebar
  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-white w-64 border-r border-gray-100 overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="bg-green-50 p-1.5 rounded-full">
            <Leaf className="w-6 h-6 text-[#449339]" />
          </div>
          <div className="text-xl tracking-tight">
            <span className="font-bold text-[#449339]">EcoSmart</span>
            <span className="font-bold text-gray-900 ml-0.5">AI</span>
          </div>
        </div>
        {isSidebarOpen && <X onClick={() => setIsSidebarOpen(false)} className="w-6 h-6 lg:hidden text-gray-500 cursor-pointer" />}
      </div>

      {/* User Profile (Top) */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-50">
        <div className="w-12 h-12 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-lg">
          {(data.user.businessName || 'R')[0].toUpperCase()}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{data.user.businessName}</h4>
          <p className="text-xs text-gray-500 font-medium">Recycler</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
              activeTab === item.id
                ? 'bg-[#f1f8ee] text-[#1b5030]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#549B45]' : 'text-gray-400'}`} />
            {item.id}
            {item.badge && (
              <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User Menu (Bottom) */}
      <div className="p-4 border-t border-gray-50 mt-auto flex flex-col gap-1">
        {userMenuItems.map((item) => (
          <button
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 ${item.className || ''}`}
          >
            <item.icon className="w-5 h-5 text-gray-400" />
            {item.id}
          </button>
        ))}
      </div>
    </aside>
  );

  // --- MAIN VIEW ---
  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900 overflow-hidden selection:bg-green-100">

      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay (Triggered by Hamburger) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 animate-in slide-in-from-left duration-300" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Header (Sticky) */}
        <header className="flex justify-between items-center px-5 lg:px-10 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 sticky top-0">

          {/* Mobile Logo (Hidden on Desktop) */}
          <div className="flex lg:hidden items-center gap-1.5">
            <div className="bg-green-50 p-1.5 rounded-full">
              <Leaf className="w-5 h-5 text-[#449339]" />
            </div>
            <div className="text-[17px] tracking-tight">
              <span className="font-bold text-[#449339]">EcoSmart</span>
              <span className="font-bold text-gray-900 ml-0.5">AI</span>
            </div>
          </div>

          {/* Desktop Greeting (Hidden on Mobile) */}
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Hi {data.user.businessName} 👋
            </h1>
            <div className="flex items-center text-[13px] text-gray-500 mt-1 gap-2 font-medium">
              <span>Your recycling impact is growing!</span>
              <span>•</span>
              <span>{data.user.dateString}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#549B45] font-semibold bg-[#eaf4e7] px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-[#549B45] rounded-full"></div> Online
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative cursor-pointer bg-gray-50 p-2.5 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            <Menu className="w-6 h-6 text-gray-800 cursor-pointer lg:hidden" onClick={() => setIsSidebarOpen(true)} />
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 lg:pb-10 scroll-smooth">

          <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 animate-in fade-in duration-500">

            {/* Mobile Greeting (Hidden on Desktop) */}
            <div className="lg:hidden mb-2">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Hi {data.user.businessName} 👋
              </h1>
              <div className="flex items-center text-[12px] text-gray-500 mt-1 gap-1.5 font-medium">
                <span>Your recycling impact is growing!</span>
                <span>•</span>
                <span>{data.user.dateString}</span>
              </div>
            </div>

            {/* ========================================= */}
            {/* ROW 1: Wallet & Stats Grid                */}
            {/* ========================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Main Wallet Card (Spans 4 cols on desktop) */}
              <div className="lg:col-span-5 xl:col-span-4 bg-gradient-to-br from-[#1b5030] to-[#449339] rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-green-900/10 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="flex items-center gap-2 text-white/90 text-[13px] font-semibold uppercase tracking-wider">
                    <Wallet className="w-4 h-4" /> Collection Wallet
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Verified
                  </div>
                </div>

                <div className="mb-6 relative z-10">
                  <p className="text-white/80 text-[14px] mb-1 font-medium">Available to spend on pickups</p>
                  <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">₦{data.wallet.balance.toLocaleString()}</h2>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6 relative z-10">
                  <div>
                    <p className="text-white/70 text-[10px] lg:text-[11px] uppercase font-bold mb-1">Today's Payments</p>
                    <p className="font-bold text-sm lg:text-base">₦{data.wallet.todayPayments.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-[10px] lg:text-[11px] uppercase font-bold mb-1">Week's Volume</p>
                    <p className="font-bold text-sm lg:text-base">₦{data.wallet.weekPurchases.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[#f5a623] text-[10px] lg:text-[11px] uppercase font-bold mb-1">Pending</p>
                    <p className="font-bold text-sm lg:text-base">₦{data.wallet.pendingSettlements.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid (Spans remaining cols on desktop) */}
              <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-[#eaf4e7] flex items-center justify-center mb-4">
                    <Package className="w-5 h-5 text-[#449339]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.activeListings}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Active Listings</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-[#eaf4e7] flex items-center justify-center mb-4">
                    <Star className="w-5 h-5 text-[#449339]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.avgRating}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Average Rating</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-[#eaf4e7] flex items-center justify-center mb-4">
                    <Scale className="w-5 h-5 text-[#449339]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalKgCollected}kg</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Total Collected</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-[#eaf4e7] flex items-center justify-center mb-4">
                    <Leaf className="w-5 h-5 text-[#449339]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.ecoPoints.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Eco Points</p>
                </div>
              </div>
            </div>

            {/* ========================================= */}
            {/* ROW 2: Pickup Requests                    */}
            {/* ========================================= */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#449339]" /> New Requests
                </h3>
                <span className="text-xs font-bold bg-[#eaf4e7] text-[#449339] px-3 py-1 rounded-full">
                  {data.requests.length} pending
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.requests.map((req) => (
                  <div key={req.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${req.colorClass}`}>
                          {req.initials}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{req.name}</p>
                          <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{req.material}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">{req.weight}</p>
                        <p className="text-xs text-gray-400">{req.distance}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRequestAction(req.id, 'accept')} className="flex-1 bg-[#449339] hover:bg-[#3a7d31] text-white py-2.5 rounded-xl text-xs font-bold transition-colors">
                        Accept
                      </button>
                      <button onClick={() => handleRequestAction(req.id, 'decline')} className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 py-2.5 rounded-xl text-xs font-bold transition-colors">
                        Decline
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {req.time}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ========================================= */}
            {/* ROW 3: Recent Activity + Eco Impact        */}
            {/* ========================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Recent Activity */}
              <div className="lg:col-span-7 bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#449339]" /> Recent Activity
                </h3>
                <div className="space-y-3">
                  {data.activities.map((act) => (
                    <div key={act.id} className={`flex items-center justify-between p-3 rounded-xl ${act.colorClass}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{act.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{act.type}</p>
                          <p className="text-xs text-gray-500">{act.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">{act.amount}</p>
                        <span className={`text-[11px] font-bold ${act.status === 'Completed' ? 'text-green-600' : 'text-amber-500'}`}>
                          {act.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eco Impact */}
              <div className="lg:col-span-5 bg-[#f1f8ee] p-5 lg:p-6 rounded-2xl border border-green-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#449339]" /> Eco Impact
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-green-50">
                    <p className="text-2xl font-bold text-[#449339]">{data.ecoImpact.wasteRecycledKg}kg</p>
                    <p className="text-xs text-gray-500 mt-1">Waste Recycled</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-50">
                    <p className="text-2xl font-bold text-[#449339]">{data.ecoImpact.co2ReducedKg}kg</p>
                    <p className="text-xs text-gray-500 mt-1">CO₂ Reduced</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-50">
                    <p className="text-2xl font-bold text-[#449339]">{data.ecoImpact.individualsRewarded}</p>
                    <p className="text-xs text-gray-500 mt-1">Indv. Rewarded</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-50">
                    <p className="text-2xl font-bold text-[#449339]">{data.ecoImpact.communitiesServed}</p>
                    <p className="text-xs text-gray-500 mt-1">Communities Served</p>
                  </div>
                </div>
                <button className="mt-4 w-full bg-white border border-[#449339] text-[#449339] py-3 rounded-xl font-bold text-sm hover:bg-[#449339] hover:text-white transition-all flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" /> View Full Report
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}