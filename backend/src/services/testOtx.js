import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const testOTX = async () => {
  try {
    const response = await axios.get(
      "https://otx.alienvault.com/api/v1/pulses/subscribed",
      {
        headers: {
          "X-OTX-API-KEY": process.env.OTX_API_KEY,
        },
        params: {
          limit: 5,
          page: 1,
        },
        timeout: 15000,
      }
    );

    console.log("OTX API works!");

    console.log(
      JSON.stringify(response.data, null, 2)
    );
  } catch (error) {
    console.error("OTX API failed:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

testOTX();