
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useWorkspace } from "@/context/WorkspaceContext"; // Dark mode detect karne ke liye

interface Props {
  data: any[];
}


const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const formatYAxis = (tickItem: number) => {
  if (tickItem >= 10000000) return `₹${(tickItem / 10000000).toFixed(1)}Cr`;
  if (tickItem >= 100000) return `₹${(tickItem / 100000).toFixed(1)}L`;
  if (tickItem >= 1000) return `₹${(tickItem / 1000).toFixed(0)}k`;
  return `₹${tickItem}`;
};

// Sleek Custom Tooltip (Theme Aware)
const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`backdrop-blur-sm border p-4 rounded-xl shadow-lg min-w-[180px] ${isDark ? "bg-[#1e1e2d]/95 border-gray-700" : "bg-white/95 border-gray-200"}`}>
        <p className={`font-medium text-xs mb-3 uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Month {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4 text-sm">
              <span className="flex items-center gap-2 font-medium text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></span>
                {entry.name === "principalPaid" ? "Principal" : "Interest"}
              </span>
              <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
        <div className={`mt-3 pt-2 border-t flex justify-between items-center text-sm ${isDark ? "border-gray-700" : "border-gray-100"}`}>
          <span className={`font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total EMI</span>
          <span className="font-bold text-indigo-500">
            {formatCurrency(payload[0].value + payload[1].value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AmortizationChart({ data }: Props) {
  const { state } = useWorkspace();
  const isDark = state?.theme === "dark";

  if (!data || data.length === 0) {
    return (
      <div className={`h-[400px] flex items-center justify-center font-medium border border-dashed rounded-xl ${isDark ? "text-gray-600 border-gray-800" : "text-gray-400 border-gray-200"}`}>
        No chart data available
      </div>
    );
  }

  return (
    <div className="h-[450px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          barSize={data.length > 60 ? 4 : data.length > 24 ? 8 : 16}
        >
          {/* Theme Aware Grid */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#E5E7EB"} />

          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? "#6B7280" : "#9CA3AF", fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? "#6B7280" : "#9CA3AF", fontSize: 12 }} 
            tickFormatter={formatYAxis}
            dx={-10}
          />

          <Tooltip 
            content={<CustomTooltip isDark={isDark} />} 
            cursor={{ fill: isDark ? "#374151" : "#F3F4F6", opacity: 0.4 }} 
          />

          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
            formatter={(value) => (
              <span className={`font-medium text-sm ml-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {value === "principalPaid" ? "Principal" : "Interest"}
              </span>
            )}
          />

          <Bar
            dataKey="principalPaid"
            stackId="a"
            fill="#4F46E5"
            name="principalPaid"
          />
          <Bar
            dataKey="interestPaid"
            stackId="a"
            fill="#F59E0B"
            name="interestPaid"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}