// German translations

export const de = {
  // Common
  loading: 'Lädt...',

  // Modal (infrastructure placeholder)
  modalPlaceholderTitle: 'Modal',
  modalPlaceholderBody: 'Dies ist ein Platzhalter-Modal.',
  modalClose: 'Schließen',

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
  presetManager: 'Preset-Verwaltung',
  presetManagerButton: 'Preset-Verwaltung',
  createPreset: 'Preset Erstellen',
  export: 'Exportieren',
  import: 'Importieren',
  duplicate: 'Duplizieren',
  active: 'Aktiv',
  noPresetsAvailable: 'Keine Presets verfügbar',

  // Preset Delete Confirmation Modal
  presetDeleteConfirmTitle: 'Preset Löschen',
  presetDeleteConfirmBody:
    'Sind Sie sicher, dass Sie "{presetName}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
  presetDeleteConfirmConfirm: 'Löschen',
  presetDeleteConfirmCancel: 'Abbrechen',

  // Preset Import Conflict Modal
  presetImportConflictTitle: 'Preset Existiert Bereits',
  presetImportConflictBody:
    'Ein Preset mit dem Namen "{importedPresetName}" existiert bereits. Wie möchten Sie fortfahren?',
  presetImportConflictOverwrite: 'Überschreiben',
  presetImportConflictRename: 'Umbenennen',
  presetImportConflictRenameLabel: 'Neuer Name:',
  presetImportConflictCancel: 'Abbrechen',

  // Preset Import Errors
  presetImportErrorInvalidFile:
    'Ungültige Preset-Datei. Bitte wählen Sie eine gültige .nzxtesc-preset-Datei aus.',
  presetImportErrorUnsupportedVersion:
    'Nicht unterstützte Preset-Formatversion. Diese Datei wurde mit einer neueren Version der Anwendung erstellt.',

  // Preset Rename Modal
  presetRenameTitle: 'Preset Umbenennen',
  presetRenameBody: 'Geben Sie einen neuen Namen für dieses Preset ein.',
  presetRenameConfirm: 'Umbenennen',
  presetRenameCancel: 'Abbrechen',

  // Preset Export Modal
  presetExportTitle: 'Preset Exportieren',
  presetExportBody: 'Geben Sie einen Namen für die exportierte Preset-Datei ein.',
  presetExportLabel: 'Exportname:',
  presetExportConfirm: 'Exportieren',
  presetExportCancel: 'Abbrechen',

  // Preset Create Modal
  presetCreateTitle: 'Preset Erstellen',
  presetCreateBody: 'Geben Sie einen Namen für das neue Preset ein.',
  presetCreateLabel: 'Preset-Name:',
  presetCreateConfirm: 'Erstellen',
  presetCreateCancel: 'Abbrechen',

  // Tooltip texts
  'tooltip.preset.create': 'Preset Erstellen',
  'tooltip.preset.export': 'Exportieren',
  'tooltip.preset.import': 'Importieren',
  'tooltip.preset.delete': 'Löschen',
  'tooltip.preset.duplicate': 'Duplizieren',
  'tooltip.preset.rename': 'Umbenennen',
  'tooltip.preset.apply': 'Anwenden',
  'tooltip.preset.reorder': 'Zum Neuordnen ziehen',
  'tooltip.preset.favorite.add': 'Zu Favoriten hinzufügen',
  'tooltip.preset.favorite.remove': 'Aus Favoriten entfernen',
  'tooltip.preset.quickApply': 'Schnell anwenden',
  'tooltip.presetManager': 'Preset-Verwaltung',
  'tooltip.languageSelector': 'Sprache auswählen',

  // Background Settings
  backgroundSettingsTitle: 'Hintergrundeinstellungen',
  backgroundColorLabel: 'Hintergrundfarbe',
  backgroundMediaLabel: 'Hintergrundmedien',
  backgroundMediaAdd: 'Hinzufügen',
  backgroundMediaUpdate: 'Aktualisieren',
  backgroundMediaRemove: 'Entfernen',
  backgroundMediaReplaceWarning: 'Dies ersetzt das aktuelle Hintergrundmedium.',
  backgroundMediaUrlReplaceWarning:
    'Hinweis: Wenn Sie eine neue Adresse in das Eingabefeld eingeben und anwenden, wird der aktuelle Hintergrundmedieninhalt ersetzt.',
  backgroundMediaInvalidSource:
    'Ungültige Medienquelle. Bitte wählen Sie eine andere Datei oder eine direkte Bild-/Video-URL.',
  backgroundMediaApply: 'Übernehmen',
  backgroundMediaCancel: 'Abbrechen',
  backgroundMediaSourceLocal: 'Lokale Medien',
  backgroundMediaSourceUrl: 'URL',
  backgroundMediaBrowse: 'Durchsuchen…',
  backgroundMediaResolve: 'Auflösen',
  backgroundMediaUrlHint: 'Direkte Bild- oder MP4-URL:',
  backgroundMediaPinterestResolveRequired: 'Bitte lösen Sie die Pinterest-URL, bevor Sie fortfahren.',
  backgroundMediaResolving: 'URL wird aufgelöst…',
  backgroundMediaTransformScale: 'Größe ändern',
  backgroundMediaTransformRotate: 'Drehen',
  backgroundMediaTransformOffsetX: 'X-Offset',
  backgroundMediaTransformOffsetY: 'Y-Offset',
  backgroundMediaTransformReset: 'Zurücksetzen',
  backgroundMediaOverlayGuides: 'Überlagerungsführungen',
} as const;