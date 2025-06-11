// src/js/types/js-yaml.d.ts
declare module 'js-yaml' {
  interface Schema {
    [key: string]: unknown;
  }

  interface LoadOptions {
    filename?: string;
    schema?: Schema;
    json?: boolean;
    listener?: (this: unknown, eventType: string, state: unknown) => void;
  }

  interface DumpOptions {
    indent?: number;
    noRefs?: boolean;
    skipInvalid?: boolean;
    schema?: Schema;
    flowLevel?: number;
    styles?: Record<string, string | boolean | number | undefined>;
    sortKeys?: boolean | ((a: string, b: string) => number);
    lineWidth?: number;
    noCompatMode?: boolean;
    condenseFlow?: boolean;
  }

  export const DEFAULT_SCHEMA: Schema;

  export function load(str: string, options?: LoadOptions): unknown;

  export function dump(obj: unknown, options?: DumpOptions): string;
}
