// TODO:
// 1. Close trashcan properly
// 2. Add input block to toolbox

import * as Blockly from "blockly";
import { blocks } from "./blocks/text";
import { blocks as customBlocks } from "./generators/python";
import { pythonGenerator } from "blockly/python";
import { save, load } from "./serialization";
import { toolbox } from "./toolbox";

// Blockly Plugins
import { Backpack } from "./backpack";
import { ScrollOptions } from "@blockly/plugin-scroll-options";
import { PyBlocksMetricsManager, PyBlocksScrollBlockDragger } from "./metrics";
import DarkTheme from "@blockly/theme-dark";
import { shadowBlockConversionChangeListener } from "@blockly/shadow-block-converter";
import {
  ContinuousToolbox,
  ContinuousFlyout,
} from "@blockly/continuous-toolbox";
import { PyBlocksTrashcan } from "./trashcan";

const hljs = require("highlight.js/lib/core");
hljs.registerLanguage("python", require("highlight.js/lib/languages/python"));

// Register the blocks and generator with Blockly
pythonGenerator.INDENT = "    "; // 4 spaces is required by PyScript

Blockly.common.defineBlocks(blocks);
Object.assign(pythonGenerator.forBlock, customBlocks);

// Sets the edges that will be fixed in the workspace
// (i.e. other directions can be scrolled infinitely)
PyBlocksMetricsManager.setFixedEdges({
  top: true,
  left: true,
});

Blockly.WorkspaceSvg.newTrashcan = function (workspace) {
  workspace.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
  var trashcan = new PyBlocksTrashcan(workspace);
  workspace.toolboxPosition = Blockly.TOOLBOX_AT_LEFT;
  return trashcan;
};

DarkTheme.setCategoryStyle("backpack_category", { colour: "#0000FF" });
DarkTheme.setBlockStyle("backpack_category", { colour: "#0000FF" });

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById("pythonArea");
const blocklyDiv = document.getElementById("blocklyDiv");

const ws = Blockly.inject(blocklyDiv, {
  theme: DarkTheme,
  grid: {
    spacing: 50,
    length: 0.5,
    colour: "#ccc",
    snap: false,
  },
  media: "./media",
  move: {
    scrollbars: true,
    drag: true,
    wheel: true,
  },
  plugins: {
    backpack: Backpack,
    blockDragger: PyBlocksScrollBlockDragger,
    metricsManager: PyBlocksMetricsManager,
    toolbox: ContinuousToolbox,
    flyoutsVerticalToolbox: ContinuousFlyout,
  },
  renderer: "zelos",
  toolbox: toolbox,
  trashcan: true,
  zoom: {
    controls: true,
    startScale: 0.8,
    maxScale: 2.0,
    minScale: 0.25,
    scaleSpeed: 1.2,
    wheel: true,
  },
});
// Set maximum width of toolbox flyout
var toolboxFlyout = ws.getToolbox().getFlyout();

/** Initialize Blockly plugins */
function initializePlugins() {
  // Backpack plugin
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
  backpack.init(ws);

  // Register category button for opening backpack
  ws.registerButtonCallback("openBackpack", (x) => {
    backpack.open();
  });

  // Scroll options plugin
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
      fastMouseStartDistance: ws.toolbox_.width_ / ws.scale,
    },
  });

  // Shadow block converter plugin
  ws.addChangeListener(shadowBlockConversionChangeListener);

  // Rebind flyout scales to a fixed amount (blockly workspace zoom level)
  // This effectively prevents resizing the toolbox flyout through blockly
  // instead, the user should use their browser's zoom mechanisms to resize the flyouts
  toolboxFlyout.getFlyoutScale = () => {
    // Keep track of the toolbox's current width (see: horizontalResize)
    return 0.8;
  };

  backpack.getFlyout().getFlyoutScale = () => {
    return 0.8;
  };

  ws.trashcan.flyout.getFlyoutScale = () => {
    return 0.6;
  };

  // Monkey Patch closing / opening flyouts
  const wsToolboxFlyout = ws.getToolbox()?.getFlyout();
  const setVisiblity = wsToolboxFlyout.setVisible;
  wsToolboxFlyout.setVisible = (visible) => {
    setVisiblity.call(wsToolboxFlyout, visible);
    if (visible) {
      // close all other flyouts
      backpack.close();
      ws.trashcan.closeFlyout();
    }
  };
  const wsTrashcanOpen = ws.trashcan.openFlyout;
  ws.trashcan.openFlyout = () => {
    backpack.close();
    wsToolboxFlyout.setVisible(false);
    wsTrashcanOpen.call(ws.trashcan);
  };

  // Refresh toolbox contents
  // (fixes label horizontal resizing within the toolbox)
  ws.getToolbox()?.refreshSelection();
}
initializePlugins();

/* Translates the workspace to Python code and displays it in the codeDiv. */
const workspaceToPython = () => {
  // try to insert an incomplete html tag to see if it is sanitized
  const code = pythonGenerator.workspaceToCode(ws);
  localStorage?.setItem("pythonCode", code);

  // Apply syntax highlighting
  const highlightedCode = hljs.highlight(code, { language: "python" }).value;
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
  const lines = code.split("\n");
  codeDiv.innerHTML = lines.map((line) => `<div>${line}\n</div>`).join("");
}

/* 
Rescaling between the workspace and the output pane
*/
const horizontalResizeHandle = document.getElementById("horizResize");
const verticalResizeHandle = document.getElementById("vertResize");
const outputPane = document.getElementById("outputPane");
const pageContainer = document.getElementById("pageContainer");
const blocklyArea = document.getElementById("blocklyArea");
const outputTextArea = document.getElementById("outputArea");
const generatedCode = document.getElementById("generatedCode");
// Minimum width of the workspace as a percentage of the pageContainer's width
const MIN_WORKSPACE_SIZE_PRC = 10;
// Cached toolbox width (needed for horizontalResize)
var toolboxWidth = 0;

/* Drag support */
horizontalResizeHandle.addEventListener("mousedown", function (e) {
  e.preventDefault();

  document.addEventListener("mousemove", horizontalResize);
  document.addEventListener("mouseup", stopHorizontalResize);
});
verticalResizeHandle.addEventListener("mousedown", function (e) {
  e.preventDefault();

  document.addEventListener("mousemove", verticalResize);
  document.addEventListener("mouseup", stopVerticalResize);
});

/* Mobile drag support */
horizontalResizeHandle.addEventListener(
  "touchstart",
  function (e) {
    if (e.cancelable) {
      e.preventDefault();
    }

    document.addEventListener("touchmove", horizontalResize);
    document.addEventListener("touchend", stopHorizontalResizeTouch);
  },
  { passive: false }
);
verticalResizeHandle.addEventListener(
  "touchstart",
  function (e) {
    if (e.cancelable) {
      e.preventDefault();
    }
    document.addEventListener("touchmove", verticalResize);
    document.addEventListener("touchend", stopVerticalResizeTouch);
  },
  { passive: false }
);

function horizontalResize(e) {
  var newToolboxWidth = toolboxFlyout.getClientRect()?.right;
  if (newToolboxWidth > 0) {
    toolboxWidth = newToolboxWidth;
  }

  // Get the X position of the mouse / touch event
  var clientX =
    (e.clientX ?? e.touches[0].clientX) - horizontalResizeHandle.offsetWidth;
  // Find the total width of the toolbox, workspace and code area
  const containerWidth = pageContainer.offsetWidth;
  // Calculate the left-most and right-most positions of the resize bar
  const leftMost =
    (toolboxWidth / containerWidth) * 100 + MIN_WORKSPACE_SIZE_PRC;
  const rightMost = 100 - 3;
  var newBlocklyWidth = (clientX / containerWidth) * 100;

  // Hide elements if the resize bar extends too far
  if (newBlocklyWidth < leftMost) {
    // hide blocklyArea
    ws.setVisible(false);
    blocklyArea.setAttribute("style", "width: 0px");
    newBlocklyWidth = 0;
  } else if (newBlocklyWidth > rightMost - 20) {
    outputPane.style.display = "none";
    newBlocklyWidth = 97;
  } else if (newBlocklyWidth > leftMost + 20) {
    outputPane.style.display = "flex";
    ws.setVisible(true);
  } else {
    outputPane.style.display = "flex";
    ws.setVisible(true);
  }
  // Resize the blockly area and the output pane
  blocklyArea.style.flex = `0 0 ${newBlocklyWidth}%`;
  outputPane.style.width = `${100}%`;

  adjustBlocklyDiv();
}

function verticalResize(e) {
  // Get the Y position of the mouse / touch event
  var clientY =
    (e.clientY ?? e.touches[0].clientY) -
    generatedCode.getBoundingClientRect().top -
    verticalResizeHandle.offsetHeight;
  const containerHeight = pageContainer.offsetHeight;

  var newGeneratedCodeHeight = (clientY / containerHeight) * 100;
  const old = newGeneratedCodeHeight;
  // Ensure the code output area is at least 5% and at most 75% of the container
  newGeneratedCodeHeight = Math.min(Math.max(newGeneratedCodeHeight, 5), 75);
  if (old !== newGeneratedCodeHeight) {
    if (old < newGeneratedCodeHeight) {
      // Hide generatedCode
      generatedCode.firstChild.style.display = "none";
      generatedCode.style.borderLeft = "0px";
      generatedCode.style.backgroundColor = "var(--blockly-main-fill)";
      newGeneratedCodeHeight = 0;
    } else {
      // Hide outputTextArea
      outputTextArea.style.display = "none";
      outputTextArea.style.borderLeft = "0px";
      outputTextArea.style.backgroundColor = "var(--blockly-main-fill)";
      newGeneratedCodeHeight = 85;
    }
  } else {
    generatedCode.style.borderLeft = "";
    generatedCode.style.backgroundColor = "";
    generatedCode.firstChild.style.display = "block";

    outputTextArea.style.borderLeft = "";
    outputTextArea.style.backgroundColor = "";
    outputTextArea.style.display = "";
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
  blocklyDiv.style.left = x + "px";
  blocklyDiv.style.top = y + "px";
  blocklyDiv.style.width = blocklyArea.offsetWidth + "px";
  blocklyDiv.style.height = blocklyArea.offsetHeight + "px";
  Blockly.svgResize(ws);
}

function stopHorizontalResize() {
  document.removeEventListener("mousemove", horizontalResize);
  document.removeEventListener("mouseup", stopHorizontalResize);
}

function stopHorizontalResizeTouch() {
  document.removeEventListener("touchmove", horizontalResize);
  document.removeEventListener("touchend", stopHorizontalResizeTouch);
}

function stopVerticalResize() {
  document.removeEventListener("mousemove", verticalResize);
  document.removeEventListener("mouseup", stopVerticalResize);
}

function stopVerticalResizeTouch() {
  document.removeEventListener("touchmove", verticalResize);
  document.removeEventListener("touchend", stopVerticalResizeTouch);
}

window.addEventListener("resize", adjustBlocklyDiv);
window.addEventListener("orientationchange", adjustBlocklyDiv);
adjustBlocklyDiv();
