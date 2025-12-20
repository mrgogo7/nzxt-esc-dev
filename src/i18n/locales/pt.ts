// Portuguese translations

export const pt = {
  // Common
  loading: 'Carregando...',

  // Modal (infrastructure placeholder)
  modalPlaceholderTitle: 'Modal',
  modalPlaceholderBody: 'Este é um modal de exemplo.',
  modalClose: 'Fechar',

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
  presetManager: 'Gerenciador de Presets',
  presetManagerButton: 'Gerenciador de Presets',
  createPreset: 'Criar Preset',
  export: 'Exportar',
  import: 'Importar',
  duplicate: 'Duplicar',
  active: 'Ativo',
  noPresetsAvailable: 'Nenhum preset disponível',

  // Preset Delete Confirmation Modal
  presetDeleteConfirmTitle: 'Excluir Preset',
  presetDeleteConfirmBody:
    'Tem certeza de que deseja excluir "{presetName}"? Esta ação não pode ser desfeita.',
  presetDeleteConfirmConfirm: 'Excluir',
  presetDeleteConfirmCancel: 'Cancelar',

  // Preset Import Conflict Modal
  presetImportConflictTitle: 'Preset Já Existe',
  presetImportConflictBody:
    'Já existe um preset chamado "{importedPresetName}". Como deseja prosseguir?',
  presetImportConflictOverwrite: 'Substituir',
  presetImportConflictRename: 'Renomear',
  presetImportConflictRenameLabel: 'Novo nome:',
  presetImportConflictCancel: 'Cancelar',

  // Preset Import Errors
  presetImportErrorInvalidFile:
    'Arquivo de preset inválido. Por favor, selecione um arquivo .nzxtesc-preset válido.',
  presetImportErrorUnsupportedVersion:
    'Versão de formato de preset não suportada. Este arquivo foi criado com uma versão mais recente do aplicativo.',

  // Preset Rename Modal
  presetRenameTitle: 'Renomear Preset',
  presetRenameBody: 'Digite um novo nome para este preset.',
  presetRenameConfirm: 'Renomear',
  presetRenameCancel: 'Cancelar',

  // Preset Export Modal
  presetExportTitle: 'Exportar Preset',
  presetExportBody: 'Digite um nome para o arquivo de preset exportado.',
  presetExportLabel: 'Nome de exportação:',
  presetExportConfirm: 'Exportar',
  presetExportCancel: 'Cancelar',

  // Preset Create Modal
  presetCreateTitle: 'Criar Preset',
  presetCreateBody: 'Digite um nome para o novo preset.',
  presetCreateLabel: 'Nome do preset:',
  presetCreateConfirm: 'Criar',
  presetCreateCancel: 'Cancelar',

  // Tooltip texts
  'tooltip.preset.create': 'Criar Preset',
  'tooltip.preset.export': 'Exportar',
  'tooltip.preset.import': 'Importar',
  'tooltip.preset.delete': 'Excluir',
  'tooltip.preset.duplicate': 'Duplicar',
  'tooltip.preset.rename': 'Renomear',
  'tooltip.preset.apply': 'Aplicar',
  'tooltip.preset.reorder': 'Arrastar para reordenar',
  'tooltip.preset.favorite.add': 'Adicionar aos favoritos',
  'tooltip.preset.favorite.remove': 'Remover dos favoritos',
  'tooltip.preset.quickApply': 'Aplicar rapidamente',
  'tooltip.presetManager': 'Gerenciador de Presets',
  'tooltip.languageSelector': 'Selecionar idioma',

  // Background Settings
  backgroundSettingsTitle: 'Configurações de fundo',
  backgroundColorLabel: 'Cor de fundo',
  backgroundMediaLabel: 'Mídia de fundo',
  backgroundMediaAdd: 'Adicionar',
  backgroundMediaUpdate: 'Atualizar',
  backgroundMediaRemove: 'Remover',
  backgroundMediaReplaceWarning: 'Isto substituirá a mídia de fundo atual.',
  backgroundMediaUrlReplaceWarning:
    'Nota: Se você inserir um novo endereço no campo de entrada e aplicá-lo, o conteúdo da mídia de fundo atual será substituído.',
  backgroundMediaInvalidSource:
    'Fonte de mídia inválida. Escolha outro arquivo ou uma URL direta de imagem/vídeo.',
  backgroundMediaApply: 'Aplicar',
  backgroundMediaCancel: 'Cancelar',
  backgroundMediaSourceLocal: 'Mídia local',
  backgroundMediaSourceUrl: 'URL',
  backgroundMediaBrowse: 'Procurar…',
  backgroundMediaResolve: 'Resolver',
  backgroundMediaUrlHint: 'URL direta de imagem ou MP4:',
  backgroundMediaPinterestResolveRequired: 'Resolva a URL do Pinterest antes de aplicar.',
  backgroundMediaResolving: 'Resolvendo URL…',
} as const;