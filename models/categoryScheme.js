import { Schema, model } from "mongoose";
import Joi from "joi";

const categorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export const Category = model("Category", categorySchema);

export const validateCategory = (body) => {
  const schema = Joi.object({
    title: Joi.string().required(),
  });

  return schema.validate(body);
};
