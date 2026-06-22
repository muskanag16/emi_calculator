
"use client";

import { useMemo } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { calculateTotals } from "@/utils/emi";

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export default function CompareMode() {
  const { state, setState } = useWorkspace(); // Global setState
  const isDark = state?.theme === "dark";

  // Global state se scenarios le rahe hain
  const scenarios = state.scenarios || [];

  const evaluatedScenarios = useMemo(() => {
    return scenarios.map((s) => ({
      ...s,
      ...calculateTotals(s.amount, s.rate, s.tenure),
    }));
  }, [scenarios]);

  const minPayable = Math.min(...evaluatedScenarios.map((s) => s.totalPayable));

  const addScenario = () => {
    if (scenarios.length >= 3) return;
    
    // Global state update karo -> isse broadcast sync trigger hoga
    setState((prev) => ({
      ...prev,
      scenarios: [
        ...prev.scenarios,
        {
          id: Date.now().toString(),
          title: `Scenario ${scenarios.length + 1}`,
          amount: prev.amount, 
          rate: prev.rate,
          tenure: prev.tenure,
        },
      ],
    }));
  };

  const removeScenario = (id: string) => {
    setState((prev) => ({
      ...prev,
      scenarios: prev.scenarios.filter((s) => s.id !== id),
    }));
  };

  
  const updateScenario = (id: string, field: string, value: number | string) => {
  setState((prev) => {
    // 1. Pehle us specific scenario ko update karo
    const updatedScenarios = prev.scenarios.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );

    const currentScenario = updatedScenarios.find((s) => s.id === id);

  
    return {
      ...prev,
      scenarios: updatedScenarios,
      amount: field === "amount" ? Number(value) : currentScenario?.amount || prev.amount,
      rate: field === "rate" ? Number(value) : currentScenario?.rate || prev.rate,
      tenure: field === "tenure" ? Number(value) : currentScenario?.tenure || prev.tenure,
    };
  });
};

  return (
    <div className={`border rounded-2xl p-6 shadow-sm transition-colors duration-300 ${isDark ? "bg-[#1e1e2d] border-gray-800" : "bg-white border-gray-200/80"}`}>
      {/* Header and Cards logic remains the same as previously optimized for dark/light mode */}
      {/* Bas 'scenarios' variable use karo aur upar diye gaye functions se update karo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Compare Scenarios</h2>
           <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
             Configure up to 3 scenarios — the lowest total cost is highlighted.
          </p>
        </div>
       <button
          onClick={addScenario}
          disabled={scenarios.length >= 3}
          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            isDark 
              ? "bg-[#13141f] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white" 
              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Scenario
        </button>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 items-start">
        {evaluatedScenarios.map((scenario) => {
          const isBestValue = scenario.totalPayable === minPayable && evaluatedScenarios.length > 1;
          const amountPercent = ((scenario.amount - 10000) / (5000000 - 10000)) * 100;
          const ratePercent = ((scenario.rate - 1) / (36 - 1)) * 100;
          const tenurePercent = ((scenario.tenure - 1) / (84 - 1)) * 100;

          return (
            <div
              key={scenario.id}
              className={`relative rounded-xl border transition-all duration-300 flex flex-col ${
                isBestValue
                  ? (isDark ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-emerald-400 bg-emerald-50 shadow-[0_4px_20px_rgba(16,185,129,0.08)]")
                  : (isDark ? "border-gray-700 bg-[#1e1e2d] hover:border-gray-600" : "border-gray-200/80 bg-white hover:border-gray-300")
              }`}
            >
              {isBestValue && (
                <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10">
                  Best Value
                </div>
              )}

              <div className="flex justify-between items-center p-5 pb-0">
                <input
                  type="text"
                  value={scenario.title}
                  onChange={(e) => updateScenario(scenario.id, "title", e.target.value)}
                  className={`font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-base ${isDark ? "text-white" : "text-gray-900"}`}
                />
                {scenarios.length > 1 && (
                  <button onClick={() => removeScenario(scenario.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              <div className="p-5 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`text-[13px] font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Amount</label>
                    <div className={`flex items-center border rounded-md px-2 py-1 w-28 focus-within:border-indigo-500 focus-within:ring-1 transition-all ${isDark ? "bg-[#13141f] border-gray-700" : "bg-white border-gray-200"}`}>
                      <span className={`font-medium mr-1 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>₹</span>
                      <input type="number" value={scenario.amount} onChange={(e) => updateScenario(scenario.id, "amount", Number(e.target.value))} className={`w-full bg-transparent text-right font-bold outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? "text-white" : "text-gray-900"}`} />
                    </div>
                  </div>
                  <input type="range" min={10000} max={5000000} step={10000} value={scenario.amount} onChange={(e) => updateScenario(scenario.id, "amount", Number(e.target.value))} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full" style={{ background: `linear-gradient(to right, #4f46e5 ${amountPercent}%, ${isDark ? '#374151' : '#e2e8f0'} ${amountPercent}%)` }} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`text-[13px] font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Rate</label>
                    <div className={`flex items-center border rounded-md px-2 py-1 w-20 focus-within:border-indigo-500 focus-within:ring-1 transition-all ${isDark ? "bg-[#13141f] border-gray-700" : "bg-white border-gray-200"}`}>
                      <input type="number" step={0.1} value={scenario.rate} onChange={(e) => updateScenario(scenario.id, "rate", Number(e.target.value))} className={`w-full bg-transparent text-right font-bold outline-none text-sm mr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? "text-white" : "text-gray-900"}`} />
                      <span className={`font-medium text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>%</span>
                    </div>
                  </div>
                  <input type="range" min={1} max={36} step={0.1} value={scenario.rate} onChange={(e) => updateScenario(scenario.id, "rate", Number(e.target.value))} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full" style={{ background: `linear-gradient(to right, #4f46e5 ${ratePercent}%, ${isDark ? '#374151' : '#e2e8f0'} ${ratePercent}%)` }} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`text-[13px] font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Tenure</label>
                    <div className={`flex items-center border rounded-md px-2 py-1 w-20 focus-within:border-indigo-500 focus-within:ring-1 transition-all ${isDark ? "bg-[#13141f] border-gray-700" : "bg-white border-gray-200"}`}>
                      <input type="number" value={scenario.tenure} onChange={(e) => updateScenario(scenario.id, "tenure", Number(e.target.value))} className={`w-full bg-transparent text-right font-bold outline-none text-sm mr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? "text-white" : "text-gray-900"}`} />
                      <span className={`font-medium text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>mo</span>
                    </div>
                  </div>
                  <input type="range" min={1} max={84} value={scenario.tenure} onChange={(e) => updateScenario(scenario.id, "tenure", Number(e.target.value))} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full" style={{ background: `linear-gradient(to right, #4f46e5 ${tenurePercent}%, ${isDark ? '#374151' : '#e2e8f0'} ${tenurePercent}%)` }} />
                </div>
              </div>

              <div className={`mt-auto border-t p-5 rounded-b-xl space-y-2.5 transition-colors duration-300 ${
                isBestValue 
                  ? (isDark ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200/70 bg-emerald-100/50") 
                  : (isDark ? "border-gray-800 bg-[#13141f]" : "border-gray-100 bg-gray-50/50")
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${isBestValue ? (isDark ? "text-emerald-400" : "text-emerald-700") : (isDark ? "text-gray-400" : "text-gray-500")}`}>Monthly EMI</span>
                  <span className={`text-sm font-bold ${isBestValue ? (isDark ? "text-emerald-300" : "text-emerald-800") : "text-indigo-500"}`}>{formatCurrency(scenario.emi)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${isBestValue ? (isDark ? "text-emerald-400" : "text-emerald-700") : (isDark ? "text-gray-400" : "text-gray-500")}`}>Total Interest</span>
                  <span className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{formatCurrency(scenario.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${isBestValue ? (isDark ? "text-emerald-300 font-bold" : "text-emerald-800 font-bold") : (isDark ? "text-gray-400" : "text-gray-500")}`}>Total Payable</span>
                  <span className={`text-sm font-bold ${isBestValue ? (isDark ? "text-emerald-200 text-base" : "text-emerald-900 text-base") : (isDark ? "text-white" : "text-gray-900")}`}>{formatCurrency(scenario.totalPayable)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    {/* </div> */}
  
      
      
    </div>
  );
}