"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { ClipboardList, Clock, CheckCircle, ChevronDown, Calendar, Loader2, Bell } from "lucide-react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

// ─── Types ───
type DashboardStats = {
  total: number;
  pending: number;
  completed: number;
  preparing: number;
  served: number;
  cancelled: number;
};

type ChartDataPoint = {
  name: string;
  orders: number;
};

const metricsConfig = [
  {
    label: "Total Orders",
    icon: ClipboardList,
    bgIcon: "bg-red-100",
    colorIcon: "text-red-600",
    key: "total",
  },
  {
    label: "New Orders",
    icon: Bell,
    bgIcon: "bg-orange-100",
    colorIcon: "text-orange-600",
    key: "pending",
  },
  {
    label: "Completed Orders",
    icon: CheckCircle,
    bgIcon: "bg-green-100",
    colorIcon: "text-green-600",
    key: "completed",
  },
];

// Dashboard Skeleton Loader
const DashboardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 border border-gray-100 w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
        <div className="h-[300px] bg-gray-200 rounded-md animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default function DashboardPage() {
  const params = useParams();
  const slug = params?.menupages as string;
  
  const [period, setPeriod] = useState("today");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define dynamic cache key based on filters
  const statsUrl = slug ? `/api/orders/${slug}/stats?period=${period}${period === "custom" ? `&date=${selectedDate}` : ""}` : null;

  // Use SWR for memory caching and fast data fetching
  const { data, isLoading: swrLoading, isValidating } = useSWR(statsUrl, {
    revalidateOnFocus: true,
    refreshInterval: 30000, // Auto-refresh every 30 seconds for real-time dashboard
    dedupingInterval: 10000, // Dedup requests within 10s
    keepPreviousData: true, // Keep data visible while switching periods
  });

  const stats = data?.success ? data.stats : {
    total: 0,
    pending: 0,
    completed: 0,
    preparing: 0,
    served: 0,
    cancelled: 0
  };
  
  const chartData = data?.success && data.chartData ? data.chartData : [];
  const loading = swrLoading && !data;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePeriodSelect = (value: string) => {
    setPeriod(value);
    setShowDropdown(false);
    if (value !== "custom") {
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
      setPeriod("custom");
    }
  };

  const getPeriodDisplay = () => {
    if (period === "today") return "Today";
    if (period === "yesterday") return "Yesterday";
    if (period === "7d") return "Last 7 Days";
    if (period === "30d") return "Last 30 Days";
    if (period === "overall") return "Overall";
    if (period === "custom") {
      const date = new Date(selectedDate);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return "Today";
  };

  const getXAxisLabel = () => {
    if (period === "today" || period === "yesterday" || period === "custom") {
      return "time from 12.00 am to 12.00 pm";
    }
    return `date from ${chartData[0]?.name || ''} to ${chartData[chartData.length - 1]?.name || ''}`;
  };

  // Fix: Check if chartData exists and has length before mapping - with proper typing
  const chartDataWithGrowth = chartData && chartData.length > 0
    ? chartData.map((point: ChartDataPoint) => ({
        ...point,
        growth: Math.min(100, Math.max(10, (point.orders / (stats.total || 1)) * 100))
      }))
    : [];

  return (
    <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 border border-gray-100 w-full min-h-[600px]">
      
      {/* ─── Dashboard Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Dashboard Overview
          </h2>
          {(loading || isValidating) && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>
        
        {/* Date Filter Section - Always in same row */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Simple Date Input - Direct picker */}
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full sm:w-[140px] pl-9 pr-1 py-2 bg-gray-100 border border-gray-200 rounded-md text-[10px] sm:text-xs font-bold focus:outline-none focus:border-[#D92632] focus:ring-1 focus:ring-[#D92632]"
              max={new Date().toISOString().split('T')[0]}
            />
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex-shrink-0" />
          </div>

          {/* Period Dropdown */}
          <div className="relative min-w-0 flex-1 sm:flex-none" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-[140px] flex items-center gap-1 bg-[#FFEFEF] text-[#D92632] px-2 py-2 rounded-md text-[10px] sm:text-xs font-bold border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors justify-between"
            >
              <span className="truncate">{getPeriodDisplay()}</span>
              <ChevronDown size={14} strokeWidth={3} className={`flex-shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border rounded-md shadow-lg py-1 z-50 min-w-[140px] w-full">
                {[
                  { value: "today", label: "Today" },
                  { value: "yesterday", label: "Yesterday" },
                  { value: "7d", label: "Last 7 Days" },
                  { value: "30d", label: "Last 30 Days" },
                  { value: "overall", label: "Overall" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePeriodSelect(option.value)}
                    className={`w-full text-left px-3 py-2 text-[10px] sm:text-xs hover:bg-gray-100 transition-colors ${
                      period === option.value ? 'bg-[#FFEFEF] text-[#D92632] font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Metrics Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {metricsConfig.map((item) => (
          <div
            key={item.label}
            className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center justify-between min-h-[100px]"
          >
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-medium text-gray-600 truncate pr-2">
                {item.label}
              </span>
              {loading ? (
                <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {stats[item.key as keyof DashboardStats] || 0}
                </span>
              )}
            </div>
            
            {/* Icon in Circle */}
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${item.bgIcon} flex items-center justify-center flex-shrink-0`}>
              <item.icon className={item.colorIcon} size={18} strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Weekly Orders Chart ─── */}
      <div className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-4 sm:p-6 min-h-[350px]">
        <div className="flex flex-row items-center justify-between gap-2 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Orders Overview
          </h3>
          <span className="text-xs sm:text-sm text-gray-500 bg-white px-3 py-1.5 rounded-md whitespace-nowrap">
            {getPeriodDisplay()}
          </span>
        </div>
        
        <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] overflow-x-auto overflow-y-hidden scrollbar-hide">
          {loading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg"></div>
          ) : (
            <div className="min-w-[700px] sm:min-w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartDataWithGrowth}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#E5E7EB" 
                    strokeDasharray="0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 10, fontWeight: 500 }}
                    tickMargin={10}
                    interval={period === "30d" ? 6 : (period === "7d" ? 1 : 0)}
                    padding={{ left: 15, right: 15 }}
                  >
                    <Label 
                      value={getXAxisLabel()} 
                      offset={-25} 
                      position="insideBottom" 
                      style={{ fill: '#6B7280', fontSize: '10px', fontWeight: 'bold' }}
                    />
                  </XAxis>
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 10, fontWeight: 500 }}
                    tickMargin={10}
                    domain={[10, 100]}
                    ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    unit="%"
                  >
                    <Label 
                      value="growth in %" 
                      angle={-90} 
                      position="insideLeft" 
                      offset={-5}
                      style={{ fill: '#6B7280', fontSize: '10px', fontWeight: 'bold', textAnchor: 'middle' }}
                    />
                  </YAxis>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "10px",
                      padding: "6px 10px",
                    }}
                    itemStyle={{ color: "#D92632", fontWeight: "bold", fontSize: "10px" }}
                    labelStyle={{ color: "#374151", fontWeight: "600", fontSize: "10px", marginBottom: "2px" }}
                    cursor={{ stroke: "#D92632", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="growth"
                    stroke="#D92632"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#D92632", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}