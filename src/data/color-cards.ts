/**
 * 25/26 AW 色卡数据 (从 DONGXIAO 25-26 Color Card Catalog.pdf 提取)
 * Source: docs/color-card-pages/hires/page_19_3x.png
 * Extracted: 2026-07-22 via PIL median pixel sampling
 */

export interface ColorSwatch {
  code: string;         // e.g. "W9260"
  name_en: string;      // e.g. "PEBBLE"
  name_cn?: string;     // 可选中文名 (你之后内部命名)
  hex: string;          // e.g. "#B5C3C4"
  rgb: [number, number, number];
  category?: string;    // neutral | warm | cool | etc.
}

export interface ColorSeries {
  series: string;       // OXFORD | LONDON | CAMBRIDGE | PARIS
  series_cn: string;
  yarn_count: string;   // 26/2NM | 36/2NM | etc.
  process: string;      // Woollen Yarn | Worsted Yarn | Tape Yarn
  composition: string;  // 30% Cashmere 70% Wool | etc.
  page_in_catalog: number;
  swatch_count: number;
  swatches: ColorSwatch[];
}

export const colorSeries: ColorSeries[] = [
  {
    series: "CAMBRIDGE",
    series_cn: "剑桥",
    yarn_count: "26/2NM",
    process: "Woollen Yarn",
    composition: "100% Cashmere",
    page_in_catalog: 19,
    swatch_count: 15,
    swatches: [
      { code: "W9260", name_en: "PEBBLE", hex: "#B5C3C4", rgb: [181, 195, 196], category: "neutral" },
      { code: "W9599", name_en: "CIRRUS", hex: "#C1BEAD", rgb: [193, 190, 173], category: "neutral" },
      { code: "W0003", name_en: "IVORY", hex: "#FDFEF8", rgb: [253, 254, 248], category: "neutral" },
      { code: "N8642", name_en: "DRIZZLE", hex: "#908F84", rgb: [144, 143, 132], category: "neutral" },
      { code: "R9387", name_en: "WET SAND", hex: "#CBC2B4", rgb: [203, 194, 180], category: "neutral" },
      { code: "R5333", name_en: "PORRIDGE", hex: "#EDEDD5", rgb: [237, 237, 213], category: "neutral" },
      { code: "C9575", name_en: "SLATE", hex: "#37362F", rgb: [55, 54, 47], category: "neutral" },
      { code: "W9528", name_en: "OTTER", hex: "#BCB18F", rgb: [188, 177, 143], category: "neutral" },
      { code: "R5822", name_en: "SHORTBREAD", hex: "#EAC9A3", rgb: [234, 201, 163], category: "neutral" },
      { code: "W9789", name_en: "CHARCOAL", hex: "#111111", rgb: [17, 17, 17], category: "neutral" },
      { code: "N5178", name_en: "SABLE", hex: "#96948E", rgb: [150, 148, 142], category: "neutral" },
      { code: "T5005", name_en: "MILLET", hex: "#E4CEA7", rgb: [228, 206, 167], category: "neutral" },
      { code: "W6300", name_en: "BLACK", hex: "#000000", rgb: [0, 0, 0], category: "neutral" },
      { code: "R9470", name_en: "GRIZZLY", hex: "#777575", rgb: [119, 117, 117], category: "neutral" },
      { code: "N9095", name_en: "BARLEY", hex: "#C8AF8C", rgb: [200, 175, 140], category: "neutral" },
    ],
  },
];