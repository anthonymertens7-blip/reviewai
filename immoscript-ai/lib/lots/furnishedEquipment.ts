export const FURNISHED_EQUIPMENT_ITEMS = [
  { value: "lit", label: "Lit" },
  { value: "table_chaises", label: "Table & chaises" },
  { value: "canape", label: "Canapé" },
  { value: "refrigerateur", label: "Réfrigérateur" },
  { value: "plaques_cuisson", label: "Plaques de cuisson" },
  { value: "four", label: "Four" },
  { value: "lave_linge", label: "Lave-linge" },
  { value: "television", label: "Télévision" },
] as const;

export type FurnishedEquipmentItem = (typeof FURNISHED_EQUIPMENT_ITEMS)[number]["value"];
