
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
};

interface ChartProps {
  data: any[];
  isDark?: boolean; 
}

export default function AmortizationChart({ data, isDark = false }: ChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[400px] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={isDark ? "#374151" : "#E5E7EB"} 
          />
          <XAxis 
            dataKey="month" 
            tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: isDark ? "#374151" : "#E5E7EB" }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value: any) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            labelFormatter={(label) => `Month ${label}`}
            contentStyle={{ 
              borderRadius: '8px', 
              border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              color: isDark ? '#F3F4F6' : '#111827'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="principalPaid" name="Principal Paid" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
          <Bar dataKey="interestPaid" name="Interest Paid" stackId="a" fill="#FB923C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}