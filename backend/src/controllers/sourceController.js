import Source from "../models/Source.js";
import IOC from "../models/IOC.js";

// /api/sources
export const createSource = async (req, res) => {
  try {
    const { name, type, url, enabled } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !type || !url) {
      return res.status(400).json({
        message: "name, type and url are required",
      });
    }

    // Chuẩn hóa dữ liệu
    const normalizedName = name.trim();
    const normalizedType = type.toUpperCase();
    const normalizedUrl = url.trim();

    // Kiểm tra source hợp lệ
    if (!["API", "RSS"].includes(normalizedType)) {
      return res.status(400).json({
        message: "Source type must be API or RSS",
      });
    }

    // Kiểm tra source đã tồn tại
    const existingSource = await Source.findOne({
      name: normalizedName,
    });

    if (existingSource) {
      return res.status(409).json({
        message: "Source already exists",
      });
    }

    // Tạo source
    const source = await Source.create({
      name: normalizedName,
      type: normalizedType,
      url: normalizedUrl,
      enabled: enabled ?? true,
    });

    return res.status(201).json({
      message: "Source created successfully",
      source,
    });
  } catch (error) {
    console.error("Failed to create source:", error);

    // Xử lý trùng lặp do unique index
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Source already exists",
      });
    }

    return res.status(500).json({
      message: "System error",
    });
  }
};

// get /api/sources
export const getSources = async (req, res) => {
  try {
    const sources = await Source.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      total: sources.length,
      sources,
    });
  } catch (error) {
    console.error("Failed to get sources:", error);

    return res.status(500).json({
      message: "System error",
    });
  }
};


 //get /api/sources/:id
 
export const getSourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const source = await Source.findById(id);

    if (!source) {
      return res.status(404).json({
        message: "Source not found",
      });
    }

    return res.status(200).json({
      source,
    });
  } catch (error) {
    console.error("Failed to get source:", error);

    return res.status(500).json({
      message: "System error",
    });
  }
};

 //put /api/sources/:id
 
export const updateSource = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      type,
      url,
      enabled,
    } = req.body;

    // Tìm source
    const source = await Source.findById(id);

    if (!source) {
      return res.status(404).json({
        message: "Source not found",
      });
    }

    // Cập nhật name
    if (name !== undefined) {
      const normalizedName = name.trim(); //bỏ khoang trang đầu cuối

      if (!normalizedName) {
        return res.status(400).json({
          message: "Source name cannot be empty",
        });
      }

      // Kiểm tra trùng tên
      const duplicateSource = await Source.findOne({
        name: normalizedName,
        _id: { $ne: id },
      });

      if (duplicateSource) {
        return res.status(409).json({
          message: "Another source with the same name already exists",
        });
      }

      source.name = normalizedName;
    }

    // Cập nhật type
    if (type !== undefined) {
      const normalizedType = type.toUpperCase();

      if (!["API", "RSS"].includes(normalizedType)) {
        return res.status(400).json({
          message: "Source type must be API or RSS",
        });
      }

      source.type = normalizedType;
    }

    // Cập nhật URL
    if (url !== undefined) {
      const normalizedUrl = url.trim();

      if (!normalizedUrl) {
        return res.status(400).json({
          message: "Source URL cannot be empty",
        });
      }

      source.url = normalizedUrl;
    }

    // Cập nhật enable
    if (enabled !== undefined) {
      source.enabled = enabled;
    }

    // Lưu thay đổi
    await source.save();

    return res.status(200).json({
      message: "Source updated successfully",
      source,
    });
  } catch (error) {
    console.error("Failed to update source:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Source already exists",
      });
    }

    return res.status(500).json({
      message: "System error",
    });
  }
};

// DELETE /api/sources/:id
 
export const deleteSource = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra source tồn tại
    const source = await Source.findById(id);

    if (!source) {
      return res.status(404).json({
        message: "Source not found",
      });
    }

    // Kiểm tra source còn IOC hay không
    const iocCount = await IOC.countDocuments({
      source: id,
    });

    if (iocCount > 0) {
      return res.status(409).json({
        message: "Cannot delete source because it still has IOC data",
        iocCount,
      });
    }

    // Xóa source
    await Source.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Source deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete source:", error);

    return res.status(500).json({
      message: "System error",
    });
  }
};