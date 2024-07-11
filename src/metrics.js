import * as ScrollOptionsPlugin from "@blockly/plugin-scroll-options";
import { FixedEdgesMetricsManager } from "@blockly/fixed-edges";
import * as Blockly from "blockly";



export class PyBlocksScrollBlockDragger extends ScrollOptionsPlugin.ScrollBlockDragger {
  /**
   * Checks if the block overflows the left or right edge of the workspace
   * Includes the toolbox width as apart of the workspace
   * @param {Blockly.MetricsManager.ContainerRegion} viewMetrics The view metrics of the workspace.
   * @param {Blockly.utils.Coordinate} mouse The mouse position.
   * */
  isBlockOutsideDragMargin(viewMetrics, mouse) {
    const blockOverflows = this.getMouseOverflows_(viewMetrics, mouse);
    const width = this.workspace.toolbox_.width_ / this.workspace.scale;
    for (const side of ["left", "right"]) {
      if (
        blockOverflows[side] > -width &&
        blockOverflows[side] < width * 0.9
      ) {
        return blockOverflows["top"] < 0 && blockOverflows["bottom"] < 0;
      }
    }
    return false;
  }

  /**
   * Passes the total amount the block has moved (both from dragging and from
   * scrolling) since it was picked up.
   *
   * @override
   */
  onDrag(e, dragDelta) {
    const totalDelta = Blockly.utils.Coordinate.sum(
      this.scrollDelta_,
      dragDelta
    );

    // Call grandparent's onDrag method
    Object.getPrototypeOf(
      ScrollOptionsPlugin.ScrollBlockDragger.prototype
    ).onDrag.call(this, e, totalDelta);
    this.dragDelta_ = dragDelta;

    // Get mouse and view metrics
    const viewMetrics = this.workspace.getMetricsManager().getViewMetrics(true);
    const mouse = Blockly.utils.svgMath.screenToWsCoordinates(
      this.workspace,
      new Blockly.utils.Coordinate(e.clientX, e.clientY)
    );
    if (this.isBlockOutsideDragMargin(viewMetrics, mouse)) {
      this.stopAutoScrolling();
      return;
    }

    if (ScrollOptionsPlugin.ScrollBlockDragger.edgeScrollEnabled) {
      this.scrollWorkspaceWhileDragging_(e);
    }
  }
}





/**
 * @typedef {{
*   top: (boolean|undefined),
*   bottom: (boolean|undefined),
*   left: (boolean|undefined),
*   right: (boolean|undefined)
* }}
*/
let FixedEdgesConfig;

/**
* The current configuration for fixed edges.
* @type {!FixedEdgesConfig}
* @private
*/
const fixedEdges = {};


export class PyBlocksMetricsManager extends ScrollOptionsPlugin.ScrollMetricsManager {
  constructor(workspace) {
    super(workspace);
    this.fixedEdgesMetricsManager = new FixedEdgesMetricsManager(workspace);
    // Sets the edges that will be fixed in the workspace
    // (i.e. other directions can be scrolled infinitely)
    FixedEdgesMetricsManager.setFixedEdges({
      top: true,
      left: true,
    });
  }

  getMetrics() {
    // Combine metrics from both managers
    const fixedEdgesMetrics = this.fixedEdgesMetricsManager.getMetrics();
    const scrollMetrics = super.getMetrics();
    
    // Example of how to merge metrics
    const mergedMetrics = {
      ...fixedEdgesMetrics,
      ...scrollMetrics,
      // Any specific logic to merge/resolve conflicts
      ...{
        contentTop: Math.max(0, scrollMetrics.contentTop),
        contentLeft: Math.max(0, scrollMetrics.contentLeft)
      }
    };
    return mergedMetrics;
  }
  /**
   * Sets which edges are fixed. This does not prevent fixed edges set by
   * no scrollbars or single-direction scrollbars.
   * @param {!FixedEdgesConfig} updatedFixedEdges The edges to set as fixed.
   * @public
   */
  static setFixedEdges(updatedFixedEdges) {
    fixedEdges.top = !!updatedFixedEdges.top;
    fixedEdges.bottom = !!updatedFixedEdges.bottom;
    fixedEdges.left = !!updatedFixedEdges.left;
    fixedEdges.right = !!updatedFixedEdges.right;
  }

  /**
   * Returns whether the scroll area has fixed edges.
   * @returns {boolean} Whether the scroll area has fixed edges.
   * @package
   * @override
   */
  hasFixedEdges() {
    return true;
  }

  /**
   * Computes the fixed edges of the scroll area.
   * @param {!Blockly.MetricsManager.ContainerRegion=} cachedViewMetrics The
   *     view metrics if they have been previously computed. Passing in null may
   *     cause the view metrics to be computed again, if it is needed.
   * @returns {!Blockly.MetricsManager.FixedEdges} The fixed edges of the scroll
   *     area.
   * @protected
   * @override
   */
  getComputedFixedEdges_(cachedViewMetrics = undefined) {
    const hScrollEnabled = this.workspace_.isMovableHorizontally();
    const vScrollEnabled = this.workspace_.isMovableVertically();

    const viewMetrics = cachedViewMetrics || this.getViewMetrics(false);

    const edges = {
      top: fixedEdges.top ? 0 : undefined,
      bottom: fixedEdges.bottom ? 0 : undefined,
      left: fixedEdges.left ? 0 : undefined,
      right: fixedEdges.right ? 0 : undefined,
    };
    if (fixedEdges.top && fixedEdges.bottom) {
      edges.bottom = viewMetrics.height;
    }
    if (fixedEdges.left && fixedEdges.right) {
      edges.right = viewMetrics.width;
    }

    if (!vScrollEnabled) {
      if (edges.top !== undefined) {
        edges.bottom = edges.top + viewMetrics.height;
      } else if (edges.bottom !== undefined) {
        edges.top = edges.bottom - viewMetrics.height;
      } else {
        edges.top = viewMetrics.top;
        edges.bottom = viewMetrics.top + viewMetrics.height;
      }
    }
    if (!hScrollEnabled) {
      if (edges.left !== undefined) {
        edges.right = edges.left + viewMetrics.width;
      } else if (edges.right !== undefined) {
        edges.left = edges.right - viewMetrics.width;
      } else {
        edges.left = viewMetrics.left;
        edges.right = viewMetrics.left + viewMetrics.width;
      }
    }
    return edges;
  }
}
