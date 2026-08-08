import uz, { type Dictionary } from "./uz";

export const locale = "uz" as const;

const dictionaries: Record<typeof locale, Dictionary> = { uz };

type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : DotPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = DotPaths<Dictionary>;

export function t(key: TranslationKey): string {
  const parts = key.split(".");
  let value: unknown = dictionaries[locale];
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }
  return typeof value === "string" ? value : key;
}
