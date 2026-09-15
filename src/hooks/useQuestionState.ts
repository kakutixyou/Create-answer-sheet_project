/**
 * フック: 問題データの状態管理
 * 問題の追加・削除・更新・大問グルーピング機能を提供
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'react'; // 別途 uuid ライブラリを追加推奨
import {
  SymbolQuestion,
  DescriptionQuestion,
  MajorQuestionGroup,
  QuestionSet,
  PaperSize,
  BaseQuestion,
} from '../types/question';

// UUID生成（簡易版、別途 uuid ライブラリを使用推奨）
const generateId = () => Math.random().toString(36).substr(2, 9);

export interface UseQuestionStateReturn {
  questions: (BaseQuestion | MajorQuestionGroup)[];
  paperSize: PaperSize;
  addSymbolQuestion: (choiceCount: number) => void;
  addDescriptionQuestion: (length: number, isGrid: boolean) => void;
  deleteQuestion: (id: string) => void;
  updateQuestion: (
    id: string,
    updates: Partial<SymbolQuestion | DescriptionQuestion>
  ) => void;
  groupIntoMajor: (questionIds: string[], majorNumber: string | number) => void;
  ungroupMajor: (majorGroupId: string) => void;
  reorderQuestions: (newOrder: (BaseQuestion | MajorQuestionGroup)[]) => void;
  setPaperSize: (size: PaperSize) => void;
  clearAll: () => void;
}

export function useQuestionState(initialPaperSize: PaperSize = 'B4'): UseQuestionStateReturn {
  const [questions, setQuestions] = useState<(BaseQuestion | MajorQuestionGroup)[]>([]);
  const [paperSize, setPaperSizeState] = useState<PaperSize>(initialPaperSize);

  // 記号問題を追加
  const addSymbolQuestion = useCallback((choiceCount: number) => {
    const newQuestion: SymbolQuestion = {
      id: generateId(),
      type: 'symbol',
      level: 'minor',
      qNumber: questions.length + 1,
      choiceCount,
      innerNumber: questions.length + 1,
    };
    setQuestions((prev) => [...prev, newQuestion]);
  }, [questions.length]);

  // 記述問題を追加
  const addDescriptionQuestion = useCallback((length: number, isGrid: boolean) => {
    const newQuestion: DescriptionQuestion = {
      id: generateId(),
      type: 'description',
      level: 'minor',
      qNumber: questions.length + 1,
      length,
      isGrid,
    };
    setQuestions((prev) => [...prev, newQuestion]);
  }, [questions.length]);

  // 問題を削除
  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) =>
      prev.filter((q) => {
        if ('minorQuestions' in q) {
          const group = q as MajorQuestionGroup;
          return !group.minorQuestions.some((mq) => mq.id === id);
        }
        return (q as BaseQuestion).id !== id;
      })
    );
  }, []);

  // 問題を更新
  const updateQuestion = useCallback(
    (id: string, updates: Partial<SymbolQuestion | DescriptionQuestion>) => {
      setQuestions((prev) =>
        prev.map((q) => {
          if ('minorQuestions' in q) {
            const group = q as MajorQuestionGroup;
            return {
              ...group,
              minorQuestions: group.minorQuestions.map((mq) =>
                mq.id === id ? { ...mq, ...updates } : mq
              ),
            };
          }
          return (q as BaseQuestion).id === id ? { ...q, ...updates } : q;
        })
      );
    },
    []
  );

  // 複数の問題を大問にグループ化
  const groupIntoMajor = useCallback(
    (questionIds: string[], majorNumber: string | number) => {
      const toGroup: (SymbolQuestion | DescriptionQuestion)[] = [];
      const remaining: (BaseQuestion | MajorQuestionGroup)[] = [];

      questions.forEach((q) => {
        if ('minorQuestions' in q) {
          remaining.push(q);
        } else {
          const bq = q as BaseQuestion;
          if (questionIds.includes(bq.id)) {
            toGroup.push(q as SymbolQuestion | DescriptionQuestion);
          } else {
            remaining.push(q);
          }
        }
      });

      if (toGroup.length === 0) return;

      const majorGroup: MajorQuestionGroup = {
        id: generateId(),
        qNumber: majorNumber,
        minorQuestions: toGroup.map((q) => ({
          ...q,
          level: 'minor',
          parentId: generateId(),
        })),
      };

      setQuestions([...remaining, majorGroup]);
    },
    [questions]
  );

  // 大問のグループ化を解除
  const ungroupMajor = useCallback((majorGroupId: string) => {
    setQuestions((prev) =>
      prev.flatMap((q) => {
        if ('minorQuestions' in q && q.id === majorGroupId) {
          return q.minorQuestions;
        }
        return q;
      })
    );
  }, []);

  // 問題の並び順を変更
  const reorderQuestions = useCallback(
    (newOrder: (BaseQuestion | MajorQuestionGroup)[]) => {
      setQuestions(newOrder);
    },
    []
  );

  // 用紙サイズを変更
  const setPaperSize = useCallback((size: PaperSize) => {
    setPaperSizeState(size);
  }, []);

  // すべてクリア
  const clearAll = useCallback(() => {
    setQuestions([]);
  }, []);

  return {
    questions,
    paperSize,
    addSymbolQuestion,
    addDescriptionQuestion,
    deleteQuestion,
    updateQuestion,
    groupIntoMajor,
    ungroupMajor,
    reorderQuestions,
    setPaperSize,
    clearAll,
  };
}
