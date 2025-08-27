import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppConfig } from "../models/appConfig.model.js";
// GET /api/app-config
export const getAppConfig = asyncHandler(async (req, res) => {
    const config = await AppConfig.findOne();

    if (!config) {
        throw new ApiError(404, "App configuration not found");
    }

    res.status(200).json(new ApiResponse(200, config, "App configuration fetched"));
});

// PUT /api/app-config/:id
export const updateAppConfig = asyncHandler(async (req, res) => {
    const updatedConfig = await AppConfig.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if (!updatedConfig) {
        throw new ApiError(404, "App configuration not found for update");
    }

    res
        .status(200)
        .json(new ApiResponse(200, updatedConfig, "App configuration updated"));
});
// POST - Add new config
export const addAppConfig = asyncHandler(async (req, res) => {
    const existing = await AppConfig.findOne();
    if (existing) throw new ApiError(400, "App configuration already exists");

    const config = await AppConfig.create(req.body);
    res.status(201).json(new ApiResponse(201, config, "App configuration created"));
});
// DELETE - Delete config
export const deleteAppConfig = asyncHandler(async (req, res) => {
    const deleted = await AppConfig.findByIdAndDelete(req.params.id);
    if (!deleted) throw new ApiError(404, "App configuration not found to delete");

    res.status(200).json(new ApiResponse(200, deleted, "App configuration deleted"));
});