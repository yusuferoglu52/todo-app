const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = loadTasksFromStorage();
let currentFilter = "all";

function loadTasksFromStorage() {
  const raw = JSON.parse(localStorage.getItem("tasks")) || [];
  return raw.map((task, i) => ({
    id: task.id != null ? task.id : `task-${Date.now()}-${i}`,
    text: task.text,
    completed: !!task.completed
  }));
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

clearCompletedBtn.addEventListener("click", function () {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

filterButtons.forEach(button => {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    renderTasks();
  });
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskCount() {
  const activeTasks = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? "s" : ""} left`;
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    if (task.completed) {
      li.classList.add("completed");
    }

    const taskLeft = document.createElement("div");
    taskLeft.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", function () {
      const t = tasks.find(x => x.id === task.id);
      if (t) t.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    span.addEventListener("click", function () {
      const t = tasks.find(x => x.id === task.id);
      if (t) t.completed = !t.completed;
      saveTasks();
      renderTasks();
    });

    taskLeft.appendChild(checkbox);
    taskLeft.appendChild(span);

    const taskButtons = document.createElement("div");
    taskButtons.className = "task-buttons";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";

    editBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      beginInlineEdit(li, task.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    deleteBtn.addEventListener("click", function () {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskButtons.appendChild(editBtn);
    taskButtons.appendChild(deleteBtn);

    li.appendChild(taskLeft);
    li.appendChild(taskButtons);

    taskList.appendChild(li);
  });

  updateTaskCount();
}

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") return;

  tasks.push({
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: taskText,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = "";
}

function beginInlineEdit(li, taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const taskLeft = li.querySelector(".task-left");
  const span = taskLeft.querySelector(".task-text");
  if (!span || taskLeft.querySelector(".task-edit-input")) return;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task-edit-input";
  input.value = task.text;

  let closed = false;

  const abandon = () => {
    if (closed) return;
    closed = true;
    renderTasks();
  };

  const commit = () => {
    if (closed) return;
    closed = true;
    const trimmed = input.value.trim();
    if (trimmed === "") {
      renderTasks();
      return;
    }
    task.text = trimmed;
    saveTasks();
    renderTasks();
  };

  input.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") {
      ev.preventDefault();
      commit();
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      abandon();
    }
  });

  input.addEventListener("blur", commit);

  span.replaceWith(input);
  input.focus();
  input.select();
}

renderTasks();