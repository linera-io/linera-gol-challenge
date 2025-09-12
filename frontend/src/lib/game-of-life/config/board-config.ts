// Board display configuration
export const BOARD_CONFIG = {
  // Maximum board canvas width in pixels
  MAX_DESKTOP_WIDTH: 720, // Desktop: max 720px wide
  MAX_MOBILE_WIDTH: 400, // Mobile: max 400px wide

  // Cell size constraints
  MIN_CELL: 10, // Minimum cell size for visibility
  MAX_CELL: 50, // Maximum cell size for small puzzles

  // Canvas threshold
  CANVAS_THRESHOLD: 50, // Use canvas for boards larger than this

  // Cell color
  CELL_COLOR: "#DE2A02", // Linera primary color for alive cells
};
