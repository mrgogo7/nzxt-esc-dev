// French translations

export const fr = {
  // Common
  loading: 'Chargement...',

  // Modal (infrastructure placeholder)
  modalPlaceholderTitle: 'Modal',
  modalPlaceholderBody: 'Ceci est une fenêtre modale de test.',
  modalClose: 'Fermer',

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
  presetManager: 'Gestionnaire de Presets',
  presetManagerButton: 'Gestionnaire de Presets',
  createPreset: 'Créer un Preset',
  export: 'Exporter',
  import: 'Importer',
  duplicate: 'Dupliquer',
  active: 'Actif',
  noPresetsAvailable: 'Aucun preset disponible',

  // Preset Delete Confirmation Modal
  presetDeleteConfirmTitle: 'Supprimer le Preset',
  presetDeleteConfirmBody:
    'Êtes-vous sûr de vouloir supprimer "{presetName}"? Cette action ne peut pas être annulée.',
  presetDeleteConfirmConfirm: 'Supprimer',
  presetDeleteConfirmCancel: 'Annuler',

  // Preset Import Conflict Modal
  presetImportConflictTitle: 'Le Preset Existe Déjà',
  presetImportConflictBody:
    'Un preset nommé "{importedPresetName}" existe déjà. Comment souhaitez-vous procéder?',
  presetImportConflictOverwrite: 'Remplacer',
  presetImportConflictRename: 'Renommer',
  presetImportConflictRenameLabel: 'Nouveau nom:',
  presetImportConflictCancel: 'Annuler',

  // Preset Import Errors
  presetImportErrorInvalidFile:
    'Fichier de preset invalide. Veuillez sélectionner un fichier .nzxtesc-preset valide.',
  presetImportErrorUnsupportedVersion:
    'Version de format de preset non prise en charge. Ce fichier a été créé avec une version plus récente de l\'application.',

  // Preset Rename Modal
  presetRenameTitle: 'Renommer le Preset',
  presetRenameBody: 'Entrez un nouveau nom pour ce preset.',
  presetRenameConfirm: 'Renommer',
  presetRenameCancel: 'Annuler',

  // Preset Export Modal
  presetExportTitle: 'Exporter le Preset',
  presetExportBody: 'Entrez un nom pour le fichier de preset exporté.',
  presetExportLabel: 'Nom d\'exportation:',
  presetExportConfirm: 'Exporter',
  presetExportCancel: 'Annuler',

  // Preset Create Modal
  presetCreateTitle: 'Créer un Preset',
  presetCreateBody: 'Entrez un nom pour le nouveau preset.',
  presetCreateLabel: 'Nom du preset:',
  presetCreateConfirm: 'Créer',
  presetCreateCancel: 'Annuler',

  // Tooltip texts
  'tooltip.preset.create': 'Créer un Preset',
  'tooltip.preset.export': 'Exporter',
  'tooltip.preset.import': 'Importer',
  'tooltip.preset.delete': 'Supprimer',
  'tooltip.preset.duplicate': 'Dupliquer',
  'tooltip.preset.rename': 'Renommer',
  'tooltip.preset.apply': 'Appliquer',
  'tooltip.preset.reorder': 'Glisser pour réorganiser',
  'tooltip.preset.favorite.add': 'Ajouter aux favoris',
  'tooltip.preset.favorite.remove': 'Retirer des favoris',
  'tooltip.preset.quickApply': 'Appliquer rapidement',
  'tooltip.presetManager': 'Gestionnaire de Presets',
  'tooltip.languageSelector': 'Sélectionner la langue',

  // Background Settings
  backgroundSettingsTitle: 'Paramètres d\'arrière-plan',
  backgroundColorLabel: 'Couleur d\'arrière-plan',
  backgroundMediaLabel: 'Média d\'arrière-plan',
  backgroundMediaAdd: 'Ajouter',
  backgroundMediaUpdate: 'Mettre à jour',
  backgroundMediaRemove: 'Retirer',
  backgroundMediaReplaceWarning: 'Cela remplacera le média d\'arrière-plan actuel.',
  backgroundMediaUrlReplaceWarning:
    'Note: Si vous saisissez une nouvelle adresse dans le champ de saisie et l\'appliquez, le contenu du média d\'arrière-plan actuel sera remplacé.',
  backgroundMediaInvalidSource:
    'Source de média invalide. Veuillez choisir un autre fichier ou une URL directe d\'image/vidéo.',
  backgroundMediaApply: 'Appliquer',
  backgroundMediaCancel: 'Annuler',
  backgroundMediaSourceLocal: 'Média local',
  backgroundMediaSourceUrl: 'URL',
  backgroundMediaBrowse: 'Parcourir…',
  backgroundMediaResolve: 'Résoudre',
  backgroundMediaUrlHint: 'URL directe d\'image ou de MP4 :',
  backgroundMediaPinterestResolveRequired: 'Veuillez résoudre l\'URL Pinterest avant d\'appliquer.',
  backgroundMediaResolving: 'Résolution de l\'URL…',
  backgroundMediaPinterestFetchFailed: 'Échec du chargement du média Pinterest. Veuillez réessayer.',
  backgroundMediaPinterestNoMedia: 'Cette épingle Pinterest ne contient pas d\'image ou de vidéo utilisable.',
  backgroundMediaEmptyStateInstruction:
    'Sélectionnez l\'une des options ci-dessous pour choisir le type de média que vous souhaitez utiliser comme arrière-plan.',
  backgroundMediaLocalBrowseDescription:
    'Cliquez sur le bouton Parcourir pour sélectionner un fichier JPG, GIF ou MP4 depuis votre ordinateur.',
  backgroundMediaUrlDescription:
    'Vous pouvez saisir une URL directe d\'image ou de vidéo MP4. Les URL d\'épingle Pinterest et les URL de vidéo YouTube sont également prises en charge.',
  backgroundMediaUrlExamples:
    'Exemples:\n• https://****.com/medya.jpg or .gif or .mp4\n• https://pinterest.com/pin/123456789/\n• https://www.youtube.com/watch?v=xxxx',
  backgroundMediaTransformScale: 'Redimensionner',
  backgroundMediaTransformRotate: 'Tourner',
  backgroundMediaTransformOffsetX: 'Décalage X',
  backgroundMediaTransformOffsetY: 'Décalage Y',
  backgroundMediaTransformReset: 'Réinitialiser',
  backgroundMediaOverlayGuides: 'Guides de superposition',
  backgroundMediaYoutubeProxyTitle: 'La Vidéo YouTube Ne Peut Pas Être Lue Ici',
  backgroundMediaYoutubeProxyDescription: 'Utilisez cette zone pour positionner la vidéo.',
} as const;
