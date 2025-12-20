// English translations

export const en = {
  // Common
  loading: 'Loading...',

  // Modal (infrastructure placeholder)
  modalPlaceholderTitle: 'Modal',
  modalPlaceholderBody: 'This is a placeholder modal.',
  modalClose: 'Close',

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
  presetManager: 'Preset Manager',
  presetManagerButton: 'Preset Manager',
  createPreset: 'Create Preset',
  export: 'Export',
  import: 'Import',
  duplicate: 'Duplicate',
  rename: 'Rename',
  apply: 'Apply',
  active: 'Active',
  noPresetsAvailable: 'No presets available',

  // Preset Delete Confirmation Modal
  presetDeleteConfirmTitle: 'Delete Preset',
  presetDeleteConfirmBody:
    'Are you sure you want to delete "{presetName}"? This action cannot be undone.',
  presetDeleteConfirmConfirm: 'Delete',
  presetDeleteConfirmCancel: 'Cancel',

  // Preset Import Conflict Modal
  presetImportConflictTitle: 'Preset Already Exists',
  presetImportConflictBody:
    'A preset named "{importedPresetName}" already exists. How would you like to proceed?',
  presetImportConflictOverwrite: 'Overwrite',
  presetImportConflictRename: 'Rename',
  presetImportConflictRenameLabel: 'New name:',
  presetImportConflictCancel: 'Cancel',

  // Preset Import Errors
  presetImportErrorInvalidFile:
    'Invalid preset file. Please select a valid .nzxtesc-preset file.',
  presetImportErrorUnsupportedVersion:
    'Unsupported preset format version. This file was created with a newer version of the application.',

  // Preset Rename Modal
  presetRenameTitle: 'Rename Preset',
  presetRenameBody: 'Enter a new name for this preset.',
  presetRenameConfirm: 'Rename',
  presetRenameCancel: 'Cancel',

  // Preset Export Modal
  presetExportTitle: 'Export Preset',
  presetExportBody: 'Enter a name for the exported preset file.',
  presetExportLabel: 'Export name:',
  presetExportConfirm: 'Export',
  presetExportCancel: 'Cancel',

  // Preset Create Modal
  presetCreateTitle: 'Create Preset',
  presetCreateBody: 'Enter a name for the new preset.',
  presetCreateLabel: 'Preset name:',
  presetCreateConfirm: 'Create',
  presetCreateCancel: 'Cancel',

  // Tooltip texts
  'tooltip.preset.create': 'Create Preset',
  'tooltip.preset.export': 'Export',
  'tooltip.preset.import': 'Import',
  'tooltip.preset.delete': 'Delete',
  'tooltip.preset.duplicate': 'Duplicate',
  'tooltip.preset.rename': 'Rename',
  'tooltip.preset.apply': 'Apply',
  'tooltip.preset.reorder': 'Drag to reorder',
  'tooltip.preset.favorite.add': 'Add to favorites',
  'tooltip.preset.favorite.remove': 'Remove from favorites',
  'tooltip.preset.quickApply': 'Quick apply',
  'tooltip.presetManager': 'Preset Manager',
  'tooltip.languageSelector': 'Select language',

  // Background Settings
  backgroundSettingsTitle: 'Background Settings',
  backgroundColorLabel: 'Background Color',
  backgroundMediaLabel: 'Background Media',
  backgroundMediaAdd: 'Add',
  backgroundMediaUpdate: 'Update',
  backgroundMediaRemove: 'Remove',
  backgroundMediaReplaceWarning: 'This will replace the current background media.',
  backgroundMediaUrlReplaceWarning:
    'Note: If you enter a new address in the input field and apply it, the current background media content will be replaced.',
  backgroundMediaInvalidSource:
    'Invalid media source. Please choose a different file or a direct image/video URL.',
  backgroundMediaApply: 'Apply',
  backgroundMediaCancel: 'Cancel',
  backgroundMediaSourceLocal: 'Local Media',
  backgroundMediaSourceUrl: 'URL',
  backgroundMediaBrowse: 'Browse…',
  backgroundMediaResolve: 'Resolve',
  backgroundMediaUrlHint: 'Direct image or MP4 URL:',
  backgroundMediaPinterestResolveRequired: 'Please resolve the Pinterest URL before applying.',
  backgroundMediaResolving: 'Resolving URL…',
  backgroundMediaPinterestFetchFailed: 'Failed to load Pinterest media. Please try again.',
  backgroundMediaPinterestNoMedia: 'This Pinterest Pin does not contain a usable image or video.',
  backgroundMediaEmptyStateInstruction:
    'Select one of the options below to choose the type of media you want to use as background.',
  backgroundMediaLocalBrowseDescription:
    'Click the Browse button to select a JPG, GIF, or MP4 file from your computer.',
  backgroundMediaUrlDescription:
    'You can enter a direct image or MP4 video URL. Pinterest Pin URLs and YouTube video URLs are also supported.',
  backgroundMediaUrlExamples:
    'Examples:\n• https://****.com/medya.jpg or .gif or .mp4\n• https://pinterest.com/pin/123456789/\n• https://www.youtube.com/watch?v=xxxx',
} as const;
