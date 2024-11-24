import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import { jwtSecret } from "../config.js";
import emailController from "./emailController.js";
import dotenv from "dotenv";
dotenv.config();

// Destructure methods for convenience
const { sign, verify } = jwt;

// Test endpoint for auth controller
export const testAuth = (req, res) => {
  res.send("Auth controller test is working");
};

// Function to handle user signup
export async function signup(req, res) {
  const {
    email,
    password,
    username,
    location,
    account_type,
    company_details,
    personal_details,
  } = req.body;

  if (!email || !password || !username || !account_type) {
    return res.status(400).send("All fields are required");
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).send("Email already in use");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).send("Username already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      email,
      password: hashedPassword,
      username,
      location,
      account_type,
      ...(account_type === "Employer"
        ? { company_details }
        : { personal_details }),
    };

    const user = new User(userData);
    await user.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    console.error("Error creating user:", error.message, error.stack);
    res.status(500).send("Error creating user");
  }
}

// Function to handle user login
export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send("Invalid password");
    }

    const token = sign({ userId: user._id }, jwtSecret, { expiresIn: "7d" });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error.message, error.stack);
    res.status(500).send("Server error");
  }
}

// Function to check if an email exists in the database
export async function checkEmail(req, res) {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ exists: true });
    }

    const otp = await emailController.sendEmail("otp", email);
    res.json({ exists: false, message: "OTP sent", otp });
  } catch (error) {
    console.error("Error checking email:", error.message, error.stack);
    res.status(500).send("Error checking email");
  }
}

// Function to check if a username exists
export async function checkUsername(req, res) {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    res.json({ exists: !!user });
  } catch (error) {
    console.error("Error checking username:", error.message, error.stack);
    res.status(500).send("Error checking username");
  }
}

// Function to update the user password
export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const username = req.user?.username;

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error.message, error.stack);
    res.status(500).json({ error: "Error updating password" });
  }
}

// Function to request password reset
export async function requestPasswordReset(req, res) {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({error: "No user found with that email address"});
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.WEBSITE}/password-reset/${resetToken}`;
    // const message = `You requested a password reset. Click here to reset: ${resetUrl}`;
    await emailController.sendEmail("passwordReset", email, {
      resetLink: resetUrl,
    });

    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
}

// Function to validate reset token
export async function validateResetToken(req, res) {
  const { token } = req.params;
  console.log("token", token);

  try {
    // Hash the token received in the request
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log(hashedToken);

    // Calculate the timestamp for one hour ago
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // Find the user with this token and check if it is not more than an hour old
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gte: oneHourAgo, $lte: Date.now() }, // Token is within the last hour
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired" });
    }

    res.status(200).json({ message: "Token is valid and within the last hour" });
  } catch (error) {
    console.error("Error validating reset token:", error.message);
    res.status(500).json({ message: "Error validating reset token" });
  }
}


// Update the resetPassword function to use validateResetToken before proceeding
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate the reset token first
    const tokenValidationResponse = await validateResetToken(
      { params: { token } },
      res
    );
    if (tokenValidationResponse && tokenValidationResponse.status === 400) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the received token and look for a user with this token and non-expired reset token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

// Function to update user details
export async function updateUserDetails(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).send("User not found");
    }

    const {
      username,
      email,
      location,
      description,
      personal_details,
      company_details,
      githubLink,
      bio,
      linkedInLink,
      portfolioLink,
      tags,
      saved_jobs,
      saved_profiles,
    } = req.body;

    console.log("Request Body:", req.body);

    // Sanitize fields before updating
    user.username = username?.trim() || user.username;
    user.email = email?.trim() || user.email;
    
    // Ensure `location` is null if it's an empty string
    user.location = location && typeof location === "object" ? location : user.location;
    
    user.description = description?.trim() || user.description;
    user.githubLink = githubLink?.trim() || user.githubLink;
    user.linkedInLink = linkedInLink?.trim() || user.linkedInLink;
    user.portfolioLink = portfolioLink?.trim() || user.portfolioLink;
    user.tags = Array.isArray(tags) ? tags : user.tags; // Ensure tags are an array
    user.profileImage = req.images || user.profileImage;
    user.bio = bio?.trim() || user.bio;

    // Ensure personal_details and company_details are objects or keep existing
    user.personal_details = typeof personal_details === "object" ? personal_details : user.personal_details;
    user.company_details = typeof company_details === "object" ? company_details : user.company_details;

    // Ensure saved_jobs and saved_profiles are arrays or keep existing
    user.saved_jobs = Array.isArray(saved_jobs) ? saved_jobs : user.saved_jobs;
    user.saved_profiles = Array.isArray(saved_profiles) ? saved_profiles : user.saved_profiles;

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user details:", error.message, error.stack);
    res.status(500).send("Error updating user details");
  }
}


// Function to get user details
export async function getUserDetails(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error.message, error.stack);
    res.status(500).send("Error fetching user details");
  }
}

// Function to get user details by ID
export async function getUserDetailsById(req, res) {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
      .select("-password")
      .populate("posts");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error(
      "Error fetching user details by ID:",
      error.message,
      error.stack
    );
    res.status(500).send("Error fetching user details");
  }
}
