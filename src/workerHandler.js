import { PyWorker } from "./pyscript/core.js";
// import * as fs from fs;

// Worker for running Python code through PyScript

const runButton = document.querySelector(".run");
const clearButton = document.querySelector(".clear");
// const saveButton = document.querySelector(".save");
const outputDiv = document.querySelector("#outputArea");
// const fs = require('fs');

var isScriptRunning = false;
var isAwaitingTermination = false;
var worker;

// Initialize the Pyodide environment
try {
  worker = await PyWorker(
    // Python code to execute
    "./worker.py",
    { config: { sync_main_only: false } } // todo: attach pyscript.toml file here?
  );
} catch (e) {
  console.error(e);
  outputDiv.insertAdjacentHTML(
    "beforeend",
    `<code><p style="color: #F00; font-weight:bold" >An exception occured while loading the Pyodide Environment
  (Try refreshing the page to fix this)</p><hr><b>Exception Details:</b><br><br>${e}<br></code>
<hr><br>
`
  );
  throw e;
}

export const waitForClickEvent = async () => {
  // Waits until the input box's submit button is clicked
  var btn = document.querySelector(".submitButton");
  var data = null;

  btn.addEventListener("click", async () => {
    var x = document.querySelector(".userInput:enabled");
    if (x) {
      x.disabled = true;
      x.style.resize = "none";
      data = x.value;
      btn.remove();
    }
  });

  // wait until click happens
  while (data === null) {
    await new Promise((r) => setTimeout(r, 100));
  }

  return data;
};

worker.sync.waitForClickEvent = waitForClickEvent;

runButton.addEventListener("click", async () => {
  // Only allow a single instance of the script to run at a time
  if (!isScriptRunning) {
    runButton.innerText = "Stop";

    // lock mechanism
    isScriptRunning = true;

    // Fetch the code to run
    const text = localStorage.getItem("pythonCode");

    // call the worker python script
    try {
      var x = await worker.sync.run(text);
    } catch (e) {
      x = e;
    }
    // output the result
    outputDiv.insertAdjacentText("beforeend", x);

    // unlock mechanism
    isScriptRunning = false;
    runButton.innerText = "Run";
    outputDiv.insertAdjacentHTML("beforeend", "<hr><br>");
  } else {
    // Kill the worker if not currently being killed
    if (isAwaitingTermination) {
      return;
    }
    isAwaitingTermination = true;
    runButton.innerText = "Stopping...";

    await worker.terminate();

    // Clear the latest input boxes in the console
    var btns = document.querySelectorAll(".submitButton");
    btns.forEach((element) => {
      element.remove();
    });
    var textareas = document.querySelectorAll(".userInput:enabled");
    textareas.forEach((element) => {
      element.disabled = true;
      element.style.resize = "none";
    });

    // Let the user know the script has been stopped
    outputDiv.insertAdjacentHTML(
      "beforeend",
      "<code>Program halted by user</code><br><hr><br>"
    );

    // Reinitialize the worker
    worker = await PyWorker(
      // Python code to execute
      "./worker.py",
      { config: { sync_main_only: false } } // todo: attach pyscript.toml file here?
    );
    worker.sync.waitForClickEvent = waitForClickEvent;

    // unlock the button
    runButton.innerText = "Run";
    isScriptRunning = false;
    isAwaitingTermination = false;
  }
});

clearButton.addEventListener("click", () => {
  if (isScriptRunning || outputDiv.innerHTML.length !== 0) {
    var response = confirm("Are you sure you want to clear the console?");
    if (!response) {
      return;
    }
  }
  outputDiv.innerHTML = "";
});

// saveButton.addEventListener("click", () => {

//   if (isScriptRunning) {
//     alert("Please wait for the script to finish running")
//     return;
//   }
//   else {
//     console.log("starting");
//     const text = localStorage.getItem("pythonCode");
//     if (text.length < 1) {
//       alert("There is no code to save")
//       return;
//     }
//     // Requiring fs module in which writeFile function is defined
//     // const writer = fs.require('fs')
//     console.log(text);

//     // Write data in 'output.py' .
//     fs.writeFile('output.py', text, (err) => {
//       // In case of a error throw err.
//       if (err) throw err;
//     });

//     console.log("success");
//     // document.getElementById('save_iframe').src = writer;
//   }
// })