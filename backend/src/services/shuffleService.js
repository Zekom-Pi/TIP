import axios from "axios";

export const sendIOCsToShuffle = async (iocs) => {
  if (process.env.SHUFFLE_ENABLED !== "true") {
    return {
      success: false,
      message: "Shuffle đã vô hiệu hóa",
    };
  }

  if (!process.env.SHUFFLE_WEBHOOK_URL) {
    throw new Error("SHUFFLE_WEBHOOK_URL chưa được thiết lập");
  }

  if (!process.env.SHUFFLE_WEBHOOK_SECRET) {
    throw new Error("SHUFFLE_WEBHOOK_SECRET chưa được thiết lập");
  }

  const payload = {
    source: "Threat Intelligence Platform",
    timestamp: new Date().toISOString(),
    count: iocs.length,

    iocs: iocs.map((ioc) => ({
      id: ioc._id,
      type: ioc.type,
      value: ioc.value,
      severity: ioc.severity,
      description: ioc.description,
      firstSeen: ioc.firstSeen,
      lastSeen: ioc.lastSeen,
    })),
  };

  const response = await axios.post(
    process.env.SHUFFLE_WEBHOOK_URL,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        "X-TIP-API-Key": process.env.SHUFFLE_WEBHOOK_SECRET,
      },
      timeout: 15000,
    }
  );

  return {
    success: true,
    sent: iocs.length,
    shuffleResponse: response.data,
  };
};