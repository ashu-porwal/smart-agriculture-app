const express = require('express');
const Task = require('../models/Task');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Create task
router.post('/', authenticate, async (req, res) => {
  try {
    const { cropName, taskName, taskDate, description, priority } = req.body;

    if (!cropName || !taskName || !taskDate) {
      return res.status(400).json({ message: 'Crop name, task name, and date are required' });
    }

    const task = new Task({
      userId: req.userId,
      cropName,
      taskName,
      taskDate,
      description,
      priority,
    });

    await task.save();
    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ taskDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task status
router.put('/:taskId', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status;
    await task.save();
    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task
router.delete('/:taskId', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
