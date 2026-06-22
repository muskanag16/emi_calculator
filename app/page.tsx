
"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useBroadcastSync } from "@/hooks/useBroadcastSync";
import usePresence from "@/hooks/usePresence";
import LoanInputs from "@/components/LoanInputs";
import SummaryCards from "@/components/SummaryCards";
import AmortizationTable from "@/components/AmortizationTable";
import useLeaderElection from "@/hooks/useLeaderSelection";
import CompareMode from "@/components/CompareMode";
import SensitivityTable from "@/components/SensitivityTable";
import PrepaymentPlanner from "@/components/PrepaymentPlanner";

export default function Home() {
  const { state, setState } = useWorkspace();
  const [activeView, setActiveView] = useState<"single" | "compare" | "prepayment">("single");

  useBroadcastSync(state, setState);
  const { tabId, activeTabs } = usePresence();
  const { leaderId, isLeader } = useLeaderElection(tabId);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("amount", String(state.amount));
    params.set("rate", String(state.rate));
    params.set("tenure", String(state.tenure));
    window.history.replaceState({}, "", `?${params}`);
  }, [state.amount, state.rate, state.tenure]);

  const toggleTheme = () => {
    setState((prev: any) => ({ ...prev, theme: prev.theme === "light" ? "dark" : "light" }));
  };

  const isDark = state?.theme === "dark";

  // Helper for cleaner tab buttons
  const getTabClass = (view: string) =>
    `flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      activeView === view
        ? "bg-indigo-600 text-white shadow-md"
        : isDark
        ? "text-gray-400 hover:text-white hover:bg-white/5"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
    }`;

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f111a] text-white" : "bg-[#f8fafc] text-black"}`}>
      <div className="sticky top-0 z-50 w-full">
        <Header tabId={tabId} activeTabs={activeTabs} theme={state.theme} leaderId={leaderId} isLeader={isLeader} toggleTheme={toggleTheme} />
      </div>

      <div className="p-6 sm:p-8">
        {/* Premium Segmented Control Tabs */}
        <div className="flex justify-start mb-6">
          <div className={`inline-flex items-center border rounded-xl p-1.5 shadow-sm transition-colors ${isDark ? "bg-[#1e1e2d] border-gray-800" : "bg-white border-gray-200/80"}`}>
            <button onClick={() => setActiveView("single")} className={getTabClass("single")}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16" /></svg>
              Single
            </button>
            <button onClick={() => setActiveView("compare")} className={getTabClass("compare")}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Compare
            </button>
            <button onClick={() => setActiveView("prepayment")} className={getTabClass("prepayment")}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Prepayment
            </button>
          </div>
        </div>

        {activeView === "single" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-4 xl:col-span-3 w-full h-full">
                <LoanInputs />
              </div>
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0">
                <SummaryCards />
                <div className="flex-1">
                  <SensitivityTable />
                </div>
              </div>
            </div>
            <AmortizationTable />
          </div>
        )}

        {activeView === "compare" && <div className="animate-in fade-in slide-in-from-bottom-2 duration-500"><CompareMode /></div>}
        {activeView === "prepayment" && <div className="animate-in fade-in slide-in-from-bottom-2 duration-500"><PrepaymentPlanner /></div>}
      </div>
    </main>
  );
}