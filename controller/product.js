import { Product, validateProduct } from "../models/productScheme.js";
import { Category } from "../models/categoryScheme.js";

class ProductsController {
  async getProducts(req, res) {
    try {
      const {
        limit = 10,
        skip = 1,
        sortBy = "price",
        sortOrder = "asc",
        category,
      } = req.query;

      const products = await Product.find({
        ...(category && { categoryId: category }),
      })
        .populate([
          { path: "categoryId", select: "title" },
          { path: "adminId", select: ["fname", "username"] },
        ])
        .limit(parseInt(limit))
        .skip(parseInt(skip - 1) * parseInt(limit))
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1, createdAt: -1 });
      const totalCount = await Product.countDocuments({
        ...(category && { categoryId: category }),
      });

      res.status(200).json({
        variant: "success",
        msg: "Products fetched successfully",
        payload: products,
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

  async getProductsByCategory(req, res) {
    try {
      const { limit = 10, skip = 0 } = req.query;
      const { categoryId } = req.params;

      const categoryData = await Category.findById(categoryId);
      if (!categoryData) {
        return res.status(404).json({
          variant: "error",
          msg: "Category not found",
          payload: null,
        });
      }

      const products = await Product.find({ categoryId })
        .populate([{ path: "categoryId", select: "title" }])
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      const totalCount = await Product.countDocuments({
        categoryId,
      });

      res.status(200).json({
        variant: "success",
        msg: `All products for category ${categoryData?.title}`,
        payload: products,
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

  async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          variant: "error",
          msg: "Product not found",
          payload: null,
        });
      }

      res.status(200).json({
        variant: "success",
        msg: "Product found",
        payload: product,
      });
    } catch (error) {
      res.status(500).json({
        variant: "error",
        msg: "Server error",
        payload: null,
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { error } = validateProduct(req.body);
      let existProduct = await Product.findOne({ title: req.body.title });
      console.log(existProduct);

      if (
        existProduct &&
        existProduct._id.toString() !== req.params.id.toString()
      ) {
        return res.status(400).json({
          msg: "This title already exists",
          variant: "error",
          payload: null,
        });
      }

      if (error) {
        return res.status(400).json({
          variant: "error",
          msg: error.details[0].message,
          payload: null,
        });
      }

      const { id } = req.params;
      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!product) {
        return res.status(404).json({
          variant: "error",
          msg: "Product not found",
          payload: null,
        });
      }

      res.status(200).json({
        variant: "success",
        msg: "Product updated successfully",
        payload: product,
      });
    } catch (error) {
      res.status(500).json({
        variant: "error",
        msg: "Server error",
        payload: null,
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({
          variant: "error",
          msg: "Product not found",
          payload: null,
        });
      }

      res.status(200).json({
        variant: "success",
        msg: "Product deleted successfully",
        payload: product,
      });
    } catch (error) {
      res.status(500).json({
        variant: "error",
        msg: "Server error",
        payload: null,
      });
    }
  }

  async createProduct(req, res) {
    try {
      const { error } = validateProduct(req.body);
      if (error) {
        return res.status(400).json({
          variant: "error",
          msg: error.details[0].message,
          payload: null,
        });
      }

      let existingTitle = await Product.findOne({ title: req.body.title });
      if (existingTitle) {
        return res.status(400).json({
          variant: "error",
          msg: "This title already exists",
          payload: null,
        });
      }

      let fileUrls = req.files.map(
        (file) => `${req.protocol}://${req.get("host")}/images/${file.filename}`
      );

      const newProduct = {
        ...req.body,
        urls: fileUrls,
        adminId: req.admin._id,
      };

      const product = await Product.create({
        ...newProduct,
        info: req.body?.info ? JSON.parse(req.body.info): [],
      });
      res.status(201).json({
        variant: "success",
        msg: "Product created successfully",
        payload: product,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        variant: "error",
        msg: "Server error",
        payload: null,
      });
    }
  }
}

export default new ProductsController();
