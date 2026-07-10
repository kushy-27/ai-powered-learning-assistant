import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide username, email and password",
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      let errorMessage = "User already registered";

      if (existingUser.email === normalizedEmail) {
        errorMessage = "Email already registered";
      } else if (existingUser.username === normalizedUsername) {
        errorMessage = "Username already taken";
      }

      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profilePicture,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(
        error.keyPattern || error.keyValue || {}
      )[0];

      let errorMessage = "User already registered";

      if (duplicateField === "email") {
        errorMessage = "Email already registered";
      } else if (duplicateField === "username") {
        errorMessage = "Username already taken";
      }

      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }

    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profilePicture } = req.body || {};

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    let normalizedUsername;
    let normalizedEmail;

    if (username !== undefined) {
      normalizedUsername = username.trim();

      const existingUsername = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: req.user.id },
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: "Username already taken",
        });
      }
    }

    if (email !== undefined) {
      normalizedEmail = email.trim().toLowerCase();

      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user.id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: "Email already registered",
        });
      }
    }

    if (username !== undefined) {
      user.username = normalizedUsername;
    }

    if (email !== undefined) {
      user.email = normalizedEmail;
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profilePicture,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(
        error.keyPattern || error.keyValue || {}
      )[0];

      let errorMessage = "Profile information already exists";

      if (duplicateField === "email") {
        errorMessage = "Email already registered";
      } else if (duplicateField === "username") {
        errorMessage = "Username already taken";
      }

      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }

    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Please provide current and new password",
      });
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "Passwords must be valid strings",
      });
    }

    if (newPassword.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "New password cannot contain only spaces",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: "New password must be different from current password",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
