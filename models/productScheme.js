import { Schema, model } from "mongoose";
import Joi from "joi";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    units: {
      type: String,
      enum: ["kg", "m", "litr", "dona"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    urls: {
      type: Array,
      required: true,
    },
    info: {
      type: Array,
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Product = model("Product", productSchema);

export const validateProduct = (body) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    oldPrice: Joi.number().default(0),
    stock: Joi.number().default(0),
    rating: Joi.number().default(0),
    views: Joi.number().default(0),
    categoryId: Joi.string().length(24).required(),
    adminId: Joi.string(),
    units: Joi.string().valid("kg", "m", "litr","dona").required(),
    description: Joi.string().required(),
    urls: Joi.array(),
    info: Joi.string(),
    available: Joi.boolean().default(true),
  });

  return schema.validate(body);
};
