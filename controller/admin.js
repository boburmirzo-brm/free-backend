import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admins, validateAdmin } from "../models/adminScheme.js";

class AdminsController {
  async getAdmins(req, res) {
    try {
      let { limit = 10, page = 1 } = req.params;
      const adminsLength = await Admins.countDocuments();
      const admins = await Admins.find()
        .limit(limit * 1)
        .skip((page - 1) * limit);

      if (!admins) {
        return res.status(400).json({
          msg: "Admins not found",
          variant: "Error",
          payload: null,
          totalCount: 0,
        });
      }

      res.status(200).json({
        msg: "Admins found",
        variant: "Success",
        payload: admins,
        totalCount: adminsLength,
      });
    } catch (error) {
      res.status(500).json({
        msg: "Server error",
        variant: "Error",
        payload: null,
        totalCount: 0,
      });
    }
  }
  async getProfile(req, res) {
    try {
      let admin = await Admins.findById(req.admin._id);
      if (!admin.isActive) {
        return res.status(401).json({
          msg: "Invalid token",
          variant: "Error",
          payload: null,
          totalCount: 0,
        });
      }
      res.status(200).json({
        msg: "Your profile found successfully",
        variant: "success",
        payload: admin,
      });
    } catch {
      res.status(500).json({
        msg: "server error",
        variant: "error",
        payload: null,
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { username } = req.admin;

      const existingAdmin = await Admins.findOne({
        username,
      });
      if (
        existingAdmin &&
        existingAdmin._id.toString() !== req.admin._id.toString()
      ) {
        return res.status(400).json({
          msg: "This username already exists",
          variant: "error",
          payload: null,
        });
      }

      let admin = await Admins.findById(req.admin._id);
      if (!admin) {
        return res.status(400).json({
          msg: "Admin not found",
          variant: "error",
          payload: null,
        });
      }

      req.body.password = admin.password;

      admin = await Admins.findByIdAndUpdate(req.admin._id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        msg: "Your profile updated successfully",
        variant: "success",
        payload: admin,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        msg: "Server error",
        variant: "error",
        payload: null,
      });
    }
  }

  async deleteAdmin(req, res) {
    try {
      const admin = await Admins.findByIdAndDelete(req.params.id);

      if (!admin) {
        return res.status(400).json({
          msg: "Admin not found",
          status: "error",
          payload: null,
        });
      }

      res.status(200).json({
        msg: "Admin deleted successfully",
        status: "success",
        payload: admin,
      });
    } catch (error) {
      res.status(500).json({
        msg: "Server error",
        status: "error",
        payload: null,
      });
    }
  }

  async getSingleAdmin(req, res) {
    try {
      let admin = await Admins.findById(req.params.id);
      if (!admin) {
        res.status(400).json({
          msg: "Admin not found",
          status: "error",
          payload: null,
        });
      }
      res.status(200).json({
        msg: "Admin successfully found",
        status: "success",
        payload: admin,
      });
    } catch (error) {
      res.status(500).json({
        msg: "Server error",
        status: "error",
        payload: null,
      });
    }
  }
  async updateAdmin(req, res) {
    try {
      if (req.body.password) {
        return res.status(400).json({
          msg: "Password must be unavailable",
          variant: "error",
          payload: null,
        });
      }
      const { id } = req.params;
      const { username } = req.admin;
      const trimmedId = id.trim();

      const existingAdmin = await Admins.findOne({ username });
      if (existingAdmin && existingAdmin._id.toString() !== trimmedId) {
        return res.status(400).json({
          msg: "This username already exists",
          variant: "error",
          payload: null,
        });
      }

      let admin = await Admins.findByIdAndUpdate(trimmedId, req.body, {
        new: true,
      });

      res.status(200).json({
        msg: "Admin updated successfully",
        variant: "success",
        payload: admin,
      });
    } catch (error) {
      res.status(500).json({
        msg: "Server error",
        status: "error",
        payload: null,
      });
    }
  }
  async registerAdmin(req, res) {
    try {
      const { error } = validateAdmin(req.body);
      if (error) {
        return res.status(400).json({
          msg: error.details[0].message,
          variant: "error",
          payload: null,
        });
      }

      let existAdmin = await Admins.findOne({ username: req.body.username });
      if (existAdmin) {
        return res.status(400).json({
          msg: "This username already exists",
          variant: "error",
          payload: null,
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      let admin = await Admins.create({
        ...req.body,
        password: hashedPassword,
      });

      const token = jwt.sign(
        { _id: admin._id, role: admin.role, isActive: true },
        process.env.SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );

      res.status(201).json({
        msg: "Admin created successfully",
        variant: "success",
        payload: { token, admin },
      });
    } catch (error) {
      res.status(500).json({
        msg: error,
        variant: "error",
        payload: null,
      });
    }
  }

  async loginAdmin(req, res) {
    try {
      let admin = await Admins.findOne({ username: req.body.username });
      if (!admin) {
        return res.status(400).json({
          msg: "Invalid username or password",
          variant: "error",
          payload: null,
        });
      }
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          msg: "Invalid token",
          variant: "Error",
          payload: null,
        });
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        admin.password
      );
      if (!validPassword) {
        return res.status(400).json({
          msg: "Invalid username or password",
          variant: "error",
          payload: null,
        });
      }

      const token = jwt.sign(
        { _id: admin._id, role: admin.role, isActive: admin.isActive },
        process.env.SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );

      res.status(200).json({
        msg: "Admin logged in successfully",
        variant: "success",
        payload: { token, admin },
      });
    } catch (error) {
      res.status(500).json({
        msg: "Server error",
        variant: "error",
        payload: null,
      });
    }
  }
}

export default new AdminsController();
