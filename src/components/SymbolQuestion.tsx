/**
 * SymbolQuestion コンポーネント
 * 記号問題の解答欄を生成（選択肢ボックス）
 * 選択肢数に応じて自動的に□の幅を計算
 */

import React, { useMemo } from 'react';
import { SymbolQuestion as SymbolQuestionType } from '../types/question';
import { calculateSymbolBoxWidth, getSymbolBoxHeightPx } from '../utils/sizeCalculator';
import { mmToPx } from '../types/paper';
import '../styles/symbol.css';

interface SymbolQuestionProps {
  question: SymbolQuestionType;
  onUpdate?: (updates: Partial<SymbolQuestionType>) => void;
  isEditable?: boolean;
}

const SYMBOL_MARKS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

export const SymbolQuestion: React.FC<SymbolQuestionProps> = ({
  question,
  onUpdate,
  isEditable = false,
}) => {
  const boxHeightPx = getSymbolBoxHeightPx();
  
  // 選択肢ボックスの幅を計算（mm → px変換）
  const boxWidthMM = calculateSymbolBoxWidth(question.choiceCount, 'B4');
  const boxWidthPx = mmToPx(boxWidthMM);

  // 選択肢ボックスを生成
  const choiceBoxes = useMemo(() => {
    return Array.from({ length: question.choiceCount }).map((_, index) => (
      <div
        key={index}
        className="symbol-choice-box"
        style={{
          width: `${boxWidthPx}px`,
          height: `${boxHeightPx}px`,
        }}
      >
        {/* 枠の上に番号を表示 */}
        {question.innerNumber !== undefined && (
          <span className="choice-number">
            {SYMBOL_MARKS[index] || index + 1}
          </span>
        )}
      </div>
    ));
  }, [question.choiceCount, boxWidthPx, boxHeightPx, question.innerNumber]);

  return (
    <div className="symbol-question">
      {/* 問題番号 */}
      <div className="question-header">
        <span className="question-number">{question.qNumber}.</span>
      </div>

      {/* 選択肢ボックスコンテナ */}
      <div className="choices-container">
        {choiceBoxes}
      </div>

      {/* 編集モード時: パラメータ調整UI */}
      {isEditable && onUpdate && (
        <div className="edit-panel">
          <label>
            選択肢数:
            <input
              type="number"
              value={question.choiceCount}
              onChange={(e) => onUpdate({ choiceCount: parseInt(e.target.value) })}
              min="2"
              max="10"
            />
          </label>
          <label>
            枠内番号を表示:
            <input
              type="checkbox"
              checked={question.innerNumber !== undefined}
              onChange={(e) =>
                onUpdate({
                  innerNumber: e.target.checked ? 1 : undefined,
                })
              }
            />
          </label>
        </div>
      )}
    </div>
  );
};
