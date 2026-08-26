import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddTask() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("Pending");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !dueDate || !priority) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user?.id) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            assignedTo: user.id,
            dueDate,
            priority,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create task"
        );
      }

      alert("Task created successfully!");

      navigate("/tasks");
    } catch (error) {
      console.error("Create task error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loggedInUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  return (
    <div className="add-task-page">

      <header className="task-header">
        <div>
          <h1>Employee Task Manager</h1>
          <p>Add New Task</p>
        </div>

        <div className="task-header-buttons">

          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>

          <button onClick={() => navigate("/tasks")}>
            Task List
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </button>

        </div>
      </header>

      <main className="add-task-content">

        <div className="add-task-card">

          <h2>Create New Task</h2>

          <p className="form-subtitle">
            Enter the task details below.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="title">
                Task Title *
              </label>

              <input
                id="title"
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description *
              </label>

              <textarea
                id="description"
                placeholder="Enter task description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="assignedTo">
                Assigned To
              </label>

              <input
                id="assignedTo"
                type="text"
                value={loggedInUser.name || ""}
                disabled
              />

              <small>
                Task will be assigned to the logged-in employee.
              </small>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="dueDate">
                  Due Date *
                </label>

                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">
                  Priority *
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value)
                  }
                >
                  <option value="">
                    Select Priority
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>
                </select>
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>
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
                onClick={() => navigate("/tasks")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Task"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default AddTask;