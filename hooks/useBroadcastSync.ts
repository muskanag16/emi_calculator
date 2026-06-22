
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { LoanState } from "@/types/loan";

type BroadcastMessage =
  | { type: "HEARTBEAT"; tabId: string }
  | { type: "REQUEST_STATE"; tabId: string }
  | { type: "STATE_UPDATE"; state: LoanState; senderId: string }
  | { type: "STATE_SYNC"; state: LoanState; targetTabId: string }
  | { type: "UNDO_ACTION"; state: LoanState; senderId: string };

export function useBroadcastSync(
  currentState: LoanState,
  updateStateFromBroadcast: (state: LoanState) => void // ✅ Now accepts the optimized network handler
) {
  const [tabId] = useState(() => uuidv4().substring(0, 5).toUpperCase());
  const [activeTabsCount, setActiveTabsCount] = useState(1);
  const [isLeader, setIsLeader] = useState(false);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const activeTabsRef = useRef<Record<string, number>>({});
  const stateRef = useRef(currentState);
  const isLeaderRef = useRef(isLeader);
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
        updateStateFromBroadcast(msg.state);
      }

      if (msg.type === "STATE_UPDATE" && msg.senderId !== tabId) {
        historyRef.current.push(JSON.stringify(stateRef.current));
        if (historyRef.current.length > 50) historyRef.current.shift();
        updateStateFromBroadcast(msg.state);
      }

      if (msg.type === "UNDO_ACTION" && msg.senderId !== tabId) {
        historyRef.current.pop();
        updateStateFromBroadcast(msg.state);
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
  }, [tabId, updateStateFromBroadcast]);

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

  const broadcastUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;

    const previousStateStr = historyRef.current.pop();
    if (previousStateStr) {
      const previousState = JSON.parse(previousStateStr);
      updateStateFromBroadcast(previousState);

      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "UNDO_ACTION",
          state: previousState,
          senderId: tabId,
        });
      }
    }
  }, [tabId, updateStateFromBroadcast]);

  return { tabId, activeTabsCount, isLeader, broadcastState, broadcastUndo };
}