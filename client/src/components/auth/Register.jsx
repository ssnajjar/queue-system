export default function Register() {
    const [form, setForm] = React.useState({ email: "", password: "" });
    const [error, setError] = React.useState("");
  
    const submit = () => {
      if (!form.email || !form.password) {
        setError("All fields required");
        return;
      }
      if (form.password.length < 6) {
        setError("Password too short");
        return;
      }
      alert("Registered (mock)");
    };
  
    return (
      <div>
        <h2>Register</h2>
        <input type="email" placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })} />
        {error && <p>{error}</p>}
        <button onClick={submit}>Register</button>
      </div>
    );
  }
  