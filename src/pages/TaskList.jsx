import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function TaskList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load tasks from MongoDB
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/tasks", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch tasks");
        }

        setTasks(data);
      } catch (error) {
        console.error("Fetch tasks error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  // Read status filter from dashboard URL
  useEffect(() => {
    const status = searchParams.get("status");

    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();

    const assignedName =
      task.assignedTo?.name?.toLowerCase() || "";

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      task.description.toLowerCase().includes(searchText) ||
      assignedName.includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority-high") {
      const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3,
      };

      return (
        priorityOrder[a.priority] -
        priorityOrder[b.priority]
      );
    }

    if (sortBy === "priority-low") {
      const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3,
      };

      return (
        priorityOrder[b.priority] -
        priorityOrder[a.priority]
      );
    }

    if (sortBy === "newest") {
      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    }

    if (sortBy === "oldest") {
      return (
        new Date(a.createdAt) -
        new Date(b.createdAt)
      );
    }

    return 0;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setSortBy("newest");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="task-page">
        <main className="task-content">
          <h2>Loading tasks...</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="task-page">

      <header className="task-header">
        <div>
          <h1>Employee Task Manager</h1>
          <p>Task List</p>
        </div>

        <div className="task-header-buttons">

          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>

          <button onClick={() => navigate("/add-task")}>
            + Add Task
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>
      </header>

      <main className="task-content">

        <div className="task-title-section">
          <h2>All Tasks</h2>

          <p>
            Search, filter and manage employee tasks.
          </p>
        </div>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {/* Search & Filters */}

        <div className="task-filters">

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

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

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
          >
            <option value="All">
              All Priority
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

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="priority-high">
              Priority: High → Low
            </option>

            <option value="priority-low">
              Priority: Low → High
            </option>
          </select>

          <button
            className="clear-filter-button"
            onClick={clearFilters}
          >
            Clear
          </button>

        </div>

        {/* Task Count */}

        <p className="task-count">
          Showing {sortedTasks.length} of{" "}
          {tasks.length} tasks
        </p>

        {/* Task Table */}

        <div className="task-table-container">

          <table className="task-table">

            <thead>
              <tr>
                <th>Task</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {sortedTasks.length > 0 ? (

                sortedTasks.map((task) => (

                  <tr key={task._id}>

                    <td>
                      <strong>
                        {task.title}
                      </strong>

                      <p className="task-description">
                        {task.description}
                      </p>
                    </td>

                    <td>
                      {task.assignedTo?.name ||
                        "Unassigned"}
                    </td>

                    <td>
                      {new Date(
                        task.dueDate
                      ).toLocaleDateString("en-GB")}
                    </td>

                    <td>
                      <span
                        className={`priority-badge ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${task.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="view-button"
                        onClick={() =>
                          navigate(
                            `/tasks/${task._id}`
                          )
                        }
                      >
                        View
                      </button>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="no-tasks"
                  >
                    No tasks found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}

export default TaskList;