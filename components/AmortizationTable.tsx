
"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { exportCSV } from "@/utils/exportCsv";
import { generateAmortizationSchedule } from "@/utils/amortization";
import AmortizationChart from "./AmortizationChart";

// Helper function for Indian currency format without decimals
const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

export default function AmortizationTable() {
  const { state } = useWorkspace();
  const isDark = state?.theme === "dark";

  const [page, setPage] = useState(1);
  const [chartMode, setChartMode] = useState(false);

  // Safe fallbacks in case state is empty
  const amount = state?.amount || 0;
  const rate = state?.rate || 0;
  const tenure = state?.tenure || 0;

  const { rows, breakEvenMonth } = useMemo(() => {
    if (!amount) return { rows: [], breakEvenMonth: null };
    return generateAmortizationSchedule(amount, rate, tenure);
  }, [amount, rate, tenure]);

  const rowsPerPage = 12;
  const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;
  const start = (page - 1) * rowsPerPage;
  const paginatedRows = rows.slice(start, start + rowsPerPage);

  if (!amount) return null;

  return (
    <div className={`mt-8 border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300 ${isDark ? "bg-[#1e1e2d] border-gray-800" : "bg-white border-gray-200/80"}`}>
      
      {/* Top Header Section */}
      <div className={`p-6 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Amortization Schedule</h2>
        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Month-by-month principal & interest breakdown
        </p>
      </div>

      {/* Controls Section (Toggle, Break-even text, Export) */}
      <div className={`flex flex-col sm:flex-row justify-between items-center p-4 border-b gap-4 transition-colors ${isDark ? "bg-[#13141f] border-gray-800" : "bg-gray-50/40 border-gray-100"}`}>
        
        <div className="flex items-center gap-6">
          {/* Segmented Toggle */}
          <div className={`flex p-1 rounded-xl transition-colors ${isDark ? "bg-gray-800/60" : "bg-gray-200/60"}`}>
            <button
              onClick={() => setChartMode(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                !chartMode 
                  ? (isDark ? "bg-[#1e1e2d] text-white shadow-sm" : "bg-white text-gray-900 shadow-sm") 
                  : (isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700")
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setChartMode(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                chartMode 
                  ? (isDark ? "bg-[#1e1e2d] text-white shadow-sm" : "bg-white text-gray-900 shadow-sm") 
                  : (isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700")
              }`}
            >
              Chart
            </button>
          </div>

          {/* Break-even Indicator Header */}
          {!chartMode && breakEvenMonth && (
            <span className={`text-sm font-medium px-3 py-1 rounded-full border ${isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-100/80"}`}>
              Break-even: <span className="font-bold">Month {breakEvenMonth}</span>
            </span>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={() => exportCSV(rows)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all shadow-sm ${
            isDark ? "bg-[#1e1e2d] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <svg className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Content Section */}
      {chartMode ? (
        <div className="p-6">
          <AmortizationChart data={rows} />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className={`border-b font-semibold tracking-wider text-[13px] ${isDark ? "bg-[#13141f] border-gray-800 text-gray-400" : "bg-gray-50/60 border-gray-200 text-gray-500"}`}>
                  <th className="py-3.5 px-6">Month</th>
                  <th className="py-3.5 px-6 text-right">EMI</th>
                  <th className="py-3.5 px-6 text-right">Principal</th>
                  <th className="py-3.5 px-6 text-right">Interest</th>
                  <th className="py-3.5 px-6 text-center">Prepayment</th>
                  <th className="py-3.5 px-6 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row: any) => {
                  const isBreakEven = row.month === breakEvenMonth;
                  return (
                    <tr
                      key={row.month}
                      className={`relative border-b last:border-none transition-colors duration-150 ${
                        isBreakEven 
                          ? (isDark ? "bg-gradient-to-r from-emerald-500/10 to-transparent font-medium border-gray-800/70" : "bg-gradient-to-r from-emerald-50/60 to-emerald-50/20 font-medium border-gray-100/70") 
                          : (isDark ? "border-gray-800/70 hover:bg-white/5" : "border-gray-100/70 hover:bg-gray-50/40")
                      }`}
                    >
                      {/* Left Indicator bar for Break-even row */}
                      <td className={`py-3.5 px-6 font-semibold flex items-center gap-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        {isBreakEven && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r" />
                        )}
                        <span>{row.month}</span>
                        {isBreakEven && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-xs animate-pulse border ${
                            isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                          }`}>
                            B/E Month
                          </span>
                        )}
                      </td>
                      <td className={`py-3.5 px-6 text-right ${isBreakEven ? (isDark ? "text-white font-semibold" : "text-gray-900 font-semibold") : (isDark ? "text-gray-400" : "text-gray-600")}`}>
                        {formatCurrency(row.emi)}
                      </td>
                      <td className={`py-3.5 px-6 text-right font-medium ${isBreakEven ? (isDark ? "text-emerald-400 font-bold" : "text-emerald-700 font-bold") : (isDark ? "text-indigo-400" : "text-indigo-600")}`}>
                        {formatCurrency(row.principalPaid)}
                      </td>
                      <td className={`py-3.5 px-6 text-right font-medium ${isDark ? "text-amber-400" : "text-amber-500"}`}>
                        {formatCurrency(row.interestPaid)}
                      </td>
                      <td className={`py-3.5 px-6 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        —
                      </td>
                      <td className={`py-3.5 px-6 text-right font-semibold ${isBreakEven ? (isDark ? "text-white" : "text-gray-900") : (isDark ? "text-gray-300" : "text-gray-800")}`}>
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className={`flex flex-col sm:flex-row justify-between items-center p-4 border-t text-sm ${isDark ? "border-gray-800 bg-[#13141f]" : "border-gray-100 bg-gray-50/40"}`}>
            <div className={`font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Showing {rows.length > 0 ? start + 1 : 0}-{Math.min(start + rowsPerPage, rows.length)} of {rows.length} months
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className={`px-3 py-1.5 border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-xs shadow-xs ${
                  isDark ? "border-gray-700 text-gray-400 hover:text-white hover:bg-[#1e1e2d] bg-transparent" : "border-gray-200 text-gray-600 hover:bg-white bg-transparent"
                }`}
              >
                ‹ Prev
              </button>
              
              <span className={`font-semibold text-xs px-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className={`px-3 py-1.5 border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-xs shadow-xs ${
                  isDark ? "border-gray-700 text-gray-400 hover:text-white hover:bg-[#1e1e2d] bg-transparent" : "border-gray-200 text-gray-600 hover:bg-white bg-transparent"
                }`}
              >
                Next ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}