const store = {
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@queuesmart.com",
      password: "admin123",
      role: "admin",
    },
    {
      id: 2,
      name: "Alice Johnson",
      email: "alice@example.com",
      password: "password123",
      role: "user",
    },
    {
      id: 3,
      name: "Bob Smith",
      email: "bob@example.com",
      password: "password123",
      role: "user",
    },
  ],

  services: [
    {
      id: 1,
      name: "Academic Advising",
      description: "Course planning and degree requirements",
      duration: 30,
      priority: "high",
    },
    {
      id: 2,
      name: "Financial Aid Office",
      description: "Scholarships, bursaries, and payment plans",
      duration: 20,
      priority: "medium",
    },
    {
      id: 3,
      name: "IT Help Desk",
      description: "Technical support for students and staff",
      duration: 15,
      priority: "low",
    },
    {
      id: 4,
      name: "Registrar Office",
      description: "Enrollment, transcripts, and official documents",
      duration: 25,
      priority: "medium",
    },
  ],

  queues: {
    1: [
      { id: 101, userId: 2, name: "Alice Johnson", position: 1, status: "almost-ready", joinedAt: Date.now() },
      { id: 102, userId: 3, name: "Bob Smith",     position: 2, status: "waiting",      joinedAt: Date.now() },
    ],
    2: [],
    3: [],
    4: [],
  },

  history: [
    { id: 1, userId: 2, service: "Academic Advising",  date: "2025-06-10", outcome: "Served",      waitTime: 22 },
    { id: 2, userId: 2, service: "IT Help Desk",        date: "2025-06-08", outcome: "Served",      waitTime: 10 },
    { id: 3, userId: 3, service: "Financial Aid Office",date: "2025-05-30", outcome: "Left Queue",  waitTime: 45 },
  ],

  notifications: [
    { id: 1, userId: 2, message: "You're 2nd in line at Academic Advising!", type: "alert",   time: new Date().toISOString() },
    { id: 2, userId: 2, message: "IT Help Desk queue is now open.",           type: "info",    time: new Date().toISOString() },
    { id: 3, userId: 3, message: "Your turn at Registrar Office was served.", type: "success", time: new Date().toISOString() },
  ],

  _nextUserId:         4,
  _nextQueueEntryId:   500,
  _nextHistoryId:      4,
  _nextNotificationId: 4,
};

store.nextUserId         = () => store._nextUserId++;
store.nextQueueEntryId   = () => store._nextQueueEntryId++;
store.nextHistoryId      = () => store._nextHistoryId++;
store.nextNotificationId = () => store._nextNotificationId++;

module.exports = store;