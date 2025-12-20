// Italian translations

export const it = {
  // Common
  loading: 'Caricamento...',

  // Modal (infrastructure placeholder)
  modalPlaceholderTitle: 'Modal',
  modalPlaceholderBody: 'Questa è una finestra modale di esempio.',
  modalClose: 'Chiudi',

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
  presetManager: 'Gestore Preset',
  presetManagerButton: 'Gestore Preset',
  createPreset: 'Crea Preset',
  export: 'Esporta',
  import: 'Importa',
  duplicate: 'Duplica',
  active: 'Attivo',
  noPresetsAvailable: 'Nessun preset disponibile',

  // Preset Delete Confirmation Modal
  presetDeleteConfirmTitle: 'Elimina Preset',
  presetDeleteConfirmBody:
    'Sei sicuro di voler eliminare "{presetName}"? Questa azione non può essere annullata.',
  presetDeleteConfirmConfirm: 'Elimina',
  presetDeleteConfirmCancel: 'Annulla',

  // Preset Import Conflict Modal
  presetImportConflictTitle: 'Il Preset Esiste Già',
  presetImportConflictBody:
    'Esiste già un preset chiamato "{importedPresetName}". Come vuoi procedere?',
  presetImportConflictOverwrite: 'Sovrascrivi',
  presetImportConflictRename: 'Rinomina',
  presetImportConflictRenameLabel: 'Nuovo nome:',
  presetImportConflictCancel: 'Annulla',

  // Preset Import Errors
  presetImportErrorInvalidFile:
    'File preset non valido. Seleziona un file .nzxtesc-preset valido.',
  presetImportErrorUnsupportedVersion:
    'Versione del formato preset non supportata. Questo file è stato creato con una versione più recente dell\'applicazione.',

  // Preset Rename Modal
  presetRenameTitle: 'Rinomina Preset',
  presetRenameBody: 'Inserisci un nuovo nome per questo preset.',
  presetRenameConfirm: 'Rinomina',
  presetRenameCancel: 'Annulla',

  // Preset Export Modal
  presetExportTitle: 'Esporta Preset',
  presetExportBody: 'Inserisci un nome per il file preset esportato.',
  presetExportLabel: 'Nome di esportazione:',
  presetExportConfirm: 'Esporta',
  presetExportCancel: 'Annulla',

  // Preset Create Modal
  presetCreateTitle: 'Crea Preset',
  presetCreateBody: 'Inserisci un nome per il nuovo preset.',
  presetCreateLabel: 'Nome del preset:',
  presetCreateConfirm: 'Crea',
  presetCreateCancel: 'Annulla',

  // Tooltip texts
  'tooltip.preset.create': 'Crea Preset',
  'tooltip.preset.export': 'Esporta',
  'tooltip.preset.import': 'Importa',
  'tooltip.preset.delete': 'Elimina',
  'tooltip.preset.duplicate': 'Duplica',
  'tooltip.preset.rename': 'Rinomina',
  'tooltip.preset.apply': 'Applica',
  'tooltip.preset.reorder': 'Trascina per riordinare',
  'tooltip.preset.favorite.add': 'Aggiungi ai preferiti',
  'tooltip.preset.favorite.remove': 'Rimuovi dai preferiti',
  'tooltip.preset.quickApply': 'Applica rapidamente',
  'tooltip.presetManager': 'Gestore Preset',
  'tooltip.languageSelector': 'Seleziona lingua',

  // Background Settings
  backgroundSettingsTitle: 'Impostazioni sfondo',
  backgroundColorLabel: 'Colore di sfondo',
  backgroundMediaLabel: 'Media di sfondo',
  backgroundMediaAdd: 'Aggiungi',
  backgroundMediaUpdate: 'Aggiorna',
  backgroundMediaRemove: 'Rimuovi',
  backgroundMediaReplaceWarning: 'Questo sostituirà il media di sfondo corrente.',
  backgroundMediaUrlReplaceWarning:
    'Nota: Se inserisci un nuovo indirizzo nel campo di input e lo applichi, il contenuto del media di sfondo corrente verrà sostituito.',
  backgroundMediaInvalidSource:
    'Sorgente media non valida. Scegli un altro file o un URL diretto di immagine/video.',
  backgroundMediaApply: 'Applica',
  backgroundMediaCancel: 'Annulla',
  backgroundMediaSourceLocal: 'Media locale',
  backgroundMediaSourceUrl: 'URL',
  backgroundMediaBrowse: 'Sfoglia…',
  backgroundMediaResolve: 'Risolvi',
  backgroundMediaUrlHint: 'URL diretta di immagine o MP4:',
  backgroundMediaPinterestResolveRequired: 'Risolvi l\'URL di Pinterest prima di applicare.',
  backgroundMediaResolving: 'Risoluzione URL…',
} as const;