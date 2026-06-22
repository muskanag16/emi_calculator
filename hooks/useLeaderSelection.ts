"use client";

import { useEffect, useRef, useState } from "react";

export default function useLeaderElection(
  tabId: string
) {
  const [leaderId, setLeaderId] =
    useState(tabId);

  const [isLeader, setIsLeader] =
    useState(true);

  const knownTabs =
    useRef<Set<string>>(new Set());

  useEffect(() => {
    const channel =
      new BroadcastChannel(
        "leader-election"
      );

    knownTabs.current.add(tabId);

    channel.postMessage({
      type: "HELLO",
      tabId,
    });

    channel.onmessage = (event) => {
      const data = event.data;

      if (
        data.type === "HELLO"
      ) {
        knownTabs.current.add(
          data.tabId
        );

        const sorted =
          Array.from(
            knownTabs.current
          ).sort();

        const leader =
          sorted[0];

        setLeaderId(leader);

        setIsLeader(
          leader === tabId
        );
      }
    };

    return () => {
      channel.close();
    };
  }, [tabId]);

  return {
    leaderId,
    isLeader,
  };
}