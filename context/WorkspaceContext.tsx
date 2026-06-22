
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
  const skipBroadcastRef = useRef(false); // ✅ Purely tracks if change came from network or user drag

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem("emi-calculator-state");
    if (savedData) {
      try {
        setLocalState(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Specialized safe state updater for incoming network broadcasts
  const updateStateFromBroadcast = useCallback((newState: LoanState) => {
    skipBroadcastRef.current = true;
    setLocalState(newState);
  }, []);

  // Attach Broadcast Sync hook
  const { tabId, activeTabsCount, isLeader, broadcastState, broadcastUndo } = useBroadcastSync(
    localState,
    updateStateFromBroadcast // ✅ Passing safe network handler
  );

  // 3. Centralized Clean Side-Effect Loop (Solves Vercel Loop Bug Completely)
  useEffect(() => {
    if (!isLoaded) return;

    // A. Debounced LocalStorage Sync
    const saveTimer = setTimeout(() => {
      localStorage.setItem("emi-calculator-state", JSON.stringify(localState));
    }, 300);

    // B. Debounced Cross-Tab Broadcast
    if (skipBroadcastRef.current) {
      skipBroadcastRef.current = false; // Change was from network, reset flag and skip rebroadcasting
    } else {
      // Local change from dragging slider, safely trigger debounce broadcast
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
      broadcastTimerRef.current = setTimeout(() => {
        broadcastState(localState);
      }, 200);
    }

    return () => {
      clearTimeout(saveTimer);
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
    };
  }, [localState, isLoaded, broadcastState]);

  // Pure setState function without any inline side-effects
  const setState = useCallback((value: React.SetStateAction<LoanState>) => {
    setLocalState(value);
  }, []);

  // Global Ctrl+Z (Undo) Listener
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