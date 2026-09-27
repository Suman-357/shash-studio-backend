const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = require("../config/env");
const Workshop = require("../models/Workshop");
const Admin = require("../models/Admin");
const Batch = require("../models/Batch");
const Registration = require("../models/Registration");
const Inquiry = require("../models/Inquiry");
const { workshops, adminUser } = require("./seedData");

mongoose.connect(env.MONGODB_URI);

const importData = async () => {
  try {
    await Workshop.deleteMany();
    await Admin.deleteMany();
    await Batch.deleteMany();

    const createdWorkshops = await Workshop.insertMany(workshops);
    await Admin.create(adminUser);

    // Seed initial batches linked to workshops
    const primaryWorkshop = createdWorkshops[0]; // 21-Day Holistic
    if (primaryWorkshop) {
      await Batch.insertMany([
        {
          workshopId: primaryWorkshop._id,
          batchCode: "AUG-2026-MORN1",
          title: "Morning Rising Batch 1",
          titleKn: "ಬೆಳಗಿನ ಮೊದಲ ಬ್ಯಾಚ್",
          slotTime: "5:30 AM – 6:30 AM IST",
          startDate: new Date("2026-08-01"),
          endDate: new Date("2026-08-21"),
          capacity: 20,
          instructorName: "Sushii",
          zoomLink: "https://zoom.us/j/shash-live-morn1",
          status: "active"
        },
        {
          workshopId: primaryWorkshop._id,
          batchCode: "AUG-2026-MORN2",
          title: "Morning Rising Batch 2",
          titleKn: "ಬೆಳಗಿನ ಎರಡನೇ ಬ್ಯಾಚ್",
          slotTime: "6:30 AM – 7:30 AM IST",
          startDate: new Date("2026-08-01"),
          endDate: new Date("2026-08-21"),
          capacity: 20,
          instructorName: "Sushii & Team",
          zoomLink: "https://zoom.us/j/shash-live-morn2",
          status: "active"
        }
      ]);
    }

    console.log("🌿 SHASH Studios Database Seeded Successfully (Workshops, Batches, Admin)!");
    process.exit();
  } catch (err) {
    console.error(`❌ Error importing data: ${err.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Workshop.deleteMany();
    await Admin.deleteMany();
    await Registration.deleteMany();
    await Inquiry.deleteMany();

    console.log("🛑 All Database Collections Destroyed!");
    process.exit();
  } catch (err) {
    console.error(`❌ Error destroying data: ${err.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
