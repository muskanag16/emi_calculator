
// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { v4 as uuidv4 } from "uuid";
// import { LoanState } from "@/types/loan";

// type BroadcastMessage =
//   | { type: "HEARTBEAT"; tabId: string }
//   | { type: "REQUEST_STATE"; tabId: string }
//   | { type: "STATE_UPDATE"; state: LoanState; senderId: string }
//   | { type: "STATE_SYNC"; state: LoanState; targetTabId: string };

// export function useBroadcastSync(
//   currentState: LoanState,
//   setLocalState: React.Dispatch<React.SetStateAction<LoanState>>
// ) {
//   const [tabId] = useState(() => uuidv4().substring(0, 5).toUpperCase());
//   const [activeTabsCount, setActiveTabsCount] = useState(1);
//   const [isLeader, setIsLeader] = useState(false);

//   const channelRef = useRef<BroadcastChannel | null>(null);
//   const activeTabsRef = useRef<Record<string, number>>({});
//   const stateRef = useRef(currentState);
//   const isLeaderRef = useRef(isLeader); 
//   useEffect(() => {
//     stateRef.current = currentState;
//   }, [currentState]);

//   useEffect(() => {
//     isLeaderRef.current = isLeader;
//   }, [isLeader]);

//   useEffect(() => {
//     const channel = new BroadcastChannel("emi_workspace_channel");
//     channelRef.current = channel;

    

    
//     channel.postMessage({ type: "REQUEST_STATE", tabId });

//     channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
//       const msg = event.data;

     
//       if (msg.type === "HEARTBEAT") {
//         activeTabsRef.current[msg.tabId] = Date.now();
//       }

      
//       if (msg.type === "REQUEST_STATE") {
//         activeTabsRef.current[msg.tabId] = Date.now(); 
//         if (isLeaderRef.current) { 
//           channel.postMessage({
//             type: "STATE_SYNC",
//             state: stateRef.current,
//             targetTabId: msg.tabId,
//           });
//         }
//       }

//       // Leader ne state bheji, toh apne aapko update karo
//       if (msg.type === "STATE_SYNC" && msg.targetTabId === tabId) {
//         setLocalState(msg.state);
//       }

     
//       if (msg.type === "STATE_UPDATE" && msg.senderId !== tabId) {
//         setLocalState(msg.state);
//       }
//     };

//     const interval = setInterval(() => {
//       channel.postMessage({ type: "HEARTBEAT", tabId });
//       activeTabsRef.current[tabId] = Date.now();

//       const now = Date.now();
//       let currentLeader = tabId;

//       Object.keys(activeTabsRef.current).forEach((id) => {
      
//         if (now - activeTabsRef.current[id] > 3000) {
//           delete activeTabsRef.current[id];
//         } else {
//           // Tab IDs ko compare karke leader decide karo
//           if (id < currentLeader) {
//             currentLeader = id;
//           }
//         }
//       });

  
//       setActiveTabsCount(Object.keys(activeTabsRef.current).length);
//       setIsLeader(currentLeader === tabId);
//     }, 1000);

//     return () => {
//       clearInterval(interval);
//       channel.close();
//     };
   
//   }, [tabId, setLocalState]);

//   const broadcastState = useCallback(
//     (newState: LoanState) => {
//       if (channelRef.current) {
//         channelRef.current.postMessage({
//           type: "STATE_UPDATE",
//           state: newState,
//           senderId: tabId,
//         });
//       }
//     },
//     [tabId]
//   );

//   return { tabId, activeTabsCount, isLeader, broadcastState };
// }
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { LoanState } from "@/types/loan";

type BroadcastMessage =
  | { type: "HEARTBEAT"; tabId: string }
  | { type: "REQUEST_STATE"; tabId: string }
  | { type: "STATE_UPDATE"; state: LoanState; senderId: string }
  | { type: "STATE_SYNC"; state: LoanState; targetTabId: string }
  | { type: "UNDO_ACTION"; state: LoanState; senderId: string }; // ✅ Undo Action properly defined

export function useBroadcastSync(
  currentState: LoanState,
  setLocalState: React.Dispatch<React.SetStateAction<LoanState>>
) {
  const [tabId] = useState(() => uuidv4().substring(0, 5).toUpperCase());
  const [activeTabsCount, setActiveTabsCount] = useState(1);
  const [isLeader, setIsLeader] = useState(false);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const activeTabsRef = useRef<Record<string, number>>({});
  const stateRef = useRef(currentState);
  const isLeaderRef = useRef(isLeader);

  // ✅ History Stack: Ctrl+Z function ke liye states save karna
  const historyRef = useRef<string[]>([]);

  useEffect(() => {
    stateRef.current = currentState;
  }, [currentState]);

  useEffect(() => {
    isLeaderRef.current = isLeader;
  }, [isLeader]);

  useEffect(() => {
    const channel = new BroadcastChannel("emi_workspace_channel");
    channelRef.current = channel;

    activeTabsRef.current[tabId] = Date.now();
    channel.postMessage({ type: "REQUEST_STATE", tabId });

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const msg = event.data;

      if (msg.type === "HEARTBEAT") {
        activeTabsRef.current[msg.tabId] = Date.now();
      }

      if (msg.type === "REQUEST_STATE") {
        activeTabsRef.current[msg.tabId] = Date.now();
        if (isLeaderRef.current) {
          channel.postMessage({
            type: "STATE_SYNC",
            state: stateRef.current,
            targetTabId: msg.tabId,
          });
        }
      }

      if (msg.type === "STATE_SYNC" && msg.targetTabId === tabId) {
        setLocalState(msg.state);
      }

      // Dusre tab mein change ho, toh purani state history mein push karo
      if (msg.type === "STATE_UPDATE" && msg.senderId !== tabId) {
        historyRef.current.push(JSON.stringify(stateRef.current));
        if (historyRef.current.length > 50) historyRef.current.shift(); // Max 50 undos limit
        setLocalState(msg.state);
      }

      // Dusre tab mein Ctrl+Z ho, toh apni local history ko bhi pop karo
      if (msg.type === "UNDO_ACTION" && msg.senderId !== tabId) {
        historyRef.current.pop();
        setLocalState(msg.state);
      }
    };

    const interval = setInterval(() => {
      channel.postMessage({ type: "HEARTBEAT", tabId });
      activeTabsRef.current[tabId] = Date.now();

      const now = Date.now();
      let currentLeader = tabId;

      Object.keys(activeTabsRef.current).forEach((id) => {
        if (now - activeTabsRef.current[id] > 3000) {
          delete activeTabsRef.current[id];
        } else if (id < currentLeader) {
          currentLeader = id;
        }
      });

      setActiveTabsCount(Object.keys(activeTabsRef.current).length);
      setIsLeader(currentLeader === tabId);
    }, 1000);

    return () => {
      clearInterval(interval);
      channel.close();
    };
  }, [tabId, setLocalState]);

  // Naya state broadcast karo aur history mein bhi save karo
  const broadcastState = useCallback(
    (newState: LoanState) => {
      historyRef.current.push(JSON.stringify(stateRef.current));
      if (historyRef.current.length > 50) historyRef.current.shift();

      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "STATE_UPDATE",
          state: newState,
          senderId: tabId,
        });
      }
    },
    [tabId]
  );

  // ✅ Global Undo function (Jo error de raha tha, wo yahan define hai)
  const broadcastUndo = useCallback(() => {
    if (historyRef.current.length === 0) return; // Kuch bhi undo karne ko nahi hai

    const previousStateStr = historyRef.current.pop();
    if (previousStateStr) {
      const previousState = JSON.parse(previousStateStr);
      setLocalState(previousState);

      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "UNDO_ACTION",
          state: previousState,
          senderId: tabId,
        });
      }
    }
  }, [tabId, setLocalState]);

  // ✅ Dekho, yahan 'broadcastUndo' pass ho raha hai
  return { tabId, activeTabsCount, isLeader, broadcastState, broadcastUndo };
}