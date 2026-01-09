import mongoose, { Schema, model, models, Types } from "mongoose";

/* ================= INTERFACE ================= */

export interface IBrand {
  _id?: Types.ObjectId;

  name: string;
  slug: string;
  website?: string;

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ================= SCHEMA ================= */

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// Helps fast lookup & avoids duplicates with casing issues
brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });

/* ================= EXPORT ================= */

const Brand = models.Brand || model<IBrand>("Brand", brandSchema);

export default Brand;
