const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const foundUser = users.find((u) => u.username === username);

  if (!foundUser) {
    return response
      .status(400)
      .json({ error: `username ${username} not found` });
  }

  request.foundUser = foundUser;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const duplicateUsername = users.some((u) => u.username === username);

  if (duplicateUsername) {
    return response.status(400).json({ error: "Username already created" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { foundUser } = request;

  return response.status(200).json(foundUser.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { foundUser } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  foundUser.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { foundUser } = request;
  const { title, deadline } = request.body;

  const { id } = request.params;

  const foundTodo = foundUser.todos.find((t) => t.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: "ToDo item not found" });
  }

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);

  return response.status(200).json(foundTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { foundUser } = request;

  const foundTodo = foundUser.todos.find((t) => t.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  foundTodo.done = true;

  return response.status(201).json(foundTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { foundUser } = request;

  const todoIndex = foundUser.todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo item not found" });
  }

  foundUser.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
