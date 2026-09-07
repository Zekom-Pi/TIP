import mongoose from "mongoose";

const iocSchema = new mongoose.Schema(
  {
    // Type IOC
    type: {
      type: String,
      enum: ["IP", "DOMAIN", "URL", "HASH"],
      required: true,
    },

    // Giá trị thực tế của IOC
    value: {
      type: String,
      required: true,
      trim: true,
    },

    // Mô tả IOC
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Mức độ nguy hiểm
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Nguồn cung cấp IOC
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Source",
      required: true,
    },

    // Thời điểm IOC được phát hiện lần đầu
    firstSeen: {
      type: Date,
      default: Date.now,
    },

    // Thời điểm IOC được phát hiện gần nhất
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Không cho phép lưu cùng một IOC từ cùng một source nhiều lần
iocSchema.index(
  {
    type: 1,
    value: 1, //chiều a-z
    source: 1, 
  },
  {
    unique: true,//yêu cầu cả 3 trường không đc trùng hết
  }
);

const IOC = mongoose.models.IOC || mongoose.model("IOC", iocSchema);

export default IOC;