const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Todo = require("../models/todo.model");

exports.createTodo = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }

  req.body.user = req.user.id;

  const todo = await Todo.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Todo created successfully",
    data: {
      todo,
    },
  });
});

exports.getTodos = asyncHandler(async (req, res, next) => {
  const { status, priority, category, sortBy = "-createdAt" } = req.query;

  const filter = { user: req.user.id };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  const todos = await Todo.find(filter)
    .sort(sortBy)
    .populate("user", "name email");

  res.status(200).json({
    status: "success",
    results: todos.length,
    data: {
      todos,
    },
  });
});

exports.getTodo = asyncHandler(async (req, res, next) => {
  const todo = await Todo.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (!todo) {
    return res.status(404).json({
      status: "fail",
      message: "Todo not found",
    });
  }

  if (todo.user._id.toString() !== req.user.id) {
    return res.status(403).json({
      status: "fail",
      message: "Not authorized to access this todo",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      todo,
    },
  });
});

exports.updateTodo = asyncHandler(async (req, res, next) => {
  let todo = await Todo.findById(req.params.id);

  if (!todo) {
    return res.status(404).json({
      status: "fail",
      message: "Todo not found",
    });
  }

  if (todo.user.toString() !== req.user.id) {
    return res.status(403).json({
      status: "fail",
      message: "Not authorized to update this todo",
    });
  }

  todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Todo updated successfully",
    data: {
      todo,
    },
  });
});

exports.deleteTodo = asyncHandler(async (req, res, next) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    return res.status(404).json({
      status: "fail",
      message: "Todo not found",
    });
  }

  if (todo.user.toString() !== req.user.id) {
    return res.status(403).json({
      status: "fail",
      message: "Not authorized to delete this todo",
    });
  }

  await Todo.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Todo deleted successfully",
    data: null,
  });
});

exports.getStats = asyncHandler(async (req, res, next) => {
  const userObjectId = new mongoose.Types.ObjectId(req.user.id);

  const stats = await Todo.aggregate([
    {
      $match: {
        user: userObjectId,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await Todo.aggregate([
    {
      $match: {
        user: userObjectId,
      },
    },
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalTodos = await Todo.countDocuments({ user: req.user.id });
  const completedTodos = await Todo.countDocuments({
    user: req.user.id,
    status: "completed",
  });
  const pendingTodos = await Todo.countDocuments({
    user: req.user.id,
    status: "pending",
  });
  const inProgressTodos = await Todo.countDocuments({
    user: req.user.id,
    status: "in-progress",
  });

  res.status(200).json({
    status: "success",
    data: {
      total: totalTodos,
      completed: completedTodos,
      pending: pendingTodos,
      inProgress: inProgressTodos,
      statusBreakdown: stats,
      priorityBreakdown: priorityStats,
      completionPercentage:
        totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
    },
  });
});

exports.completeTodo = asyncHandler(async (req, res, next) => {
  let todo = await Todo.findById(req.params.id);

  if (!todo) {
    return res.status(404).json({
      status: "fail",
      message: "Todo not found",
    });
  }

  if (todo.user.toString() !== req.user.id) {
    return res.status(403).json({
      status: "fail",
      message: "Not authorized to update this todo",
    });
  }

  todo = await Todo.findByIdAndUpdate(
    req.params.id,
    {
      status: "completed",
      isCompleted: true,
    },
    {
      new: true,
    },
  );

  res.status(200).json({
    status: "success",
    message: "Todo marked as completed",
    data: {
      todo,
    },
  });
});
