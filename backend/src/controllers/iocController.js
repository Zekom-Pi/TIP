import IOC from "../models/IOC.js";
import Source from "../models/Source.js";

export const createIOC = async (req ,res) => {
    try{
        const {type , value, description ,severity, source, firstSeen, lastSeen} = req.body;
        if(!type || !value || !source){
            return res.status(400).json({message : "Sth invalid"});
        }

        const sourceExist = await Source.findById(source);

        if(!sourceExist) {
            return res.status(404).json({message : "Source not found"});
        }
        const normalizedType = type.toUpperCase();
        const normalizedValue = value.trim();

        const existingIOC = await IOC.findOne({
            type : normalizedType,
            value : normalizedValue,
            source,
        });

        if(existingIOC) {
            return res.status(409).json({message :"IOC already exists",
                ioc : existingIOC, //thoát ra ngya
            });

        }

        const ioc = await IOC.create({
      type: normalizedType,
      value: normalizedValue,
      description: description?.trim() || "",
      severity: severity || "medium",
      source,
      firstSeen: firstSeen || new Date(),
      lastSeen: lastSeen || new Date(),
    });

    const populatedIOC = await ioc.populate("source"); // gán source kemfvaof ioc

    return res.status(201).json({
      message: "IOC created successfully",
      ioc: populatedIOC,
    });
    } catch (error) {
        console.error("Failed to create IOC:", error);

    // Xử lý trường hợp MongoDB unique index phát hiện duplicate
    if (error.code === 11000) {  // ngăn hai user cùng lưu 1 lúc => mỗi ioc là duy nhất
      return res.status(409).json({
        message: "IOC already exists",
      });
    }

    return res.status(500).json({
      message: "System error",
    });
    }
};

export const getIOCs = async (req, res) => {
    try{
        const {type , severity, search} = req.query;
        const filter = {};
        if(type){
            filter.type = type.toUpperCase();
        }

        if(severity){
            filter.severity = severity.toLowerCase();

        }

        if(search){
            filter.value = {
                $regex : search,
                $options : "i", //không phân biệt hoa thường
            };
        }

        //const iocs = (await IOC.find(filter).populate("source" , "name type url")).sort({createdAt: -1});

        const iocs = await IOC.find(filter).sort({ createdAt: -1 }).populate("source", "name type url");//lấy 3 trường của source

        return res.status(200).json({total : iocs.length , iocs});

    } catch (error) {
        console.error("Failed to get IOCs: ", error);
        return res.status(500).json({message: "System error"});

    }
};

export const getIOCById = async (req, res) => {
    try {
        const {id} = req.params; //lấy id từ req
        const ioc  = await IOC.findById(id).populate("source", "name type url" );

        if(!ioc) {
            return res.status(404).json({
                message: "IOC not found",
            });
        }

        return res.status(200).json({ioc});

    } catch (error){
        console.error("Failed to fetch IOC: " , error);

        return res.status(500).json({message : "System error"});

    }
};

export const updateIOC = async (req , res) => {
    try{
        const {id} = req.params; //lấy id

        const {type , value , description, severity , source, firstSeen , lastSeen} = req.body;

        const ioc = await IOC.findById(id);

        if(!ioc) {
            return res.status(404).json({message : "IOC not found"});

        }

        if(source ){
            const sourceExist = await Source.findById(source);

            if(!sourceExist){
                return res.status(404).json({message : "Source not found"});
                //nếu ko tồn tại
            }

            ioc.source = source;
        }

        if(type){
            ioc.type = type.toUpperCase();

        }

        if(value){
            ioc.value = value.trim();

        }

        if (description !== undefined) {
      ioc.description = description.trim();
    }

    if (severity) {
      ioc.severity = severity.toLowerCase();
    }

    if (firstSeen) {
      ioc.firstSeen = firstSeen;
    }

    if (lastSeen) {
      ioc.lastSeen = lastSeen;
    }

    await ioc.save();

    const updatedIOC = await ioc.populate("source");

     return res.status(200).json({
      message: "IOC updated successfully",
      ioc: updatedIOC,
    });
    } catch (error){
        console.error("Failed to update IOC:", error);

    // Duplicate theo unique index
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Another IOC with the same type, value and source already exists",
      });
    }

    return res.status(500).json({
      message: "System error",
    });
    }
};

export const deleteIOC = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedIOC = await IOC.findByIdAndDelete(id);

    if (!deletedIOC) {
      return res.status(404).json({
        message: "IOC not found",
      });
    }

    return res.status(200).json({
      message: "IOC deleted successfully",
      ioc: deletedIOC,
    });
  } catch (error) {
    console.error("Failed to delete IOC:", error);

    return res.status(500).json({
      message: "System error",
    });
  }
};