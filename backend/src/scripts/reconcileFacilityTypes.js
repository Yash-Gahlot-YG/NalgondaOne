const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Business = require("../models/Business");

async function fixFacilityTypes() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Government hospitals & health centres
  const govRes = await Business.updateMany(
    {
      $or: [
        { businessName: /Government General Hospital/i },
        { businessName: /Mother & Child Hospital/i },
        { businessName: /Area Hospital/i },
        { businessName: /Urban Primary Health/i },
        { businessName: /DM&HO/i },
      ],
    },
    { $set: { facilityType: "government_hospital" } }
  );

  // Diagnostic centres
  const diagRes = await Business.updateMany(
    { category: "Diagnostic Center" },
    { $set: { facilityType: "diagnostic_center" } }
  );

  // Polyclinics / private clinics
  const clinicRes = await Business.updateMany(
    { businessName: /Patnam Doctor/i },
    { $set: { facilityType: "private_clinic" } }
  );

  console.log(`Reconciled: Gov facilities: ${govRes.modifiedCount}, Diagnostic: ${diagRes.modifiedCount}, Clinics: ${clinicRes.modifiedCount}`);
  await mongoose.disconnect();
}

fixFacilityTypes();
