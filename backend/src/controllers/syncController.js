import {
  collectFromAllSources,
} from "../services/collectorService.js";

import SyncLog from "../models/Sync_logs.js";

export const startSync = async (req, res) => {
  try {
    // Lấy ID của Admin đang thực hiện đồng bộ
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "User information not found",
      });
    }

    console.log(
      `Sync started by user: ${userId}`
    );

    // Gọi Collector Service
    const result = await collectFromAllSources(
      userId
    );

    // Nếu Collector gặp lỗi tổng quát
    if (!result.success) {
      return res.status(500).json({
        message: "Synchronization failed",
        error: result.error,
      });
    }

    return res.status(200).json({
      message: "Synchronization completed successfully",
      result,
    });
  } catch (error) {
    console.error(
      "Failed to start synchronization:",
      error
    );

    return res.status(500).json({
      message: "System error",
    });
  }
};

export const getSyncLogs = async (req, res) => {
  try {
    const logs = await SyncLog.find().populate("source", "name type url").populate("triggeredBy", "username").sort({ createdAt: -1 });

    return res.status(200).json({
      logs,
    });
  } catch (error) {
    console.error("Failed to get sync logs:", error);

    return res.status(500).json({
      message: "System error",
    });
  }
};