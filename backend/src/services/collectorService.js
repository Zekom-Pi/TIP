import Source from "../models/Source.js";
import IOC from "../models/IOC.js";
import SyncLog from "../models/Sync_logs.js";
import { collectFromOTX } from "./collectors/otxCollector.js";

/**
  @param {ObjectId} userId
*/
export const collectFromAllSources = async (userId) => {
  try {
    // Lấy tất cả source enable
    const sources = await Source.find({
      enabled: true,
    });

    const results = [];

    // từng source
    for (const source of sources) {
      const result = await collectFromSource(
        source,
        userId
      );

      results.push(result);
    }

    return {
      success: true,
      totalSources: sources.length,
      results,
    };
  } catch (error) {
    console.error(
      "Failed to collect from all sources:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* Đồng bộ dữ liệu từ một source */
const collectFromSource = async ( source, userId) => {
  // Tạo syncLog khi bắt đầu
  const syncLog = await SyncLog.create({
    source: source._id,
    triggeredBy: userId,
    status: "running",
    startedAt: new Date(),
  });

  try {
    let fetchedIOCs = [];

    /* Chọn Collector phù hợp với Source */
    if (source.name === "AlienVault OTX") {
      fetchedIOCs = await collectFromOTX(source);
    } else {
      throw new Error(
        `Unsupported source: ${source.name}`
      );
    }

    let newIOC = 0;
    let duplicateIOC = 0;
    let errorCount = 0;

    /* Lưu IOC vào MongoDB */
    for (const ioc of fetchedIOCs) {
      try {
        /* Kiểm tra IOC đã tồn tại chưa với điều kiện unique: type + value + source */
        const existingIOC = await IOC.findOne({
          type: ioc.type,
          value: ioc.value,
          source: source._id,
        });

        if (existingIOC) {
          duplicateIOC++;
          continue;
        }

        /* IOC chưa tồn tại => tạo mới */
        await IOC.create({ ...ioc, source: source._id});

        newIOC++;
      } catch (error) {
        /* Một IOC lỗi => toàn bộ quá trình dừng lại */
        errorCount++;

        console.error(
          `Failed to save IOC ${ioc.value}:`,
          error.message
        );
      }
    }

    /* Cập nhật SyncLog*/
    syncLog.status = "success";
    syncLog.totalFetched = fetchedIOCs.length;
    syncLog.newIOC = newIOC;
    syncLog.duplicateIOC = duplicateIOC;
    syncLog.errorCount = errorCount;
    syncLog.message =
      "Synchronization completed successfully";
    syncLog.finishedAt = new Date();
    await syncLog.save();

    return {
      success: true,
      source: source.name,
      totalFetched: fetchedIOCs.length,
      newIOC,
      duplicateIOC,
      errorCount,
      message:
        "Synchronization completed successfully",
    };
  } catch (error) {
    /* Nếu gặp lỗi */
    console.error( `Failed to synchronize source ${source.name}:`, error);

    syncLog.status = "failed";
    syncLog.errorCount = 1;
    syncLog.message = error.message;
    syncLog.finishedAt = new Date();

    await syncLog.save();

    return {
      success: false,
      source: source.name,
      totalFetched: 0,
      newIOC: 0,
      duplicateIOC: 0,
      errorCount: 1,
      message: error.message,
    };
  }
};