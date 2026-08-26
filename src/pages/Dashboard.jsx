import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        // Get statistics
        const statsResponse = await fetch(
          "http://localhost:5000/api/tasks/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const statsData = await statsResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message || "Failed to load statistics"
          );
        }

        setStats(statsData);

        // Get recent tasks
        const tasksResponse = await fetch(
          "http://localhost:5000/api/tasks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const tasksData = await tasksResponse.json();

        if (!tasksResponse.ok) {
          throw new Error(
            tasksData.message || "Failed to load tasks"
          );
        }

        setTasks(tasksData);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const completionPercentage =
    stats.total > 0
      ? Math.round(
        (stats.completed / stats.total) * 100
      )
      : 0;

  const chartData = [
    {
      name: "Completed",
      value: stats.completed,
    },
    {
      name: "In Progress",
      value: stats.inProgress,
    },
    {
      name: "Pending",
      value: stats.pending,
    },
  ];

  // Calculate overdue tasks from real MongoDB tasks
  const overdueTasks = tasks.filter((task) => {
    if (task.status === "Completed") {
      return false;
    }

    if (!task.dueDate) {
      return false;
    }

    const dueDate = new Date(task.dueDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return dueDate < today;
  }).length;

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <h2>Loading dashboard...</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Header */}

      <header className="dashboard-header">

        <div>
          <h1>Employee Task Manager</h1>
          <p>Dashboard</p>
        </div>

        <div className="dashboard-header-buttons">

          <button
            onClick={() => navigate("/tasks")}
          >
            View Tasks
          </button>

          <button
            onClick={() => navigate("/add-task")}
          >
            + Add Task
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </header>

      {/* Main */}

      <main className="dashboard-content">

        <div className="dashboard-welcome">

          <h2>Welcome Back 👋</h2>

          <p>
            Here's an overview of your employee tasks.
          </p>

        </div>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {/* Statistics */}

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">📋</div>

            <div>
              <p>Total Tasks</p>
              <h3>{stats.total}</h3>
            </div>

          </div>

          <div
            className="stat-card completed-card clickable-card"
            onClick={() =>
              navigate("/tasks?status=Completed")
            }
          >

            <div className="stat-icon">✅</div>

            <div>
              <p>Completed</p>
              <h3>{stats.completed}</h3>
            </div>

          </div>

          <div
            className="stat-card progress-card clickable-card"
            onClick={() =>
              navigate("/tasks?status=In Progress")
            }
          >

            <div className="stat-icon">🔄</div>

            <div>
              <p>In Progress</p>
              <h3>{stats.inProgress}</h3>
            </div>

          </div>

          <div
            className="stat-card pending-card clickable-card"
            onClick={() =>
              navigate("/tasks?status=Pending")
            }
          >

            <div className="stat-icon">⏳</div>

            <div>
              <p>Pending</p>
              <h3>{stats.pending}</h3>
            </div>

          </div>

          <div className="stat-card overdue-card">

            <div className="stat-icon">🔴</div>

            <div>
              <p>Overdue</p>
              <h3>{overdueTasks}</h3>
            </div>

          </div>

        </div>

        {/* Progress */}

        <div className="progress-section">

          <div className="section-heading">

            <div>
              <h2>Task Completion</h2>

              <p>
                Overall task completion progress
              </p>
            </div>

            <strong>
              {completionPercentage}%
            </strong>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${completionPercentage}%`,
              }}
            ></div>

          </div>

        </div>

        {/* Status Breakdown */}

        <div className="status-breakdown">

          <div className="section-heading">

            <div>
              <h2>Task Status Breakdown</h2>

              <p>
                Current distribution of employee tasks
              </p>
            </div>

          </div>

          <div className="breakdown-grid">

            <div className="breakdown-item">
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>

            <div className="breakdown-item">
              <span>In Progress</span>
              <strong>{stats.inProgress}</strong>
            </div>

            <div className="breakdown-item">
              <span>Pending</span>
              <strong>{stats.pending}</strong>
            </div>

            <div className="breakdown-item">
              <span>Overdue</span>
              <strong>{overdueTasks}</strong>
            </div>

          </div>

        </div>

        {/* Task Status Chart */}

        <div className="task-chart-section">

          <div className="section-heading">

            <div>
              <h2>Task Status Chart</h2>

              <p>
                Distribution of employee tasks by status
              </p>
            </div>

          </div>

          <div className="task-chart">

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >

                  <Cell fill="#16a34a"/>
                  <Cell fill="#2563eb" />
                  <Cell fill="#f59e0b"/>

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Recent Tasks */}

        <div className="recent-tasks">

          <div className="section-heading">

            <div>
              <h2>Recent Tasks</h2>

              <p>
                Latest employee tasks
              </p>
            </div>

            <button
              className="view-all-button"
              onClick={() => navigate("/tasks")}
            >
              View All
            </button>

          </div>

          <div className="recent-task-list">

            {tasks.length > 0 ? (

              tasks.slice(0, 4).map((task) => (

                <div
                  className="recent-task-item"
                  key={task._id}
                >

                  <div className="recent-task-info">

                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      Assigned to{" "}
                      {task.assignedTo?.name ||
                        "Unassigned"}
                    </span>

                  </div>

                  <div className="recent-task-status">

                    <span
                      className={`priority-badge ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>

                    <span
                      className={`status-badge ${task.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {task.status}
                    </span>

                  </div>

                </div>

              ))

            ) : (

              <p>
                No tasks available.
              </p>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;