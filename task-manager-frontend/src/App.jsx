
import { useEffect, useState } from "react";
import "./App.css";
const API = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load tasks");
      setTasks(await response.json());
      setError("");
    } catch {
      setError("Cannot connect to the server. Check your backend.");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) throw new Error("Could not add task");

      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
      setTitle("");
      setError("");
    } catch {
      setError("Failed to add task. Check your backend.");
    }
  }

  async function updateStatus(id, status) {
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Update failed");

      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((task) => task._id === id ? updatedTask : task)
      );
    } catch {
      setError("Failed to update task status.");
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setTasks((prev) => prev.filter((task) => task._id !== id));
      setError("");
    } catch {
      setError("Failed to delete task.");
    }
  }

  return (
    <main className="app">
      <header>
        <h1>Task Manager</h1>
        <p>Organize your work, one task at a time.</p>
      </header>

      <form className="task-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="Enter a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {error && <p className="error">{error}</p>}

      <h2>My Tasks ({tasks.length})</h2>

      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Add your first task!</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <article className="task" key={task._id}>
              <div className="task-info">
                <strong>{task.title}</strong>
                <span className={`status ${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </div>

              <div className="actions">
                <select
                  aria-label={`Status for ${task.title}`}
                  value={task.status}
                  onChange={(e) =>
                    updateStatus(task._id, e.target.value)
                  }
                >
                  <option>Pending</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                </select>

                <button
                  className="delete"
                  onClick={() => deleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default App;
