/// <reference types="vite/client" />

interface ImportMetaEnv {}

interface CareComplaintsFePluginConfig {
  enabled?: boolean;
}

interface CarePluginRuntimeMeta {
  care_complaints_fe?: {
    config?: CareComplaintsFePluginConfig;
  };
}

interface CarePluginRuntime {
  meta?: CarePluginRuntimeMeta;
}

declare global {
  const __CORE_ENV__: {
    readonly apiUrl: string;
  };

  interface Window {
    __CARE_PLUGIN_RUNTIME__?: CarePluginRuntime;
  }
}

export {};
