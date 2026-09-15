/**
 * ページレイアウト計算ロジック
 * 複数の問題をB4用紙の2段組みに配置し、ページネーションを自動計算
 * 最も複雑なビジネスロジックの一つ
 */

import {
  SymbolQuestion,
  DescriptionQuestion,
  MajorQuestionGroup,
  PaperSize,
  BaseQuestion,
  PageLayout,
} from '../types/question';
import {
  getColumnWidthMM,
  getColumnHeightMM,
  PAPER_MARGINS,
  QUESTION_BLOCK_GAP_MM,
  QUESTION_NUMBER_HEIGHT_MM,
  GRID_BOX_SIZE_MM,
  ColumnLayout,
} from '../types/paper';

/**
 * 問題ブロックの高さを推定（mm単位）
 * 記号問題: 問題番号 + 選択肢ボックス高さ
 * 記述問題: 問題番号 + マス目の高さ（文字数に応じて計算）
 */
function estimateQuestionHeightMM(
  question: SymbolQuestion | DescriptionQuestion
): number {
  let answerAreaHeight = 0;

  if (question.type === 'symbol') {
    // 記号問題: □の高さ ≒ 8-10mm
    const symbolQ = question as SymbolQuestion;
    answerAreaHeight = 8; // 固定値（デザイン次第で調整可能）n  } else {
    // 記述問題: マス目の高さ = (文字数 + 改行数) × 高さ
    const descQ = question as DescriptionQuestion;
    if (descQ.isGrid) {
      // マス目モード: 5mm × 1行（ここではシンプルに1行想定）
      answerAreaHeight = GRID_BOX_SIZE_MM;
    } else {
      // 長い枠モード: 8mm高さの1本線
      answerAreaHeight = 8;
    }
  }

  // 問題番号 + マージン + 解答欄
  return QUESTION_NUMBER_HEIGHT_MM + 2 + answerAreaHeight + QUESTION_BLOCK_GAP_MM;
}

/**
 * 大問グループの総高さを計算
 */
function estimateMajorGroupHeightMM(group: MajorQuestionGroup): number {
  let totalHeight = QUESTION_NUMBER_HEIGHT_MM + 4; // 大問タイトル部分
  totalHeight += group.minorQuestions.reduce((sum, q) => {
    return sum + estimateQuestionHeightMM(q);
  }, 0);
  return totalHeight;
}

/**
 * ページレイアウト計算メイン関数
 * 問題リストをB4用紙に配置し、ページごとの段ごとの問題リストを返す
 */
export function calculatePageLayout(
  questions: (BaseQuestion | MajorQuestionGroup)[],
  paperSize: PaperSize
): PageLayout[] {
  const layouts: PageLayout[] = [];
  let currentPageNumber = 1;
  let currentColumn = 0; // 0=左段, 1=右段
  let currentColumnHeightUsed = 0;

  const columnHeightMM = getColumnHeightMM(paperSize);
  const columnWidthMM = getColumnWidthMM(paperSize);
  const margins = PAPER_MARGINS[paperSize];

  // フラット化: MajorQuestionGroup を展開して単一のリストにする
  const flatQuestions: (SymbolQuestion | DescriptionQuestion)[] = [];
  const questionMetadata: Map<string, { parentId?: string }> = new Map();

  questions.forEach((q) => {
    if ('minorQuestions' in q) {
      // 大問グループ
      const group = q as MajorQuestionGroup;
      group.minorQuestions.forEach((mq) => {
        flatQuestions.push(mq);
        questionMetadata.set(mq.id, { parentId: group.id });
      });
    } else {
      // 単独問題
      flatQuestions.push(q as SymbolQuestion | DescriptionQuestion);
    }
  });

  // 問題を1つずつ配置していく
  for (const question of flatQuestions) {
    const questionHeight = estimateQuestionHeightMM(question);

    // 現在の段に入るかチェック
    if (currentColumnHeightUsed + questionHeight <= columnHeightMM) {
      // 現在の段に追加
      let layout = layouts.find(
        (l) => l.pageNumber === currentPageNumber && l.column === currentColumn
      );
      if (!layout) {
        layout = {
          pageNumber: currentPageNumber,
          column: currentColumn,
          questions: [],
          heightUsedMM: 0,
        };
        layouts.push(layout);
      }
      layout.questions.push(question);
      layout.heightUsedMM = currentColumnHeightUsed + questionHeight;
      currentColumnHeightUsed += questionHeight;
    } else {
      // 次の段（または次のページ）に移動
      if (currentColumn === 0) {
        // 左段→右段
        currentColumn = 1;
        currentColumnHeightUsed = 0;

        const layout: PageLayout = {
          pageNumber: currentPageNumber,
          column: currentColumn,
          questions: [question],
          heightUsedMM: questionHeight,
        };
        layouts.push(layout);
        currentColumnHeightUsed = questionHeight;
      } else {
        // 右段→次ページの左段
        currentPageNumber += 1;
        currentColumn = 0;
        currentColumnHeightUsed = 0;

        const layout: PageLayout = {
          pageNumber: currentPageNumber,
          column: currentColumn,
          questions: [question],
          heightUsedMM: questionHeight,
        };
        layouts.push(layout);
        currentColumnHeightUsed = questionHeight;
      }
    }
  }

  return layouts;
}

/**
 * ページレイアウトから、各ページの段の幅・高さを計算
 */
export function getColumnLayout(
  paperSize: PaperSize,
  columnIndex: number
): ColumnLayout {
  const widthMM = getColumnWidthMM(paperSize);
  const heightMM = getColumnHeightMM(paperSize);

  return {
    paperSize,
    columnIndex,
    widthMM,
    heightMM,
    currentHeightUsedMM: 0,
  };
}
