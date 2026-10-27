
import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const Signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await user.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists. Please log in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newuser = await user.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      data: {
        _id: newuser._id,
        name: newuser.name,
        email: newuser.email,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({
      message: "Signup failed. Please try again.",
    });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await user.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      data: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find().select("-password");
    return res.status(200).json({ data: alluser });
  } catch (error) {
    console.error("Get users error:", error.message);
    return res.status(500).json({
      message: "Could not retrieve users.",
    });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags } = req.body.editForm;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      message: "User unavailable",
    });
  }

  try {
    const updatedProfile = await user.findByIdAndUpdate(
      _id,
      { $set: { name, about, tags } },
      { new: true }
    ).select("-password");

    if (!updatedProfile) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({ data: updatedProfile });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({
      message: "Could not update profile.",
    });
  }
};
