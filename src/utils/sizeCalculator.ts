/**
 * B4用紙用のロジック
 * 記号問題の幅計算（選択肢数から自動的に□の幅を決定）
 * 記述問題の幅計算（文字数からマス幅を決定）
 */

import { getColumnWidthMM, mmToPx } from '../types/paper';
import { PaperSize } from '../types/question';

/**
 * 記号問題用: 選択肢数から、1つの□の幅を計算（mm単位）
 *
 * B4用紙1段の幅: 約114mm
 * マージン・問題番号などで約100mm使用可能
 * 記号4個: 各25mm程度
 * 記号5個: 各20mm程度
 * 記号6個: 各16mm程度
 *
 * 計算式: (有効幅 - 記号間マージン) / 記号数
 */
export function calculateSymbolBoxWidth(
  choiceCount: number,
  paperSize: PaperSize,
  marginBetweenBoxes: number = 2 // mm
): number {
  const columnWidth = getColumnWidthMM(paperSize);
  // 問題番号やその他のマージン(左右各5mm)
  const effectiveWidth = columnWidth - 10;
  // 選択肢間のマージンの総和
  const totalMargin = marginBetweenBoxes * (choiceCount - 1);
  // 1つの□の幅
  const boxWidth = (effectiveWidth - totalMargin) / choiceCount;

  return Math.max(boxWidth, 10); // 最小幅10mm
}

/**
 * 記述問題用: 文字数から、マス目のトータル幅を計算（mm単位）
 *
 * 1マスのサイズ: 5mm (標準的な原稿用紙規格)
 * 文字数20: 100mm
 * 文字数40: 200mm（1段に収まらないため複数行になる可能性）
 *
 * isGrid=false（長い枠）の場合: boxWidth × 文字数 = トータル幅
 * isGrid=true（マス目）の場合: 段の幅に収まるように自動折り返しを考慮
 */
export function calculateDescriptionWidth(
  length: number,
  paperSize: PaperSize,
  boxWidth: number = 5 // mm (1マスのデフォルト)
): number {
  const columnWidth = getColumnWidthMM(paperSize);
  const effectiveWidth = columnWidth - 10; // 左右マージン

  // マス目モード: 文字数分の幅を確保
  const totalWidth = length * boxWidth;

  // 一段に収まれば返す、収まらなければ段の幅に合わせる
  return Math.min(totalWidth, effectiveWidth);
}

/**
 * 記号問題の□の高さ（px単位）
 * 通常は固定値
 */
export function getSymbolBoxHeightPx(): number {
  return mmToPx(8);
}

/**
 * 記述問題の1行の高さ（px単位）
 * マス目と長い枠で同じ
 */
export function getDescriptionLineHeightPx(): number {
  return mmToPx(5);
}

/**
 * Canvas状の座標計算: 問題がどの(x, y)に配置されるか計算
 * ページレイアウトからの集計で使用
 */
export interface QuestionPosition {
  pageNumber: number;
  column: number; // 0=左段, 1=右段
  offsetTopPx: number; // ページ内での相対Y座標
  offsetLeftPx: number; // 段内での相対X座標
}

export function calculateQuestionPosition(
  pageNumber: number,
  columnIndex: number,
  offsetTopMM: number,
  paperSize: PaperSize
): QuestionPosition {
  const { mmToPx } = require('../types/paper');
  const margins = require('../types/paper').PAPER_MARGINS[paperSize];
  const columnWidth = getColumnWidthMM(paperSize);
  const { COLUMN_GAP_MM } = require('../types/paper');

  let offsetLeftPx = mmToPx(margins.left);
  if (columnIndex === 1) {
    offsetLeftPx += mmToPx(columnWidth + COLUMN_GAP_MM);
  }

  return {
    pageNumber,
    column: columnIndex,
    offsetTopPx: mmToPx(margins.top + offsetTopMM),
    offsetLeftPx,
  };
}
