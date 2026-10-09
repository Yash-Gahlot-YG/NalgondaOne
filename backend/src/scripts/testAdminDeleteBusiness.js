require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Business = require("../models/Business");
const jwt = require("jsonwebtoken");
const express = require("express");
const adminRoutes = require("../routes/adminRoutes");
const businessRoutes = require("../routes/businessRoutes");
const authRoutes = require("../routes/authRoutes");

async function runAdminDeleteTests() {
  console.log("=================================================");
  console.log("STARTING ADMIN DELETE BUSINESS INTEGRATION TESTS");
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

  const testOwnerEmail = `bizowner_${Date.now()}@example.com`;
  const testAdminEmail = `admin_${Date.now()}@example.com`;
  const testPassword = "Password123!";

  let ownerToken = "";
  let adminToken = "";
  let testBusinessId = "";

  try {
    // 1. Create a business owner user
    console.log("\n[Step 1] Create Test Business Owner User");
    const owner = new User({
      name: "Business Owner",
      email: testOwnerEmail,
      passwordHash: testPassword,
      role: "business_owner",
    });
    await owner.save();
    ownerToken = jwt.sign(
      { id: owner._id, email: owner.email, role: owner.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    assert("Business Owner user created and JWT generated", !!ownerToken);

    // 2. Create an admin user
    console.log("\n[Step 2] Create Test Admin User");
    const admin = new User({
      name: "Admin User",
      email: testAdminEmail,
      passwordHash: testPassword,
      role: "admin",
    });
    await admin.save();
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    assert("Admin user created and JWT generated", !!adminToken);

    // 3. Create a test business
    console.log("\n[Step 3] Submit new business");
    const createBizRes = await fetch(`${BASE_URL}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: "Test Published Store",
        category: "Retail",
        description: "A business to test admin deletion.",
        services: ["Retail Sales", "Home Delivery"],
        address: "Clock Tower",
        locality: "Center",
        city: "Nalgonda",
        phone: "9876543210",
        openingTime: "09:00 AM",
        closingTime: "09:00 PM",
      }),
    });
    const createBizData = await createBizRes.json();
    testBusinessId = createBizData.data?._id;
    assert("Business created with status pending", createBizRes.status === 201 && !!testBusinessId);

    // 4. Test security: Unauthenticated DELETE request
    console.log("\n[Step 4] Unauthenticated DELETE /api/admin/businesses/:id");
    const unauthDeleteRes = await fetch(`${BASE_URL}/api/admin/businesses/${testBusinessId}`, {
      method: "DELETE",
    });
    assert("Unauthenticated DELETE returns 401", unauthDeleteRes.status === 401);

    // 5. Test security: Normal user DELETE request
    console.log("\n[Step 5] Normal User DELETE /api/admin/businesses/:id");
    const userDeleteRes = await fetch(`${BASE_URL}/api/admin/businesses/${testBusinessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert("Normal user DELETE returns 403 Forbidden", userDeleteRes.status === 403);

    // 6. Admin approves the business
    console.log("\n[Step 6] Admin approves the business");
    const approveRes = await fetch(`${BASE_URL}/api/admin/businesses/${testBusinessId}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ adminNotes: "Approved for listing" }),
    });
    const approveData = await approveRes.json();
    assert("Admin approval returns 200", approveRes.status === 200);
    assert("Business status is 'approved' and verified is true", approveData.data?.status === "approved" && approveData.data?.verified === true);

    // 7. Verify business appears in public listings
    console.log("\n[Step 7] Verify public listing and public details");
    const publicListRes = await fetch(`${BASE_URL}/api/businesses/approved`);
    const publicListData = await publicListRes.json();
    const isListed = publicListData.data?.some((b) => b._id === testBusinessId);
    assert("Approved business appears in GET /api/businesses/approved", isListed);

    const publicDetailRes = await fetch(`${BASE_URL}/api/businesses/${testBusinessId}`);
    assert("Approved business details accessible at GET /api/businesses/:id (200)", publicDetailRes.status === 200);

    // 8. Admin deletes the published business
    console.log("\n[Step 8] Admin DELETE /api/admin/businesses/:id for published business");
    const adminDeleteRes = await fetch(`${BASE_URL}/api/admin/businesses/${testBusinessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminDeleteData = await adminDeleteRes.json();
    assert("Admin DELETE returns 200 OK", adminDeleteRes.status === 200);
    assert("Delete response has success: true", adminDeleteData.success === true);

    // 9. Verify business is gone from public listings and public detail returns 404
    console.log("\n[Step 9] Verify business removed from public endpoints");
    const publicListAfterRes = await fetch(`${BASE_URL}/api/businesses/approved`);
    const publicListAfterData = await publicListAfterRes.json();
    const isStillListed = publicListAfterData.data?.some((b) => b._id === testBusinessId);
    assert("Deleted business no longer in GET /api/businesses/approved", !isStillListed);

    const publicDetailAfterRes = await fetch(`${BASE_URL}/api/businesses/${testBusinessId}`);
    assert("Public business details returns 404 after deletion", publicDetailAfterRes.status === 404);

    // 10. Verify admin detail endpoint returns 404
    console.log("\n[Step 10] Verify admin detail returns 404");
    const adminDetailAfterRes = await fetch(`${BASE_URL}/api/admin/businesses/${testBusinessId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert("Admin GET /api/admin/businesses/:id returns 404", adminDetailAfterRes.status === 404);

    // 11. Verify business owner user account still exists and can login
    console.log("\n[Step 11] Verify Business Owner User account is intact");
    const ownerInDb = await User.findOne({ email: testOwnerEmail });
    assert("Business owner User account was NOT deleted", !!ownerInDb);

    const ownerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testOwnerEmail, password: testPassword }),
    });
    assert("Business owner can still log in successfully (200)", ownerLoginRes.status === 200);

  } finally {
    // Cleanup
    if (testBusinessId) {
      await Business.deleteOne({ _id: testBusinessId });
    }
    await User.deleteOne({ email: testOwnerEmail });
    await User.deleteOne({ email: testAdminEmail });
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

runAdminDeleteTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
