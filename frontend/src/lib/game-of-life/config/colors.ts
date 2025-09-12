export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export const RECTANGLE_COLORS: RGBColor[] = [
  { r: 34, g: 197, b: 94 }, // Green (primary for initial)
  { r: 59, g: 130, b: 246 }, // Blue (primary for final)
  { r: 168, g: 85, b: 247 }, // Purple
  { r: 251, g: 146, b: 60 }, // Orange
  { r: 20, g: 184, b: 166 }, // Teal
  { r: 236, g: 72, b: 153 }, // Pink
  { r: 250, g: 204, b: 21 }, // Yellow
  { r: 239, g: 68, b: 68 }, // Red
];

export function getRGBString(color: RGBColor): string {
  return `${color.r}, ${color.g}, ${color.b}`;
}