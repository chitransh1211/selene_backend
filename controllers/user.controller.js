import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, isAdmin } = req.body || {};

  // Required fields
  if (!name || !phone || !password) {
    throw new ApiError(400, "Name, phone, and password are required");
  }

  // Uniqueness checks (email is optional)
  if (email) {
    const userByEmail = await User.findOne({ email });
    if (userByEmail)
      throw new ApiError(409, `User with email ${email} already exists`);
  }
  const userByPhone = await User.findOne({ phone });
  if (userByPhone)
    throw new ApiError(409, `User with phone ${phone} already exists`);

  // Create (assumes password hashing in model pre-save hook)
  const user = await User.create({
    name,
    email: email || undefined,
    phone,
    password,
    isAdmin: Boolean(isAdmin) || false,
    address: [],
  });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) throw new ApiError(500, "Error while registering a user");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new ApiError(400, "Email or Phone and Password are required");
  }

  const user = await User.findOne({ phone });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select("-password");

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const fetchUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");

  if (!users) {
    throw new ApiError(500, "Something went wrong while fetching users");
  }

  res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, isAdmin, address } = req.body;
  const { id } = req.params;

  if (!name || !phone) {
    throw new ApiError(400, "Name and phone are required fields.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { name, email, phone, isAdmin, address },
    { new: true, runValidators: true }
  );

  if (!updatedUser) throw new ApiError(404, "User not found.");

  res
    .status(200)
    .json(
      new ApiResponse(200, { user: updatedUser }, "User updated successfully.")
    );
});

const verifyUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "User has been verified using Authentication middleware. Verified user is attached to req.user"
      )
    );
});
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

export {
  registerUser,
  loginUser,
  updateUser,
  verifyUser,
  fetchUsers,
  getUserById,
};
