/**
 * 問題の基本データ型定義
 * すべての問題（大問、小問、記号、記述）がこの構造に統一される
 */

export type QuestionType = 'symbol' | 'description';

export type PaperSize = 'B4' | 'A4' | 'B5';

/**
 * 紙サイズの物理的スペック（mm単位）
 * B4: 257 x 364 mm (標準的な解答用紙サイズ)
 * A4: 210 x 297 mm
 * B5: 182 x 257 mm
 */
export const PAPER_SPECS: Record<PaperSize, { width: number; height: number; columns: number }> = {
  B4: { width: 257, height: 364, columns: 2 },
  A4: { width: 210, height: 297, columns: 1 },
  B5: { width: 182, height: 257, columns: 1 },
};

/**
 * CSS内での実際の表示サイズ（px単位）
 * 1mm ≈ 3.78px（96dpi基準）
 */
export const DPI_RATIO = 3.78;

/**
 * 基本問題インターフェース
 */
export interface BaseQuestion {
  id: string;                              // ユニークID（uuid推奨）
  type: QuestionType;                       // 問題タイプ
  parentId?: string;                        // 大問IDがある場合は指定（小問が大問に属する場合）
  level: 'major' | 'minor';                 // 「大問」「小問」の区別
}

/**
 * 記号問題の具体的なデータ構造
 */
export interface SymbolQuestion extends BaseQuestion {
  type: 'symbol';
  qNumber: string | number;                 // 表示用問題番号: "1", "(1)", "Ⅰ"など
  choiceCount: number;                      // 選択肢の数: 4, 5, 6など
  width?: number;                           // 選択肢ボックスの幅（オプション、デフォルト計算値）
  innerNumber?: number;                     // 記号ボックス内の番号（例: 「① ② ③ ④」）
}

/**
 * 記述問題の具体的なデータ構造
 */
export interface DescriptionQuestion extends BaseQuestion {
  type: 'description';
  qNumber: string | number;                 // 表示用問題番号
  length: number;                           // 解答欄の「文字数」または「マス数"
  isGrid: boolean;                          // true: 原稿用紙のようなマス目 / false: 1つの長い枠
  boxWidth?: number;                        // マス1つの幅（デフォルト: 20px）
  innerNumber?: number;                     // 枠内に表示する番号
}

/**
 * 大問のグルーピング構造
 */
export interface MajorQuestionGroup {
  id: string;
  qNumber: string | number;                 // 「大問1", "Ⅰ"など
  minorQuestions: (SymbolQuestion | DescriptionQuestion)[];  // 大問配下の小問
}

/**
 * アプリ全体の問題セット
 */
export interface QuestionSet {
  id: string;
  title: string;
  paperSize: PaperSize;
  questions: (BaseQuestion | MajorQuestionGroup)[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ページレイアウトの計算結果
 * 2段組の場合、どの問題がどのページのどの段にあるかを管理
 */
export interface PageLayout {
  pageNumber: number;                       // ページ番号（1始まり）
  column: number;                           // 段番号（1 or 2）
  questions: (SymbolQuestion | DescriptionQuestion)[];
  heightUsedMM: number;                     // そのページの段で使用されたMMの高さ
}
