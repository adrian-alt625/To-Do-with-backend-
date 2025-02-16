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
let todos = [];
//initiating file input (through file explorer) once the "upload" button is pressed
upload.addEventListener("click", openFE);
//what happens when "upload" button is pressed
function openFE() {
  console.log("hello world");
  fileInput.click();
}

//calls the "readFile" function when a file is uploaded
fileInput.addEventListener("change", readFile);
//reading the file, creating an array where each line is stored seperately in an array
function readFile() {
  console.log("hi guys");

  let reader = new FileReader();

  reader.readAsText(fileInput.files[0]);

  reader.onload = function () {
    let text = reader.result;

    text = text.split("\n");
    text = text.map((line) => line.trim());
    console.log(text);
    change();
    addFromFile(text);
    console.log(todos);
  };
}

// calls the "change" function when "create" button is clicked
create.addEventListener("click", change);

// make a function that removes the "startup" elements and adds the to-do-list elements
function change() {
  //removing starting elements
  btnContainer.style.display = "none";
  //adding new elements
  main.style.display = "block";
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
  } else if (e.target.tagName === "SPAN") {
    let item = e.target.parentElement.textContent;
    item = item.slice(0, -1);
    console.log(item);
    let index = todos.indexOf(item);
    if (index !== -1) {
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
  await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // the type of file (json)
    },
    body: JSON.stringify({
      task: mainInput.value,
      completed: false,
    }),
  });
}
