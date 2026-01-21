export function buildSearchText(product: {
  name?: string;
  brand?: any;
  attributes?: Record<string, string>;
  description?: string;
}) {
  const parts: string[] = [];

  if (product.name) {
    parts.push(product.name);
  }

  if (product.description) {
    parts.push(product.description);
  }

  // brand can be ObjectId or populated object
  if (product.brand) {
    if (typeof product.brand === "string") {
      parts.push(product.brand);
    } else if (product.brand.name) {
      parts.push(product.brand.name);
    }
  }

  if (product.attributes) {
    Object.values(product.attributes).forEach((value) => {
      if (value) parts.push(value);
    });
  }

  return parts
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
