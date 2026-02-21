export const MOCK_SERVICES = [
    { id: 1, name: 'Academic Advising', description: 'Course planning and degree requirements', duration: 30, priority: 'high', queueLength: 8 },
    { id: 2, name: 'Financial Aid Office', description: 'Scholarships, bursaries, and payment plans', duration: 20, priority: 'medium', queueLength: 5 },
    { id: 3, name: 'IT Help Desk', description: 'Technical support for students and staff', duration: 15, priority: 'low', queueLength: 3 },
    { id: 4, name: 'Registrar Office', description: 'Enrollment, transcripts, and official documents', duration: 25, priority: 'medium', queueLength: 12 },
  ]
  
  export const MOCK_QUEUES_BY_SERVICE = {
    1: [ // academic advising — 8 people
      { id: 101, name: 'Alice Johnson', position: 1, waitTime: 30, status: 'almost-ready' },
      { id: 102, name: 'Bob Smith', position: 2, waitTime: 60, status: 'waiting' },
      { id: 103, name: 'Carol White', position: 3, waitTime: 90, status: 'waiting' },
      { id: 104, name: 'David Lee', position: 4, waitTime: 120, status: 'waiting' },
      { id: 105, name: 'Eva Martinez', position: 5, waitTime: 150, status: 'waiting' },
      { id: 106, name: 'Frank Zhang', position: 6, waitTime: 180, status: 'waiting' },
      { id: 107, name: 'Grace Kim', position: 7, waitTime: 210, status: 'waiting' },
      { id: 108, name: 'Henry Park', position: 8, waitTime: 240, status: 'waiting' },
    ],
    2: [ // financial aid — 5 people
      { id: 201, name: 'Isla Torres', position: 1, waitTime: 20, status: 'almost-ready' },
      { id: 202, name: 'James Patel', position: 2, waitTime: 40, status: 'waiting' },
      { id: 203, name: 'Karen Nguyen', position: 3, waitTime: 60, status: 'waiting' },
      { id: 204, name: 'Liam Chen', position: 4, waitTime: 80, status: 'waiting' },
      { id: 205, name: 'Maya Singh', position: 5, waitTime: 100, status: 'waiting' },
    ],
    3: [ // IT help desk — 3 people
      { id: 301, name: 'Noah Brown', position: 1, waitTime: 15, status: 'almost-ready' },
      { id: 302, name: 'Olivia Davis', position: 2, waitTime: 30, status: 'waiting' },
      { id: 303, name: 'Pedro Lopez', position: 3, waitTime: 45, status: 'waiting' },
    ],
    4: [ // registrar — 12 people
      { id: 401, name: 'Quinn Wilson', position: 1, waitTime: 25, status: 'almost-ready' },
      { id: 402, name: 'Rachel Moore', position: 2, waitTime: 50, status: 'waiting' },
      { id: 403, name: 'Sam Taylor', position: 3, waitTime: 75, status: 'waiting' },
      { id: 404, name: 'Tina Anderson', position: 4, waitTime: 100, status: 'waiting' },
      { id: 405, name: 'Uma Jackson', position: 5, waitTime: 125, status: 'waiting' },
      { id: 406, name: 'Victor Harris', position: 6, waitTime: 150, status: 'waiting' },
      { id: 407, name: 'Wendy Martin', position: 7, waitTime: 175, status: 'waiting' },
      { id: 408, name: 'Xander Garcia', position: 8, waitTime: 200, status: 'waiting' },
      { id: 409, name: 'Yara Robinson', position: 9, waitTime: 225, status: 'waiting' },
      { id: 410, name: 'Zoe Clark', position: 10, waitTime: 250, status: 'waiting' },
      { id: 411, name: 'Aaron Lewis', position: 11, waitTime: 275, status: 'waiting' },
      { id: 412, name: 'Beth Walker', position: 12, waitTime: 300, status: 'waiting' },
    ],
  }
  
  export const MOCK_HISTORY = [
    { id: 1, service: 'Academic Advising', date: '2025-06-10', outcome: 'Served', waitTime: 22 },
    { id: 2, service: 'IT Help Desk', date: '2025-06-08', outcome: 'Served', waitTime: 10 },
    { id: 3, service: 'Financial Aid Office', date: '2025-05-30', outcome: 'Left Queue', waitTime: 45 },
    { id: 4, service: 'Registrar Office', date: '2025-05-22', outcome: 'Served', waitTime: 18 },
  ]
  
  export const MOCK_NOTIFICATIONS = [
    { id: 1, message: "You're 2nd in line at Academic Advising!", type: 'alert', time: '2 min ago' },
    { id: 2, message: 'IT Help Desk queue is now open.', type: 'info', time: '1 hr ago' },
    { id: 3, message: 'Your turn at Registrar Office was served.', type: 'success', time: 'Yesterday' },
  ]
  
  // Preset admin account
  export const ADMIN_ACCOUNT = { email: 'admin@queuesmart.com', password: 'admin123', name: 'Admin User' }