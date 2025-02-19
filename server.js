const express = require("express");
const app = express();
const port = 2000;
const mongoose = require("mongoose");

require("dotenv").config();
console.log("MONGO_URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.static("main"));
app.use(express.json());

//
/*creating the blueprint for each "Todo" */
const todoSchema = new mongoose.Schema({
  task: { type: String, required: true }, // Task name (required)
  completed: { type: Boolean, default: false }, // Completion status (default: false)
});

// Create and export the Todo model
const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;

app.get("/todo", async (req, res) => {
  const oldTodos = await Todo.find();
  res.json(oldTodos);
});

app.post("/todos", async (req, res) => {
  const { task, completed } = req.body;
  console.log({ task, completed });
  // res.send({ status: "recieved" });
  const newTodo = new Todo({ task, completed });
  const savedTodo = await newTodo.save();
  console.log("Saved To-Do: " + savedTodo);
  res.json(savedTodo);
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const deletedTodo = await Todo.findByIdAndDelete(id);
  res.json({ message: "todo deleted successfully", deletedTodo });
});

app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const todo = await Todo.findById(id);
  const updatedTodo = await Todo.findByIdAndUpdate(
    id,
    { $set: { completed: !todo.completed } },
    { new: true }
  );

  res.json({ message: "Todo updated", updatedTodo });
});

app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const todo = await Todo.findById(id);
  res.json(todo);
});

app.listen(
  port,
  console.log("✅ server has started on http://localhost:" + port)
);
