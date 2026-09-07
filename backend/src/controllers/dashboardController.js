import IOC from "../models/IOC.js";
import Source from "../models/Source.js";
import SyncLog from "../models/Sync_logs.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Đếm tổng IOC
    const totalIOC = await IOC.countDocuments();

    // Đếm IOC theo type
    const iocByType = await IOC.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Đếm tổng Source
    const totalSources = await Source.countDocuments();

    // Source đang enabled
    const activeSources = await Source.countDocuments({ enabled: true });

    // Lấy log sync mới nhất
    const latestSync = await SyncLog.findOne()
      .populate("source", "name type url")
      .populate("triggeredBy", "username")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      totalIOC,
      iocByType,
      sources: {
        total: totalSources,
        active: activeSources,
      },
      latestSync,
    });
  } catch (error) {
    console.error( "Failed to get dashboard stats:",error);

    return res.status(500).json({
      message: "System error",
    });
  }
};