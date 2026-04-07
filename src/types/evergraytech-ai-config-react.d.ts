declare module "@evergraytech/ai-config/react" {
  export {
    AIConfigPanel,
    AIConfigProvider,
    AIConfigResetButton,
    AIConfigSettingsHeader,
    AIConfigSettingsSurface,
    AIConfigSetupRequired,
    AIApiKeyField,
    AICredentialStatus,
    AIGenerationSettingsForm,
    AIModeSelector,
    AIModelSelector,
    AIProviderSelector,
    AIStatus as AIConfigStatus,
    AIUsageHint,
    useAIConfig,
    useAIConfigActions,
    useAIConfigAppDefinition,
    useAIConfigState,
    useAvailableModels,
    useAvailableProviders,
  } from "@evergraytech/ai-config/dist/react";

  export type {
    AIConfigPanelProps,
    AIConfigSettingsHeaderProps,
    AIConfigSettingsSurfaceProps,
    AIConfigSetupRequiredProps,
    AIGenerationSettingsFormProps,
    AIModelSelectorProps,
    AIProviderSelectorProps,
  } from "@evergraytech/ai-config/dist/react";
}
