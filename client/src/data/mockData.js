export const services = [
    {
      id: 1,
      name: "Academic Advising",
      description: "Meet with an advisor",
      expectedDuration: 15,
      priority: "medium",
      isOpen: true,
      queue: [
        { userId: 101, name: "John Doe", status: "waiting" },
        { userId: 102, name: "Jane Smith", status: "almost ready" }
      ]
    },
    {
      id: 2,
      name: "IT Support",
      description: "Technical help",
      expectedDuration: 10,
      priority: "high",
      isOpen: true,
      queue: []
    }
  ];
  
  export const history = [
    {
      id: 1,
      serviceName: "Academic Advising",
      date: "2026-02-01",
      outcome: "Served"
    }
  ];
  
  export const notifications = [
    { id: 1, message: "You are now 2nd in line." }
  ];
  