/**
 * DescriptionQuestion コンポーネント
 * 記述問題の解答欄を生成（マス目または長い枠）
 * 最重要: 文字数に応じて幅を動的に計算し、改行なしで横並びを実現
 */

import React, { useMemo } from 'react';
import { DescriptionQuestion as DescriptionQuestionType } from '../types/question';
import {
  calculateDescriptionWidth,
  getDescriptionLineHeightPx,
} from '../utils/sizeCalculator';
import { mmToPx } from '../types/paper';
import '../styles/description.css';

interface DescriptionQuestionProps {
  question: DescriptionQuestionType;
  onUpdate?: (updates: Partial<DescriptionQuestionType>) => void;
  isEditable?: boolean;
}

export const DescriptionQuestion: React.FC<DescriptionQuestionProps> = ({
  question,
  onUpdate,
  isEditable = false,
}) => {
  // マス目1つのサイズ（デフォルト5mm）
  const boxWidthMM = question.boxWidth ?? 5;
  const boxWidthPx = mmToPx(boxWidthMM);
  const lineHeightPx = getDescriptionLineHeightPx();

  // 総幅を計算（mm → px変換）
  const totalWidthMM = calculateDescriptionWidth(
    question.length,
    question.type === 'description' ? 'B4' : 'B4' // デフォルト B4 (後で props から受け取り推奨)
  );
  const totalWidthPx = mmToPx(totalWidthMM);

  // グリッドモード時: マス目を1つ1つ生成
  const gridBoxes = useMemo(() => {
    if (!question.isGrid) return null;
    return Array.from({ length: question.length }).map((_, index) => (
      <div
        key={index}
        className="description-grid-box"
        style={{
          width: `${boxWidthPx}px`,
          height: `${lineHeightPx}px`,
        }}
      >
        {/* 最初のマスに innerNumber を表示 */}
        {index === 0 && question.innerNumber !== undefined && (
          <span className="inner-number">{question.innerNumber}</span>
        )}
      </div>
    ));
  }, [question.length, question.isGrid, boxWidthPx, lineHeightPx, question.innerNumber]);

  // 長い枠モード
  const longBox = useMemo(() => {
    if (question.isGrid) return null;
    return (
      <div
        className="description-long-box"
        style={{
          width: `${totalWidthPx}px`,
          height: `${lineHeightPx}px`,
        }}
      />
    );
  }, [question.isGrid, totalWidthPx, lineHeightPx]);

  return (
    <div className="description-question">
      {/* 問題番号 */}
      <div className="question-header">
        <span className="question-number">{question.qNumber}.</span>
      </div>

      {/* 解答欄コンテナ */}
      <div className="answer-area">
        {question.isGrid ? (
          <div className="grid-container">
            {gridBoxes}
          </div>
        ) : (
          <div className="long-box-container">
            {longBox}
          </div>
        )}
      </div>

      {/* 編集モード時: パラメータ調整UI */}
      {isEditable && onUpdate && (
        <div className="edit-panel">
          <label>
            文字数:
            <input
              type="number"
              value={question.length}
              onChange={(e) => onUpdate({ length: parseInt(e.target.value) })}
              min="1"
              max="100"
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={question.isGrid}
              onChange={(e) => onUpdate({ isGrid: e.target.checked })}
            />
            マス目モード
          </label>
          <label>
            マス幅 (mm):
            <input
              type="number"
              value={question.boxWidth ?? 5}
              onChange={(e) => onUpdate({ boxWidth: parseFloat(e.target.value) })}
              min="3"
              max="10"
              step="0.5"
            />
          </label>
          <label>
            枠内番号:
            <input
              type="number"
              value={question.innerNumber ?? ''}
              onChange={(e) =>
                onUpdate({ innerNumber: e.target.value ? parseInt(e.target.value) : undefined })
              }
              placeholder="なし"
            />
          </label>
        </div>
      )}
    </div>
  );
};
