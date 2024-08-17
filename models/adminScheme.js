import Joi from "joi";
import { Schema, model } from "mongoose";

const adminScheme = new Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: false,
      default: "",
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    role: {
      type: String,
      required: true,
      enum: [, "admin", "owner"],
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

export const Admins = model("Admin", adminScheme);

export const validateAdmin = (body) => {
  const schema = Joi.object({
    fname: Joi.string().required(),
    lname: Joi.string().allow(""),
    username: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().required(),
    isActive: Joi.boolean().allow(true),
    role: Joi.string().valid("admin", "owner").allow("admin"),
  });
  return schema.validate(body);
};
