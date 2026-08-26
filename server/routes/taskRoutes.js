const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET all tasks
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});

// GET dashboard statistics
router.get("/stats", protect, async (req, res) => {
  try {
    const total = await Task.countDocuments();

    const pending = await Task.countDocuments({
      status: "Pending",
    });

    const inProgress = await Task.countDocuments({
      status: "In Progress",
    });

    const completed = await Task.countDocuments({
      status: "Completed",
    });

    res.json({
      total,
      pending,
      inProgress,
      completed,
    });
  } catch (error) {
    console.error("Get task statistics error:", error);

    res.status(500).json({
      message: "Failed to fetch task statistics",
    });
  }
});

// GET single task
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email"
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);

    res.status(500).json({
      message: "Failed to fetch task",
    });
  }
});

// CREATE task
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      status,
    } = req.body;

    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({
        message: "Title, assignedTo and dueDate are required",
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      dueDate,
      priority: priority || "Medium",
      status: status || "Pending",
    });

    const populatedTask = await task.populate(
      "assignedTo",
      "name email"
    );

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
});

// UPDATE task
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
});

// DELETE task
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});

module.exports = router;