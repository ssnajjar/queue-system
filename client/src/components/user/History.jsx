import { history } from "../../data/mockData";

export default function History() {
  return (
    <div>
      <h2>Queue History</h2>
      {history.map(h => (
        <div key={h.id}>
          {h.date} — {h.serviceName} — {h.outcome}
        </div>
      ))}
    </div>
  );
}
