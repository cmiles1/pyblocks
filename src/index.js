/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {blocks} from './blocks/text';
import {forBlock} from './generators/python';
import {pythonGenerator} from 'blockly/python';
import {save, load} from './serialization';
import {toolbox} from './toolbox';

const hljs = require('highlight.js/lib/core');
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));

// Register the blocks and generator with Blockly
pythonGenerator.INDENT = '    '; // 4 spaces is required by PyScript

Blockly.common.defineBlocks(blocks);
Object.assign(pythonGenerator.forBlock, forBlock);
console.log(pythonGenerator.forBlock);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('pythonArea');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {
  toolbox: toolbox, 
  media: './media',
});

/* Translates the workspace to Python code and displays it in the codeDiv. */
const workspaceToPython = () => {
  // Python generator : Blockly workspace -> Python code
  const code = pythonGenerator.workspaceToCode(ws);
  
  localStorage?.setItem('pythonCode', code);

  // Apply syntax highlighting
  const highlightedCode = hljs.highlight(
    code,
    { language: 'python' }
  ).value

  // todo: ensure sanitization
  codeDiv.innerHTML = highlightedCode;
};

// Load the initial state from storage and run the code.
load(ws);
workspaceToPython();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});

// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  workspaceToPython();
});




/* 
Rescaling between the workspace and the output pane
*/
const resizeHandle = document.getElementById('resize');
const outputPane = document.getElementById('outputPane');
const pageContainer = document.getElementById('pageContainer');
const blocklyArea = document.getElementById('blocklyArea');


resizeHandle.addEventListener('mousedown', function (e) {
  e.preventDefault();

  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
});

function resize(e) {
  const containerWidth = pageContainer.offsetWidth;
  const newBlocklyWidth = (e.clientX / containerWidth) * 100;
  const newOutputPaneWidth = 100 - newBlocklyWidth;

  blocklyDiv.style.flex = `0 0 ${newBlocklyWidth}%`;
  outputPane.style.flex = `0 0 ${newOutputPaneWidth}%`;

  var element = blocklyArea;
  let x = 0;
  let y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  // Position blocklyDiv over blocklyArea.
  blocklyDiv.style.left = x + 'px';
  blocklyDiv.style.top = y + 'px';
  blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
  blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
  Blockly.svgResize(ws);
}

function stopResize() {
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
}


