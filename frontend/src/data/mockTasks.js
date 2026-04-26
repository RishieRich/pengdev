const WORKERS = ["Ramesh", "Suresh", "Amit", "Mahesh", "Nilesh"];

const TASK_TEMPLATES = [
  {
    title: "Complete spring seal packing",
    description: "20 pieces packing complete karke ready rack mein rakhna.",
    customer: "Yash Seals",
    product: "Spring Seal",
    quantity: "20 pcs",
    eta: "11:00",
    priority: "High",
  },
  {
    title: "SS coil cutting for Yash Seals order",
    description: "Lunch se pehle coil cutting complete karke inspection table par update dena.",
    customer: "Yash Seals",
    product: "SS CR Coil",
    quantity: "45 kg",
    eta: "12:30",
    priority: "High",
  },
  {
    title: "Prepare dispatch for Unisto Corporation",
    description: "Packing, label aur dispatch slip ready karna.",
    customer: "Unisto Corporation",
    product: "Seal Lock",
    quantity: "1 lot",
    eta: "14:00",
    priority: "Medium",
  },
  {
    title: "Check material availability for seal lock batch",
    description: "Aaj ke batch ke liye pending material list confirm karna.",
    customer: "Internal",
    product: "Seal Lock Batch",
    quantity: "1 checklist",
    eta: "15:00",
    priority: "Medium",
  },
  {
    title: "Finish drilling and inspection for heat sink order",
    description: "Drilling ke baad inspection remarks update karna.",
    customer: "Effectronic Technology",
    product: "Heat Sink",
    quantity: "60 pcs",
    eta: "16:00",
    priority: "High",
  },
  {
    title: "Update pending material list for tomorrow",
    description: "Kal ke dispatch aur production ke liye shortage list banana.",
    customer: "Internal",
    product: "Material Planning",
    quantity: "1 list",
    eta: "17:00",
    priority: "Low",
  },
];

const STATUS_ROTATION = ["Open", "In Progress", "Done", "Blocked", "Delayed"];

function dateOffset(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

function timeFor(date, hour, minute = 0) {
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function buildTasksForDate(date, dayIndex) {
  const tasks = [];
  WORKERS.forEach((workerName, workerIndex) => {
    const count = 4 + ((workerIndex + dayIndex) % 3);
    for (let i = 0; i < count; i += 1) {
      const template = TASK_TEMPLATES[(workerIndex + i + dayIndex) % TASK_TEMPLATES.length];
      const status = STATUS_ROTATION[(workerIndex + i + dayIndex) % STATUS_ROTATION.length];
      const updatedHour = 8 + ((workerIndex + i) % 5);
      const etaHour = Number(template.eta.split(":")[0]);
      tasks.push({
        id: `${date}-${workerName.toLowerCase()}-${i + 1}`,
        date,
        workerName,
        title: template.title,
        description: template.description,
        customer: template.customer,
        product: template.product,
        quantity: template.quantity,
        eta: template.eta,
        priority: template.priority,
        status,
        progress: status === "Done" ? 100 : status === "In Progress" ? 50 : status === "Blocked" ? 25 : 0,
        lastUpdatedAt: timeFor(date, updatedHour, workerIndex * 5),
        updateDueAt: timeFor(date, updatedHour + 3, workerIndex * 5),
        updateHistory: [
          {
            at: timeFor(date, updatedHour, workerIndex * 5),
            status,
            progress: status === "Done" ? 100 : status === "In Progress" ? 50 : status === "Blocked" ? 25 : 0,
            notes: status === "Blocked" ? "Material confirmation pending." : "Morning task status captured.",
          },
        ],
        source: i % 2 === 0 ? "Voice" : "Manual",
        confidenceScore: i % 2 === 0 ? 0.91 : null,
      });
    }
  });
  return tasks;
}

export const workers = WORKERS.map((name, index) => ({
  id: name.toLowerCase(),
  name,
  role: ["Packing", "Dispatch", "Cutting", "Inspection", "Planning"][index],
}));

export const mockTasksByDate = {
  [dateOffset(0)]: buildTasksForDate(dateOffset(0), 0),
  [dateOffset(1)]: buildTasksForDate(dateOffset(1), 1),
  [dateOffset(2)]: buildTasksForDate(dateOffset(2), 2),
};

export const demoTranscript =
  "Aaj Ramesh ko 11 baje tak 20 spring seal packing complete karna hai. Suresh ko Yash Seals ka dispatch 2 baje tak ready karna hai. Amit ko SS coil cutting lunch ke pehle complete karni hai. Mahesh ko heat sink inspection 4 baje tak karna hai.";
