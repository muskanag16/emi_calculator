
"use client";

interface HeaderProps {
  tabId: string;
  activeTabs: number;
  leaderId: string;
  isLeader: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function Header({
  tabId,
  activeTabs,
  leaderId,
  isLeader,
  theme,
  toggleTheme,
}: HeaderProps) {
  
 
  const shortTabId = tabId ? tabId.slice(0, 4).toUpperCase() : "..";
  
  // Theme check
  const isDark = theme === "dark";

  return (
    <header className={`w-full border-b px-8 py-3.5 flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors duration-300 ${
      isDark ? "bg-[#1e1e2d] border-gray-800" : "bg-white border-gray-100"
    }`}>
      
      {/* Left Side: Logo, Title & Subtitle */}
      <div className="flex items-center gap-3.5">
        {/* Sleek Logo Icon Box */}
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
          <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l4-4 4 4 6-6" />
          </svg>
        </div>
        
        {/* Title Details */}
        <div className="flex flex-col">
          <h1 className={`text-[14px] font-bold tracking-tight leading-none mb-1 transition-colors ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            EMI Workspace
          </h1>
          <p className={`text-[11px] font-medium leading-none transition-colors ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}>
            Loan calculator • synced across tabs
          </p>
        </div>
      </div>

      {/* Right Side: Badges & Theme Switcher */}
      <div className="flex items-center gap-2.5">
        
        {/* Tab ID + LEADER Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-[11px] font-semibold shadow-2xs transition-colors ${
          isDark ? "bg-[#13141f] border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200/60 text-gray-600"
        }`}>
          <span>Tab {shortTabId}</span>
          {isLeader && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border tracking-wider uppercase ${
              isDark ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-600 border-blue-100"
            }`}>
              Leader
            </span>
          )}
        </div>

        {/* Active Tabs Counting Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-[11px] font-semibold shadow-2xs transition-colors ${
          isDark ? "bg-[#13141f] border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200/60 text-gray-600"
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.7)]"></div>
          <span>{activeTabs} tab{activeTabs !== 1 ? 's' : ''}</span>
        </div>

        {/* Round Minimalist Theme Button */}
        <button
          onClick={toggleTheme}
          className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200 shadow-2xs ml-1 ${
            isDark 
              ? "bg-[#13141f] border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white" 
              : "bg-gray-50/50 border-gray-200/70 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            // Moon Icon
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            // Sun Icon
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>

      </div>
    </header>
  );
}