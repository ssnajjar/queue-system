import { services } from "../../data/mockData";

export default function QueueManagement() {
  const service = services[0];

  return (
    <div>
      <h2>Queue Management</h2>
      {service.queue.map((u, index) => (
        <div key={index}>
          {u.name} — {u.status}
          <button>Remove</button>
        </div>
      ))}
      <button>Serve Next User</button>
    </div>
  );
}
