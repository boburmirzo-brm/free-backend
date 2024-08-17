import express from "express";
import AdminsController from "../controller/admin.js";
import ProductsController from "../controller/product.js";
import CategoriesController from "../controller/category.js";
import CommentsController from "../controller/comment.js";
import { auth, ownerMiddleware } from "../middleware/auth.js";
import { uploader } from "../middleware/uploader.js";

const router = express.Router();

//admins
router.get("/admin",[auth],  AdminsController.getAdmins);
router.post("/admin/sign-up",[auth], AdminsController.registerAdmin);
router.delete(
  "/admin/:id",
  [auth, ownerMiddleware],
  AdminsController.deleteAdmin
);
router.patch("/admin/profile", [auth], AdminsController.updateProfile);
router.get("/admin/profile", [auth], AdminsController.getProfile);
router.get(
  "/admin/:id",
  [auth, ownerMiddleware],
  AdminsController.getSingleAdmin
);
router.patch(
  "/admin/:id",
  [auth, ownerMiddleware],
  AdminsController.updateAdmin
);
router.post("/admin/sign-in", AdminsController.loginAdmin);

//products
router.get("/products", ProductsController.getProducts);
router.get("/product/:id", ProductsController.getProduct);
router.patch("/product/:id", [auth], ProductsController.updateProduct);
router.delete("/product/:id", [auth], ProductsController.deleteProduct);
router.get(
  "/product/category/:categoryId",
  ProductsController.getProductsByCategory
);
router.post(
  "/product",
  [auth, uploader.array("photos")],
  ProductsController.createProduct
);

//category
router.get("/category", CategoriesController.getCategories);
router.get("/category/:id", CategoriesController.getCategoryById);
router.post("/category", [auth], CategoriesController.createCategory);
router.patch("/category/:id", [auth], CategoriesController.updateCategory);
router.delete("/category/:id", [auth], CategoriesController.deleteCategory);

//comments
router.get("/comment", [auth], CommentsController.getComments);
router.delete("/comment/:id", [auth], CommentsController.deleteComment);
router.post("/comment", [auth], CommentsController.createComment);
router.patch("/comment/:id", [auth], CommentsController.updateComment);

export default router;
