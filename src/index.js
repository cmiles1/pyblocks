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

// Register the blocks and generator with Blockly
pythonGenerator.INDENT = '    '; // 4 spaces is required by PyScript

Blockly.common.defineBlocks(blocks);
Object.assign(pythonGenerator.forBlock, forBlock);



// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
codeDiv.contentEditable = true;
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {
  toolbox: toolbox, 
  media: './media',
});


const workspaceToPython = () => {
  const code = pythonGenerator.workspaceToCode(ws);
  codeDiv.textContent = code;
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
