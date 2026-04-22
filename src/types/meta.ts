export type WithMeta<T = unknown> = T & {
  __meta?: {
    name?: string;
    url?: string;
    config?: Record<string, unknown>;
  };
};
