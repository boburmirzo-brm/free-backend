import { Category, validateCategory } from "../models/categoryScheme.js";
import { Admins } from "../models/adminScheme.js";

class CategoriesController {
  async getCategories(req, res) {
    try {
      const categories = await Category.find().populate([
        { path: "adminId", select: ["fname", "username"] },
      ]);
      const totalCount = await Category.countDocuments();

      res.status(200).json({
        variant: "success",
        msg: "All categories",
        payload: categories,
        totalCount,
      });
    } catch (error) {
      res.status(500).json({
        variant: "error",
        msg: "Server error",
        payload: null,
      });
    }
  }
  async getCategoryById(req, res) {
    try {
      let category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(400).json({
          variant: "error",
          msg: "Category not found",
          payload: null,
        });
      }

      res.status(200).json({
        variant: "success",
        msg: "Category found",
        payload: category,
      });
    } catch (error) {
      res.status(500).json({
        variant: "error",
        msg: "Server error",
        payload: null,
      });
    }
  }

  async createCategory(req, res) {
    try {
      const { error } = validateCategory(req.body);
      if (error) return res.status(400).json({ msg: error.details[0].message });

      let existingTitle = await Category.findOne({ title: req.body.title });
      if (existingTitle) {
        return res.status(400).json({
          variant: "error",
          msg: "This title already exists",
          payload: null,
        });
      }

      const category = await Category.create({
        ...req.body,
        adminId: req.admin._id,
      });

      const admin = await Admins.findById(req.admin._id).select("name email");

      res.status(201).json({
        variant: "success",
        msg: "Category created successfully",
        payload: {
          category,
          createdBy: admin,
        },
      });
    } catch (error) {
      res.status(500).json({
        variant: "error",
        msg: "Server error",
        payload: null,
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { error } = validateCategory(req.body);
      if (error) return res.status(400).json({ msg: error.details[0].message });

      let existingCategory = await Category.findOne({ title: req.body.title });
      console.log(existingCategory);

      if (
        existingCategory &&
        existingCategory._id.toString() !== req.params.id.toString()
      ) {
        return res.status(400).json({
          msg: "This title already exists",
          variant: "error",
          payload: null,
        });
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!category) {
        return res.status(404).json({
          variant: "error",
          msg: "Category not found",
          payload: null,
        });
      }

      const admin = await Admins.findById(category.adminId).select(
        "name email"
      );

      res.status(200).json({
        variant: "success",
        msg: "Category updated successfully",
        payload: {
          category,
          updatedBy: admin,
        },
      });
    } catch (error) {
      res.status(500).json({
        variant: "error",
        msg: "Server error",
        payload: null,
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);

      if (!category) {
        return res.status(404).json({
          variant: "error",
          msg: "Category not found",
          payload: null,
        });
      }

      const admin = await Admins.findById(category.adminId).select(
        "name email"
      );

      res.status(200).json({
        variant: "success",
        msg: "Category deleted successfully",
        payload: {
          category,
          deletedBy: admin,
        },
      });
    } catch (error) {
      res.status(500).json({
        variant: "error",
        msg: "Server error",
        payload: null,
      });
    }
  }
}

export default new CategoriesController();
