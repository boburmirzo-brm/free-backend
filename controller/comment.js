import { Comment, validateComment } from "../models/commentScheme.js";
import { Admins } from "../models/adminScheme.js";

class CommentsController {
  async getComments(req, res) {
    try {
      const comments = await Comment.find().populate([
        { path: "adminId", select: ["fname", "username"] },
      ]);
      const totalCount = await Comment.countDocuments();

      res.status(200).json({
        variant: "success",
        msg: "All comments",
        payload: comments,
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

  async createComment(req, res) {
    try {
      const { error } = validateComment(req.body);
      if (error) return res.status(400).json({ msg: error.details[0].message });

      let existingTitle = await Comment.findOne({ title: req.body.title });
      if (existingTitle) {
        return res.status(400).json({
          variant: "error",
          msg: "This title already exists",
          payload: null,
        });
      }

      const comment = await Comment.create({
        ...req.body,
        adminId: req.admin._id,
      });

      const admin = await Admins.findById(req.admin._id).select("name email");

      res.status(201).json({
        variant: "success",
        msg: "comment created successfully",
        payload: {
          comment,
          createdBy: admin,
        },
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

  async updateComment(req, res) {
    try {
      const { error } = validateComment(req.body);
      if (error) return res.status(400).json({ msg: error.details[0].message });

      let existingComment = await Comment.findOne({ title: req.body.title });
      console.log(existingComment);

      if (
        existingComment &&
        existingComment._id.toString() !== req.params.id.toString()
      ) {
        return res.status(400).json({
          msg: "This title already exists",
          variant: "error",
          payload: null,
        });
      }

      const comment = await Comment.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!comment) {
        return res.status(404).json({
          variant: "error",
          msg: "Comment not found",
          payload: null,
        });
      }

      const admin = await Admins.findById(comment.adminId).select(
        "name email"
      );

      res.status(200).json({
        variant: "success",
        msg: "Comment updated successfully",
        payload: {
          comment,
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

  async deleteComment(req, res) {
    try {
      const comment = await Comment.findByIdAndDelete(req.params.id);

      if (!comment) {
        return res.status(404).json({
          variant: "error",
          msg: "Comment not found",
          payload: null,
        });
      }

      const admin = await Admins.findById(comment.adminId).select(
        "name email"
      );

      res.status(200).json({
        variant: "success",
        msg: "Comment deleted successfully",
        payload: {
          comment,
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

export default new CommentsController();
