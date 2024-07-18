import { Order } from "blockly/python";

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const blocks = Object.create(null);

blocks["text_input"] = function (block, generator) {
  const text = generator.valueToCode(block, "TEXT", Order.NONE) || "";
  // Generate the function call for this block.
  const code = `input(${text})\n`;
  return [code, Order.FUNCTION_CALL];
};
