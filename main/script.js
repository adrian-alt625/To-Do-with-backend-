//do crtl+shift+g to open the "commit menu" to submit the updated version to GitHub
"use strict";

//assigning values for the "upload button" and the file input
const fileInput = document.querySelector(".fileInput");
const upload = document.querySelector(".uploadBtn");
const create = document.querySelector(".createBtn");
const btnContainer = document.querySelector(".button-container");
const heading = document.querySelector(".heading");
const add = document.querySelector(".take-input");
const main = document.querySelector(".main-container");
const heading2 = document.querySelector(".heading2");
const mainInput = document.querySelector(".input");
const list = document.querySelector(".list");
const saveBtn = document.querySelector(".save");
const darkMode = document.querySelector(".dark-mode");
const errorLogin = document.querySelector(".incorrect-details");
let todos = [];
//initiating file input (through file explorer) once the "upload" button is pressed
upload.addEventListener("click", openFE);
//what happens when "upload" button is pressed
function openFE() {
  console.log("hello world");
  readFile();
}

//calls the "readFile" function when a file is uploaded
//reading the file, creating an array where each line is stored seperately in an array
async function readFile() {
  // let reader = new FileReader();

  // reader.readAsText(fileInput.files[0]);

  // reader.onload = function () {
  //   let text = reader.result;

  //   text = text.split("\n");
  //   text = text.map((line) => line.trim());
  //   console.log(text);
  change();
  // addFromFile(text);
  await loadTodos();
  addFromFile(todosArrayName);

  // };
}

// calls the "change" function when "create" button is clicked
create.addEventListener("click", change);
create.addEventListener("click", clearDB);

// make a function that removes the "startup" elements and adds the to-do-list elements
function change() {
  //removing starting elements
  btnContainer.style.display = "none";
  //adding new elements
  main.style.display = "block";
  heading2.textContent = userName + "'s To-Do List";
}

add.addEventListener("click", addToList);

let input;
function addToList() {
  input = document.querySelector(".input").value;
  if (input != "") {
    let li = document.createElement("li");
    let text = document.createTextNode(input);
    todos.push(text.textContent);
    //
    postInfo(); //sending it to the backend
    //
    li.appendChild(text);
    list.appendChild(li);
    document.querySelector(".input").value = "";
    let span = document.createElement("span");
    span.innerHTML = "&#10006";
    li.appendChild(span);
    console.log(todos);
  }
}

list.addEventListener("click", function (e) {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("checked");
    let item = e.target.textContent;
    item = item.slice(0, -1);
    console.log(item);
    let index = todos.indexOf(item);
    toggleCompletedDB(todosArrayId[index]);
  } else if (e.target.tagName === "SPAN") {
    let item = e.target.parentElement.textContent;
    item = item.slice(0, -1);
    console.log(item);
    let index = todos.indexOf(item);
    if (index !== -1) {
      removeFromDB(todosArrayId[index]);
      todosArrayId.splice(index, 1);
      todos.splice(index, 1);
    }
    console.log(todos);
    e.target.parentElement.remove();
  }
});

function addFromFile(arr) {
  for (let i = 0; i < arr.length; i++) {
    let li = document.createElement("li");
    let text = document.createTextNode(arr[i]);
    li.appendChild(text);
    list.appendChild(li);
    document.querySelector(".input").value = "";
    let span = document.createElement("span");
    span.innerHTML = "&#10006";
    li.appendChild(span);
    todos.push(arr[i]);
    getTodoStatus(todosArrayId[i]).then((status) => {
      if (status == true) {
        li.classList.toggle("checked");
      }
    });
  }
}

function downloadFile() {
  let filename = prompt("Enter desired filename: ");
  let contents = todos;
  contents = todos.join("\n");
  const blob = new Blob([contents], { type: "text/plain" }); // Create a Blob
  const url = URL.createObjectURL(blob); // Generate a temporary URL

  const a = document.createElement("a"); // Create a hidden <a> element
  a.href = url;
  a.download = filename; // Set the file name
  document.body.appendChild(a);
  a.click(); // Simulate a click
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Clean up the URL
}

saveBtn.addEventListener("click", downloadFile);

//dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

darkMode.addEventListener("click", toggleDarkMode);

//backend begins

const baseUrl = "http://localhost:2000";

async function postInfo() {
  const userId = getCurrentUserId();
  console.log(userId);
  let response = await fetch(baseUrl + "/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // the type of file (json)
    },
    body: JSON.stringify({
      task: mainInput.value,
      completed: false,
      userId: getCurrentUserId(),
    }),
  });
  let newTodo = await response.json(); // Get the newly created todo object
  todosArrayId.push(newTodo._id); // Add its ID to the array
  console.log(todosArrayId);
  console.log("New todo added with ID:", newTodo._id);
}

let todosArrayName = [];
let todosArrayId = [];

async function fetchTodos() {
  const userId = getCurrentUserId();
  if (!userId) {
    console.log("no userId found");
    return [];
  }
  let response = await fetch(`${baseUrl}/todo?userId=${userId}`);
  let todos = await response.json();
  console.log("Fetched Todos: ", todos);
  return todos;
}

//function to wait for the data before updating the "todosArray"
async function loadTodos() {
  todosArrayName = await delayTodosName();
  todosArrayId = await delayTodosId();
}

//function to wait for the data to arrive before being able to use it
async function delayTodosName() {
  let todos = await fetchTodos();
  let todosArrayName = todos.map((todo) => todo.task);
  console.log(todosArrayName);
  return todosArrayName;
}

async function delayTodosId() {
  let todos = await fetchTodos();
  let todosArrayId = todos.map((todo) => todo._id);
  console.log(todosArrayId);
  return todosArrayId;
}

async function removeFromDB(id) {
  await fetch(baseUrl + "/todos/" + id, {
    method: "DELETE",
  });
  console.log("Todo deleted");
}

async function toggleCompletedDB(id) {
  let response = await fetch(baseUrl + "/todos/" + id, {
    method: "PATCH",
  });
  let updatedTodo = await response.json();
  console.log("Updated Todo", updatedTodo);
}

async function getTodoStatus(id) {
  let response = await fetch(baseUrl + "/todos/" + id);
  let todo = await response.json();
  `Task: ${todo.task}, Completed: ${todo.completed}`;
  return todo.completed;
}

async function clearDB() {
  const userId = getCurrentUserId();
  let response = await fetch(`${baseUrl}/todos?userId=${userId}`, {
    method: "DELETE",
  });
  console.log("todos for currently logged in user deleted");
}

//code starting for all things related to login/signup
const buttonContainer = document.querySelector(".button-container");
const loginSignupContainer = document.querySelector(".login-signup-container");
const loginOptionBtn = document.querySelector(".loginBtn");
const signupOptionBtn = document.querySelector(".signupBtn");
const loginPage = document.querySelector(".login-page");
const signupPage = document.querySelector(".signup-page");
const signupUsername = document.querySelector(".input-username-signup");
const signupPassword = document.querySelector(".input-password-signup");
const submitSignup = document.querySelector(".submit-signupBtn");
const loginUsername = document.querySelector(".input-username-login");
const loginPassword = document.querySelector(".input-password-login");
const submitLogin = document.querySelector(".submit-loginBtn");

loginOptionBtn.addEventListener("click", changeToLogin);
signupOptionBtn.addEventListener("click", changeToSignup);

function changeToLogin() {
  loginSignupContainer.style.display = "none";
  loginPage.style.display = "block";
}

function changeToSignup() {
  loginSignupContainer.style.display = "none";
  signupPage.style.display = "block";
}

function changeToMainFromLogin() {
  buttonContainer.style.display = "block";
  loginPage.style.display = "none";
}
function changeToMainFromSignup() {
  buttonContainer.style.display = "block";
  signupPage.style.display = "none";
}

let userName;

//signing up
async function createAccount() {
  const username = signupUsername.value;
  const password = signupPassword.value;

  if (username !== "" && password !== "") {
    try {
      const response = await fetch(baseUrl + "/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      console.log(data.message);
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
        console.log("user ID: " + data.userId);
        changeToMainFromSignup();
        userName = username;
        heading.textContent = userName + "'s To-Do List";
      } else {
        console.log("no user Id from backend");
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }
}

submitSignup.addEventListener("click", createAccount);

function getCurrentUserId() {
  return localStorage.getItem("userId");
}

//logging in
async function loginAccount() {
  const username = loginUsername.value;
  const password = loginPassword.value;

  if (username !== "" && password !== "") {
    try {
      const response = await fetch(baseUrl + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      console.log(data.message);

      if (data.userId) {
        localStorage.setItem("userId", data.userId);
        console.log("Logged in user ID: " + data.userId);
        changeToMainFromLogin();
        userName = username;
        heading.textContent = userName + "'s To-Do List";
      } else {
        console.log("Login failed");
        errorLogin.style.display = "block";
      }
    } catch (error) {
      console.log("error:", error);
    }
  }
}

submitLogin.addEventListener("click", loginAccount);

const backButtons = document.querySelectorAll(".backArrowBtn");

// Attach event listeners to each button
backButtons.forEach((backButton) => {
  backButton.addEventListener("click", function (event) {
    // Find the closest parent <div> of the clicked button
    const parentDiv = event.target.closest("div");

    // Check if the parent div is found and hide it
    if (parentDiv) {
      errorLogin.style.display = "none";
      signupUsername.value = "";
      signupPassword.value = "";
      loginPassword.value = "";
      loginUsername.value = "";
      parentDiv.style.display = "none";
      loginSignupContainer.style.display = "block";
    }
  });
});

const settingsCog = document.querySelector(".settings-cog");
const settingsCog2 = document.querySelector(".settings-cog2");
const optionsMenu = document.querySelector(".options-menu");
const closeOptionsBtn = document.querySelector(".close-optionsBtn");
const profileBtn = document.querySelector(".profileBtn");
const contactBtn = document.querySelector(".contactBtn");
const logoutBtn = document.querySelector(".log-outBtn");
const blurOverlay = document.querySelector(".blur-overlay");

settingsCog.addEventListener("click", showOptions);
settingsCog2.addEventListener("click", showOptions);

function showOptions() {
  optionsMenu.style.display = "block";
  blurOverlay.style.display = "block";
}

closeOptionsBtn.addEventListener("click", closeOptions);
blurOverlay.addEventListener("click", blurClicked);

function closeOptions() {
  optionsMenu.style.display = "none";
  blurOverlay.style.display = "none";
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function blurClicked() {
  optionsMenu.style.display = "none";
  blurOverlay.style.display = "none";
  changeDetailsMenu.style.display = "none";
  deleteConfirmation.style.display = "none";
  emailForm.style.display = "none";
}

const changeDetailsMenu = document.querySelector(".change-details-menu");
const closeChangeDetailsBtn = document.querySelector(
  ".close-change-detailsBtn"
);

profileBtn.addEventListener("click", openChangeDetailsMenu);

function openChangeDetailsMenu() {
  changeDetailsMenu.style.display = "block";
  optionsMenu.style.display = "none";
}

closeChangeDetailsBtn.addEventListener("click", closeChangeDetailsMenu);

function closeChangeDetailsMenu() {
  blurOverlay.style.display = "none";
  changeDetailsMenu.style.display = "none";
  usernameInput.value = "";
  currentPasswordInput.value = "";
  newPasswordInput.value = "";
  showOptions();
}

const usernameInput = document.querySelector(".new-username");
const submitUsernameBtn = document.getElementById("submit-usernameBtn");

submitUsernameBtn.addEventListener("click", changeUsername);

async function changeUsername(event) {
  event.preventDefault();
  console.log("button clickec");
  const newUsername = usernameInput.value;
  const userId = localStorage.getItem("userId");

  if (!newUsername) {
    return;
  }

  const response = await fetch(
    baseUrl + "/users/" + userId + "/change-username",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUsername }),
    }
  );

  const result = await response.json();
  if (result.message == "Username is already taken.") {
    usernameInput.value = "";
    usernameInput.placeholder = "Username taken";
  } else if (result.message == "username updated.") {
    usernameInput.value = "";
    usernameInput.placeholder = "Username Updated";
    heading.textContent = newUsername + "'s To-Do List";
    heading2.textContent = newUsername + "'s To-Do List";
  }
}

const currentPasswordInput = document.querySelector(".current-password");
const newPasswordInput = document.querySelector(".new-password");
const submitPasswordBtn = document.getElementById("submit-passwordBtn");

submitPasswordBtn.addEventListener("click", changePassword);

async function changePassword(event) {
  event.preventDefault();
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const userId = localStorage.getItem("userId");

  if (!currentPassword || !newPassword) {
    return;
  }

  const response = await fetch(
    baseUrl + "/users/" + userId + "/change-password",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    }
  );

  const result = await response.json();
  if (result.message == "Incorrect current password") {
    currentPasswordInput.value = "";
    currentPasswordInput.placeholder = "Incorrect current password";
    newPasswordInput.value = "";
    newPasswordInput.placeholder = "Incorrect current password";
  } else if (result.message == "Password updated successfully") {
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    currentPasswordInput.placeholder = "Password updated";
    newPasswordInput.placeholder = "Password updated";
  }
}

const deleteBtn = document.getElementById("delete-accountBtn");
const deleteConfirmation = document.querySelector(".delete-confirmation");
const noDelete = document.getElementById("no-delete");
const yesDelete = document.getElementById("yes-delete");

deleteBtn.addEventListener("click", openConfirmation);

function openConfirmation() {
  optionsMenu.style.display = "none";
  deleteConfirmation.style.display = "block";
  changeDetailsMenu.style.display = "none";
}

noDelete.addEventListener("click", function () {
  changeDetailsMenu.style.display = "block";
  deleteConfirmation.style.display = "none";
});

yesDelete.addEventListener("click", deleteAccount);

async function deleteAccount() {
  const userId = localStorage.getItem("userId");

  const response = await fetch(
    baseUrl + "/users/" + userId + "/delete-account",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const result = await response.json();
  if (result.message == "account deleted") {
    console.log("account deleted");
    localStorage.removeItem("userId");
    window.location.href = baseUrl;
  } else {
    console.log("failed to delete account");
  }
}

const emailForm = document.querySelector(".email-form");
const emailUserName = document.getElementById("user-name");
const emailUserEmail = document.getElementById("user-email");
const emailUserMessage = document.getElementById("user-message");
const emailSendBtn = document.getElementById("send-message");
const closeEmailFormBtn = document.querySelector(".close-email-formBtn");

contactBtn.addEventListener("click", openEmailForm);
function openEmailForm() {
  emailForm.style.display = "block";
}

closeEmailFormBtn.addEventListener("click", closeEmailForm);
function closeEmailForm() {
  emailForm.style.display = "none";
}

emailSendBtn.addEventListener("click", sendEmail);
function sendEmail(event) {
  event.preventDefault();
  const username = emailUserName.value;
  const email = emailUserEmail.value;
  const message = emailUserMessage.value;

  if (!username || !email || !message) {
    alert("Please fill in all fields.");
    return;
  }
  emailjs.init("ka3O-bMMfHRbthln-");
  const templateParams = {
    from_name: username,
    from_email: email,
    message: message,
  };
  emailjs.send("service_ib5p6el", "template_lr20bkj", templateParams).then(
    function (response) {
      alert("Message Sent Successfully!");
      console.log("SUCCESS!", response.status, response.text);
      emailUserEmail.value = "";
      emailUserMessage.value = "";
      emailUserName.value = "";
    },
    function (error) {
      alert("Failed to send message. Please try again.");
      console.log("FAILED...", error);
    }
  );
}

logoutBtn.addEventListener("click", logOut);
function logOut() {
  localStorage.removeItem("userId");
  window.location.href = baseUrl;
}

// const backBtn = document.querySelector(".backBtn");

// backBtn.addEventListener("click", goBack);
// function goBack() {
//   main.style.display = "none";
//   btnContainer.style.display = "block";
//   removeListItems(todosArrayName);
// }

// function removeListItems(arr) {
//   // Get the unordered list container
//   const ul = document.querySelector(".list");

//   // Get all list items within the UL
//   const listItems = ul.querySelectorAll("li");

//   // Get the number of items to remove (based on array length)
//   const itemsToRemove = arr.length;

//   // Loop through and remove list items, starting from the last to avoid index shifting
//   for (let i = 0; i < itemsToRemove; i++) {
//     if (listItems[i]) {
//       listItems[i].remove();
//     }
//   }
//   todosArrayId = [];
// }
