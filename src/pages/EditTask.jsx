import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditTask() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("Create Login Page");
  const [description, setDescription] = useState(
    "Build a responsive login page with email and password validation."
  );
  const [assignedTo, setAssignedTo] = useState("Siddhesh");
  const [dueDate, setDueDate] = useState("2026-08-25");
  const [priority, setPriority] = useState("High");
  const [status, setStatus] = useState("Completed");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !description || !assignedTo || !dueDate || !priority) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");

    console.log("Updated Task:", {
      id,
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      status,
    });

    alert("Task updated successfully!");

    navigate(`/tasks/${id}`);
  };

  return (
    <div className="add-task-page">

      <header className="task-header">
        <div>
          <h1>Employee Task Manager</h1>
          <p>Edit Task</p>
        </div>

        <div className="task-header-buttons">
          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>

          <button onClick={() => navigate("/tasks")}>
            Task List
          </button>

          <button onClick={() => {

            localStorage.removeItem("isLoggedIn");
            navigate("/login");
          }}
            >
            Logout
          </button>
        </div>
      </header>

      <main className="add-task-content">

        <div className="add-task-card">

          <h2>Edit Task</h2>

          <p className="form-subtitle">
            Update the task information below.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Task Title *</label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description *</label>

              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Assigned To *</label>

              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Due Date *</label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Priority *</label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            <div className="form-buttons">

              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate(`/tasks/${id}`)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="submit-button"
              >
                Update Task
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default EditTask;