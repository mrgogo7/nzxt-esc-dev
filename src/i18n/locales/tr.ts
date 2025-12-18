// Turkish translations

export const tr = {
  // Common
  loading: 'Yükleniyor...',

  // Modal (infrastructure placeholder)
  modalPlaceholderTitle: 'Modal',
  modalPlaceholderBody: 'Bu bir yer tutucu modal penceresidir.',
  modalClose: 'Kapat',

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
  presetManager: 'Preset Yöneticisi',
  presetManagerButton: 'Preset Yöneticisi',
  createPreset: 'Preset Oluştur',
  export: 'Dışa Aktar',
  import: 'İçe Aktar',
  duplicate: 'Kopyala',
  rename: 'Yeniden Adlandır',
  apply: 'Uygula',
  active: 'Aktif',
  noPresetsAvailable: 'Preset bulunamadı',

  // Preset Delete Confirmation Modal
  presetDeleteConfirmTitle: 'Preset Sil',
  presetDeleteConfirmBody:
    '"{presetName}" adlı preset\'i silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
  presetDeleteConfirmConfirm: 'Sil',
  presetDeleteConfirmCancel: 'İptal',

  // Preset Import Conflict Modal
  presetImportConflictTitle: 'Preset Zaten Mevcut',
  presetImportConflictBody:
    '"{importedPresetName}" adlı bir preset zaten mevcut. Nasıl devam etmek istersiniz?',
  presetImportConflictOverwrite: 'Üzerine Yaz',
  presetImportConflictRename: 'Yeniden Adlandır',
  presetImportConflictRenameLabel: 'Yeni ad:',
  presetImportConflictCancel: 'İptal',

  // Preset Import Errors
  presetImportErrorInvalidFile:
    'Geçersiz preset dosyası. Lütfen geçerli bir .nzxtesc-preset dosyası seçin.',
  presetImportErrorUnsupportedVersion:
    'Desteklenmeyen preset format sürümü. Bu dosya uygulamanın daha yeni bir sürümü ile oluşturulmuş.',

  // Preset Rename Modal
  presetRenameTitle: 'Preset Yeniden Adlandır',
  presetRenameBody: 'Bu preset için yeni bir ad girin.',
  presetRenameConfirm: 'Yeniden Adlandır',
  presetRenameCancel: 'İptal',

  // Preset Export Modal
  presetExportTitle: 'Preset Dışa Aktar',
  presetExportBody: 'Dışa aktarılacak preset dosyası için bir ad girin.',
  presetExportLabel: 'Dışa aktarma adı:',
  presetExportConfirm: 'Dışa Aktar',
  presetExportCancel: 'İptal',

  // Preset Create Modal
  presetCreateTitle: 'Preset Oluştur',
  presetCreateBody: 'Yeni preset için bir ad girin.',
  presetCreateLabel: 'Preset adı:',
  presetCreateConfirm: 'Oluştur',
  presetCreateCancel: 'İptal',

  // Tooltip texts
  'tooltip.preset.create': 'Preset Oluştur',
  'tooltip.preset.export': 'Dışa Aktar',
  'tooltip.preset.import': 'İçe Aktar',
  'tooltip.preset.delete': 'Sil',
  'tooltip.preset.duplicate': 'Kopyala',
  'tooltip.preset.rename': 'Yeniden Adlandır',
  'tooltip.preset.apply': 'Uygula',
  'tooltip.preset.reorder': 'Sıralamak için sürükle',
  'tooltip.preset.favorite.add': 'Favorilere ekle',
  'tooltip.preset.favorite.remove': 'Favorilerden çıkar',
  'tooltip.preset.quickApply': 'Hızlı uygula',
  'tooltip.presetManager': 'Preset Yöneticisi',
  'tooltip.languageSelector': 'Dil seç',

  // Background Settings
  backgroundSettingsTitle: 'Arka Plan Ayarları',
  backgroundColorLabel: 'Arka Plan Rengi',
} as const;
