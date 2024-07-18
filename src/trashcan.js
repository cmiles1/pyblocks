import * as Blockly from "blockly/core";

const browserEvents = Blockly.browserEvents;
const dom = Blockly.utils.dom;
const Svg = Blockly.utils.Svg;
const SPRITE = {
  width: 96,
  height: 124,
  url: "sprites.png",
};

/** Width of both the trash can and lid images. */
const WIDTH = 47;

/** Height of the trashcan image (minus lid). */
const BODY_HEIGHT = 44;

/** Height of the lid image. */
const LID_HEIGHT = 16;

/** Location of trashcan in sprite image. */
const SPRITE_LEFT = 0;

/** Location of trashcan in sprite image. */
const SPRITE_TOP = 32;

export class PyBlocksTrashcan extends Blockly.Trashcan {
  constructor(workspace) {
    super(workspace);
    // Store the toolbox and toolbox flyout for closing/opening
    this.toolbox = workspace.getToolbox();
    this.toolboxFlyout = null;
    this.svgLid = null; // remove the lid
  }

  /**
   * Initializes the trash can.
   * @override
   */
  init() {
    super.init();
    this.toolboxFlyout = this.toolbox?.getFlyout();
    if (this.toolboxFlyout === null) {
      throw new Error("Toolbox flyout not found");
    }
    this.flyout.autoClose = true;
    var labelData = {
      kind: "label",
      text: "Recently Deleted",
      "web-class": "flyoutHeaderLabel",
    };
    this.contents.unshift(JSON.stringify(labelData));
  }

  /**
   * Handle a BLOCK_DELETE event. Adds deleted blocks oldXml to the content
   * array.
   *
   * @param event Workspace event.
   */
  onDelete(event) {
    if (
      this.workspace.options.maxTrashcanContents <= 0 ||
      event.type !== Blockly.Events.BLOCK_DELETE
    ) {
      return;
    }
    const deleteEvent = event;
    if (event.type === Blockly.Events.BLOCK_DELETE && !deleteEvent.wasShadow) {
      if (!deleteEvent.oldJson) {
        throw new Error("Encountered a delete event without proper oldJson");
      }
      const cleanedJson = JSON.stringify(
        this.cleanBlockJson(deleteEvent.oldJson)
      );
      if (this.contents.includes(cleanedJson)) {
        return;
      }
      this.contents.push(cleanedJson);
      while (
        this.contents.length > this.workspace.options.maxTrashcanContents
      ) {
        this.contents.shift();
      }
    }
  }

  /**
   * Create the trash can elements.
   * Note that this implementation skips creating the svgLid
   *
   * @returns The trash can's SVG group.
   * @override
   */
  createDom() {
    /* Here's the markup that will be generated:
        <g class="blocklyTrash">
          <clippath id="blocklyTrashBodyClipPath837493">
            <rect width="47" height="45" y="15"></rect>
          </clippath>
          <image width="64" height="92" y="-32" xlink:href="media/sprites.png"
              clip-path="url(#blocklyTrashBodyClipPath837493)"></image>
        </g>
        */

    this.svgGroup = dom.createSvgElement(Svg.G, { class: "blocklyTrash" });
    let clip;
    const rnd = String(Math.random()).substring(2);
    clip = dom.createSvgElement(
      Svg.CLIPPATH,
      { id: "blocklyTrashBodyClipPath" + rnd },
      this.svgGroup
    );
    dom.createSvgElement(
      Svg.RECT,
      { width: WIDTH, height: BODY_HEIGHT, y: LID_HEIGHT },
      clip
    );
    const body = dom.createSvgElement(
      Svg.IMAGE,
      {
        width: SPRITE.width,
        x: -SPRITE_LEFT,
        height: SPRITE.height,
        y: -SPRITE_TOP,
        "clip-path": "url(#blocklyTrashBodyClipPath" + rnd + ")",
      },
      this.svgGroup
    );
    body.setAttributeNS(
      dom.XLINK_NS,
      "xlink:href",
      this.workspace.options.pathToMedia + SPRITE.url
    );

    // bindEventWithChecks_ quashes events too aggressively. See:
    // https://groups.google.com/forum/#!topic/blockly/QF4yB9Wx00s
    // Using bindEventWithChecks_ for blocking mousedown causes issue in mobile.
    // See #4303
    browserEvents.bind(
      this.svgGroup,
      "pointerdown",
      this,
      this.blockMouseDownWhenOpenable
    );
    browserEvents.bind(this.svgGroup, "pointerup", this, this.click);
    // Bind to body instead of this.svgGroup so that we don't get lid jitters
    browserEvents.bind(body, "pointerover", this, this.mouseOver);
    browserEvents.bind(body, "pointerout", this, this.mouseOut);
    this.animateLid();
    return this.svgGroup;
  }
}
