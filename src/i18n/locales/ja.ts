// Japanese translations

export const ja = {
  // Common
  loading: '読み込み中...',

  // Modal (infrastructure placeholder)
  modalPlaceholderTitle: 'モーダル',
  modalPlaceholderBody: 'これはプレースホルダーのモーダルです。',
  modalClose: '閉じる',

  // Language names (for selector)
  languageEnglish: 'English',
  languageTurkish: 'Türkçe',
  languageSpanish: 'Español',
  languageGerman: 'Deutsch',
  languagePortuguese: 'Português',
  languageFrench: 'Français',
  languageItalian: 'Italiano',
  languageJapanese: '日本語',

  // Preset Manager
  presetManager: 'プリセットマネージャー',
  presetManagerButton: 'プリセットマネージャー',
  createPreset: 'プリセットを作成',
  export: 'エクスポート',
  import: 'インポート',
  duplicate: '複製',
  active: 'アクティブ',
  noPresetsAvailable: 'プリセットがありません',

  // Preset Delete Confirmation Modal
  presetDeleteConfirmTitle: 'プリセットを削除',
  presetDeleteConfirmBody:
    '"{presetName}"を削除してもよろしいですか？この操作は元に戻せません。',
  presetDeleteConfirmConfirm: '削除',
  presetDeleteConfirmCancel: 'キャンセル',

  // Preset Import Conflict Modal
  presetImportConflictTitle: 'プリセットが既に存在します',
  presetImportConflictBody:
    '"{importedPresetName}"という名前のプリセットが既に存在します。どのように進めますか？',
  presetImportConflictOverwrite: '上書き',
  presetImportConflictRename: '名前を変更',
  presetImportConflictRenameLabel: '新しい名前:',
  presetImportConflictCancel: 'キャンセル',

  // Preset Import Errors
  presetImportErrorInvalidFile:
    '無効なプリセットファイルです。有効な.nzxtesc-presetファイルを選択してください。',
  presetImportErrorUnsupportedVersion:
    'サポートされていないプリセット形式のバージョンです。このファイルはアプリケーションの新しいバージョンで作成されました。',

  // Preset Rename Modal
  presetRenameTitle: 'プリセットの名前を変更',
  presetRenameBody: 'このプリセットの新しい名前を入力してください。',
  presetRenameConfirm: '名前を変更',
  presetRenameCancel: 'キャンセル',

  // Preset Export Modal
  presetExportTitle: 'プリセットをエクスポート',
  presetExportBody: 'エクスポートするプリセットファイルの名前を入力してください。',
  presetExportLabel: 'エクスポート名:',
  presetExportConfirm: 'エクスポート',
  presetExportCancel: 'キャンセル',

  // Preset Create Modal
  presetCreateTitle: 'プリセットを作成',
  presetCreateBody: '新しいプリセットの名前を入力してください。',
  presetCreateLabel: 'プリセット名:',
  presetCreateConfirm: '作成',
  presetCreateCancel: 'キャンセル',

  // Tooltip texts
  'tooltip.preset.create': 'プリセットを作成',
  'tooltip.preset.export': 'エクスポート',
  'tooltip.preset.import': 'インポート',
  'tooltip.preset.delete': '削除',
  'tooltip.preset.duplicate': '複製',
  'tooltip.preset.rename': '名前を変更',
  'tooltip.preset.apply': '適用',
  'tooltip.preset.reorder': 'ドラッグして並び替え',
  'tooltip.preset.favorite.add': 'お気に入りに追加',
  'tooltip.preset.favorite.remove': 'お気に入りから削除',
  'tooltip.preset.quickApply': 'クイック適用',
  'tooltip.presetManager': 'プリセットマネージャー',
  'tooltip.languageSelector': '言語を選択',

  // Background Settings
  backgroundSettingsTitle: '背景設定',
  backgroundColorLabel: '背景色',
} as const;
