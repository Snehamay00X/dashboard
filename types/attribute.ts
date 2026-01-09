export type AttributeType = "text" | "number" | "select";

export interface AttributeDefinition {
  _id?: string;
  key: string;
  label: string;
  type: AttributeType;
  allowedValues?: string[];
  isFilterable: boolean;
}
