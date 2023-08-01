const myForm = document.getElementById("myForm");
const descriptionInput = document.getElementById("descriptionInput");
const datetimeInput = document.getElementById("datetimeInput");
const listDiv = document.getElementById("listDiv");
const sortOrder = document.getElementById("sortOrder");

let tasks = [];

myForm.addEventListener("submit", submitNewTask);

function submitNewTask(event) {
  event.preventDefault();

  let task = {
    description: descriptionInput.value,
    timeLeft: datetimeInput.value,
    completed: false,
    timestamp: Date.now(),
  };

  tasks.push(task);
  saveTasksToSessionStorage();

  descriptionInput.value = "";
  datetimeInput.value = "";

  displayTasks();
}

function saveTasksToSessionStorage() {
  sessionStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromSessionStorage() {
  const savedTasks = sessionStorage.getItem("tasks");
  tasks = savedTasks ? JSON.parse(savedTasks) : [];
}

function checkboxChange(index, checked) {
  tasks[index].completed = checked;
  saveTasksToSessionStorage();
  displayTasks();
}

function calculateTimeRemaining(deadline) {
  const taskDate = new Date(deadline);
  const currentTimestamp = Date.now();
  const timeRemaining = taskDate.getTime() - currentTimestamp;

  if (timeRemaining <= 0) {
    const year = taskDate.getFullYear();
    const month = String(taskDate.getMonth() + 1).padStart(2, "0");
    const date = String(taskDate.getDate()).padStart(2, "0");
    const hours = String(taskDate.getHours()).padStart(2, "0");
    const minutes = String(taskDate.getMinutes()).padStart(2, "0");
    return {
      message: `The deadline has passed. The task was due on ${year}-${month}-${date} at ${hours}:${minutes}.`,
    };
  } else {
    const remainingDays = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const remainingMinutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );

    let message = "Time Left: ";

    if (remainingDays > 0) {
      message += `${remainingDays} days, `;
    }
    if (remainingHours > 0 || remainingDays > 0) {
      message += `${remainingHours} hours, `;
    }
    message += `${remainingMinutes} minutes`;

    return {
      message: message,
      fullDate: taskDate.toDateString(),
    };
  }
}

function displayTasks() {
  loadTasksFromSessionStorage();
  sortTasks();

  listDiv.innerHTML = "";

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("taskCard");

    const taskDescription = document.createElement("p");
    taskDescription.classList.add("taskDescription");
    taskDescription.textContent = task.description;

    const taskDeadline = document.createElement("p");
    taskDeadline.classList.add("taskDeadline");

    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.checked = task.completed;

    taskCheckbox.addEventListener("change", () => {
      checkboxChange(index, taskCheckbox.checked);
    });

    const taskCheckboxStatus = document.createElement("span");

    if (task.completed === true) {
      taskDiv.classList.add("completed");
      taskDescription.style.textDecoration = "line-through";
      taskCheckboxStatus.textContent = "";
    } else {
      taskDiv.classList.remove("completed");
      taskDescription.style.textDecoration = "none";
      taskCheckboxStatus.textContent = "Not Completed";
    }

    const timeRemaining = calculateTimeRemaining(task.timeLeft);
    taskDeadline.textContent =
      task.timeLeft !== "" ? timeRemaining.message : "";

    const taskDelete = document.createElement("button");
    taskDelete.textContent = "Delete";
    taskDelete.classList.add("taskDelete");
    taskDelete.addEventListener("click", () => {
      confirmDelete(index);
    });

    taskDiv.appendChild(taskDescription);
    taskDiv.appendChild(taskCheckbox);
    taskDiv.appendChild(taskCheckboxStatus);
    taskDiv.appendChild(taskDeadline);
    taskDiv.appendChild(taskDelete);
    listDiv.appendChild(taskDiv);
  });
}

displayTasks();

function confirmDelete(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    deleteTask(index);
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasksToSessionStorage();
  displayTasks();
}

sortOrder.addEventListener("change", () => {
  sortTasks();
  displayTasks();
});

function sortTasks() {
  const sortOrderValue = sortOrder.value;

  tasks.sort((a, b) => {
    if (sortOrderValue !== "recentlyCompleted" && a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (sortOrderValue === "recentlyAdded") {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else if (sortOrderValue === "deadline") {
      return new Date(a.timeLeft) - new Date(b.timeLeft);
    } else if (sortOrderValue === "recentlyCompleted") {
      if (a.completed !== b.completed) {
        return b.completed ? 1 : -1;
      } else {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
    }
  });
}

function prefillSessionStorage() {
  if (!sessionStorage.getItem("tasks")) {
    let prefillTasks = [
      {
        description: "1",
        timeLeft: "2023-08-02T20:00",
        completed: false,
        timestamp: 1690915500513,
      },
      {
        description: "2",
        timeLeft: "2023-08-03T20:00",
        completed: true,
        timestamp: 1690915510513,
      },
      {
        description: "3",
        timeLeft: "",
        completed: false,
        // timestamp: Date.now(),
        timestamp: 1690915560513,
      },
    ];
    sessionStorage.setItem("tasks", JSON.stringify(prefillTasks));
  }
}

prefillSessionStorage();
loadTasksFromSessionStorage();
displayTasks();
