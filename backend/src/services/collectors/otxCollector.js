import axios from "axios";
/**
 * @param {Object} source 
 * @returns {Array} 
 */
export const collectFromOTX = async (source) => {
  try {
    const response = await axios.get(
      "https://otx.alienvault.com/api/v1/pulses/subscribed",
      {
        headers: {
          "X-OTX-API-KEY": process.env.OTX_API_KEY,
        },

        params: {
          limit: 5, //5 pulses mỗi lần
          page: 1,
        },
        timeout: 15000, //15s
      }
    );

    const pulses = response.data?.results;

    if (!Array.isArray(pulses)) {
      throw new Error(
        "Invalid OTX response: results is not an array"
      );
    }

    const normalizedIOCs = [];

    // Duyệt lần lượt pulse 
    for (const pulse of pulses) {
      const indicators = pulse.indicators; // lấy mảng indicator

      if (!Array.isArray(indicators)) {
        continue;
      }

      for (const indicator of indicators) {
        const normalized = normalizeOTXIndicator( indicator, pulse, source);

        // Chỉ lấy những IOC mà hệ thống hỗ trợ
        if (normalized) {
          normalizedIOCs.push(normalized);
        }
      }
    }

    return normalizedIOCs;
  } catch (error) {
    console.error(
      "Failed to collect IOC from AlienVault OTX:",
      error.response?.data || error.message
    );

    throw error;
  }
};


 //Chuyển Indicator của OTX thành format IOC của hệ thống
 
const normalizeOTXIndicator = ( indicator, pulse, source ) => {
  const type = mapOTXType(indicator.type);

  // Bỏ qua những loại IOC mà hệ thống chưa hỗ trợ
  if (!type) {
    return null;
  }

  if (!indicator.indicator) {
    return null; //khong có gia trị
  }

  return {
    type,
    value: indicator.indicator,
    description:
      indicator.description || pulse.description || pulse.name || "",
    severity: "medium",
    source: source._id,
    firstSeen: indicator.created ? new Date(indicator.created) : new Date(),
    lastSeen: new Date(),
  };
};


//Chuyển loại Indicator của OTX sang loại IOC mà hệ thống sử dụng
const mapOTXType = (otxType) => {
  switch (otxType) {
    // IP
    case "IPv4":
    case "IPv6":
      return "IP";

    // Domain
    case "domain":
    case "hostname":
      return "DOMAIN";

    // URL
    case "URL":
    case "url":
      return "URL";

    // Hash
    case "FileHash-MD5":
    case "FileHash-SHA1":
    case "FileHash-SHA256":
      return "HASH";

    default:
      return null;
  }
};