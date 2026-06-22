

import { useState, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { useWorkspace } from "@/context/WorkspaceContext";
import { calculateTotals } from "@/utils/emi";
import { generatePrepaymentSchedule } from "@/utils/prepayment";
import { exportCSV } from "@/utils/exportCsv";
import dynamic from "next/dynamic";


const AmortizationChart = dynamic(
  () => import("@/components/AmortizationChart"),
  { 
    ssr: false, 
    loading: () => <div className="p-6 text-center text-gray-500 font-medium">Loading Chart...</div> 
  }
);

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const formatTenure = (months: number) => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years > 0 && remainingMonths > 0) return `${years} yr ${remainingMonths} mo`;
  if (years > 0) return `${years} yr`;
  return `${remainingMonths} mo`;
};

export default function PrepaymentPlanner() {
  const { state, setState } = useWorkspace();
  const isDark = state?.theme === "dark";

  const [month, setMonth] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  
  const [page, setPage] = useState(1);
  const [chartMode, setChartMode] = useState(false);

  const original = calculateTotals(state.amount, state.rate, state.tenure);

  const adjusted = useMemo(() => {
    return generatePrepaymentSchedule(
      state.amount,
      state.rate,
      state.tenure,
      state.prepayments || []
    );
  }, [state.amount, state.rate, state.tenure, state.prepayments]);

  const interestSaved = Math.max(0, original.totalInterest - (adjusted.totalInterest || 0));
  const tenureReduced = Math.max(0, state.tenure - (adjusted.actualTenure || state.tenure));

  const addPrepayment = () => {
    if (!month || !amount || month < 1 || month > state.tenure) return;

    setState((prev: any) => ({
      ...prev,
      prepayments: [
        ...(prev.prepayments || []),
        { id: uuid(), month: Number(month), amount: Number(amount) },
      ].sort((a, b) => a.month - b.month),
    }));

    setMonth("");
    setAmount("");
  };

  const removePrepayment = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      prepayments: prev.prepayments.filter((p: any) => p.id !== id),
    }));
  };

  const hasPrepayments = state.prepayments && state.prepayments.length > 0;

  const scheduleRows = (adjusted as any).rows || [];
  const rowsPerPage = 12;
  const totalPages = Math.ceil(scheduleRows.length / rowsPerPage) || 1;
  const startIdx = (page - 1) * rowsPerPage;
  const paginatedRows = scheduleRows.slice(startIdx, startIdx + rowsPerPage);
  
  const breakEvenRow = scheduleRows.find((r: any) => r.principalPaid >= r.interestPaid);
  const breakEvenMonth = breakEvenRow ? breakEvenRow.month : -1;

  return (
    <div className="space-y-6">
      
      {/* ================= TOP CARD: PREPAYMENT PLANNER (INPUTS) ================= */}
      <div className={`border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300 ${isDark ? "bg-[#1e1e2d] border-gray-800" : "bg-white border-gray-200/80"}`}>
        <div className={`p-6 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
          <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Prepayment Planner</h2>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Schedule lump-sum payments and see interest saved</p>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className={`border rounded-xl p-5 ${isDark ? "bg-[#13141f] border-gray-800" : "bg-gray-50/60 border-gray-100"}`}>
              <h3 className={`text-sm font-medium mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Add a one-time prepayment</h3>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className={`text-xs mb-1.5 block ${isDark ? "text-gray-500" : "text-gray-500"}`}>Month</label>
                  <input type="number" placeholder="e.g. 12" value={month} onChange={(e) => setMonth(e.target.value === "" ? "" : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${isDark ? "bg-[#1e1e2d] border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`} />
                </div>
                <div className="flex-1 w-full">
                  <label className={`text-xs mb-1.5 block ${isDark ? "text-gray-500" : "text-gray-500"}`}>Amount (₹)</label>
                  <input type="number" placeholder="e.g. 100000" value={amount} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${isDark ? "bg-[#1e1e2d] border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`} />
                </div>
                <button onClick={addPrepayment} disabled={!month || !amount} className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm">
                  Add
                </button>
              </div>
            </div>

            {!hasPrepayments ? (
              <div className={`border-2 border-dashed rounded-xl p-8 flex items-center justify-center text-sm font-medium text-center transition-colors ${isDark ? "border-gray-800 text-gray-600 bg-[#13141f]" : "border-gray-200/80 text-gray-400 bg-gray-50/30"}`}>
                No prepayments yet. Add one above to see the impact.
              </div>
            ) : (
              <div className="space-y-3">
                {state.prepayments.map((p: any) => (
                  <div key={p.id} className={`flex items-center justify-between border rounded-xl p-4 shadow-2xs group transition-colors ${isDark ? "bg-[#13141f] border-gray-800" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`text-xs font-bold px-2.5 py-1 rounded-md ${isDark ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>Month {p.month}</div>
                      <div className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{formatCurrency(p.amount)}</div>
                    </div>
                    <button onClick={() => removePrepayment(p.id)} className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-gray-500 hover:text-red-400 hover:bg-red-900/20" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`border rounded-xl p-6 h-full flex flex-col justify-center transition-colors ${isDark ? "bg-[#13141f] border-gray-800" : "bg-gray-50/50 border-gray-100"}`}>
            <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-6 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Prepayment Impact</h3>
            <div className="space-y-6">
              <div className={`flex justify-between items-center pb-4 border-b ${isDark ? "border-gray-800" : "border-gray-200/60"}`}>
                <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Interest Saved</span>
                <span className={`text-2xl font-bold text-emerald-500`}>{interestSaved > 0 ? formatCurrency(interestSaved) : "₹0"}</span>
              </div>
              <div className={`flex justify-between items-center pb-5 border-b ${isDark ? "border-gray-800" : "border-gray-200/60"}`}>
                <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Tenure Reduced By</span>
                <span className={`text-2xl font-bold ${tenureReduced > 0 ? (isDark ? "text-white" : "text-gray-900") : (isDark ? "text-gray-700" : "text-gray-400")}`}>{tenureReduced > 0 ? `${tenureReduced} mo` : "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-2">
                <div>
                  <div className={`text-[11px] font-semibold uppercase mb-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Original Tenure</div>
                  <div className={`text-sm font-bold ${isDark ? "text-gray-300" : "text-gray-800"}`}>{formatTenure(state.tenure)}</div>
                </div>
                <div>
                  <div className={`text-[11px] font-semibold uppercase mb-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>New Tenure</div>
                  <div className="text-sm font-bold text-indigo-600">{formatTenure(adjusted.actualTenure)}</div>
                </div>
                <div>
                  <div className={`text-[11px] font-semibold uppercase mb-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Original Interest</div>
                  <div className={`text-sm font-bold ${isDark ? "text-gray-300" : "text-gray-800"}`}>{formatCurrency(original.totalInterest)}</div>
                </div>
                <div>
                  <div className={`text-[11px] font-semibold uppercase mb-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>New Interest</div>
                  <div className="text-sm font-bold text-indigo-600">{formatCurrency(adjusted.totalInterest)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM CARD: ADJUSTED SCHEDULE ================= */}
      <div className={`border rounded-2xl shadow-sm overflow-hidden mb-8 transition-colors duration-300 ${isDark ? "bg-[#1e1e2d] border-gray-800" : "bg-white border-gray-200/80"}`}>
        
        <div className={`p-6 border-b pb-4 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
          <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Adjusted Schedule</h2>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Amortization reflecting your prepayments</p>
        </div>

        <div className={`flex flex-col sm:flex-row justify-between items-center p-4 border-b gap-4 transition-colors ${isDark ? "bg-[#13141f] border-gray-800" : "bg-white border-gray-100"}`}>
          <div className="flex items-center gap-6">
            <div className={`flex p-1 rounded-xl transition-colors border ${isDark ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
              <button onClick={() => setChartMode(false)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${!chartMode ? (isDark ? "bg-gray-800 text-white shadow-sm" : "bg-white text-gray-900 shadow-sm border border-gray-200") : (isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700")}`}>Table</button>
              <button onClick={() => setChartMode(true)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${chartMode ? (isDark ? "bg-gray-800 text-white shadow-sm" : "bg-white text-gray-900 shadow-sm border border-gray-200") : (isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700")}`}>Chart</button>
            </div>
            
            {!chartMode && breakEvenMonth !== -1 && (
              <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Break-even at <span className="text-blue-500">month {breakEvenMonth}</span>
              </span>
            )}
          </div>

          <button onClick={() => exportCSV(scheduleRows)} className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all shadow-sm ${isDark ? "bg-[#1e1e2d] border-gray-700 text-gray-300 hover:bg-gray-800" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>

        {!chartMode ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className={`border-b font-medium text-[13px] ${isDark ? "bg-[#13141f] border-gray-800 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                    <th className="py-3.5 px-6 font-medium">Month</th>
                    <th className="py-3.5 px-6 text-right font-medium">EMI</th>
                    <th className="py-3.5 px-6 text-right font-medium">Principal</th>
                    <th className="py-3.5 px-6 text-right font-medium">Interest</th>
                    <th className="py-3.5 px-6 text-center font-medium">Prepayment</th>
                    <th className="py-3.5 px-6 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">No schedule data</td>
                    </tr>
                  ) : (
                    paginatedRows.map((row: any) => {
                      const isBreakEven = row.month === breakEvenMonth;
                      const hasPrepayment = row.prepayment > 0;

                      return (
                        <tr 
                          key={row.month} 
                          className={`border-b last:border-none transition-colors duration-150 ${
                            isBreakEven 
                              ? (isDark ? "bg-blue-900/20 border-blue-900/30" : "bg-blue-50/60 border-blue-100") 
                              : (isDark ? "border-gray-800/70 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50/40")
                          }`}
                        >
                          <td className={`py-3.5 px-6 font-semibold flex items-center gap-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            {row.month}
                            {isBreakEven && (
                              <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                B/E
                              </span>
                            )}
                          </td>
                          <td className={`py-3.5 px-6 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {formatCurrency(row.emi || 0)}
                          </td>
                          <td className={`py-3.5 px-6 text-right font-medium ${isDark ? "text-blue-400" : "text-blue-500"}`}>
                            {formatCurrency(row.principalPaid || 0)}
                          </td>
                          <td className={`py-3.5 px-6 text-right font-medium ${isDark ? "text-orange-400" : "text-orange-400"}`}>
                            {formatCurrency(row.interestPaid || 0)}
                          </td>
                          <td className={`py-3.5 px-6 text-center font-medium ${hasPrepayment ? (isDark ? "text-gray-200" : "text-gray-800") : "text-gray-400"}`}>
                            {hasPrepayment ? formatCurrency(row.prepayment) : "—"}
                          </td>
                          <td className={`py-3.5 px-6 text-right font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {formatCurrency(row.balance || 0)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className={`flex flex-col sm:flex-row justify-between items-center p-4 text-sm ${isDark ? "bg-transparent" : "bg-white"}`}>
              <div className={`font-medium ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                Showing {scheduleRows.length > 0 ? startIdx + 1 : 0}-{Math.min(startIdx + rowsPerPage, scheduleRows.length)} of {scheduleRows.length} months
              </div>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className={`px-3 py-1.5 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-xs shadow-sm ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100"}`}>
                  ‹ Prev
                </button>
                <span className={`font-medium text-xs px-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {page} / {totalPages}
                </span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className={`px-3 py-1.5 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-xs shadow-sm ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100"}`}>
                  Next ›
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ✅ FIX 2: Placeholder text hata kar actual Chart Component render kiya */
          <AmortizationChart data={scheduleRows} isDark={isDark} />
        )}
      </div>

      <div className="text-center mt-4 pb-8">
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Open this page in a second tab — inputs, theme, and mode stay in sync via the BroadcastChannel API.
        </p>
      </div>

    </div>
  );
}