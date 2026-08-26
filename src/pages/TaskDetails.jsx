import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function TaskDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load task from MongoDB
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/tasks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load task"
          );
        }

        setTask(data);
        setStatus(data.status);
        setPriority(data.priority);
      } catch (error) {
        console.error("Fetch task error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate]);

  // Update task
  const handleUpdate = async () => {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            priority,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update task"
        );
      }

      setTask(data.task);

      alert("Task updated successfully!");

      navigate("/tasks");
    } catch (error) {
      console.error("Update task error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="task-details-page">
        <main className="task-details-content">
          <h2>Loading task...</h2>
        </main>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="task-details-page">
        <main className="task-details-content">
          <p className="form-error">{error}</p>

          <button onClick={() => navigate("/tasks")}>
            Back to Tasks
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="task-details-page">

      <header className="task-header">
        <div>
          <h1>Employee Task Manager</h1>
          <p>Task Details</p>
        </div>

        <div className="task-header-buttons">

          <button
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/tasks")}
          >
            Task List
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>
      </header>

      <main className="task-details-content">

        <div className="task-details-card">

          <div className="details-top">

            <div>
              <p className="task-id">
                Task #{task._id}
              </p>

              <h2>{task.title}</h2>
            </div>

            <span
              className={`status-badge ${task.status
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {task.status}
            </span>

          </div>

          <div className="task-detail-info">

            <p>
              <strong>Description:</strong>
            </p>

            <p>
              {task.description || "No description"}
            </p>

            <p>
              <strong>Assigned To:</strong>{" "}
              {task.assignedTo?.name ||
                "Unassigned"}
            </p>

            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(
                task.dueDate
              ).toLocaleDateString("en-GB")}
            </p>

          </div>

          <div className="details-actions">

            <div className="form-group">
              <label htmlFor="priority">
                Priority
              </label>

              <select
                id="priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
              >
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

          </div>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <div className="form-buttons">

            <button
              className="back-button"
              onClick={() => navigate("/tasks")}
            >
              Back to Tasks
            </button>

            <button
              className="submit-button"
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : "Update Task"}
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default TaskDetails;