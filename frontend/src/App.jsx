import { useEffect, useState } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  const load = () =>
    fetch('/api/tasks').then((r) => r.json()).then(setTasks).catch(() => {});

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setTitle('');
    load();
  };

  return (
    <main>
      <h1>Task Manager</h1>
      <form onSubmit={add}>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
               placeholder="New task" />
        <button type="submit">Add</button>
      </form>
      <ul>{tasks.map((t) => <li key={t._id}>{t.title}</li>)}</ul>
    </main>
  );
}
