import mongoose from "mongoose";

const syncLogSchema = new mongoose.Schema(
  {
    // Nguồn dữ liệu được đồng bộ
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Source",
      required: true,
    },

    // User thực hiện quá trình đồng bộ
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Trạng thái đồng bộ
    status: {
      type: String,
      enum: ["running", "success", "failed"],
      default: "running",
    },

    // Tổng số IOC lấy được từ source
    totalFetched: {
      type: Number,
      default: 0,
    },

    // Số IOC mới được thêm vào database
    newIOC: {
      type: Number,
      default: 0,
    },

    // Số IOC đã tồn tại
    duplicateIOC: {
      type: Number,
      default: 0,
    },

    // Số lỗi xảy ra
    errorCount: {
      type: Number,
      default: 0,
    },

    // Thông báo kết quả đồng bộ
    message: {
      type: String,
      default: "",
    },

    // Thời gian bắt đầu
    startedAt: {
      type: Date,
      default: Date.now,
    },

    // Thời gian kết thúc
    finishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SyncLog = mongoose.model("SyncLog", syncLogSchema);

export default SyncLog;