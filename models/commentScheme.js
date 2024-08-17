import { Schema, model } from "mongoose";
import Joi from "joi";

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
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

export const Comment = model("Comment", commentSchema);

export const validateComment = (body) => {
  const schema = Joi.object({
    text: Joi.string().required(),
    productId: Joi.string().length(24).required(),
    rating: Joi.number().required(),
    adminId: Joi.string(),
  });
  return schema.validate(body);
};
