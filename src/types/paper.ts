/**
 * B4用紙のレイアウトと座標管理
 */

import { PaperSize, DPI_RATIO, PAPER_SPECS } from './question';

/**
 * 各紙サイズのマージン設定（mm単位）
 * 上下左右の余白
 */
export const PAPER_MARGINS: Record<PaperSize, { top: number; bottom: number; left: number; right: number }> = {
  B4: { top: 15, bottom: 15, left: 15, right: 15 },
  A4: { top: 15, bottom: 15, left: 15, right: 15 },
  B5: { top: 10, bottom: 10, left: 10, right: 10 },
};

/**
 * 2段組内の段同士のマージン（mm単位）
 */
export const COLUMN_GAP_MM = 10;

/**
 * 問題ブロック間のマージン（mm単位）
 */
export const QUESTION_BLOCK_GAP_MM = 8;

/**
 * 問題番号のコンテナ高さ（mm単位）
 */
export const QUESTION_NUMBER_HEIGHT_MM = 6;

/**
 * 1マスの標準サイズ（mm単位、B4ベース）
 * 記述問題のグリッド計算に使用
 */
export const GRID_BOX_SIZE_MM = 5;

/**
 * B4用紙内の1段あたりの有効幅を計算
 */
export function getColumnWidthMM(paperSize: PaperSize): number {
  const spec = PAPER_SPECS[paperSize];
  const margins = PAPER_MARGINS[paperSize];
  const totalWidth = spec.width - margins.left - margins.right;
  const gap = spec.columns === 2 ? COLUMN_GAP_MM : 0;
  return (totalWidth - gap) / spec.columns;
}

/**
 * 1段あたりの有効高さを計算
 */
export function getColumnHeightMM(paperSize: PaperSize): number {
  const spec = PAPER_SPECS[paperSize];
  const margins = PAPER_MARGINS[paperSize];
  return spec.height - margins.top - margins.bottom;
}

/**
 * mm -> px 変換
 */
export function mmToPx(mm: number): number {
  return Math.round(mm * DPI_RATIO);
}

/**
 * px -> mm 変換
 */
export function pxToMm(px: number): number {
  return Math.round((px / DPI_RATIO) * 100) / 100;
}

/**
 * ページレイアウト用の計算オブジェクト
 */
export interface ColumnLayout {
  paperSize: PaperSize;
  columnIndex: number;              // 0 or 1（左段か右段か）
  widthMM: number;
  heightMM: number;
  currentHeightUsedMM: number;      // 現在どれだけ使用しているか
}
