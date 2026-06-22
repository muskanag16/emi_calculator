
// "use client";

// import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
// import { LoanState } from "@/types/loan";
// import { useBroadcastSync } from "@/hooks/useBroadcastSync";

// interface WorkspaceContextType {
//   state: LoanState;
//   setState: React.Dispatch<React.SetStateAction<LoanState>>;
//   tabId: string;
//   activeTabsCount: number;
//   isLeader: boolean;
// }

// const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

// const defaultState: LoanState = {
//   amount: 1500000,
//   rate: 11,
//   tenure: 48,
//   theme: "light",
//   compareMode: false,
//   scenarios: [
//     { id: "A", title: "Scenario A", amount: 1500000, rate: 11, tenure: 24 },
//     { id: "B", title: "Scenario B", amount: 1500000, rate: 11, tenure: 48 },
//     { id: "C", title: "Scenario C", amount: 1500000, rate: 11, tenure: 60 },
//   ],
//   prepayments: [],
// };

// export function WorkspaceProvider({ children }: { children: ReactNode }) {
//   const [localState, setLocalState] = useState<LoanState>(defaultState);
//   const [isLoaded, setIsLoaded] = useState(false);

//   // 1. Initial Load: Page refresh hone par localStorage se data wapas laao
//   useEffect(() => {
//     const savedData = localStorage.getItem("emi-calculator-state");
//     if (savedData) {
//       try {
//         setLocalState(JSON.parse(savedData));
//       } catch (e) {
//         console.error("Failed to parse state", e);
//       }
//     }
//     setIsLoaded(true); // Data load hone ke baad hi UI dikhao
//   }, []);

//   // 2. Attach Broadcast Channel (Bina kisi hack ke Cross-Tab Sync ke liye)
//   const { tabId, activeTabsCount, isLeader, broadcastState } = useBroadcastSync(
//     localState,
//     setLocalState
//   );

//   // 3. Data Save: Jab bhi koi naya number daalo, use localStorage mein save kar do
//   const setState = useCallback(
//     (value: React.SetStateAction<LoanState>) => {
//       setLocalState((prev) => {
//         const nextState = typeof value === "function" ? value(prev) : value;

//         // Refresh ke liye LocalStorage mein save karo
//         localStorage.setItem("emi-calculator-state", JSON.stringify(nextState));

//         // Dusre tabs ko update bhejo
//         broadcastState(nextState);

//         return nextState;
//       });
//     },
//     [broadcastState]
//   );

//   return (
//     <WorkspaceContext.Provider 
//       value={{ state: localState, setState, tabId, activeTabsCount, isLeader }}
//     >
//       {/* Jab tak purana data load na ho jaye, default state mat dikhao */}
//       {isLoaded ? children : null}
//     </WorkspaceContext.Provider>
//   );
// }

// export const useWorkspace = () => {
//   const context = useContext(WorkspaceContext);
//   if (!context) {
//     throw new Error("useWorkspace must be used within a WorkspaceProvider");
//   }
//   return context;
// };
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
  
  // ✅ FIX: Debounce timer refernce
  const broadcastTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 2. Broadcast hook
  const { tabId, activeTabsCount, isLeader, broadcastState, broadcastUndo } = useBroadcastSync(
    localState,
    setLocalState
  );

  // ✅ 3. Auto-save to LocalStorage (Debounced)
  // Ye tabhi save karega jab state 300ms tak change nahi hogi, I/O lag khatam!
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        localStorage.setItem("emi-calculator-state", JSON.stringify(localState));
      }, 300);
      return () => clearTimeout(timer); // Cleanup old timer
    }
  }, [localState, isLoaded]);

  // ✅ 4. Custom setState interceptor (Debounced Broadcast)
  const setState = useCallback(
    (value: React.SetStateAction<LoanState>) => {
      setLocalState((prev) => {
        const nextState = typeof value === "function" ? value(prev) : value;

        if (JSON.stringify(prev) !== JSON.stringify(nextState)) {
          // Agar user lagatar slider hila raha hai, toh purana network request cancel karo
          if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
          
          // Naya request tabhi bhejo jab user 200ms ke liye ruk jaye
          broadcastTimerRef.current = setTimeout(() => {
            broadcastState(nextState);
          }, 200); 
        }

        return nextState; // Local screen INSTANTLY update hogi bina kisi lag ke!
      });
    },
    [broadcastState]
  );

  // 5. Global Ctrl+Z (Undo) Listener
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