import {
  Backpack as BackpackPlugin,
  BackpackChange,
} from "@blockly/workspace-backpack";
import * as Blockly from "blockly/core";

/**
 * Base64 encoded data uri for backpack  icon.
 */
const backpackSvgDataUri =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+Cjxzdmcgd2lkdGg9Ij" +
  "IxLjQ4OTk5OTk5OTk5OTk5NSIgaGVpZ2h0PSIyMS4wOSIgeG1sbnM9Imh0dHA6Ly93d3cudz" +
  "Mub3JnLzIwMDAvc3ZnIiB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIi" +
  "BjbGFzcz0ic2hvd2VkIiBkYXRhLWRyYXdpbmctc2NhbGU9IjEiIGRhdGEtdW5pdC1rZXk9Ik" +
  "1JTExJTUVURVIiIGRhdGEtdmVyc2lvbj0iY2xpcGJvYXJkIj4KIDxnIGNsYXNzPSJsYXllci" +
  "I+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxnIGlkPSJzdmdfMTMiPgogICA8ZWxsaX" +
  "BzZSBjeD0iMTAuNzUiIGN5PSIxMC43NSIgZmlsbD0iI2Y0ZjRmNCIgaWQ9InN2Z18xNSIgcn" +
  "g9IjYuNjEiIHJ5PSI2LjYxIiBzdHJva2U9IiMwMDAwMDAiLz4KICAgPGcgaWQ9IlNWR1JlcG" +
  "9faWNvbkNhcnJpZXIiIHRyYW5zZm9ybT0ibWF0cml4KDAuNzAwNDEgMCAwIDAuNzAwNDEgMy" +
  "43Nzg2OCAzLjkxMTY3KSI+CiAgICA8ZyBpZD0ic3ZnXzEiIHRyYW5zZm9ybT0ibWF0cml4KD" +
  "EgMCAwIDEgLTAuMDAwMDAxNjc1MDYgMC4wMDAwMDIxNjQ2OCkiPgogICAgIDxnIGlkPSJzdm" +
  "dfMiIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgMSA4LjUyNjUxZS0xNCAxLjQzODg1ZS0xMy" +
  "kiPgogICAgICA8cGF0aCBkPSJtNy4zNSw2LjAxbC0wLjY3LDBjLTAuNTQsMCAtMC45OSwwLj" +
  "Q1IC0wLjk5LDAuOTlsMCwxLjU4YzAsMC4xNCAwLjExLDAuMjUgMC4yNSwwLjI1YzAuMTQsMC" +
  "AwLjI1LC0wLjExIDAuMjUsLTAuMjVsMCwtMS41OGMwLC0wLjI3IDAuMjIsLTAuNDkgMC40OS" +
  "wtMC40OWwwLjY3LDBjMC4xNCwwIDAuMjUsLTAuMTEgMC4yNSwtMC4yNWMwLC0wLjE0IC0wLj" +
  "ExLC0wLjI1IC0wLjI1LC0wLjI1eiIgaWQ9InN2Z18zIi8+CiAgICAgPC9nPgogICAgPC9nPg" +
  "ogICAgPGcgaWQ9InN2Z180IiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAxIC0wLjAwMDAwMT" +
  "Y3NTA2IDAuMDAwMDAyMTY0NjgpIj4KICAgICA8ZyBpZD0ic3ZnXzUiIHRyYW5zZm9ybT0ibW" +
  "F0cml4KDEgMCAwIDEgOC41MjY1MWUtMTQgMS40Mzg4NWUtMTMpIj4KICAgICAgPHBhdGggZD" +
  "0ibTguMTYsNi4wMWwwLDBjLTAuMTQsMCAtMC4yNiwwLjExIC0wLjI2LDAuMjVjMCwwLjE0ID" +
  "AuMTIsMC4yNSAwLjI2LDAuMjVsMCwwYzAuMTQsMCAwLjI1LC0wLjExIDAuMjUsLTAuMjVjMC" +
  "wtMC4xNCAtMC4xMSwtMC4yNSAtMC4yNSwtMC4yNXoiIGlkPSJzdmdfNiIvPgogICAgIDwvZz" +
  "4KICAgIDwvZz4KICAgIDxnIGlkPSJzdmdfNyIgdHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgMS" +
  "AtMC4wMDAwMDE2NzUwNiAwLjAwMDAwMjE2NDY4KSI+CiAgICAgPGcgaWQ9InN2Z184IiB0cm" +
  "Fuc2Zvcm09Im1hdHJpeCgxIDAgMCAxIDguNTI2NTFlLTE0IDEuNDM4ODVlLTEzKSI+CiAgIC" +
  "AgIDxwYXRoIGQ9Im0tNjI3LjQsLTAuNTFjMC4wMSwtMC41IDAuMzIsLTAuODEgMC44LC0wLj" +
  "gxYzAuMzUsMCAwLjUzLDAuMTUgMC42OCwwLjI3YzAuMDksMC4wNyAwLjE3LDAuMTQgMC4zMS" +
  "wwLjE4YzAuMDUsMC4wMiAwLjEsMC4wMiAwLjE4LDAuMDJjMC40NSwwIDAuODIsLTAuMzcgMC" +
  "44MiwtMC44MmMwLC0wLjQ1IC0wLjM3LC0wLjgyIC0wLjgyLC0wLjgyYy0wLjA4LDAgLTAuMT" +
  "MsMC4wMSAtMC4xOCwwLjAyYy0wLjE0LDAuMDUgLTAuMjIsMC4xMSAtMC4zMSwwLjE5Yy0wLj" +
  "E1LDAuMTIgLTAuMzMsMC4yNyAtMC42OCwwLjI3Yy0wLjQ1LDAgLTAuNzgsLTAuMzMgLTAuOC" +
  "wtMC44YzAsMCAwLC0wLjAxIDAsLTAuMDFsMCwtMi4yOWMwLC0wLjcyIDAuNTksLTEuMzEgMS" +
  "4zMSwtMS4zMWwyLjI0LDBjMC4xLDAgMC4xOSwtMC4wMyAwLjI1LC0wLjA4YzAuMDYsLTAuMD" +
  "UgMC4wOSwtMC4xMiAwLjA5LC0wLjIyYzAsLTAuMTcgLTAuMDUsLTAuMjQgLTAuMTUsLTAuMz" +
  "ZjLTAuMDksLTAuMTEgLTAuMjEsLTAuMjUgLTAuMjgsLTAuNDljLTAuMDMsLTAuMDkgLTAuMD" +
  "QsLTAuMTkgLTAuMDQsLTAuMzJjMCwtMC43MyAwLjU5LC0xLjMyIDEuMzIsLTEuMzJjMC43My" +
  "wwIDEuMzIsMC41OSAxLjMyLDEuMzJjMCwwLjEyIC0wLjAxLDAuMjMgLTAuMDQsMC4zMmMtMC" +
  "4wNywwLjI0IC0wLjE5LDAuMzggLTAuMjgsMC40OWMtMC4xLDAuMTIgLTAuMTUsMC4xOSAtMC" +
  "4xNSwwLjM2YzAsMC4xNSAwLjA0LDAuMyAwLjM0LDAuM2wyLjI3LDBjMC43MiwwIDEuMzEsMC" +
  "41OSAxLjMxLDEuMzFsMCwyLjI1YzAsMC4xMSAwLjAzLDAuMzUgMC4zLDAuMzVjMC4xNywwID" +
  "AuMjMsLTAuMDYgMC4zNiwtMC4xNmMwLjExLC0wLjA5IDAuMjUsLTAuMjEgMC40OSwtMC4yOG" +
  "MwLjA5LC0wLjAyIDAuMTksLTAuMDQgMC4zMiwtMC4wNGMwLjczLDAgMS4zMiwwLjYgMS4zMi" +
  "wxLjMyYzAsMC43MyAtMC41OSwxLjMyIC0xLjMyLDEuMzJjLTAuMTMsMCAtMC4yMywtMC4wMS" +
  "AtMC4zMiwtMC4wNGMtMC4yNCwtMC4wNyAtMC4zOCwtMC4xOCAtMC40OSwtMC4yOGMtMC4xMy" +
  "wtMC4xIC0wLjE5LC0wLjE1IC0wLjM2LC0wLjE1Yy0wLjE1LDAgLTAuMywwLjA0IC0wLjMsMC" +
  "4zNGwwLDIuMjZjMCwwLjcyIC0wLjU5LDEuMzEgLTEuMzEsMS4zMWwtMi4yNywwYy0wLjUyLD" +
  "AgLTAuODQsLTAuMzEgLTAuODQsLTAuODFjMCwtMC4zNSAwLjE0LC0wLjUzIDAuMjYsLTAuNj" +
  "djMC4wOCwtMC4wOSAwLjE1LC0wLjE3IDAuMTksLTAuMzJjMC4wMSwtMC4wNCAwLjAyLC0wLj" +
  "EgMC4wMiwtMC4xN2MwLC0wLjQ1IC0wLjM3LC0wLjgyIC0wLjgyLC0wLjgyYy0wLjQ1LDAgLT" +
  "AuODIsMC4zNyAtMC44MiwwLjgyYzAsMC4wNyAwLjAxLDAuMTMgMC4wMiwwLjE3YzAuMDQsMC" +
  "4xNSAwLjExLDAuMjMgMC4xOSwwLjMyYzAuMTEsMC4xNCAwLjI2LDAuMzIgMC4yNiwwLjY3Yz" +
  "AsMC4yNSAtMC4wOSwwLjQ2IC0wLjI2LDAuNjFjLTAuMTYsMC4xMyAtMC4zNiwwLjIgLTAuNT" +
  "gsMC4ybC0yLjI0LDBjLTAuNzIsMCAtMS4zMSwtMC41OSAtMS4zMSwtMS4zMWwwLC0yLjI4Yz" +
  "AsLTAuMDEgMCwtMC4wMSAwLC0wLjAxem0wLjUsMi4yOWMwLDAuNDUgMC4zNiwwLjgxIDAuOD" +
  "EsMC44MWwyLjI0LDBjMC4xLDAgMC4xOSwtMC4wMyAwLjI1LC0wLjA4YzAuMDYsLTAuMDUgMC" +
  "4wOSwtMC4xMyAwLjA5LC0wLjIzYzAsLTAuMTcgLTAuMDUsLTAuMjMgLTAuMTUsLTAuMzVjLT" +
  "AuMDksLTAuMTEgLTAuMjEsLTAuMjUgLTAuMjgsLTAuNDljLTAuMDMsLTAuMSAtMC4wNCwtMC" +
  "4yIC0wLjA0LC0wLjMyYzAsLTAuNzMgMC41OSwtMS4zMiAxLjMyLC0xLjMyYzAuNzMsMCAxLj" +
  "MyLDAuNTkgMS4zMiwxLjMyYzAsMC4xMiAtMC4wMSwwLjIyIC0wLjA0LDAuMzJjLTAuMDcsMC" +
  "4yNCAtMC4xOSwwLjM4IC0wLjI4LDAuNDljLTAuMSwwLjEyIC0wLjE1LDAuMTggLTAuMTUsMC" +
  "4zNWMwLDAuMTYgMC4wNCwwLjMxIDAuMzQsMC4zMWwyLjI3LDBjMC40NSwwIDAuODEsLTAuMz" +
  "YgMC44MSwtMC44MWwwLC0yLjI2YzAsLTAuNTIgMC4zMSwtMC44NCAwLjgsLTAuODRjMC4zNS" +
  "wwIDAuNTMsMC4xNSAwLjY4LDAuMjdjMC4wOSwwLjA3IDAuMTcsMC4xNCAwLjMxLDAuMThjMC" +
  "4wNSwwLjAyIDAuMSwwLjAyIDAuMTgsMC4wMmMwLjQ1LDAgMC44MiwtMC4zNiAwLjgyLC0wLj" +
  "gyYzAsLTAuNDUgLTAuMzcsLTAuODIgLTAuODIsLTAuODJjLTAuMDgsMCAtMC4xMywwLjAxIC" +
  "0wLjE4LDAuMDJjLTAuMTQsMC4wNSAtMC4yMiwwLjExIC0wLjMxLDAuMTljLTAuMTUsMC4xMi" +
  "AtMC4zMywwLjI3IC0wLjY4LDAuMjdjLTAuNDcsMCAtMC44LC0wLjM1IC0wLjgsLTAuODVsMC" +
  "wtMi4yNWMwLC0wLjQ1IC0wLjM2LC0wLjgxIC0wLjgxLC0wLjgxbC0yLjI3LDBjLTAuNTIsMC" +
  "AtMC44NCwtMC4zMSAtMC44NCwtMC44YzAsLTAuMzYgMC4xNCwtMC41MyAwLjI2LC0wLjY4Yz" +
  "AuMDgsLTAuMDkgMC4xNSwtMC4xNyAwLjE5LC0wLjMyYzAuMDEsLTAuMDQgMC4wMiwtMC4wOS" +
  "AwLjAyLC0wLjE3YzAsLTAuNDUgLTAuMzcsLTAuODIgLTAuODIsLTAuODJjLTAuNDUsMCAtMC" +
  "44MiwwLjM3IC0wLjgyLDAuODJjMCwwLjA4IDAuMDEsMC4xMyAwLjAyLDAuMTdjMC4wNCwwLj" +
  "E1IDAuMTEsMC4yMyAwLjE5LDAuMzJjMC4xMSwwLjE1IDAuMjYsMC4zMiAwLjI2LDAuNjhjMC" +
  "wwLjI0IC0wLjA5LDAuNDYgLTAuMjYsMC42Yy0wLjE2LDAuMTMgLTAuMzYsMC4yIC0wLjU4LD" +
  "AuMmwtMi4yNCwwYy0wLjQ1LDAgLTAuODEsMC4zNiAtMC44MSwwLjgxbDAsMi4yOGMwLjAxLD" +
  "AuMTIgMC4wNiwwLjMxIDAuMywwLjMxYzAuMTcsMCAwLjIzLC0wLjA1IDAuMzYsLTAuMTVjMC" +
  "4xMSwtMC4wOSAwLjI1LC0wLjIxIDAuNDksLTAuMjhjMC4wOSwtMC4wMyAwLjE5LC0wLjA0ID" +
  "AuMzIsLTAuMDRjMC43MywwIDEuMzIsMC41OSAxLjMyLDEuMzJjMCwwLjczIC0wLjU5LDEuMz" +
  "IgLTEuMzIsMS4zMmMtMC4xMywwIC0wLjIzLC0wLjAxIC0wLjMyLC0wLjA0Yy0wLjI0LC0wLj" +
  "A3IC0wLjM4LC0wLjE4IC0wLjQ5LC0wLjI4Yy0wLjEzLC0wLjEgLTAuMTksLTAuMTUgLTAuMz" +
  "YsLTAuMTVjLTAuMTUsMCAtMC4yOSwwLjA0IC0wLjMsMC4zMmwwLDIuMjhsMCwweiIgaWQ9In" +
  "N2Z185IiB0cmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAxIDYzMi4yNTkgMTEuNzgyOSkiLz4KIC" +
  "AgICA8L2c+CiAgICA8L2c+CiAgIDwvZz4KICAgPHBhdGggZD0ibTExLjc0LDkuNTZjMC4wMi" +
  "wtMC4wNyAtMC4wMiwtMC4xNSAtMC4wOSwtMC4xN2MtMC4wNywtMC4wMiAtMC4xNCwwLjAyIC" +
  "0wLjE3LDAuMDlsLTAuNTMsMS45NmMtMC4wMiwwLjA3IDAuMDIsMC4xNSAwLjA5LDAuMTdjMC" +
  "4wNywwLjAyIDAuMTUsLTAuMDIgMC4xNywtMC4wOWwwLjUyLC0xLjk2eiIgZmlsbD0iIzAwMD" +
  "AwMCIgaWQ9InN2Z18xMCIvPgogICA8cGF0aCBkPSJtMTAuNTQsOS44NWMwLjA0LDAuMDYgMC" +
  "4wMiwwLjE1IC0wLjAyLDAuMTlsLTAuNDIsMC4zNGMtMC4wNywwLjA2IC0wLjA3LDAuMTcgMC" +
  "wwLjIxbDAuNDIsMC4zNGMwLjA2LDAuMDUgMC4wNywwLjE0IDAuMDIsMC4xOWMtMC4wNCwwLj" +
  "A3IC0wLjEzLDAuMDggLTAuMTksMC4wMmwtMC40MiwtMC4zNGMtMC4yMSwtMC4xNyAtMC4yMS" +
  "wtMC41IDAsLTAuNjZsMC40MiwtMC4zNGMwLjA3LC0wLjA1IDAuMTUsLTAuMDMgMC4xOSwwLj" +
  "AybDAsMC4wMWwwLDAuMDF6IiBmaWxsPSIjMDAwMDAwIiBpZD0ic3ZnXzExIi8+CiAgIDxwYX" +
  "RoIGQ9Im0xMi4xOCwxMS4xM2MtMC4wNSwtMC4wNiAtMC4wMywtMC4xNSAwLjAyLC0wLjE5bD" +
  "AuNDMsLTAuMzRjMC4wNywtMC4wNiAwLjA3LC0wLjE3IDAsLTAuMjFsLTAuNDMsLTAuMzRjLT" +
  "AuMDYsLTAuMDUgLTAuMDcsLTAuMTQgLTAuMDIsLTAuMTljMC4wNCwtMC4wNyAwLjEzLC0wLj" +
  "A4IDAuMTgsLTAuMDJsMC40MywwLjM0YzAuMjEsMC4xNyAwLjIxLDAuNSAwLDAuNjZsLTAuND" +
  "MsMC4zNGMtMC4wNiwwLjA1IC0wLjE0LDAuMDMgLTAuMTgsLTAuMDJsMCwtMC4wMWwwLC0wLj" +
  "AxeiIgZmlsbD0iIzAwMDAwMCIgaWQ9InN2Z18xMiIvPgogIDwvZz4KIDwvZz4KPC9zdmc+";

/**
 * Base64 encoded data uri for backpack icon when filled.
 */
const backpackFilledSvgDataUri = backpackSvgDataUri;

/**
 * Backpack plugin for Blockly, positioned above the zoom controls in the workspace
 * @extends {BackpackPlugin}
 */
export class Backpack extends BackpackPlugin {
  MARGIN_HORIZONTAL_ = 50;
  spriteSize = 75;
  spriteTop = 0;

  init(workspace) {
    super.init();

    this.toolbox = workspace.getToolbox();
    this.toolboxFlyout = this.toolbox.getFlyout();
    // Add a label block to the flyout content.
    var labelData = JSON.stringify({
      kind: "label",
      text: "Backpack",
      "web-class": "flyoutHeaderLabel",
    });
    this.contents_.push(labelData);
    // Bind toolbox buttons to open/close the backpack
    this.toolbox.contents_.forEach((categoryDiv) => {
      if (categoryDiv.name_ === "Backpack") {
        categoryDiv.onClick = () => {
          this.open();
        };
      } else {
        categoryDiv.onClick = () => {
          this.toolboxFlyout.setVisible(true);
          super.close();
        };
      }
    });
  }
  /**
   * Opens the backpack.
   * @override
   **/
  open() {
    this.toolbox.selectCategoryByName("Backpack");
    this.toolboxFlyout.setVisible(false);
    this.workspace_.trashcan?.closeFlyout();
    super.open();
  }

  /**
   * Closes the backpack.
   * @override
   */
  close() {
    super.close();
    if (!this.toolboxFlyout.isVisible()) {
      this.toolboxFlyout.setVisible(true);
    }
  }

  /**
   * Creates and initializes the flyout and inserts it into the dom.
   * @override
   */
  initFlyout() {
    // Create flyout options.
    const flyoutWorkspaceOptions = new Blockly.Options({
      scrollbars: true,
      parentWorkspace: this.workspace_,
      rtl: this.workspace_.RTL,
      oneBasedIndex: this.workspace_.options.oneBasedIndex,
      renderer: this.workspace_.options.renderer,
      rendererOverrides: this.workspace_.options.rendererOverrides,
      move: {
        scrollbars: true,
      },
    });
    // Create vertical flyout.
    // overriden to set the backpack position to left
    flyoutWorkspaceOptions.toolboxPosition =
      Blockly.utils.toolbox.Position.LEFT;
    const VerticalFlyout = Blockly.registry.getClassFromOptions(
      Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
      this.workspace_.options,
      true
    );
    if (VerticalFlyout) {
      this.flyout_ = new VerticalFlyout(flyoutWorkspaceOptions);
    } else {
      throw new Error("VerticalFlyout does not exist");
    }

    // Add flyout to DOM.
    const parentNode = this.workspace_.getParentSvg().parentNode;
    parentNode?.appendChild(this.flyout_?.createDom(Blockly.utils.Svg.SVG));
    this.flyout_.init(this.workspace_);
  }

  /**
   * Positions the backpack.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   *
   * @param metrics The workspace metrics.
   * @param savedPositions List of rectangles that
   *     are already on the workspace.
   * @override
   */
  position(metrics, savedPositions) {
    if (!this.initialized_) {
      return;
    }

    const scrollbars = this.workspace_.scrollbar;
    const hasVerticalScrollbars =
      scrollbars && scrollbars.isVisible() && scrollbars.canScrollVertically();
    const hasHorizontalScrollbars =
      scrollbars &&
      scrollbars.isVisible() &&
      scrollbars.canScrollHorizontally();

    if (
      metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_LEFT ||
      (this.workspace_.horizontalLayout && !this.workspace_.RTL)
    ) {
      // Right corner placement.
      this.left_ =
        metrics.absoluteMetrics.left +
        metrics.viewMetrics.width -
        this.WIDTH_ -
        this.MARGIN_HORIZONTAL_;
      if (hasVerticalScrollbars && !this.workspace_.RTL) {
        this.left_ -= Blockly.Scrollbar.scrollbarThickness;
      }
    } else {
      // Left corner placement.
      this.left_ = this.MARGIN_HORIZONTAL_;
      if (hasVerticalScrollbars && this.workspace_.RTL) {
        this.left_ += Blockly.Scrollbar.scrollbarThickness;
      }
    }

    // Top corner placement
    this.top_ = metrics.absoluteMetrics.top + this.MARGIN_VERTICAL_;
    if (hasHorizontalScrollbars) {
      // The horizontal scrollbars are always positioned on the bottom.
      this.top_ -= Blockly.Scrollbar.scrollbarThickness;
    }

    // Check for collision and bump if needed.
    let boundingRect = this.getBoundingRectangle();
    for (let i = 0, otherEl; (otherEl = savedPositions[i]); i++) {
      if (boundingRect.intersects(otherEl)) {
        // Bump up.
        this.top_ = otherEl.top - this.HEIGHT_ - this.MARGIN_VERTICAL_;
        // Recheck other savedPositions
        boundingRect = this.getBoundingRectangle();
        i = -1;
      }
    }

    if (this.svgGroup_) {
      this.svgGroup_.setAttribute(
        "transform",
        `translate(${this.left_},${this.top_})`
      );
    }
  }

  /**
   * Adds multiple items to the backpack.
   *
   * @param items The backpack contents to add.
   */
  addItems(items) {
    const addedItems = this.filterDuplicates(items);
    if (addedItems.length) {
      this.contents_.push(...addedItems);
      this.onContentChange();
    }
  }

  /**
   * Handles content change.
   * @override
   */
  onContentChange() {
    this.maybeRefreshFlyoutContents();
    Blockly.Events.fire(new BackpackChange(this.workspace_.id));

    if (!this.options.useFilledBackpackImage || !this.svgImg_) return;
    if (this.contents_.length > 0) {
      this.svgImg_.setAttributeNS(
        Blockly.utils.dom.XLINK_NS,
        "xlink:href",
        backpackFilledSvgDataUri
      );
    } else {
      this.svgImg_.setAttributeNS(
        Blockly.utils.dom.XLINK_NS,
        "xlink:href",
        backpackSvgDataUri
      );
    }
  }

  /**
   * Creates DOM for UI element.
   * @override
   */
  createDom() {
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      { class: "backpackHolder" },
      null
    );
    this.svgImg_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        class: "blocklyBackpack",
        width: this.spriteSize + "px",
        x: this.spriteLeft,
        height: this.spriteSize + "px",
        y: -this.spriteTop,
        cursor: "pointer",
        style: `opacity: 0.8;`,
      },
      this.svgGroup_
    );

    this.svgImg_.setAttributeNS(
      Blockly.utils.dom.XLINK_NS,
      "xlink:href",
      backpackSvgDataUri
    );

    Blockly.utils.dom.insertAfter(
      this.svgGroup_,
      this.workspace_.getBubbleCanvas()
    );
  }
}
