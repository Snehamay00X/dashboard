export interface ProductPayload {
  name: string;
  brand?: string;
  description?: string;
  images: string[];
  attributes: Record<string, string>;
}
