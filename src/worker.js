import { PyWorker } from './pyscript/core.js';

// Worker for running Python code through PyScript

const runButton = document.querySelector('.run');
const codeDiv = document.querySelector("#pythonArea");
const outputDiv = document.querySelector("#outputArea");

var isScriptRunning = false;

const worker = await PyWorker(
    // Python code to execute
    './worker.py',
    { config: { sync_main_only: false } } // todo: attach pyscript.toml file here?
);  



runButton.addEventListener('click', async () => { 
    // Only allow a single instance of the script to run at a time
    if (!isScriptRunning) {
        runButton.innerHTML = 'Stop';

        // lock mechanism
        isScriptRunning = true;

        // call the worker python script
        var x = await worker.sync.run(codeDiv.textContent);

        // output the result
        outputDiv.textContent = x;
        
        // unlock mechanism
        isScriptRunning = false;
        runButton.innerHTML = 'Run';
    }
});