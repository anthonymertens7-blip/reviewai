/**
 * Ne garde que les champs réellement renseignés. On n'envoie jamais de
 * `null`/`""`/`undefined` au modèle : un champ absent du prompt est plus sûr
 * qu'une valeur vide ambiguë (cf. règle anti-hallucination de l'Étape 7).
 */
export function omitEmpty<T extends Record<string, unknown>>(input: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    result[key as keyof T] = value as T[keyof T];
  }
  return result;
}
