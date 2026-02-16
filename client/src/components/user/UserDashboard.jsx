import { services, notifications } from "../../data/mockData";

export default function UserDashboard() {
  return (
    <div>
      <h2>User Dashboard</h2>

      <h3>Available Services</h3>
      {services.map(s => (
        <div key={s.id}>
          {s.name} — {s.queue.length} waiting
        </div>
      ))}

      <h3>Notifications</h3>
      {notifications.map(n => <p key={n.id}>{n.message}</p>)}
    </div>
  );
}
