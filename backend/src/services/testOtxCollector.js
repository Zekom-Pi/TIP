import dotenv from "dotenv";
import { collectFromOTX } from "./collectors/otxCollector.js";

dotenv.config();

const source = { _id: "000000000000000000000001", name: "AlienVault OTX" };

const test = async () => {
  try {
    const iocs = await collectFromOTX(source);

    console.log(
      `OTX returned ${iocs.length} normalized IOC(s)`
    );

    console.log(
      JSON.stringify(iocs.slice(0, 10), null, 2)
    );
  } catch (error) {
    console.error(
      "OTX collector test failed:",
      error.message
    );
  }
};

test();