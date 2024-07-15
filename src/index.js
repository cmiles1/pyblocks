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

// Blockly Plugins
import {Backpack} from './backpack';
import {
  ScrollOptions,
} from '@blockly/plugin-scroll-options';
import {PyBlocksMetricsManager, PyBlocksScrollBlockDragger} from './metrics';
import DarkTheme from '@blockly/theme-dark';



const hljs = require('highlight.js/lib/core');
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));

// Register the blocks and generator with Blockly
pythonGenerator.INDENT = '    '; // 4 spaces is required by PyScript

Blockly.common.defineBlocks(blocks);
Object.assign(pythonGenerator.forBlock, forBlock);




// Sets the edges that will be fixed in the workspace
// (i.e. other directions can be scrolled infinitely)
PyBlocksMetricsManager.setFixedEdges({
  top: true,
  left: true,
});

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('pythonArea');
const blocklyDiv = document.getElementById('blocklyDiv');
console.log(Blockly.Themes);
const ws = Blockly.inject(blocklyDiv, {
  theme: DarkTheme,
  grid: {
    spacing: 50,
    length: 0.5,
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
    backpack: Backpack,
    blockDragger: PyBlocksScrollBlockDragger,
    metricsManager: PyBlocksMetricsManager,
  },
  toolbox: toolbox, 
  trashcan: true,
  zoom: {
    controls: true,
    startScale: 1.5,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2,
    wheel: true,
    maxScale: 10,
  },
});



/** Initialize Blockly plugins */
function initializePlugins() {
  const backpackOptions = {
    allowEmptyBackpackOpen: false,
    useFilledBackpackImage: false,
    contextMenu: {
      emptyBackpack: false,
      removeFromBackpack: true,
      copyToBackpack: true,
    },
  };
  
  const backpack = new Backpack(ws, backpackOptions);
  backpack.init();

  const scrollOptions = new ScrollOptions(ws);
  scrollOptions.init({
    enableWheelScroll: true, 
    enableEdgeScroll: true, 
    edgeScrollOptions: {
      // How far the mouse/dragged block must be from the edge of the workspace to start scrolling
      // Note that this functionality is overriden by metrics.js::PyBlocksScrollBlockDragger
      slowBlockStartDistance: 10, 
      slowMouseStartDistance: 10,
      fastBlockStartDistance: ws.toolbox_.width_ / ws.scale, 
      fastMouseStartDistance: ws.toolbox_.width_ / ws.scale
    }
  });

}
initializePlugins();


// Remove trashcan lid animation
var s = ws.trashcan.svgLid.getAttribute('clip-path').match(/url\(#(.*)\)/)[1];
document.getElementById(s).remove();
ws.trashcan.svgLid.remove();


// Rescale icons
ws.trashcan.svgGroup.querySelector('image').style.transform += 'scale(1.2)';
var icons = ws.zoomControls_.svgGroup.querySelectorAll('image');
icons.forEach((icon, index) => {
  icon.style.transform += `scale(1.5) translate(0px, ${-(index-2)*15 - 40}px)`;
  icon.style.opacity = 0.8;
});


// loop over all icons and indices













/* Translates the workspace to Python code and displays it in the codeDiv. */
const workspaceToPython = () => {
  // Python generator : Blockly workspace -> Python code
  //const code = pythonGenerator.workspaceToCode(ws);
  // try to insert an incomplete html tag to see if it is sanitized
  const code = pythonGenerator.workspaceToCode(ws);
  localStorage?.setItem('pythonCode', code);
  
  // Apply syntax highlighting
  const highlightedCode = hljs.highlight(
    code,
    { language: 'python' }
  ).value 
  updateLineNumbers(highlightedCode);

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

/** Updates the line numbers for the generated code */
function updateLineNumbers(code) {
  const lines = code.split('\n');
  codeDiv.innerHTML = lines.map(line => `<div>${line}\n</div>`).join('');
}


/* 
Rescaling between the workspace and the output pane
*/
const horizontalResizeHandle = document.getElementById('horizResize');
const verticalResizeHandle = document.getElementById('vertResize');
const outputPane = document.getElementById('outputPane');
const pageContainer = document.getElementById('pageContainer');
const blocklyArea = document.getElementById('blocklyArea');
const outputTextArea = document.getElementById('outputArea');
const generatedCode = document.getElementById('generatedCode');

/* Drag support */
horizontalResizeHandle.addEventListener('mousedown', function (e) {
  e.preventDefault();

  document.addEventListener('mousemove', horizontalResize);
  document.addEventListener('mouseup', stopHorizontalResize);
});
verticalResizeHandle.addEventListener('mousedown', function (e) {
  e.preventDefault();

  document.addEventListener('mousemove', verticalResize);
  document.addEventListener('mouseup', stopVerticalResize);
});

/* Mobile drag support */
horizontalResizeHandle.addEventListener('touchstart', function (e) {
  e.preventDefault();

  document.addEventListener('touchmove', horizontalResize);
  document.addEventListener('touchend', stopHorizontalResizeTouch);
});
verticalResizeHandle.addEventListener('touchstart', function (e) {
  e.preventDefault();

  document.addEventListener('touchmove', verticalResize);
  document.addEventListener('touchend', stopVerticalResizeTouch);
});



function horizontalResize(e) {
  var clientX = (e.clientX??e.touches[0].clientX) - 10 - (window.innerWidth/100);
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


function verticalResize(e) {
  var clientY = e.clientY??e.touches[0].clientY;
  const containerHeight = pageContainer.offsetHeight;

  clientY -= generatedCode.getBoundingClientRect().top + 25; 


  var newGeneratedCodeHeight = (clientY / containerHeight) * 100;
  var old = newGeneratedCodeHeight;
  // Ensure the code output area is at least 5% and at most 75% of the container
  newGeneratedCodeHeight = Math.min(Math.max(newGeneratedCodeHeight, 5), 75);
  if (old !== newGeneratedCodeHeight) {
    if (old < newGeneratedCodeHeight) {
      // Hide generatedCode
      generatedCode.firstChild.style.display = 'none';
      generatedCode.style.borderLeft = '0px';
      generatedCode.style.backgroundColor = 'var(--blockly-main-fill)';
      newGeneratedCodeHeight = 0;
    } else {
      // Hide outputTextArea
      outputTextArea.style.display = 'none';
      outputTextArea.style.borderLeft = '0px';
      outputTextArea.style.backgroundColor = 'var(--blockly-main-fill)';
      newGeneratedCodeHeight = 85;
    }
  } else {
    generatedCode.style.borderLeft = '';
    generatedCode.style.backgroundColor = '';
    generatedCode.firstChild.style.display = 'block';
    
    outputTextArea.style.borderLeft = '';
    outputTextArea.style.backgroundColor = '';
    outputTextArea.style.display = '';
  }
  

  // Resize the generated code and the output text area
  generatedCode.style.flex = `0 0 ${newGeneratedCodeHeight}%`;
  outputTextArea.style.height = `${100}%`;



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

function stopVerticalResize() {
  document.removeEventListener('mousemove', verticalResize);
  document.removeEventListener('mouseup', stopVerticalResize);
}

function stopVerticalResizeTouch() {
  document.removeEventListener('touchmove', verticalResize);
  document.removeEventListener('touchend', stopVerticalResizeTouch);
}


window.addEventListener('resize', adjustBlocklyDiv);
window.addEventListener('orientationchange', adjustBlocklyDiv);
adjustBlocklyDiv();




