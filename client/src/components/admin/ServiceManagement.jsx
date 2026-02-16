export default function ServiceManagement() {
    const [service, setService] = React.useState({
      name: "",
      description: "",
      expectedDuration: "",
      priority: "low"
    });
  
    const save = () => {
      if (!service.name || service.name.length > 100) return alert("Invalid name");
      if (!service.description) return alert("Description required");
      if (!service.expectedDuration) return alert("Duration required");
      alert("Service saved (mock)");
    };
  
    return (
      <div>
        <h2>Service Management</h2>
        <input placeholder="Service Name" onChange={e => setService({ ...service, name: e.target.value })} />
        <textarea placeholder="Description" onChange={e => setService({ ...service, description: e.target.value })} />
        <input type="number" placeholder="Expected Duration"
          onChange={e => setService({ ...service, expectedDuration: e.target.value })} />
        <select onChange={e => setService({ ...service, priority: e.target.value })}>
          <option>low</option>
          <option>medium</option>
          <option>high</option>
        </select>
        <button onClick={save}>Save</button>
      </div>
    );
  }
  