// Spanish translations

export const es = {
  // Common
  loading: 'Cargando...',

  // Modal (infrastructure placeholder)
  modalPlaceholderTitle: 'Modal',
  modalPlaceholderBody: 'Este es un modal de prueba.',
  modalClose: 'Cerrar',

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
  presetManager: 'Gestor de Presets',
  presetManagerButton: 'Gestor de Presets',
  createPreset: 'Crear Preset',
  export: 'Exportar',
  import: 'Importar',
  duplicate: 'Duplicar',
  active: 'Activo',
  noPresetsAvailable: 'No hay presets disponibles',

  // Preset Delete Confirmation Modal
  presetDeleteConfirmTitle: 'Eliminar Preset',
  presetDeleteConfirmBody:
    '¿Está seguro de que desea eliminar "{presetName}"? Esta acción no se puede deshacer.',
  presetDeleteConfirmConfirm: 'Eliminar',
  presetDeleteConfirmCancel: 'Cancelar',

  // Preset Import Conflict Modal
  presetImportConflictTitle: 'El Preset Ya Existe',
  presetImportConflictBody:
    'Ya existe un preset llamado "{importedPresetName}". ¿Cómo desea proceder?',
  presetImportConflictOverwrite: 'Sobrescribir',
  presetImportConflictRename: 'Renombrar',
  presetImportConflictRenameLabel: 'Nuevo nombre:',
  presetImportConflictCancel: 'Cancelar',

  // Preset Import Errors
  presetImportErrorInvalidFile:
    'Archivo de preset inválido. Por favor, seleccione un archivo .nzxtesc-preset válido.',
  presetImportErrorUnsupportedVersion:
    'Versión de formato de preset no compatible. Este archivo fue creado con una versión más nueva de la aplicación.',

  // Preset Rename Modal
  presetRenameTitle: 'Renombrar Preset',
  presetRenameBody: 'Ingrese un nuevo nombre para este preset.',
  presetRenameConfirm: 'Renombrar',
  presetRenameCancel: 'Cancelar',

  // Preset Export Modal
  presetExportTitle: 'Exportar Preset',
  presetExportBody: 'Ingrese un nombre para el archivo de preset exportado.',
  presetExportLabel: 'Nombre de exportación:',
  presetExportConfirm: 'Exportar',
  presetExportCancel: 'Cancelar',

  // Preset Create Modal
  presetCreateTitle: 'Crear Preset',
  presetCreateBody: 'Ingrese un nombre para el nuevo preset.',
  presetCreateLabel: 'Nombre del preset:',
  presetCreateConfirm: 'Crear',
  presetCreateCancel: 'Cancelar',

  // Tooltip texts
  'tooltip.preset.create': 'Crear Preset',
  'tooltip.preset.export': 'Exportar',
  'tooltip.preset.import': 'Importar',
  'tooltip.preset.delete': 'Eliminar',
  'tooltip.preset.duplicate': 'Duplicar',
  'tooltip.preset.rename': 'Renombrar',
  'tooltip.preset.apply': 'Aplicar',
  'tooltip.preset.reorder': 'Arrastrar para reordenar',
  'tooltip.preset.favorite.add': 'Añadir a favoritos',
  'tooltip.preset.favorite.remove': 'Quitar de favoritos',
  'tooltip.preset.quickApply': 'Aplicar rápidamente',
  'tooltip.presetManager': 'Gestor de Presets',
  'tooltip.languageSelector': 'Seleccionar idioma',

  // Background Settings
  backgroundSettingsTitle: 'Configuración de fondo',
  backgroundColorLabel: 'Color de fondo',
  backgroundMediaLabel: 'Medio de fondo',
  backgroundMediaAdd: 'Agregar',
  backgroundMediaUpdate: 'Actualizar',
  backgroundMediaRemove: 'Eliminar',
  backgroundMediaReplaceWarning: 'Esto reemplazará el medio de fondo actual.',
  backgroundMediaUrlReplaceWarning:
    'Nota: Si ingresa una nueva dirección en el campo de entrada y la aplica, el contenido del medio de fondo actual se reemplazará.',
  backgroundMediaInvalidSource:
    'Fuente de medio no válida. Elija otro archivo o una URL directa de imagen/vídeo.',
  backgroundMediaApply: 'Aplicar',
  backgroundMediaCancel: 'Cancelar',
  backgroundMediaSourceLocal: 'Medio local',
  backgroundMediaSourceUrl: 'URL',
  backgroundMediaBrowse: 'Examinar…',
  backgroundMediaResolve: 'Resolver',
  backgroundMediaUrlHint: 'URL directa de imagen o MP4:',
  backgroundMediaPinterestResolveRequired: 'Resuelva la URL de Pinterest antes de aplicar.',
  backgroundMediaResolving: 'Resolviendo URL…',
} as const;