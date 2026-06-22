
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
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
  
  const broadcastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const skipBroadcastRef = useRef(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem("emi-calculator-state");
    if (savedData) {
      try {
        // Purane aur naye state ko merge karo taaki koi property miss na ho
        setLocalState((prev) => ({ ...prev, ...JSON.parse(savedData) }));
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Safe updater for incoming network broadcasts
  const updateStateFromBroadcast = useCallback((newState: LoanState) => {
    skipBroadcastRef.current = true; // Mark that this update came from network
    setLocalState(newState);
  }, []);

  // Attach Broadcast Sync hook
  const { tabId, activeTabsCount, isLeader, broadcastState, broadcastUndo } = useBroadcastSync(
    localState,
    updateStateFromBroadcast
  );

  // 3. Centralized Side-Effect Loop
  useEffect(() => {
    if (!isLoaded) return;

    // ✅ FIX: Save to LocalStorage IMMEDIATELY (No Delay)
    // Ab refresh karne par data hamesha latest wala hi dikhega
    localStorage.setItem("emi-calculator-state", JSON.stringify(localState));

    // Debounced Cross-Tab Broadcast (Only network calls are delayed)
    if (skipBroadcastRef.current) {
      skipBroadcastRef.current = false; 
    } else {
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
      broadcastTimerRef.current = setTimeout(() => {
        broadcastState(localState);
      }, 200);
    }

    return () => {
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
    };
  }, [localState, isLoaded, broadcastState]);

  const setState = useCallback((value: React.SetStateAction<LoanState>) => {
    setLocalState(value);
  }, []);

  // Global Undo Setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return; 
        }
        e.preventDefault(); 
        broadcastUndo();    
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [broadcastUndo]);

  return (
    <WorkspaceContext.Provider 
      value={{ state: localState, setState, tabId, activeTabsCount, isLeader }}
    >
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