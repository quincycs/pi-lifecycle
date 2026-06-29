# pi-lifecycle

A [pi](https://pi.dev) extension that records lifecycle events into the active session as custom metadata entries. These enteries aren't sent to the LLM, and just serve as a record of the session's lifecycle events.

## Install

```bash
pi install git:github.com/quincycs/pi-lifecycle
```

## What it records

The extension appends `pi-lifecycle` custom entries for:

- `session_start`
- `agent_start`
- `agent_end`
- `session_shutdown`

Each entry includes state (`idle` or `busy`), timestamp, process id, and related metadata such as run id, session/shutdown reason, elapsed time, and message count.

## Package layout

This repository is a pi package. Its `package.json` declares:

```json
{
  "pi": {
    "extensions": ["./extensions"]
  }
}
```
