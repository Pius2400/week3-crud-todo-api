const express = require('express');
const Joi = require('joi');

const app = express();
app.use(express.json());

// In-memory array to hold todos
let todos = [
  { id: 1, task: 'Complete assignment', completed: false }
];

// 1. LOGGING MIDDLEWARE (Applies to all requests)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 2. JOI VALIDATION SCHEMA & MIDDLEWARE
const todoSchema = Joi.object({
  task: Joi.string().min(3).required(),
  completed: Joi.boolean().optional()
});

const validateTodo = (req, res, next) => {
  const { error } = todoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// 3. ROUTES WITH TRY/CATCH

// Route 1: GET /todos
app.get('/todos', async (req, res, next) => {
  try {
    res.json(todos);
  } catch (err) {
    next(err);
  }
});

// Route 2: POST /todos
app.post('/todos', validateTodo, async (req, res, next) => {
  try {
    const { task } = req.body;

    // Simulated error trigger for testing 500 error handler
    if (task === 'trigger-error') {
      throw new Error('Database server failure');
    }

    const newTodo = {
      id: todos.length + 1,
      task,
      completed: false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
});

// Route 3: PATCH /todos/:id
app.patch('/todos/:id', validateTodo, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (req.body.task) todo.task = req.body.task;
    if (req.body.completed !== undefined) todo.completed = req.body.completed;

    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// 4. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));