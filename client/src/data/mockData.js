// Mock data for the queue system

export const services = [
    {
      id: 1,
      name: "Customer Support",
      description: "General customer service and inquiries",
      expectedDuration: 10,
      priority: "medium",
      isOpen: true,
      queue: [
        { name: "John Doe", email: "john@example.com", status: "waiting", priority: "normal" },
        { name: "Jane Smith", email: "jane@example.com", status: "waiting", priority: "normal" },
        { name: "Bob Johnson", email: "bob@example.com", status: "waiting", priority: "high" }
      ]
    },
    {
      id: 2,
      name: "Technical Support",
      description: "Technical issues and troubleshooting",
      expectedDuration: 15,
      priority: "high",
      isOpen: true,
      queue: [
        { name: "Alice Brown", email: "alice@example.com", status: "waiting", priority: "normal" },
        { name: "Charlie Davis", email: "charlie@example.com", status: "waiting", priority: "medium" }
      ]
    },
    {
      id: 3,
      name: "Billing Department",
      description: "Billing questions and payment support",
      expectedDuration: 8,
      priority: "low",
      isOpen: false,
      queue: []
    }
  ];
  
  export const notifications = [
    {
      id: 1,
      message: "Your turn is coming up! You are 2nd in line.",
      timestamp: "2 minutes ago",
      type: "info"
    },
    {
      id: 2,
      message: "New service 'Technical Support' is now available",
      timestamp: "1 hour ago",
      type: "success"
    },
    {
      id: 3,
      message: "Reminder: You have an appointment at 3:00 PM",
      timestamp: "3 hours ago",
      type: "warning"
    }
  ];
  
  export const history = [
    {
      id: 1,
      date: "2024-02-15",
      serviceName: "Customer Support",
      waitTime: "12 minutes",
      outcome: "Completed"
    },
    {
      id: 2,
      date: "2024-02-14",
      serviceName: "Technical Support",
      waitTime: "18 minutes",
      outcome: "Completed"
    },
    {
      id: 3,
      date: "2024-02-13",
      serviceName: "Billing Department",
      waitTime: "5 minutes",
      outcome: "Cancelled"
    },
    {
      id: 4,
      date: "2024-02-12",
      serviceName: "Customer Support",
      waitTime: "15 minutes",
      outcome: "Completed"
    }
  ];