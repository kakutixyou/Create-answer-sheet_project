# 解答用紙生成アプリ (Answer Sheet App)

B4用紙対応の解答用紙を簡単に作成・カスタマイズできるReact + TypeScriptアプリです。

## 🎯 主な機能

- **記号問題**: 選択肢数を指定で自動的に□の幅を調整
- **記述問題**: 文字数指定でマス目または長い枠を生成
- **B4/A4/B5対応**: 複数のペーパーサイズに対応
- **2段組レイアウト**: B4用紙は左右2段の自動配置
- **ページネーション自動化**: 問題数に応じて自動的に次ページへ
- **印刷/PDF出力**: ブラウザの印刷機能でPDF化可能

---

## 📁 ディレクトリ構成

```
src/
├── components/             # UIコンポーネント
│   ├── DescriptionQuestion.tsx    # 記述問題コンポーネント
│   ├── SymbolQuestion.tsx         # 記号問題コンポーネント
│   ├── QuestionBlock.tsx          # 問題ブロックラッパー
│   ├── Page.tsx                   # B4ページ（2段組）
│   ├── PaperView.tsx              # 複数ページ管理・ビュー
│   └── Sidebar.tsx                # 操作パネル
│
├── hooks/
│   └── useQuestionState.ts        # 問題データ管理フック
│
├── utils/
│   ├── layoutCalculator.ts        # ページレイアウト計算
│   ├── sizeCalculator.ts          # サイズ計算（幅・高さ）
│   └── pdfHelper.ts               # 印刷/PDF出力ロジック
│
├── types/
│   ├── question.ts                # 問題データ型定義
│   └── paper.ts                   # 用紙・マージン定義
│
├── styles/
│   ├── global.css                 # グローバルスタイル
│   ├── layout.css                 # 画面分割レイアウト
│   ├── paper.css                  # 用紙スタイル
│   ├── symbol.css                 # 記号問題スタイル
│   ├── description.css            # 記述問題スタイル
│   ├── questionBlock.css          # 問題ブロックスタイル
│   ├── sidebar.css                # サイドバースタイル
│   └── print.css                  # プリント用スタイル
│
├── App.tsx                        # メインコンポーネント
└── main.tsx                       # エントリーポイント
```

---

## 🔧 開発のポイント・修正時の注意点

### 1. **用紙サイズの設定** (`src/types/question.ts`, `src/types/paper.ts`)

**変更対象**: `PAPER_SPECS`, `PAPER_MARGINS`, `DPI_RATIO`

```typescript
// types/question.ts
export const PAPER_SPECS: Record<PaperSize, { width: number; height: number; columns: number }> = {
  B4: { width: 257, height: 364, columns: 2 },  // ← B4サイズ (mm単位)
  A4: { width: 210, height: 297, columns: 1 },  // ← A4サイズ
  B5: { width: 182, height: 257, columns: 1 },  // ← B5サイズ
};

export const DPI_RATIO = 3.78;  // 1mm ≈ 3.78px (96dpi基準)
```

**新しい用紙サイズを追加する場合**:
1. `PaperSize` タイプに新しいサイズを追加
2. `PAPER_SPECS` に該当サイズの幅・高さ・段数を追加
3. `PAPER_MARGINS` に余白設定を追加
4. `src/styles/paper.css` で新しい `.paper-{size}` クラスを追加

---

### 2. **記号問題の幅計算** (`src/utils/sizeCalculator.ts`)

**関数**: `calculateSymbolBoxWidth()`

```typescript
export function calculateSymbolBoxWidth(
  choiceCount: number,
  paperSize: PaperSize,
  marginBetweenBoxes: number = 2 // mm
): number {
  const columnWidth = getColumnWidthMM(paperSize);
  const effectiveWidth = columnWidth - 10;  // ← 左右の余白
  const totalMargin = marginBetweenBoxes * (choiceCount - 1);
  const boxWidth = (effectiveWidth - totalMargin) / choiceCount;
  return Math.max(boxWidth, 10);  // 最小幅10mm
}
```

**調整ポイント**:
- `effectiveWidth = columnWidth - 10`: 左右の合計余白（変更したい場合はここを修正）
- `marginBetweenBoxes = 2`: 選択肢ボックス間のギャップ（mm単位）
- `Math.max(boxWidth, 10)`: 最小ボックス幅（小さすぎる選択肢数の場合の保護）

---

### 3. **記述問題の幅計算** (`src/utils/sizeCalculator.ts`)

**関数**: `calculateDescriptionWidth()`

```typescript
export function calculateDescriptionWidth(
  length: number,
  paperSize: PaperSize,
  boxWidth: number = 5  // mm (1マスのデフォルトサイズ)
): number {
  const columnWidth = getColumnWidthMM(paperSize);
  const effectiveWidth = columnWidth - 10;  // ← 左右の余白
  const totalWidth = length * boxWidth;     // ← 総幅
  return Math.min(totalWidth, effectiveWidth);  // ← 段幅に収まるように調整
}
```

**調整ポイント**:
- `boxWidth = 5`: デフォルトは1マス = 5mm（原稿用紙規格）
- `Math.min()`: 文字数が多い場合、自動的に段幅に合わせる
- **マス目が1行に収まらない場合**: `GRID_BOX_SIZE_MM` を小さくするか、複数行対応を追加

---

### 4. **ページレイアウト計算** (`src/utils/layoutCalculator.ts`)

**関数**: `calculatePageLayout()`

**重要なマジック値**:
- `QUESTION_BLOCK_GAP_MM = 8`: 問題ブロック間のマージン
- `QUESTION_NUMBER_HEIGHT_MM = 6`: 問題番号の高さ
- `GRID_BOX_SIZE_MM = 5`: マス目のサイズ

**ロジック**:
1. 問題を1つずつ処理
2. 「現在の段の残り高さ」で次の問題が入るかチェック
3. 入らなければ右段へ、右段もダメなら次ページの左段へ移動

**修正する場合**:
```typescript
function estimateQuestionHeightMM(
  question: SymbolQuestion | DescriptionQuestion
): number {
  let answerAreaHeight = 0;
  if (question.type === 'symbol') {
    answerAreaHeight = 8;  // ← 記号問題の枠高さを変更
  } else {
    const descQ = question as DescriptionQuestion;
    if (descQ.isGrid) {
      answerAreaHeight = GRID_BOX_SIZE_MM;  // ← マス目高さ
    } else {
      answerAreaHeight = 8;  // ← 長い枠の高さ
    }
  }
  return QUESTION_NUMBER_HEIGHT_MM + 2 + answerAreaHeight + QUESTION_BLOCK_GAP_MM;
}
```

---

### 5. **状態管理** (`src/hooks/useQuestionState.ts`)

**提供される関数**:
- `addSymbolQuestion(choiceCount)`: 記号問題追加
- `addDescriptionQuestion(length, isGrid)`: 記述問題追加
- `deleteQuestion(id)`: 問題削除
- `updateQuestion(id, updates)`: 問題更新
- `groupIntoMajor(questionIds, majorNumber)`: 大問グループ化
- `ungroupMajor(majorGroupId)`: グループ解除
- `reorderQuestions(newOrder)`: 並び順変更
- `clearAll()`: 全削除

**注意**: 現在は ID 生成に `Math.random()` を使用しています。  
本番では `uuid` ライブラリの導入推奨:
```bash
npm install uuid
```

---

### 6. **大問・小問グループ化** (`src/types/question.ts`)

**データ構造**:
```typescript
export interface MajorQuestionGroup {
  id: string;
  qNumber: string | number;              // "大問1" など
  minorQuestions: (SymbolQuestion | DescriptionQuestion)[];
}
```

**使用例**:
```typescript
// 問題1, 2, 3 を「大問1」として一括化
questionState.groupIntoMajor(['q1', 'q2', 'q3'], '大問1');
```

---

### 7. **CSS 調整 (各スタイルファイル)**

#### `paper.css` - 用紙サイズとマージン
```css
.paper-b4 .page-container {
  width: 972px;   /* 257mm × 3.78 */
  height: 1378px; /* 364mm × 3.78 */
}

.page-content {
  padding: 57px;    /* 15mm × 3.78 */
  gap: 38px;        /* COLUMN_GAP_MM (10mm × 3.78) */
}
```

#### `symbol.css` / `description.css` - 枠線スタイル
```css
.symbol-choice-box {
  border: 2px solid #111827;  /* ← 枠線の太さと色 */
}

.description-grid-box {
  border: 1px solid #111827;  /* ← 記述問題の枠線 */
}

.description-grid-box:not(:last-child) {
  border-right: none;  /* ← マス目をくっつける */
}
```

#### `print.css` - プリント時の調整
```css
@page {
  size: B4;       /* ← 印刷サイズ */
  margin: 0;      /* ← 必ず 0 */
}
```

---

### 8. **印刷・PDF出力** (`src/utils/pdfHelper.ts`)

**ブラウザのプリント画面で確認すべき設定**:
- 用紙サイズ: B4 (257 x 364 mm)
- 余白: なし (0mm)
- 倍率: 100%
- 背景グラフィックス: **オン** ✓ (枠線を印刷するため必須)

**PDFに出力する場合**:
1. ブラウザの印刷ダイアログを開く (`Ctrl+P` または `Cmd+P`)
2. プリンター: 「PDFに保存」を選択
3. 設定を確認して「保存」

---

## 🚀 セットアップ・実行

### インストール
```bash
npm install
```

### 開発サーバー起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### プレビュー
```bash
npm run preview
```

---

## 📝 よくある修正パターン

### Q1: 記号問題の□が小さすぎる / 大きすぎる
**A**: `sizeCalculator.ts` の `calculateSymbolBoxWidth()` で `effectiveWidth - 10` の値を調整

### Q2: 記述問題のマス目が1行に収まらない
**A**: `sizeCalculator.ts` の `calculateDescriptionWidth()` で `boxWidth` を小さくするか、  
または `layoutCalculator.ts` の `estimateQuestionHeightMM()` で複数行対応を追加

### Q3: ページレイアウトが変
**A**: `layoutCalculator.ts` の `estimateQuestionHeightMM()` で問題の高さ推定が正確か確認。  
また `QUESTION_BLOCK_GAP_MM` で問題間のマージンを調整

### Q4: 新しい用紙サイズ (例: A3) を追加したい
**A**: 
1. `question.ts` の `PaperSize` と `PAPER_SPECS` に A3 を追加
2. `paper.ts` の `PAPER_MARGINS` に A3 の余白を追加
3. `paper.css` に `.paper-a3` クラスを追加

### Q5: 大問と小問のスタイルを変えたい
**A**: `QuestionBlock.tsx` の `isMajor` prop で条件分岐  
または `questionBlock.css` で `.major-question` と `.minor-question` クラスを修正

---

## 💡 アーキテクチャ上の工夫

1. **型安全性**: TypeScript で問題データ構造を厳密に定義
2. **再利用可能な計算関数**: mm ↔ px 変換、サイズ計算を utils に分離
3. **レイアウト計算の独立性**: ビジネスロジックを React から分離
4. **CSS のモジュール化**: 各コンポーネント用の CSS ファイルを分離
5. **プリント対応**: `@media print` で不要な UI を隠し、用紙サイズを指定

---

## 🐛 既知の制限・将来対応予定

- [ ] 複数行にまたがる記述問題への対応
- [ ] ドラッグ&ドロップで問題の並び順変更
- [ ] JSON ファイルからの問題インポート
- [ ] Canvas での座標ベース配置（高度な調整用）
- [ ] 複数テンプレート保存機能
- [ ] 問題の画像挿入機能

---

## 📄 ライセンス

MIT

---

## 👥 開発者向けメモ

**最後に修正したコンポーネント/ファイル**: 2026-09-15  
**主な依存関係**: React 18+, TypeScript 5+, Vite 5+
