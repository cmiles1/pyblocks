import { PyWorker } from './pyscript/core.js';

// Worker for running Python code through PyScript

const runButton = document.querySelector('.run');
const outputDiv = document.querySelector("#outputArea");

var isScriptRunning = false;
var isAwaitingTermination = false;

var worker = await PyWorker(
    // Python code to execute
    './worker.py',
    { config: { sync_main_only: false } } // todo: attach pyscript.toml file here?
);

export const waitForClickEvent = async () => {
    // Waits until the input box's submit button is clicked
    var btn = document.querySelector('.submit-button');
    var textarea = document.querySelector('.user-input:enabled');
    var data = null;

    btn.addEventListener('click', async () => {
        data = textarea.value;
        textarea.disabled = true;
        btn.remove();
    });

    // wait until click happens
    while (data === null) {
        await new Promise(r => setTimeout(r, 100));
    };

    return data;
};

worker.sync.waitForClickEvent = waitForClickEvent;

runButton.addEventListener('click', async () => { 
    // Only allow a single instance of the script to run at a time
    if (!isScriptRunning) {
        runButton.innerText = 'Stop';
        
        // lock mechanism
        isScriptRunning = true;

        // Fetch the code to run
        const text = localStorage.getItem('pythonCode');

        // call the worker python script
        try {
            var x = await worker.sync.run(text);
        } catch (e) {
            x = e;
        }
        // output the result
        outputDiv.insertAdjacentText('beforeend', x);
        
        // unlock mechanism
        isScriptRunning = false;
        runButton.innerText = 'Run';
        outputDiv.insertAdjacentHTML('beforeend', '<hr><br>');
    }
    else {
        // Kill the worker if not currently being killed
        if (isAwaitingTermination) {return;}
        isAwaitingTermination = true;
        runButton.innerText = 'Stopping...';
        
        await worker.terminate();

        // Clear the latest input boxes in the console
        var btns = document.querySelectorAll('.submit-button');
        btns.forEach(element => {
            element.remove();
        });
        var textareas = document.querySelectorAll('.user-input:enabled');
        textareas.forEach(element => {
            element.disabled = true;
        });

        // Let the user know the script has been stopped
        outputDiv.insertAdjacentHTML('beforeend', '<code>Program halted by user</code><br><hr><br>');

        // Reinitialize the worker
        worker = await PyWorker(
            // Python code to execute
            './worker.py',
            { config: { sync_main_only: false } } // todo: attach pyscript.toml file here?
        );
        worker.sync.waitForClickEvent = waitForClickEvent;

        // unlock the button
        runButton.innerText = 'Run';
        isScriptRunning = false;
        isAwaitingTermination = false;
    }
});