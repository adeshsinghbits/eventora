import cron from "node-cron";
import Event from "../models/Event.js";

const startEventStatusUpdater = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("🕒 Running event status updater...");

    const now = new Date();

    try {
      // 1. Upcoming → Ongoing
      const ongoing = await Event.updateMany(
        {
          startDate: { $lte: now },
          endDate: { $gte: now },
          status: "published",
          isDeleted: false,
        },
        { $set: { status: "ongoing" } }
      );

      // 2. Ongoing → Completed
      const completed = await Event.updateMany(
        {
          endDate: { $lt: now },
          status: { $in: ["published", "ongoing"] },
          isDeleted: false,
        },
        { $set: { status: "completed" } }
      );

      console.log(`✅ Updated: ongoing=${ongoing.modifiedCount}, completed=${completed.modifiedCount}`);
    } catch (error) {
      console.error("❌ Cron Error:", error.message);
    }
  });
};

export default startEventStatusUpdater;