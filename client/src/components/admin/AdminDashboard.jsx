import { services } from "../../data/mockData";

export default function AdminDashboard() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      {services.map(s => (
        <div key={s.id}>
          {s.name} | Queue: {s.queue.length}
          <button>{s.isOpen ? "Close" : "Open"}</button>
        </div>
      ))}
    </div>
  );
}
