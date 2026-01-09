import AttributeDefinition from "@/models/AttributeDefinition";

export async function validateAttributes(
  attributes: Record<string, string>
) {
  const defs = await AttributeDefinition.find().select("key type allowedValues");

  const defMap = new Map(defs.map(d => [d.key, d]));

  for (const [key, value] of Object.entries(attributes)) {
    const def = defMap.get(key);
    if (!def) {
      throw new Error(`Invalid attribute key: ${key}`);
    }

    if (def.type === "number" && isNaN(Number(value))) {
      throw new Error(`${key} must be a number`);
    }

    if (
      def.type === "select" &&
      def.allowedValues.length &&
      !def.allowedValues.includes(value)
    ) {
      throw new Error(`Invalid value for ${key}`);
    }
  }
}
