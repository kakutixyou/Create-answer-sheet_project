/**
 * QuestionBlock コンポーネント
 * 1問分のラッパー（問題番号のマージンやスタイルを統一管理）
 * 大問・小問の階層を表現
 */

import React from 'react';
import { SymbolQuestion, DescriptionQuestion, MajorQuestionGroup } from '../types/question';
import { SymbolQuestion as SymbolQuestionComponent } from './SymbolQuestion';
import { DescriptionQuestion as DescriptionQuestionComponent } from './DescriptionQuestion';
import '../styles/questionBlock.css';

interface QuestionBlockProps {
  question: SymbolQuestion | DescriptionQuestion;
  isMajor?: boolean;                    // 大問として表示するかどうか
  majorNumber?: string | number;        // 大問の番号
  onUpdate?: (updates: Partial<SymbolQuestion | DescriptionQuestion>) => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export const QuestionBlock: React.FC<QuestionBlockProps> = ({
  question,
  isMajor = false,
  majorNumber,
  onUpdate,
  onDelete,
  isEditable = false,
}) => {
  return (
    <div
      className={`question-block ${
        isMajor ? 'major-question' : 'minor-question'
      }`}
    >
      {/* 大問タイトル */}
      {isMajor && (
        <div className="major-title">
          <h3>大問 {majorNumber}</h3>
        </div>
      )}

      {/* 問題本体 */}
      <div className="question-content">
        {question.type === 'symbol' ? (
          <SymbolQuestionComponent
            question={question as SymbolQuestion}
            onUpdate={onUpdate}
            isEditable={isEditable}
          />
        ) : (
          <DescriptionQuestionComponent
            question={question as DescriptionQuestion}
            onUpdate={onUpdate}
            isEditable={isEditable}
          />
        )}
      </div>

      {/* 削除ボタン */}
      {isEditable && onDelete && (
        <button className="delete-btn" onClick={onDelete}>
          削除
        </button>
      )}
    </div>
  );
};
