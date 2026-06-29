import { randomUUID } from "node:crypto";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type LifecycleState = "idle" | "busy";

type LifecycleEvent =
  | "session_start"
  | "agent_start"
  | "agent_end"
  | "session_shutdown";

type LifecycleEntry = {
  extension: "pi-lifecycle";
  version: 1;
  event: LifecycleEvent;
  state: LifecycleState;
  timestamp: number;
  pid: number;
  runId?: string;
  sessionReason?: string;
  shutdownReason?: string;
  messageCount?: number;
  elapsedMs?: number;
};

type LifecycleExtra = Partial<
  Pick<
    LifecycleEntry,
    "runId" | "sessionReason" | "shutdownReason" | "messageCount" | "elapsedMs"
  >
>;

export default function (pi: ExtensionAPI) {
  let currentRunId: string | undefined;
  let currentRunStartedAt: number | undefined;

  function appendLifecycle(
    event: LifecycleEvent,
    state: LifecycleState,
    extra: LifecycleExtra = {},
  ) {
    const entry: LifecycleEntry = {
      extension: "pi-lifecycle",
      version: 1,
      event,
      state,
      timestamp: Date.now(),
      pid: process.pid,
      ...extra,
    };

    pi.appendEntry("pi-lifecycle", entry);
  }

  pi.on("session_start", (event) => {
    currentRunId = undefined;
    currentRunStartedAt = undefined;
    appendLifecycle("session_start", "idle", { sessionReason: event.reason });
  });

  pi.on("agent_start", () => {
    currentRunId = randomUUID();
    currentRunStartedAt = Date.now();
    appendLifecycle("agent_start", "busy", { runId: currentRunId });
  });

  pi.on("agent_end", (event) => {
    const runId = currentRunId;
    const elapsedMs =
      currentRunStartedAt === undefined ? undefined : Date.now() - currentRunStartedAt;

    appendLifecycle("agent_end", "idle", {
      runId,
      elapsedMs,
      messageCount: event.messages.length,
    });
    currentRunId = undefined;
    currentRunStartedAt = undefined;
  });

  pi.on("session_shutdown", (event) => {
    const runId = currentRunId;
    const elapsedMs =
      currentRunStartedAt === undefined ? undefined : Date.now() - currentRunStartedAt;

    appendLifecycle("session_shutdown", "idle", {
      runId,
      elapsedMs,
      shutdownReason: event.reason,
    });
    currentRunId = undefined;
    currentRunStartedAt = undefined;
  });
}
