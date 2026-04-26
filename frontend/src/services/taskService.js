import { demoTranscript, mockTasksByDate, workers } from "../data/mockTasks";

const STORAGE_KEY = "heliqx_task_overrides_v1";

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function nowIso() {
  return new Date().toISOString().slice(0, 19);
}

function mergeTasks(date) {
  const store = readStore();
  const base = mockTasksByDate[date] || [];
  const saved = store[date] || [];
  const savedById = new Map(saved.map((task) => [task.id, task]));
  const merged = base.map((task) => savedById.get(task.id) || task);
  const created = saved.filter((task) => !base.some((baseTask) => baseTask.id === task.id));
  return [...created, ...merged];
}

export const taskService = {
  getWorkers() {
    return workers;
  },

  getTasksByDate(date) {
    return mergeTasks(date);
  },

  createTasks(tasks) {
    const store = readStore();
    tasks.forEach((task) => {
      const date = task.date;
      const current = store[date] || [];
      store[date] = [
        {
          ...task,
          id: task.id || `created-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          lastUpdatedAt: task.lastUpdatedAt || nowIso(),
          updateDueAt: task.updateDueAt || nowIso(),
          updateHistory: task.updateHistory || [
            { at: nowIso(), status: task.status || "Open", progress: 0, notes: "Created from morning voice capture." },
          ],
        },
        ...current,
      ];
    });
    writeStore(store);
    return tasks;
  },

  updateTaskStatus(taskId, update) {
    const store = readStore();
    const dates = Array.from(new Set([...Object.keys(mockTasksByDate), ...Object.keys(store)]));
    dates.forEach((date) => {
      store[date] = store[date] || [];
      const existing = mergeTasks(date).find((task) => task.id === taskId);
      if (!existing) return;
      const updated = {
        ...existing,
        status: update.status,
        progress: update.progress,
        lastUpdatedAt: nowIso(),
        updateDueAt: nowIso(),
        blockerReason: update.blockerReason,
        updateHistory: [
          ...(existing.updateHistory || []),
          {
            at: nowIso(),
            status: update.status,
            progress: update.progress,
            notes: update.notes || "",
            blockerReason: update.blockerReason || "",
          },
        ],
      };
      store[date] = [updated, ...store[date].filter((task) => task.id !== taskId)];
    });
    writeStore(store);
  },

  buildDraftTasksFromTranscript(transcript, date) {
    const text = (transcript || demoTranscript).trim();
    return [
      {
        id: `draft-${Date.now()}-1`,
        date,
        workerName: "Ramesh",
        title: "Complete spring seal packing",
        description: text,
        customer: "Yash Seals",
        product: "Spring Seal",
        quantity: "20 pcs",
        eta: "11:00",
        priority: "High",
        status: "Open",
        source: "Voice",
        confidenceScore: 0.93,
      },
      {
        id: `draft-${Date.now()}-2`,
        date,
        workerName: "Suresh",
        title: "Prepare Yash Seals dispatch",
        description: "Dispatch 2 baje tak ready karna hai.",
        customer: "Yash Seals",
        product: "Dispatch",
        quantity: "1 lot",
        eta: "14:00",
        priority: "High",
        status: "Open",
        source: "Voice",
        confidenceScore: 0.9,
      },
      {
        id: `draft-${Date.now()}-3`,
        date,
        workerName: "Amit",
        title: "SS coil cutting before lunch",
        description: "Lunch ke pehle SS coil cutting complete karni hai.",
        customer: "Internal",
        product: "SS Coil",
        quantity: "1 batch",
        eta: "12:30",
        priority: "Medium",
        status: "Open",
        source: "Voice",
        confidenceScore: 0.87,
      },
      {
        id: `draft-${Date.now()}-4`,
        date,
        workerName: "Mahesh",
        title: "Heat sink inspection",
        description: "Heat sink inspection 4 baje tak complete karna hai.",
        customer: "Effectronic Technology",
        product: "Heat Sink",
        quantity: "1 batch",
        eta: "16:00",
        priority: "Medium",
        status: "Open",
        source: "Voice",
        confidenceScore: 0.89,
      },
    ];
  },

  demoTranscript,
};
