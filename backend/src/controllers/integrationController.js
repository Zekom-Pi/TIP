import IOC from "../models/IOC.js";
import { sendIOCsToShuffle } from "../services/shuffleService.js";

export const testShuffleIntegration = async (req, res) => {
  try {
    const iocs = await IOC.find()
      .populate("source", "name type")
      .sort({ createdAt: -1 })
      .limit(5);

    const result = await sendIOCsToShuffle(iocs);

    return res.status(200).json({
      success: true,
      message: "Test data sent to Shuffle",
      result,
    });
  } catch (error) {
    console.error("Shuffle integration error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};