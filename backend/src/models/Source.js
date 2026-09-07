import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    // Tên nguồn dữ liệu
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // nguồn: API hoặc RSS
    type: {
      type: String,
      enum: ["API", "RSS"],
      required: true,
    },

    // URL
    url: {
      type: String,
      required: true,
      trim: true,
    },

    // Cho phép hoặc tạm dừng nguồn dữ liệu
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Source = mongoose.model("Source", sourceSchema);

export default Source;