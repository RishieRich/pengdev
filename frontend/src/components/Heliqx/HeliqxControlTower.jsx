import React, { useEffect, useMemo, useState } from "react";
import { taskService } from "../../services/taskService";

const STATUSES = ["Open", "In Progress", "Done", "Blocked", "Delayed"];
const PRIORITIES = ["High", "Medium", "Low"];
function todayString(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function displayTime(value) {
  if (!value) return "No update";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function isUpdatePending(task) {
  if (task.status === "Done") return false;
  const last = new Date(task.lastUpdatedAt);
  if (Number.isNaN(last.getTime())) return true;
  return Date.now() - last.getTime() > 3 * 60 * 60 * 1000;
}

function isEtaMissed(task, selectedDate) {
  if (task.status === "Done") return false;
  const eta = new Date(`${selectedDate}T${task.eta}:00`);
  return !Number.isNaN(eta.getTime()) && Date.now() > eta.getTime();
}

function priorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function statusClass(status) {
  return `task-status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function statusLabel(status) {
  const labels = {
    Open: "Open",
    "In Progress": "In Progress",
    Done: "Done",
    Blocked: "Blocked",
    Delayed: "Delayed",
  };
  return labels[status] || status;
}

function TaskSummaryCards({ tasks, selectedDate }) {
  const stats = useMemo(() => {
    const blockedDelayed = tasks.filter((task) => task.status === "Blocked" || task.status === "Delayed").length;
    return [
      { label: "Total Tasks", value: tasks.length, tone: "total" },
      { label: "Open", value: tasks.filter((task) => task.status === "Open").length, tone: "open" },
      { label: "In Progress", value: tasks.filter((task) => task.status === "In Progress").length, tone: "progress" },
      { label: "Done", value: tasks.filter((task) => task.status === "Done").length, tone: "done" },
      { label: "Blocked / Delayed", value: blockedDelayed, tone: "blocked" },
      { label: "Update Pending", value: tasks.filter(isUpdatePending).length, tone: "pending" },
    ];
  }, [tasks]);

  return (
    <div className="heliqx-summary-grid">
      {stats.map((stat) => (
        <div key={stat.label} className={`heliqx-summary-card ${stat.tone}`}>
          <div className="heliqx-summary-label">{stat.label}</div>
          <div className="heliqx-summary-value">{stat.value}</div>
          <div className="heliqx-summary-sub">{selectedDate}</div>
        </div>
      ))}
    </div>
  );
}

function VoiceTaskCapture({ selectedDate, onCreate }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState(taskService.demoTranscript);
  const [drafts, setDrafts] = useState([]);

  function simulateRecording() {
    setRecording(true);
    setDrafts([]);
    window.setTimeout(() => {
      setTranscript(taskService.demoTranscript);
      setRecording(false);
    }, 2400);
  }

  function convertToDrafts() {
    setDrafts(taskService.buildDraftTasksFromTranscript(transcript, selectedDate));
  }

  function updateDraft(id, patch) {
    setDrafts((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }

  function createDrafts() {
    const now = new Date().toISOString().slice(0, 19);
    const tasks = drafts.map((task) => ({
      ...task,
      id: `voice-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      lastUpdatedAt: now,
      updateDueAt: now,
      updateHistory: [{ at: now, status: "Open", progress: 0, notes: "Created from reviewed morning voice task." }],
    }));
    onCreate(tasks);
    setDrafts([]);
  }

  return (
    <section className="heliqx-card voice-capture-card">
      <div className="heliqx-section-title">
        <div>
          <p>Morning Voice Task Capture</p>
          <h2>Subah ke verbal instructions ko worker tickets mein convert karein</h2>
        </div>
        <span className="heliqx-mini-badge">Frontend simulation</span>
      </div>

      <div className="voice-grid">
        <div className="voice-panel">
          <button className={`record-btn ${recording ? "recording" : ""}`} type="button" onClick={simulateRecording} disabled={recording}>
            <span className="record-dot" />
            {recording ? "Recording..." : "Record Task Voice"}
          </button>
          <label htmlFor="voice-text">Or paste/type Hindi task instruction</label>
          <textarea
            id="voice-text"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={5}
          />
          <div className="voice-actions">
            <button type="button" onClick={convertToDrafts}>Convert to Task Tickets</button>
            <button type="button" className="ghost" onClick={() => { setDrafts([]); setTranscript(""); }}>Clear Draft</button>
          </div>
        </div>

        <div className="review-panel">
          <div className="review-head">
            <strong>Review before saving</strong>
            <span>{drafts.length} draft tickets</span>
          </div>
          {drafts.length === 0 ? (
            <div className="empty-review">Voice/text se draft tickets banenge. Create karne se pehle yahan review hoga.</div>
          ) : (
            <>
              <div className="task-review-table">
                <div className="task-review-row header">
                  <span>Worker</span><span>Task</span><span>Customer/Product</span><span>Qty</span><span>ETA</span><span>Priority</span><span>Confidence</span><span>Actions</span>
                </div>
                {drafts.map((draft) => (
                  <div key={draft.id} className="task-review-row">
                    <span>{draft.workerName}</span>
                    <span>{draft.title}</span>
                    <span>{draft.customer} / {draft.product}</span>
                    <span>{draft.quantity}</span>
                    <span>{draft.eta}</span>
                    <span>{draft.priority}</span>
                    <span>{Math.round(draft.confidenceScore * 100)}%</span>
                    <span className="review-actions">
                      <button type="button" onClick={() => {
                        const title = window.prompt("Task title edit karein", draft.title);
                        if (title) updateDraft(draft.id, { title });
                      }}>Edit</button>
                      <button type="button" onClick={() => setDrafts((current) => current.filter((task) => task.id !== draft.id))}>Remove</button>
                    </span>
                  </div>
                ))}
              </div>
              <div className="voice-actions right">
                <button type="button" onClick={createDrafts}>Create Tasks</button>
                <button type="button" className="ghost" onClick={() => setDrafts([])}>Clear Draft</button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function WorkerSummary({ workers, tasks, activeWorker, onSelectWorker }) {
  return (
    <section className="heliqx-card">
      <div className="heliqx-section-title compact">
        <div>
          <p>Worker load</p>
          <h2>Aaj worker-wise progress</h2>
        </div>
        {activeWorker && <button type="button" className="heliqx-text-btn" onClick={() => onSelectWorker("")}>Show all</button>}
      </div>
      <div className="worker-grid">
        {workers.map((worker) => {
          const ownTasks = tasks.filter((task) => task.workerName === worker.name);
          const blockedDelayed = ownTasks.filter((task) => task.status === "Blocked" || task.status === "Delayed").length;
          const lastUpdate = ownTasks
            .map((task) => task.lastUpdatedAt)
            .filter(Boolean)
            .sort()
            .at(-1);
          return (
            <button
              key={worker.id}
              type="button"
              className={`worker-card ${activeWorker === worker.name ? "active" : ""}`}
              onClick={() => onSelectWorker(activeWorker === worker.name ? "" : worker.name)}
            >
              <div className="worker-avatar">{worker.name[0]}</div>
              <div className="worker-main">
                <strong>{worker.name}</strong>
                <span>{worker.role}</span>
              </div>
              <div className="worker-stats">
                <span>{ownTasks.length} total</span>
                <span>{ownTasks.filter((task) => task.status === "Done").length} done</span>
                <span>{ownTasks.filter((task) => task.status === "In Progress").length} progress</span>
                <span>{ownTasks.filter((task) => task.status === "Open").length} open</span>
                <span>{blockedDelayed} blocked/delayed</span>
              </div>
              <small>Last update {displayTime(lastUpdate)}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TaskAlerts({ tasks, selectedDate }) {
  const alerts = useMemo(() => {
    const items = [];
    const pending = tasks.filter(isUpdatePending).slice(0, 2);
    pending.forEach((task) => {
      items.push({ tone: "pending", text: `${task.workerName} has not updated ${task.title} for 3+ hours` });
    });
    const etaMissed = tasks.find((task) => isEtaMissed(task, selectedDate));
    if (etaMissed) items.push({ tone: "danger", text: `${etaMissed.workerName}'s ${etaMissed.title} has ETA miss risk` });
    const blocked = tasks.find((task) => task.status === "Blocked");
    if (blocked) items.push({ tone: "danger", text: `${blocked.workerName}'s ${blocked.title} is blocked` });
    const overloaded = Object.entries(tasks.reduce((acc, task) => {
      acc[task.workerName] = (acc[task.workerName] || 0) + 1;
      return acc;
    }, {})).find(([, count]) => count >= 6);
    if (overloaded) items.push({ tone: "warn", text: `${overloaded[0]} has high worker load today` });
    if (tasks.filter((task) => task.status === "Open").length > 8) {
      items.push({ tone: "warn", text: "Too many open tasks hain. Priority review karna chahiye." });
    }
    return items.slice(0, 5);
  }, [tasks, selectedDate]);

  return (
    <section className="heliqx-card alerts-tower-card">
      <div className="heliqx-section-title compact">
        <div>
          <p>Action Alerts</p>
          <h2>Dekhne layak cheezein</h2>
        </div>
      </div>
      <div className="tower-alert-list">
        {alerts.length === 0 ? (
          <div className="tower-alert good">Sab control mein hai. No major alerts.</div>
        ) : alerts.map((alert, index) => (
          <div key={`${alert.text}-${index}`} className={`tower-alert ${alert.tone}`}>{alert.text}</div>
        ))}
      </div>
    </section>
  );
}

function TaskCard({ task, selectedDate, onUpdate }) {
  const updatePending = isUpdatePending(task);
  const etaMissed = isEtaMissed(task, selectedDate);

  return (
    <article className={`simple-task-card ${statusClass(task.status)}`}>
      <div className="simple-task-main">
        <div className={`status-dot ${statusClass(task.status)}`} />
        <div className="simple-task-copy">
          <div className="simple-task-title-row">
            <h3>{task.title}</h3>
            <span className={`task-status ${statusClass(task.status)}`}>{statusLabel(task.status)}</span>
          </div>
          <p>{task.description}</p>
          <div className="simple-task-meta">
            <span>{task.customer}</span>
            <span>{task.product}</span>
            <span>{task.quantity}</span>
            <span className={priorityClass(task.priority)}>{task.priority}</span>
          </div>
        </div>
      </div>
      <div className="simple-task-side">
        <div className="eta-block">
          <span>ETA</span>
          <strong>{task.eta}</strong>
        </div>
        <div className="simple-task-flags">
          {updatePending && <span className="eta-miss">Update pending</span>}
          {etaMissed && <span className="eta-miss">ETA miss</span>}
          {!updatePending && !etaMissed && <span className="last-update">Last {displayTime(task.lastUpdatedAt)}</span>}
        </div>
        <button type="button" onClick={() => onUpdate(task)}>Update</button>
      </div>
    </article>
  );
}

function TaskBoard({ tasks, workers, selectedDate, onUpdate }) {
  const groupedByWorker = useMemo(() => {
    return workers
      .map((worker) => ({
        worker,
        tasks: tasks.filter((task) => task.workerName === worker.name),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [tasks, workers]);

  return (
    <section className="heliqx-card">
      <div className="heliqx-section-title compact">
        <div>
          <p>Aaj ke tasks</p>
          <h2>Simple worker-wise task status</h2>
        </div>
      </div>
      <div className="simple-task-list">
        {groupedByWorker.length === 0 ? (
          <div className="empty-column">No matching tasks</div>
        ) : groupedByWorker.map(({ worker, tasks: workerTasks }) => {
          const done = workerTasks.filter((task) => task.status === "Done").length;
          const problem = workerTasks.filter((task) => task.status === "Blocked" || task.status === "Delayed").length;
          return (
            <div key={worker.id} className="worker-task-group">
              <div className="worker-task-head">
                <div>
                  <strong>{worker.name}</strong>
                  <span>{workerTasks.length} tasks / {done} done</span>
                </div>
                {problem > 0 ? <span className="worker-problem">{problem} issue</span> : <span className="worker-ok">On track</span>}
              </div>
              <div className="worker-task-items">
                {workerTasks.map((task) => (
                  <TaskCard key={task.id} task={task} selectedDate={selectedDate} onUpdate={onUpdate} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TaskUpdateModal({ task, onClose, onSave }) {
  const [status, setStatus] = useState(task?.status || "Open");
  const [progress, setProgress] = useState(task?.progress || 0);
  const [notes, setNotes] = useState("");
  const [blockerReason, setBlockerReason] = useState(task?.blockerReason || "");

  if (!task) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="task-update-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p>Update Status</p>
            <h2>{task.title}</h2>
            <span>{task.workerName} / {task.customer} / ETA {task.eta}</span>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </div>

        <label>Status</label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        <label>Progress</label>
        <div className="progress-buttons">
          {[0, 25, 50, 75, 100].map((value) => (
            <button key={value} type="button" className={progress === value ? "active" : ""} onClick={() => setProgress(value)}>
              {value}%
            </button>
          ))}
        </div>

        <label>Notes</label>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Short update likhein" />

        {(status === "Blocked" || status === "Delayed") && (
          <>
            <label>Blocker reason</label>
            <textarea value={blockerReason} onChange={(event) => setBlockerReason(event.target.value)} rows={2} placeholder="Material, machine, manpower..." />
          </>
        )}

        <button
          className="save-update-btn"
          type="button"
          onClick={() => onSave(task.id, { status, progress, notes, blockerReason })}
        >
          Save Update
        </button>
      </div>
    </div>
  );
}

export default function HeliqxControlTower() {
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [tasks, setTasks] = useState([]);
  const [workers] = useState(taskService.getWorkers());
  const [workerFilter, setWorkerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [modalTask, setModalTask] = useState(null);

  useEffect(() => {
    setTasks(taskService.getTasksByDate(selectedDate));
  }, [selectedDate]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const statusMatch = !statusFilter || task.status === statusFilter;
      const workerMatch = !workerFilter || task.workerName === workerFilter;
      const priorityMatch = !priorityFilter || task.priority === priorityFilter;
      const queryMatch = !query || [task.workerName, task.title, task.customer, task.product].join(" ").toLowerCase().includes(query);
      return statusMatch && workerMatch && priorityMatch && queryMatch;
    });
  }, [tasks, search, statusFilter, workerFilter, priorityFilter]);

  function createTasks(newTasks) {
    taskService.createTasks(newTasks);
    setTasks(taskService.getTasksByDate(selectedDate));
  }

  function saveUpdate(taskId, update) {
    const now = new Date().toISOString().slice(0, 19);
    setTasks((current) => current.map((task) => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        ...update,
        lastUpdatedAt: now,
        updateDueAt: now,
        updateHistory: [
          ...(task.updateHistory || []),
          { at: now, ...update },
        ],
      };
    }));
    taskService.updateTaskStatus(taskId, update);
    setModalTask(null);
  }

  return (
    <div className="heliqx-page">
      <section className="heliqx-hero">
        <div>
          <p className="hero-eyebrow">HELIQx CT by ARQ ONE AI Labs</p>
          <h1>HELIQx WorkGrid</h1>
          <p>Client workspace: Pawan Engineering. Daily task management and worker status tracking.</p>
        </div>
        <div className="heliqx-hero-panel">
          <span>5 workers</span>
          <strong>{filteredTasks.length}</strong>
          <span>visible tasks</span>
        </div>
      </section>

      <section className="heliqx-card filter-strip">
        <div className="date-quick-actions">
          <button type="button" className={selectedDate === todayString() ? "active" : ""} onClick={() => setSelectedDate(todayString())}>Today</button>
          <button type="button" className={selectedDate === todayString(-1) ? "active" : ""} onClick={() => setSelectedDate(todayString(-1))}>Yesterday</button>
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </div>
        <div className="tower-filters">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search worker/task/customer/product" />
          <select value={workerFilter} onChange={(event) => setWorkerFilter(event.target.value)}>
            <option value="">All workers</option>
            {workers.map((worker) => <option key={worker.id} value={worker.name}>{worker.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All status</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option value="">All priority</option>
            {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </div>
      </section>

      <TaskSummaryCards tasks={filteredTasks} selectedDate={selectedDate} />
      <VoiceTaskCapture selectedDate={selectedDate} onCreate={createTasks} />

      <div className="heliqx-two-col">
        <WorkerSummary workers={workers} tasks={tasks} activeWorker={workerFilter} onSelectWorker={setWorkerFilter} />
        <TaskAlerts tasks={filteredTasks} selectedDate={selectedDate} />
      </div>

      <TaskBoard tasks={filteredTasks} workers={workers} selectedDate={selectedDate} onUpdate={setModalTask} />

      <TaskUpdateModal task={modalTask} onClose={() => setModalTask(null)} onSave={saveUpdate} />
    </div>
  );
}
