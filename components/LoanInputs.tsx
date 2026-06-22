
"use client";

import { useWorkspace } from "@/context/WorkspaceContext";

export default function LoanInputs() {
  const { state, setState } = useWorkspace();
  const isDark = state?.theme === "dark";

  const amount = state?.amount || 1500000;
  const rate = state?.rate || 11;
  const tenure = state?.tenure || 48;

  const amountPercent = ((amount - 10000) / (5000000 - 10000)) * 100;
  const ratePercent = ((rate - 1) / (36 - 1)) * 100;
  const tenurePercent = ((tenure - 1) / (84 - 1)) * 100;

  return (
    <div className={`w-full h-full p-6 border rounded-2xl shadow-sm flex flex-col transition-colors ${isDark ? "bg-[#1e1e2d] border-gray-800" : "bg-white border-gray-200"}`}>
      <div className="mb-6">
        <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Loan Details</h2>
        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Adjust and watch every tab update</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Loan Amount</label>
            <div className={`flex items-center border rounded-lg px-3 py-1.5 w-32 focus-within:border-indigo-500 focus-within:ring-1 transition-all ${isDark ? "bg-[#13141f] border-gray-700" : "bg-gray-50 border-gray-200"}`}>
              <span className="text-gray-500 font-medium mr-2">₹</span>
              <input type="number" value={amount} min={10000} max={5000000} onChange={(e) => setState((prev: any) => ({ ...prev, amount: Number(e.target.value) }))} className={`w-full bg-transparent text-right font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? "text-white" : "text-gray-900"}`} />
            </div>
          </div>
          <input type="range" min={10000} max={5000000} step={10000} value={amount} onChange={(e) => setState((prev: any) => ({ ...prev, amount: Number(e.target.value) }))} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`} style={{ background: `linear-gradient(to right, #4f46e5 ${amountPercent}%, ${isDark ? '#374151' : '#f3f4f6'} ${amountPercent}%)` }} />
          <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-500"><span>₹10k</span><span>₹50.00L</span></div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Interest Rate (p.a.)</label>
            <div className={`flex items-center border rounded-lg px-3 py-1.5 w-24 focus-within:border-indigo-500 focus-within:ring-1 transition-all ${isDark ? "bg-[#13141f] border-gray-700" : "bg-gray-50 border-gray-200"}`}>
              <input type="number" value={rate} min={1} max={36} step={0.1} onChange={(e) => setState((prev: any) => ({ ...prev, rate: Number(e.target.value) }))} className={`w-full bg-transparent text-right font-bold outline-none mr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? "text-white" : "text-gray-900"}`} />
              <span className="text-gray-500 font-medium">%</span>
            </div>
          </div>
          <input type="range" min={1} max={36} step={0.1} value={rate} onChange={(e) => setState((prev: any) => ({ ...prev, rate: Number(e.target.value) }))} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full`} style={{ background: `linear-gradient(to right, #4f46e5 ${ratePercent}%, ${isDark ? '#374151' : '#f3f4f6'} ${ratePercent}%)` }} />
          <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-500"><span>1%</span><span>36%</span></div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Tenure</label>
            <div className={`flex items-center border rounded-lg px-3 py-1.5 w-24 focus-within:border-indigo-500 focus-within:ring-1 transition-all ${isDark ? "bg-[#13141f] border-gray-700" : "bg-gray-50 border-gray-200"}`}>
              <input type="number" value={tenure} min={1} max={84} onChange={(e) => setState((prev: any) => ({ ...prev, tenure: Number(e.target.value) }))} className={`w-full bg-transparent text-right font-bold outline-none mr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? "text-white" : "text-gray-900"}`} />
              <span className="text-gray-500 font-medium">mo</span>
            </div>
          </div>
          <input type="range" min={1} max={84} value={tenure} onChange={(e) => setState((prev: any) => ({ ...prev, tenure: Number(e.target.value) }))} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full`} style={{ background: `linear-gradient(to right, #4f46e5 ${tenurePercent}%, ${isDark ? '#374151' : '#f3f4f6'} ${tenurePercent}%)` }} />
          <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-500"><span>1 mo</span><span>7 yr</span></div>
        </div>
      </div>
    </div>
  );
}