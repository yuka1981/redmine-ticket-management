# Redmine Tickets: SaltStack Implementation Evaluation

> **Generated:** 2026-02-09
> **Scope:** Gaps identified in InfraScope's SaltStack integration (~70% complete)
> **Total Tickets:** 23 across 4 epics

---

## Epic 1: Cluster Management & Salt Lifecycle

> Salt master/minion lifecycle is partially automated (Ansible bootstrap works, reactor partially configured),
> but critical glue is missing: callback endpoints, state deployment, key management UI, and health monitoring.

---

### SALT-001: Add Salt callback controller and routes for reactor events

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | High |
| **Effort** | M |
| **Epic** | Cluster Management & Salt Lifecycle |

**Description:**

The Salt reactor fires `rails_notify.notify_job_complete` and `rails_notify.notify_minion_start` which POST to `/api/v1/salt/job_complete` and `/api/v1/salt/minion_start` respectively, but these Rails endpoints do not exist. Without them, Salt events are silently dropped and the system relies entirely on polling.

**Acceptance Criteria:**
- [ ] `Api::V1::SaltCallbacksController` created with `job_complete` and `minion_start` actions
- [ ] Routes added: `POST /api/v1/salt/job_complete` and `POST /api/v1/salt/minion_start`
- [ ] `job_complete` action updates the associated Task record (status, result) and broadcasts via ActionCable
- [ ] `minion_start` action updates device status to `online` and refreshes `last_seen_at`
- [ ] Authentication via shared secret (Salt runner sends API key in header)
- [ ] RSpec tests for both endpoints with valid/invalid payloads

**Related Files:**
- `salt/runners/rails_notify.py` (lines 148, 169 — POST targets)
- `api/config/routes.rb` (missing routes)
- `api/app/jobs/salt_job.rb` (currently polls instead of receiving callbacks)

---

### SALT-002: Register minion_start reactor in Salt master configuration

| Field | Value |
|-------|-------|
| **Tracker** | Task |
| **Priority** | High |
| **Effort** | S |
| **Epic** | Cluster Management & Salt Lifecycle |

**Description:**

`salt/reactor/minion_start.sls` exists and fires `rails_notify.notify_minion_start`, but the Salt master config template only registers the `job_complete` reactor. The `minion_start` event (`salt/minion/*/start`) is never caught.

**Acceptance Criteria:**
- [ ] `master.conf.j2` updated to include `minion_start` reactor entry:
  ```yaml
  reactor:
    - 'salt/job/*/ret/*':
      - /srv/salt/reactor/job_complete.sls
    - 'salt/minion/*/start':
      - /srv/salt/reactor/minion_start.sls
  ```
- [ ] Ansible role re-deploys master config when changed (handler exists)
- [ ] Verify minion start events trigger the reactor in test environment

**Related Files:**
- `api/ansible/roles/salt_master/templates/master.conf.j2` (line 28-31)
- `salt/reactor/minion_start.sls`

---

### SALT-003: Create Ansible tasks to deploy Salt states and pillar to master

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | High |
| **Effort** | M |
| **Epic** | Cluster Management & Salt Lifecycle |

**Description:**

The Salt master Ansible role creates `/srv/salt/states` and `/srv/salt/pillar` directories but never populates them from the repository. Salt states and pillar data in `salt/states/` and `salt/pillar/` exist in the repo but are not deployed, meaning `state.apply` calls will fail on a freshly provisioned master.

**Acceptance Criteria:**
- [ ] New Ansible playbook or tasks added to `salt_master` role that synchronizes:
  - `salt/states/` → `/srv/salt/states/` on master
  - `salt/pillar/` → `/srv/salt/pillar/` on master
  - `salt/reactor/` → `/srv/salt/reactor/` on master
  - `salt/runners/` → `/srv/salt/runners/` on master
- [ ] Uses `ansible.builtin.synchronize` (rsync) or `ansible.builtin.copy` with `recursive: yes`
- [ ] Idempotent — only copies changed files
- [ ] Can be run independently via `salt_deploy.yml` playbook
- [ ] Handler restarts `salt-master` service if reactor/runner files change

**Related Files:**
- `api/ansible/roles/salt_master/tasks/main.yml` (lines 170-184 — creates empty dirs)
- `api/ansible/playbooks/bootstrap/salt_deploy.yml`
- `salt/states/`, `salt/pillar/`, `salt/reactor/`, `salt/runners/`

---

### SALT-004: Build minion key management UI

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Medium |
| **Effort** | L |
| **Epic** | Cluster Management & Salt Lifecycle |

**Description:**

`SaltApiClient` already supports `list_keys`, `accept_key`, and `delete_key` but there is no frontend UI. Operators must SSH into the Salt master to manage keys, which breaks the self-service workflow.

**Acceptance Criteria:**
- [ ] New API endpoint `GET /api/v1/salt/keys` returning accepted, pending, rejected, and denied keys
- [ ] New API endpoints `POST /api/v1/salt/keys/:id/accept` and `DELETE /api/v1/salt/keys/:id`
- [ ] React component `SaltKeyManager` showing key status with accept/reject/delete actions
- [ ] Accessible from the Settings or Infrastructure page
- [ ] Only `admin` role can manage keys (Pundit policy)
- [ ] Confirmation dialog before destructive actions (delete, reject)
- [ ] Toast notifications for success/failure

**Related Files:**
- `api/app/services/salt_api_client.rb` (methods: `list_keys`, `accept_key`, `delete_key`)
- `ui/src/components/` (no existing key management components)

---

### SALT-005: Support multi-minion targeting in Salt execution

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Medium |
| **Effort** | M |
| **Epic** | Cluster Management & Salt Lifecycle |

**Description:**

`SaltApiClient#execute_async` only accepts a single `minion_id`. There is no support for glob patterns (`web*`), compound matchers (`G@os:CentOS`), or list targeting. This prevents fleet-wide operations like "benchmark all servers in rack A".

**Acceptance Criteria:**
- [ ] `SaltApiClient#execute_async` supports `tgt_type` parameter (glob, list, compound, grain)
- [ ] New `execute_batch` method for targeting multiple minions with batch size control
- [ ] Task model supports multi-device targeting (new `target_ids` array or multiple tasks spawned)
- [ ] UI allows selecting multiple devices for batch operations
- [ ] Progress tracking per minion within a batch task

**Related Files:**
- `api/app/services/salt_api_client.rb` (`execute_async` method — single target only)
- `api/app/jobs/salt_job.rb` (single minion execution)

---

### SALT-006: Add background minion health monitoring job

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Medium |
| **Effort** | M |
| **Epic** | Cluster Management & Salt Lifecycle |

**Description:**

No background process monitors minion connectivity. Devices can go offline without detection until a user manually runs a task that fails. The `minion_start` reactor (SALT-002) handles reconnection events, but not sustained outages.

**Acceptance Criteria:**
- [ ] New `MinionHealthCheckJob` Sidekiq job that runs on a configurable schedule (default: every 5 minutes)
- [ ] Pings all devices with `salt_minion_id` present via `test.ping`
- [ ] Updates `device.status` to `offline` if ping fails (with grace period of 2 consecutive failures)
- [ ] Updates `device.last_seen_at` on successful ping
- [ ] Broadcasts status changes via ActionCable for real-time UI updates
- [ ] Configurable via Sidekiq-Cron or `sidekiq-scheduler`

**Related Files:**
- `api/app/services/salt_api_client.rb` (`ping` method exists)
- `api/app/models/device.rb` (`status` and `last_seen_at` fields)

---

### SALT-007: Implement Salt event bus integration (replace polling)

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Low |
| **Effort** | XL |
| **Epic** | Cluster Management & Salt Lifecycle |

**Description:**

`SaltJob` polls the Salt API every 2 seconds for job status. This is inefficient and adds latency. Salt's event bus (`/events` SSE endpoint) provides real-time push updates but is not utilized. With callback endpoints (SALT-001) handling most cases, this ticket covers the remaining edge cases and provides a more robust event-driven architecture.

**Acceptance Criteria:**
- [ ] New `SaltEventListenerJob` that maintains a persistent SSE connection to Salt's `/events` endpoint
- [ ] Routes events to appropriate handlers (job completion, minion start/stop, auth events)
- [ ] Graceful reconnection with exponential backoff on connection loss
- [ ] Falls back to polling if SSE connection cannot be established
- [ ] Metrics/logging for event processing latency
- [ ] Integration tests with mock SSE stream

**Related Files:**
- `api/app/jobs/salt_job.rb` (lines 119-175 — polling loop)
- `api/app/services/salt_api_client.rb` (no `/events` endpoint support)

---

## Epic 2: Hardware Information Management

> Hardware data comes exclusively from Redfish/IPMI discovery. Salt grains provide richer, OS-level hardware
> data (CPU model, memory DIMMs, disk serial numbers, NIC MACs) that should be collected and tracked.

---

### SALT-008: Add grains collection methods to SaltApiClient

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | High |
| **Effort** | S |
| **Epic** | Hardware Information Management |

**Description:**

`SaltApiClient` lacks methods for `grains.items` and `grains.get`. These are essential for collecting OS-level hardware information (CPU, memory, disks, network interfaces) from managed devices.

**Acceptance Criteria:**
- [ ] New method `grains_items(minion_id)` — returns all grains for a minion
- [ ] New method `grains_get(minion_id, grain_key)` — returns specific grain value
- [ ] Uses `local` client (synchronous) for single-minion requests
- [ ] Handles authentication, timeouts, and error responses consistently with existing methods
- [ ] RSpec unit tests with mocked HTTP responses

**Related Files:**
- `api/app/services/salt_api_client.rb` (no grains methods)

---

### SALT-009: Create hardware inventory sync job

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | High |
| **Effort** | M |
| **Epic** | Hardware Information Management |

**Description:**

`device.hardware_info` is only populated during initial Redfish discovery. There is no mechanism to refresh hardware data from Salt grains, which provides more detailed and current OS-level information (installed packages, kernel version, CPU topology, DIMM details).

**Acceptance Criteria:**
- [ ] New `HardwareInventorySyncJob` Sidekiq job
- [ ] Collects `grains.items` from target device via Salt (depends on SALT-008)
- [ ] Merges grain data into `device.hardware_info` JSONB field (preserving Redfish data, adding/updating Salt data under a `salt_grains` key)
- [ ] Can be triggered manually per device (new device action) or run fleet-wide on schedule
- [ ] Records changes in PaperTrail for audit
- [ ] API endpoint to trigger sync: `POST /api/v1/devices/:id/sync_hardware`

**Related Files:**
- `api/app/models/device.rb` (`hardware_info` JSONB field)
- `api/app/jobs/hardware_discovery_job.rb` (existing Redfish-based discovery)

---

### SALT-010: Implement hardware change detection and alerting

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Medium |
| **Effort** | L |
| **Epic** | Hardware Information Management |

**Description:**

When hardware changes on a device (disk failure, memory swap, NIC replacement), there is no detection or alerting mechanism. Operators discover changes reactively when something breaks.

**Acceptance Criteria:**
- [ ] `HardwareInventorySyncJob` (SALT-009) diffs previous and current `hardware_info`
- [ ] Significant changes (component add/remove/change) create a `HardwareChangeEvent` record
- [ ] Changes are displayed on the device detail page in a "Hardware Changes" timeline
- [ ] Optional notification (log, webhook, or email) when critical hardware changes detected
- [ ] Configurable sensitivity — ignore minor changes (e.g., uptime, load average)

**Related Files:**
- `api/app/models/device.rb` (`hardware_info` field, PaperTrail versioning)

---

### SALT-011: Create custom Salt grain module for InfraScope metadata

| Field | Value |
|-------|-------|
| **Tracker** | Task |
| **Priority** | Low |
| **Effort** | M |
| **Epic** | Hardware Information Management |

**Description:**

Standard Salt grains cover generic system info. A custom grain module (`_grains/infrascope.py`) can provide InfraScope-specific metadata: IPMI/BMC firmware version, RAID controller status, GPU inventory, and hardware health indicators not covered by default grains.

**Acceptance Criteria:**
- [ ] Custom grain module at `salt/states/_grains/infrascope.py`
- [ ] Collects: BMC firmware version, RAID status, GPU info (if present), NIC firmware versions
- [ ] Auto-syncs to minions via `saltutil.sync_grains`
- [ ] Deployed as part of state/pillar sync (SALT-003)
- [ ] Unit tests for grain module
- [ ] Data format documented in `docs/07-SALTSTACK.md`

**Related Files:**
- `salt/states/` (no `_grains/` directory currently)
- `api/app/services/salt_api_client.rb` (will consume this data via SALT-008)

---

## Epic 3: Benchmark Engagement & Results

> PerfSpect benchmarking works end-to-end for ad-hoc execution. But there's no scheduling, comparison,
> trending, retention automation, or dashboard view to make benchmark data operationally useful.

---

### SALT-012: Schedule automated benchmark cleanup job

| Field | Value |
|-------|-------|
| **Tracker** | Task |
| **Priority** | High |
| **Effort** | S |
| **Epic** | Benchmark Engagement & Results |

**Description:**

`BenchmarkReport.cleanup_expired` exists and a rake task wraps it, but it must be run manually. Expired reports accumulate indefinitely, consuming database storage.

**Acceptance Criteria:**
- [ ] Add `sidekiq-cron` or `sidekiq-scheduler` gem (if not present)
- [ ] Register `BenchmarkReportCleanupJob` to run daily at 02:00 UTC
- [ ] Job calls `BenchmarkReport.cleanup_expired` and logs the count of deleted reports
- [ ] Configurable retention period (default: 90 days, via ENV or Rails config)
- [ ] Monitoring — job failure alerts if cleanup raises an error

**Related Files:**
- `api/app/models/benchmark_report.rb` (`cleanup_expired` method, `expired` scope)
- `api/lib/tasks/benchmark_reports.rake` (manual cleanup task)

---

### SALT-013: Add benchmark scheduling (recurring benchmarks)

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Medium |
| **Effort** | L |
| **Epic** | Benchmark Engagement & Results |

**Description:**

Benchmarks can only be triggered manually via the device detail page. Operators need the ability to schedule recurring benchmarks (e.g., weekly PerfSpect runs) to track performance trends over time.

**Acceptance Criteria:**
- [ ] New `BenchmarkSchedule` model with fields: device_id, suite, cron_expression, enabled, last_run_at
- [ ] `BenchmarkSchedulerJob` checks due schedules and spawns benchmark tasks
- [ ] UI on device detail page to create/edit/delete benchmark schedules
- [ ] Schedules can be paused/resumed
- [ ] Maximum concurrent benchmark limit to prevent resource contention
- [ ] Schedules visible in device detail and a new "Scheduled Benchmarks" section

**Related Files:**
- `api/app/models/benchmark_report.rb`
- `api/app/jobs/salt_job.rb` (handles benchmark execution)
- `ui/src/components/devices/BenchmarkReportsList.jsx`

---

### SALT-014: Build benchmark report comparison API and UI

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Medium |
| **Effort** | L |
| **Epic** | Benchmark Engagement & Results |

**Description:**

`BenchmarkReport.result_data` stores detailed benchmark results as JSONB, but there's no way to compare reports side-by-side or view trends. This makes it impossible to answer "did performance improve after the firmware update?"

**Acceptance Criteria:**
- [ ] API endpoint `GET /api/v1/benchmark_reports/compare?ids[]=X&ids[]=Y` returns normalized comparison data
- [ ] Comparison highlights: improved, degraded, unchanged metrics with percentage deltas
- [ ] React `BenchmarkComparison` component with side-by-side view
- [ ] Select any two reports from same or different devices for comparison
- [ ] Trending chart (line graph) showing key metrics over time for a single device
- [ ] Uses recharts or similar lightweight charting library

**Related Files:**
- `api/app/models/benchmark_report.rb` (`result_data` JSONB field)
- `ui/src/components/devices/BenchmarkReportsList.jsx` (current list — add "Compare" action)

---

### SALT-015: Create benchmark dashboard with fleet-wide view

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Medium |
| **Effort** | L |
| **Epic** | Benchmark Engagement & Results |

**Description:**

Benchmark data is siloed per device. There's no aggregate view to compare performance across the fleet, identify underperformers, or view overall benchmarking activity.

**Acceptance Criteria:**
- [ ] New page `/benchmarks` (or section in Dashboard) with fleet-wide benchmark overview
- [ ] Summary cards: total reports, reports this week, devices benchmarked, average scores
- [ ] Table of recent benchmark reports across all devices with sorting/filtering
- [ ] Heatmap or bar chart comparing latest scores across devices
- [ ] Filter by: suite type, date range, device group (rack/site)
- [ ] Links to device detail and individual report pages

**Related Files:**
- `ui/src/pages/` (no benchmark dashboard page)
- `api/app/controllers/api/v1/benchmark_reports_controller.rb`

---

### SALT-016: Add benchmark baseline thresholds and performance alerting

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Low |
| **Effort** | L |
| **Epic** | Benchmark Engagement & Results |

**Description:**

No mechanism exists to flag performance degradation. A device could lose 30% CPU performance and no one would know until a user manually compares reports.

**Acceptance Criteria:**
- [ ] New `BenchmarkBaseline` model: device_id, suite, metric_name, baseline_value, threshold_pct
- [ ] Baselines can be set manually or auto-generated from the first N reports (rolling average)
- [ ] When a new report arrives, compare key metrics against baselines
- [ ] If any metric deviates beyond threshold, create a `BenchmarkAlert` record
- [ ] Alerts visible on device detail page and benchmark dashboard
- [ ] Optional webhook notification for threshold violations

**Related Files:**
- `api/app/models/benchmark_report.rb`
- `api/app/jobs/salt_job.rb` (report creation after benchmark completes)

---

### SALT-017: Support custom benchmark profiles

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Low |
| **Effort** | M |
| **Epic** | Benchmark Engagement & Results |

**Description:**

Benchmark suites are hardcoded. Operators cannot define custom benchmark configurations (e.g., "CPU-only quick test" or "full storage burn-in") or customize PerfSpect parameters.

**Acceptance Criteria:**
- [ ] New `BenchmarkProfile` model: name, suite, parameters (JSONB), created_by, description
- [ ] Seed with default profiles matching current hardcoded suites
- [ ] UI for creating/editing profiles with parameter fields appropriate to each suite type
- [ ] Profile selection in the PerfSpect modal (replaces or extends current suite dropdown)
- [ ] Only `admin` and `operator` roles can create/edit profiles
- [ ] Profiles can be shared across the organization or marked as personal

**Related Files:**
- `ui/src/components/devices/PerfSpectModal.jsx` (current suite selection)
- `api/app/jobs/salt_job.rb` (benchmark execution parameters)

---

## Epic 4: Salt Infrastructure & Operations

> The operational robustness of Salt integration needs improvement: task cancellation should actually stop
> Salt jobs, failed tasks should be retryable, and integration test coverage is needed.

---

### SALT-018: Implement task cancellation that kills Salt jobs

| Field | Value |
|-------|-------|
| **Tracker** | Bug |
| **Priority** | High |
| **Effort** | M |
| **Epic** | Salt Infrastructure & Operations |

**Description:**

When a user cancels a task, only the AASM state transitions to `cancelled`. The underlying Salt job continues running on the minion, consuming resources. The Salt API provides `saltutil.kill_job` for this purpose.

**Acceptance Criteria:**
- [ ] `SaltApiClient` gains `kill_job(jid)` method calling `saltutil.kill_job`
- [ ] Task cancellation flow calls `kill_job` with the Salt JID before state transition
- [ ] `SaltJob` polling loop detects cancellation and exits cleanly
- [ ] If `kill_job` fails (job already finished), cancellation still succeeds gracefully
- [ ] Cancellation reason logged in task logs
- [ ] RSpec tests for cancellation with mocked Salt API responses

**Related Files:**
- `api/app/jobs/salt_job.rb` (polling loop, no kill mechanism)
- `api/app/services/salt_api_client.rb` (no `kill_job` method)
- `api/app/controllers/api/v1/tasks_controller.rb` (`cancel` action)

---

### SALT-019: Add task retry mechanism

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | High |
| **Effort** | M |
| **Epic** | Salt Infrastructure & Operations |

**Description:**

Failed tasks cannot be retried. Operators must navigate back to the device, remember the parameters, and re-trigger the action manually. This is error-prone and slow during incident response.

**Acceptance Criteria:**
- [ ] New `retry` action on Task: `POST /api/v1/tasks/:id/retry`
- [ ] Creates a new Task with same parameters as the original (linked via `retry_of` foreign key)
- [ ] Only `failed` and `cancelled` tasks can be retried
- [ ] UI "Retry" button on task detail page (only visible for retryable states)
- [ ] Retry count tracked and displayed (e.g., "Attempt 3 of 5")
- [ ] Optional auto-retry with configurable max attempts and backoff
- [ ] Pundit authorization — same role requirements as the original action

**Related Files:**
- `api/app/models/task.rb` (AASM states, no retry support)
- `api/app/controllers/api/v1/tasks_controller.rb`
- `ui/src/components/tasks/TaskDetail.jsx`

---

### SALT-020: Implement task orchestration and dependencies

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Medium |
| **Effort** | XL |
| **Epic** | Salt Infrastructure & Operations |

**Description:**

Tasks execute independently with no dependency chaining. Common workflows like "deploy → verify → benchmark" require manual sequential triggering. Salt has built-in orchestration (`state.orchestrate`), but InfraScope doesn't leverage it.

**Acceptance Criteria:**
- [ ] New `TaskGroup` model: name, tasks (ordered), status, created_by
- [ ] Tasks within a group execute sequentially; next task starts only when previous succeeds
- [ ] If a task fails, the group pauses (configurable: pause, skip, or abort)
- [ ] UI for creating task groups from predefined workflows or ad-hoc task chains
- [ ] Task group progress visible in UI with per-step status
- [ ] API: `POST /api/v1/task_groups` with array of task definitions

**Related Files:**
- `api/app/models/task.rb` (currently independent)
- `api/app/jobs/salt_job.rb`, `api/app/jobs/ansible_job.rb`

---

### SALT-021: Add pillar and runner methods to SaltApiClient

| Field | Value |
|-------|-------|
| **Tracker** | Feature |
| **Priority** | Medium |
| **Effort** | S |
| **Epic** | Salt Infrastructure & Operations |

**Description:**

`SaltApiClient` supports `local`, `local_async`, and `wheel` clients but lacks `pillar` and `runner` client support. Pillar data retrieval is needed for configuration verification, and runner execution is needed for orchestration and custom runners.

**Acceptance Criteria:**
- [ ] New method `pillar_items(minion_id)` — returns all pillar data for a minion
- [ ] New method `pillar_get(minion_id, key)` — returns specific pillar value
- [ ] New method `run_runner(function, args, kwargs)` — executes a Salt runner
- [ ] Uses appropriate client types (`local` for pillar, `runner` for runners)
- [ ] Consistent error handling and timeout behavior with existing methods
- [ ] RSpec unit tests with mocked HTTP responses

**Related Files:**
- `api/app/services/salt_api_client.rb` (missing client types)
- `salt/runners/rails_notify.py` (existing runner, could be invoked via API)

---

### SALT-022: Add integration tests for Salt API client and SaltJob

| Field | Value |
|-------|-------|
| **Tracker** | Task |
| **Priority** | Medium |
| **Effort** | L |
| **Epic** | Salt Infrastructure & Operations |

**Description:**

`SaltApiClient` and `SaltJob` have no integration test coverage. Unit tests mock all HTTP calls, so real API interaction issues (auth flow, response format changes, timeout handling) go undetected until production.

**Acceptance Criteria:**
- [ ] Integration test suite using VCR or WebMock with recorded cassettes from real Salt API
- [ ] Tests cover: authentication flow, job execution, job status polling, key management
- [ ] Tests for error scenarios: auth failure, timeout, minion not found, job not found
- [ ] CI-compatible — can run without a live Salt master (uses recorded responses)
- [ ] Optional "live" test mode for running against actual Salt API (gated by ENV flag)
- [ ] Documentation in `docs/07-SALTSTACK.md` on recording new cassettes

**Related Files:**
- `api/app/services/salt_api_client.rb`
- `api/app/jobs/salt_job.rb`
- `api/spec/` (no integration specs for Salt)

---

### SALT-023: Add Salt API health check endpoint and monitoring

| Field | Value |
|-------|-------|
| **Tracker** | Task |
| **Priority** | Medium |
| **Effort** | S |
| **Epic** | Salt Infrastructure & Operations |

**Description:**

There is no way to verify Salt API connectivity from the InfraScope UI beyond the settings page "Test Connection" button. If the Salt API goes down, tasks fail with opaque errors.

**Acceptance Criteria:**
- [ ] New `GET /api/v1/health/salt` endpoint returning Salt API status (up/down, latency, version)
- [ ] Dashboard widget or status indicator showing Salt master connectivity
- [ ] Background health check runs every 60 seconds (piggyback on SALT-006 or separate lightweight job)
- [ ] If Salt API is unreachable, device actions that require Salt are disabled with clear messaging
- [ ] Health status included in the main application health check endpoint

**Related Files:**
- `api/app/services/salt_api_client.rb` (`ping` and `authenticate` methods)
- `api/app/controllers/api/v1/salt_api_settings_controller.rb` (`test` action — partial implementation)

---

## Summary

| Epic | Tickets | High | Medium | Low |
|------|---------|------|--------|-----|
| 1. Cluster Management & Salt Lifecycle | 7 | 3 | 3 | 1 |
| 2. Hardware Information Management | 4 | 2 | 1 | 1 |
| 3. Benchmark Engagement & Results | 6 | 1 | 3 | 2 |
| 4. Salt Infrastructure & Operations | 6 | 3 | 3 | 0 |
| **Total** | **23** | **9** | **10** | **4** |

### Effort Breakdown

| Size | Count | Description |
|------|-------|-------------|
| S | 4 | Small — config changes, method additions, < 1 day |
| M | 9 | Medium — new endpoints, jobs, or components, 1-3 days |
| L | 8 | Large — full features with API + UI, 3-5 days |
| XL | 2 | Extra Large — architectural changes, 5+ days |

### Dependency Graph

```
SALT-001 (callbacks) ← SALT-002 (reactor registration)
SALT-003 (state deploy) ← SALT-011 (custom grains)
SALT-008 (grains API) ← SALT-009 (inventory sync) ← SALT-010 (change detection)
SALT-012 (cleanup cron) — independent
SALT-013 (scheduling) — independent
SALT-014 (comparison) — independent
SALT-015 (dashboard) ← SALT-014 (comparison)
SALT-016 (baselines) ← SALT-014 (comparison)
SALT-018 (kill jobs) — independent
SALT-019 (retry) — independent
SALT-020 (orchestration) ← SALT-019 (retry)
SALT-021 (pillar/runner) — independent
SALT-022 (integration tests) ← SALT-008, SALT-018, SALT-021
SALT-023 (health check) — independent
```

### Suggested Implementation Order

**Phase 1 — Critical Glue (Weeks 1-2):**
SALT-001, SALT-002, SALT-003, SALT-008, SALT-012, SALT-018

**Phase 2 — Core Features (Weeks 3-5):**
SALT-009, SALT-004, SALT-019, SALT-021, SALT-023

**Phase 3 — Advanced Features (Weeks 6-9):**
SALT-005, SALT-006, SALT-010, SALT-013, SALT-014, SALT-022

**Phase 4 — Polish & Scale (Weeks 10+):**
SALT-007, SALT-011, SALT-015, SALT-016, SALT-017, SALT-020
