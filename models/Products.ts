import mongoose, { Schema, Types } from "mongoose";

export interface IProduct {
  name: string;
  description: string;
  brand: Types.ObjectId;
  images: string[];
  attributes: Record<string, string>;
  searchText: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    images: {
      type: [String],
      default: [],
    },

    attributes: {
      type: Map,
      of: String,
      default: {},
    },

    // 🔥 THIS IS THE MAGIC
    searchText: {
      type: String,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
