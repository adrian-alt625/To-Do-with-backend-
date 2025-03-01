const express = require("express");
const app = express();
const port = 2000;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

app.use(cors());

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
  listId: { type: mongoose.Schema.Types.ObjectId, ref: "List", required: true },
});

// Create and export the Todo model
const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;

app.get("/todo", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.json({ message: "user ID not found " });
  }
  const oldTodos = await Todo.find({ userId });
  res.json(oldTodos);
});

app.post("/todos", async (req, res) => {
  const { task, completed, userId } = req.body;
  console.log({ task, completed, userId });
  // res.send({ status: "recieved" });
  const newTodo = new Todo({ task, completed, userId });
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

app.delete("/todos", async (req, res) => {
  const { userId } = req.query;
  await Todo.deleteMany({ userId });
  res.json({ message: "Todos for user deleted" });
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);
module.exports = User;

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    //check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ message: "Username already taken " });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    //create new user
    const newUser = new User({ username, password: hashedPassword });
    const savedUser = await newUser.save();
    console.log("saved user:", savedUser);

    res.json({
      message: "New user created successfully",
      userId: savedUser._id,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.json({ message: "Serving error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.json({ message: "user not found " });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.json({ message: "Incorrect password" });
  }

  res.json({ message: "login successful", userId: user._id });
});

app.patch("/users/:id/change-username", async (req, res) => {
  const { id } = req.params;
  const { newUsername } = req.body;
  console.log(id);
  console.log(newUsername);

  if (!newUsername) {
    return res.json({ message: "New username is required" });
  }

  const existingUser = await User.findOne({ username: newUsername });
  if (existingUser) {
    return res.json({ message: "Username is already taken." });
  }

  await User.findByIdAndUpdate(id, { username: newUsername });
  res.json({ message: "username updated." });
});

app.patch("/users/:id/change-password", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.json({ message: "Incorrect current password" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  await User.findByIdAndUpdate(id, { password: hashedNewPassword });
  res.json({ message: "Password updated successfully" });
});

app.delete("/users/:id/delete-account", async (req, res) => {
  const { id } = req.params;

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    return res.json({ message: "user not found" });
  }
  res.json({ message: "account deleted" });
});

const listSchema = new mongoose.Schema({
  listName: { type: String, required: true }, // Task name (required)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
const Lists = mongoose.model("List", listSchema);
module.exports = Lists;

app.post("/lists", async (req, res) => {
  const { listName, userId } = req.body;
  if (!listName || !userId) {
    return res.json({ error: "listname or userId is missing " });
  }

  const newList = new Lists({
    listName,
    userId,
  });
  await newList.save();
  res.json({
    message: "new list created ",
    listId: newList._id,
    listName: listName,
  });
});

app.get("/lists/:id", async (req, res) => {
  const { id } = req.params;
  const lists = await Lists.find({
    userId: new mongoose.Types.ObjectId(id),
  });
  console.log(id);
  res.json(lists);
});

app.listen(
  port,
  console.log("✅ server has started on http://localhost:" + port)
);
