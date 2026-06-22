
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { LoanState } from "@/types/loan";
import { useBroadcastSync } from "@/hooks/useBroadcastSync";

interface WorkspaceContextType {
  state: LoanState;
  setState: React.Dispatch<React.SetStateAction<LoanState>>;
  tabId: string;
  activeTabsCount: number;
  isLeader: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const defaultState: LoanState = {
  amount: 1500000,
  rate: 11,
  tenure: 48,
  theme: "light",
  compareMode: false,
  scenarios: [
    { id: "A", title: "Scenario A", amount: 1500000, rate: 11, tenure: 24 },
    { id: "B", title: "Scenario B", amount: 1500000, rate: 11, tenure: 48 },
    { id: "C", title: "Scenario C", amount: 1500000, rate: 11, tenure: 60 },
  ],
  prepayments: [],
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [localState, setLocalState] = useState<LoanState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial Load: Page refresh hone par localStorage se data wapas laao
  useEffect(() => {
    const savedData = localStorage.getItem("emi-calculator-state");
    if (savedData) {
      try {
        setLocalState(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    setIsLoaded(true); // Data load hone ke baad hi UI dikhao
  }, []);

  // 2. Attach Broadcast Channel (Bina kisi hack ke Cross-Tab Sync ke liye)
  const { tabId, activeTabsCount, isLeader, broadcastState } = useBroadcastSync(
    localState,
    setLocalState
  );

  // 3. Data Save: Jab bhi koi naya number daalo, use localStorage mein save kar do
  const setState = useCallback(
    (value: React.SetStateAction<LoanState>) => {
      setLocalState((prev) => {
        const nextState = typeof value === "function" ? value(prev) : value;

        // Refresh ke liye LocalStorage mein save karo
        localStorage.setItem("emi-calculator-state", JSON.stringify(nextState));

        // Dusre tabs ko update bhejo
        broadcastState(nextState);

        return nextState;
      });
    },
    [broadcastState]
  );

  return (
    <WorkspaceContext.Provider 
      value={{ state: localState, setState, tabId, activeTabsCount, isLeader }}
    >
      {/* Jab tak purana data load na ho jaye, default state mat dikhao */}
      {isLoaded ? children : null}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
