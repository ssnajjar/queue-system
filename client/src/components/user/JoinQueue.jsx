import { services } from "../../data/mockData";

export default function JoinQueue() {
  const [selected, setSelected] = React.useState(null);

  return (
    <div>
      <h2>Join Queue</h2>
      <select onChange={e => setSelected(services.find(s => s.id == e.target.value))}>
        <option>Select service</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {selected && (
        <>
          <p>Estimated wait: {selected.queue.length * selected.expectedDuration} minutes</p>
          <button>Join Queue</button>
          <button>Leave Queue</button>
        </>
      )}
    </div>
  );
}
