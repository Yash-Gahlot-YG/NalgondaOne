require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Business = require("../models/Business");
const jwt = require("jsonwebtoken");
const express = require("express");
const adminRoutes = require("../routes/adminRoutes");
const businessRoutes = require("../routes/businessRoutes");
const authRoutes = require("../routes/authRoutes");

async function runBusinessOwnerTests() {
  console.log("=================================================");
  console.log("STARTING BUSINESS OWNER DASHBOARD INTEGRATION TESTS");
  console.log("=================================================\n");

  const results = [];
  function assert(name, condition, details = "") {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      results.push({ name, pass: true });
    } else {
      console.error(`❌ FAIL: ${name} ${details ? `(${details})` : ""}`);
      results.push({ name, pass: false, details });
    }
  }

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Spin up temporary Express app for isolated deterministic testing
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/businesses", businessRoutes);
  app.use("/api/admin", adminRoutes);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const BASE_URL = `http://localhost:${port}`;
  console.log(`Test server running on port ${port}`);

  const userAEmail = `user_a_${Date.now()}@example.com`;
  const userBEmail = `user_b_${Date.now()}@example.com`;
  const adminEmail = `admin_test_${Date.now()}@example.com`;
  const password = "Password123!";

  let userAToken = "";
  let userBToken = "";
  let adminToken = "";
  let userAId = "";
  let userBId = "";
  let businessAId = "";
  let businessBId = "";

  try {
    // 1. Create User A & User B & Admin
    console.log("\n[Step 1] Register User A, User B, and Admin");
    const regResA = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User A", email: userAEmail, password }),
    });
    const regDataA = await regResA.json();
    userAToken = regDataA.data?.token;
    userAId = regDataA.data?.user?.id;
    assert("User A registered and authenticated", regResA.status === 201 && !!userAToken);

    const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User B", email: userBEmail, password }),
    });
    const regDataB = await regResB.json();
    userBToken = regDataB.data?.token;
    userBId = regDataB.data?.user?.id;
    assert("User B registered and authenticated", regResB.status === 201 && !!userBToken);

    const admin = new User({
      name: "Admin Tester",
      email: adminEmail,
      passwordHash: password,
      role: "admin",
    });
    await admin.save();
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    assert("Admin user created", !!adminToken);

    // 2. User A creates Business A
    console.log("\n[Step 2] User A creates Business A");
    const createBizARes = await fetch(`${BASE_URL}/api/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        businessName: "User A Bakery",
        category: "Food",
        description: "Fresh bakery items",
        services: ["Custom Cakes", "Pastries"],
        address: "Clock Tower Road",
        locality: "Center",
        city: "Nalgonda",
        phone: "9111111111",
      }),
    });
    const createBizAData = await createBizARes.json();
    businessAId = createBizAData.data?._id;
    assert("Business A created", createBizARes.status === 201 && !!businessAId);
    assert("Business A has owner = User A", createBizAData.data?.owner?.toString() === userAId);

    // 3. User B creates Business B
    console.log("\n[Step 3] User B creates Business B");
    const createBizBRes = await fetch(`${BASE_URL}/api/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({
        businessName: "User B Electronics",
        category: "Electronics",
        description: "Gadgets and repairs",
        services: ["Phone Repair", "Laptop Repair"],
        address: "RTC Colony",
        locality: "North",
        city: "Nalgonda",
        phone: "9222222222",
      }),
    });
    const createBizBData = await createBizBRes.json();
    businessBId = createBizBData.data?._id;
    assert("Business B created", createBizBRes.status === 201 && !!businessBId);
    assert("Business B has owner = User B", createBizBData.data?.owner?.toString() === userBId);

    // 4. Test Owner Isolation on GET /api/businesses/my-businesses
    console.log("\n[Step 4] Test Owner Isolation on GET /api/businesses/my-businesses");
    const myBizARes = await fetch(`${BASE_URL}/api/businesses/my-businesses`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const myBizAData = await myBizARes.json();
    assert("User A fetches my-businesses with 200", myBizARes.status === 200);
    assert("User A sees Business A in list", myBizAData.data?.some((b) => b._id === businessAId));
    assert("User A DOES NOT see Business B in list", !myBizAData.data?.some((b) => b._id === businessBId));

    const myBizBRes = await fetch(`${BASE_URL}/api/businesses/my-businesses`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const myBizBData = await myBizBRes.json();
    assert("User B fetches my-businesses with 200", myBizBRes.status === 200);
    assert("User B sees Business B in list", myBizBData.data?.some((b) => b._id === businessBId));
    assert("User B DOES NOT see Business A in list", !myBizBData.data?.some((b) => b._id === businessAId));

    // 5. Test Unauthenticated Access to /api/businesses/my-businesses
    console.log("\n[Step 5] Unauthenticated GET /api/businesses/my-businesses");
    const unauthMyBizRes = await fetch(`${BASE_URL}/api/businesses/my-businesses`);
    assert("Unauthenticated request to /my-businesses returns 401", unauthMyBizRes.status === 401);

    // 6. Test Ownership on GET /api/businesses/my-businesses/:id
    console.log("\n[Step 6] Test GET /api/businesses/my-businesses/:id");
    const getBizAByOwnerRes = await fetch(`${BASE_URL}/api/businesses/my-businesses/${businessAId}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert("User A can access own Business A details (200)", getBizAByOwnerRes.status === 200);

    const getBizAByOtherUserRes = await fetch(`${BASE_URL}/api/businesses/my-businesses/${businessAId}`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    assert("User B accessing Business A details returns 403 Forbidden", getBizAByOtherUserRes.status === 403);

    // 7. Test Cross-User Editing Protection (User B tries to edit User A's business)
    console.log("\n[Step 7] Test Cross-User Editing Protection on PUT /my-businesses/:id");
    const unauthorizedEditRes = await fetch(`${BASE_URL}/api/businesses/my-businesses/${businessAId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ businessName: "Hacked Business Name" }),
    });
    assert("User B editing Business A returns 403 Forbidden", unauthorizedEditRes.status === 403);

    // 8. Test Admin Field Tampering Protection
    console.log("\n[Step 8] Test Admin-controlled field tampering protection");
    const tamperRes = await fetch(`${BASE_URL}/api/businesses/my-businesses/${businessAId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        businessName: "User A Updated Bakery",
        description: "Updated description",
        status: "approved", // Malicious attempt to self-approve!
        verified: true,     // Malicious attempt to self-verify!
        adminNotes: "Self Approved",
        owner: userBId,     // Malicious attempt to reassign owner!
      }),
    });
    const tamperData = await tamperRes.json();
    assert("Update response returns 200", tamperRes.status === 200);
    assert("Self-approval was blocked: status is 'pending'", tamperData.data?.status === "pending");
    assert("Self-verification was blocked: verified is false", tamperData.data?.verified === false);
    assert("Owner reassignment was blocked: owner is still User A", tamperData.data?.owner?.toString() === userAId);

    // 9. Test Safe Re-verification Workflow
    console.log("\n[Step 9] Test Safe Re-verification Workflow");
    // Admin approves Business A
    const approveRes = await fetch(`${BASE_URL}/api/admin/businesses/${businessAId}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ adminNotes: "Verified store location" }),
    });
    assert("Admin approves Business A (200)", approveRes.status === 200);

    // Verify it is publicly listed
    const pubList1 = await fetch(`${BASE_URL}/api/businesses/approved`);
    const pubList1Data = await pubList1.json();
    assert("Business A is in public approved list", pubList1Data.data?.some((b) => b._id === businessAId));

    // Owner edits Business A
    const editApprovedBizRes = await fetch(`${BASE_URL}/api/businesses/my-businesses/${businessAId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        phone: "9999999999",
      }),
    });
    const editApprovedBizData = await editApprovedBizRes.json();
    assert("Owner edit of approved business returns 200", editApprovedBizRes.status === 200);
    assert("Status automatically reset to 'pending'", editApprovedBizData.data?.status === "pending");
    assert("Verified state automatically reset to false", editApprovedBizData.data?.verified === false);

    // Verify it is no longer publicly listed until re-verified
    const pubList2 = await fetch(`${BASE_URL}/api/businesses/approved`);
    const pubList2Data = await pubList2.json();
    assert("Edited business is safely hidden from public listing until re-approved", !pubList2Data.data?.some((b) => b._id === businessAId));

    // 10. Test Public Browsing Without Auth
    console.log("\n[Step 10] Test Public Browsing");
    const publicExploreRes = await fetch(`${BASE_URL}/api/businesses/approved`);
    assert("Public /api/businesses/approved returns 200 without token", publicExploreRes.status === 200);

  } finally {
    // Cleanup
    if (businessAId) await Business.deleteOne({ _id: businessAId });
    if (businessBId) await Business.deleteOne({ _id: businessBId });
    await User.deleteOne({ email: userAEmail });
    await User.deleteOne({ email: userBEmail });
    await User.deleteOne({ email: adminEmail });
    server.close();
    await mongoose.disconnect();
    console.log("\nCleanup completed and database disconnected.");
  }

  console.log("\n=================================================");
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=================================================");
  if (failed > 0) process.exit(1);
}

runBusinessOwnerTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
