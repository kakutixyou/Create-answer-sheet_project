/**
 * PDF出力・印刷ヘルパー関数
 */

export function triggerPrint() {
  window.print();
}

/**
 * 印刷設定の推奨事項を返す
 */
export function getPrintSettings() {
  return {
    message: 'ブラウザの印刷ダイアログで以下の設定を確認してください：',
    settings: [
      '✓ 用紙サイズ: B4 (257 x 364 mm)',
      '✓ 余白: なし (0mm)',
      '✓ 倍率: 100%',
      '✓ 背景グラフィックス: オン',
      '✓ ヘッダー・フッター: オフ',
    ],
  };
}
