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

// Plugins
import {FixedEdgesMetricsManager} from '@blockly/fixed-edges';
import {Backpack} from './backpack';

const hljs = require('highlight.js/lib/core');
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));

// Register the blocks and generator with Blockly
pythonGenerator.INDENT = '    '; // 4 spaces is required by PyScript

Blockly.common.defineBlocks(blocks);
Object.assign(pythonGenerator.forBlock, forBlock);


FixedEdgesMetricsManager.setFixedEdges({
  top: true,
  left: true,
});


// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('pythonArea');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {
  grid: {
    spacing: 40,
    length: 3,
    colour: '#ccc',
    snap: false
  },
  media: './media',
  move: {
    scrollbars: true,
    drag: true,
    wheel: true
  },
  plugins: {
    metricsManager: FixedEdgesMetricsManager,
    backpack: Backpack
  },
  toolbox: toolbox, 
  trashcan: true,
  zoom: {
    controls: true,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2,
    wheel: true,
    maxScale: 10,
  },
});

const backpackOptions = {
  allowEmptyBackpackOpen: false,
  useFilledBackpackImage: false,
  contextMenu: {
    emptyBackpack: false,
    removeFromBackpack: true,
    copyToBackpack: true,
  },
};
// Initialize backpack
const backpack = new Backpack(ws, backpackOptions);
backpack.init();

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
const horizontalResizeHandle = document.getElementById('resize');
const outputPane = document.getElementById('outputPane');
const pageContainer = document.getElementById('pageContainer');
const blocklyArea = document.getElementById('blocklyArea');

/* Drag support */
horizontalResizeHandle.addEventListener('mousedown', function (e) {
  e.preventDefault();

  document.addEventListener('mousemove', horizontalResize);
  document.addEventListener('mouseup', stopHorizontalResize);
});

/* Mobile drag support */
horizontalResizeHandle.addEventListener('touchstart', function (e) {
  e.preventDefault();

  document.addEventListener('touchmove', horizontalResize);
  document.addEventListener('touchend', stopHorizontalResizeTouch);
});


function horizontalResize(e) {
  var clientX = e.clientX??e.touches[0].clientX;
  const containerWidth = pageContainer.offsetWidth;
  var newBlocklyWidth = (clientX / containerWidth) * 100;
  var old = newBlocklyWidth;
  // Ensure the blockly area is at least 20% and at most 80% of the page
  newBlocklyWidth = Math.min(Math.max(newBlocklyWidth, 15), 80);
  if (old !== newBlocklyWidth) {
    if (old < newBlocklyWidth) {
      // hide blocklyArea
      blocklyArea.style.display = 'none';
    }
    else {
      outputPane.style.display = 'none';
      newBlocklyWidth = 97;
    }
  }
  else {
    blocklyArea.style.display = 'block';
    outputPane.style.display = 'flex';
  }
  // Resize the blockly area and the output pane
  blocklyArea.style.flex = `0 0 ${newBlocklyWidth}%`;
  outputPane.style.width = `${100}%`;

  adjustBlocklyDiv();
}

function adjustBlocklyDiv() {
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

function stopHorizontalResize() {
  document.removeEventListener('mousemove', horizontalResize);
  document.removeEventListener('mouseup', stopHorizontalResize);
}

function stopHorizontalResizeTouch() {
  document.removeEventListener('touchmove', horizontalResize);
  document.removeEventListener('touchend', stopHorizontalResizeTouch);
}

window.addEventListener('resize', adjustBlocklyDiv);
window.addEventListener('orientationchange', adjustBlocklyDiv);
adjustBlocklyDiv();