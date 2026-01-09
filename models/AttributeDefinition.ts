import mongoose, { Schema, models } from "mongoose";

export interface IAttributeDefinition {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  allowedValues?: string[];
  isFilterable: boolean;
}

const AttributeDefinitionSchema = new Schema<IAttributeDefinition>({
  key: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "number", "select"],
    default: "text",
  },
  allowedValues: {
    type: [String],
    default: [],
  },
  isFilterable: {
    type: Boolean,
    default: true,
  },
});

export default models.AttributeDefinition ||
  mongoose.model<IAttributeDefinition>(
    "AttributeDefinition",
    AttributeDefinitionSchema
  );
