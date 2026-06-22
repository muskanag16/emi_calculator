
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { v4 as uuid } from "uuid";

export default function usePresence() {
  const [activeTabs, setActiveTabs] =
    useState(1);

  const [tabId, setTabId] =
    useState("");

  const tabsRef =
    useRef<Map<string, number>>(
      new Map()
    );

  useEffect(() => {
    const generatedId =
      uuid().slice(0, 8);

    setTabId(generatedId);

    const channel =
      new BroadcastChannel(
        "emi-presence"
      );

    const sendHeartbeat = () => {
      channel.postMessage({
        type: "HEARTBEAT",
        tabId: generatedId,
        timestamp: Date.now(),
      });
    };

    channel.onmessage = (event) => {
      const data = event.data;

      if (
        data.type === "HEARTBEAT"
      ) {
        tabsRef.current.set(
          data.tabId,
          data.timestamp
        );
      }
    };

    sendHeartbeat();

    const heartbeatInterval =
      setInterval(
        sendHeartbeat,
        2000
      );

    const cleanupInterval =
      setInterval(() => {
        const now = Date.now();

        tabsRef.current.forEach(
          (lastSeen, id) => {
            if (
              now - lastSeen >
              5000
            ) {
              tabsRef.current.delete(
                id
              );
            }
          }
        );

        tabsRef.current.set(
          generatedId,
          now
        );

        setActiveTabs(
          tabsRef.current.size
        );
      }, 1000);

    return () => {
      clearInterval(
        heartbeatInterval
      );

      clearInterval(
        cleanupInterval
      );

      channel.close();
    };
  }, []);

  return {
    tabId,
    activeTabs,
  };
}