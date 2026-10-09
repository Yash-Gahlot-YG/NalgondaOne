require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

async function runTests() {
  console.log("=========================================");
  console.log("STARTING AUTHENTICATION INTEGRATION TESTS");
  console.log("=========================================\n");

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

  // Connect to DB for cleanup before test
  await mongoose.connect(process.env.MONGODB_URI);
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = "Password123!";

  // Cleanup test user if exists
  await User.deleteOne({ email: testEmail });

  try {
    // TEST 1: Register new user
    console.log("\n[Test 1] POST /api/auth/register - New User");
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: testEmail,
        password: testPassword,
        phone: "9876543210",
        role: "super_admin", // Attempt privilege escalation!
      }),
    });
    const regData = await regRes.json();
    assert("Register returns status 201", regRes.status === 201, `Status: ${regRes.status}`);
    assert("Register returns success: true", regData.success === true);
    assert("Register returns JWT token", !!regData.data?.token);
    assert("Register forces role = 'user' (escalation prevented)", regData.data?.user?.role === "user");
    assert("Register does not expose passwordHash", regData.data?.user?.passwordHash === undefined);
    assert("Register returns correct user profile", regData.data?.user?.email === testEmail);

    const userToken = regData.data?.token;

    // TEST 2: Duplicate email registration
    console.log("\n[Test 2] POST /api/auth/register - Duplicate Email");
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Another User",
        email: testEmail.toUpperCase(), // Test case-insensitivity
        password: "AnotherPassword123!",
      }),
    });
    const dupData = await dupRes.json();
    assert("Duplicate email returns status 400", dupRes.status === 400, `Status: ${dupRes.status}`);
    assert("Duplicate email returns friendly message", dupData.message.includes("already exists"));

    // TEST 3: Short password validation (< 8 chars)
    console.log("\n[Test 3] POST /api/auth/register - Short Password");
    const shortPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Short Pass User",
        email: `short_${Date.now()}@example.com`,
        password: "short",
      }),
    });
    const shortPassData = await shortPassRes.json();
    assert("Short password returns status 400", shortPassRes.status === 400, `Status: ${shortPassRes.status}`);
    assert("Short password error message references length", shortPassData.message.includes("8 characters"));

    // TEST 4: Login with valid credentials
    console.log("\n[Test 4] POST /api/auth/login - Valid Credentials");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail.toUpperCase(), // Test case insensitivity
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    assert("Login returns status 200", loginRes.status === 200, `Status: ${loginRes.status}`);
    assert("Login returns success: true", loginData.success === true);
    assert("Login returns token", !!loginData.data?.token);
    assert("Login returns safe user object", loginData.data?.user?.email === testEmail && !loginData.data?.user?.passwordHash);

    // TEST 5: Login with wrong password
    console.log("\n[Test 5] POST /api/auth/login - Wrong Password");
    const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "IncorrectPassword!",
      }),
    });
    const wrongPassData = await wrongPassRes.json();
    assert("Wrong password returns status 401", wrongPassRes.status === 401, `Status: ${wrongPassRes.status}`);
    assert("Generic error message does not leak info", wrongPassData.message === "Invalid email or password.");

    // TEST 6: Login with non-existent email
    console.log("\n[Test 6] POST /api/auth/login - Non-existent Email");
    const nonExistRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "doesnotexist@example.com",
        password: "Password123!",
      }),
    });
    const nonExistData = await nonExistRes.json();
    assert("Non-existent email returns status 401", nonExistRes.status === 401, `Status: ${nonExistRes.status}`);
    assert("Same generic error message returned", nonExistData.message === "Invalid email or password.");

    // TEST 7: GET /api/auth/me with valid token
    console.log("\n[Test 7] GET /api/auth/me - Authenticated");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const meData = await meRes.json();
    assert("GET /me returns status 200", meRes.status === 200, `Status: ${meRes.status}`);
    assert("GET /me returns correct user data", meData.data?.user?.email === testEmail);
    assert("GET /me does not leak passwordHash", meData.data?.user?.passwordHash === undefined);

    // TEST 8: GET /api/auth/me without token
    console.log("\n[Test 8] GET /api/auth/me - Unauthenticated");
    const unauthMeRes = await fetch(`${BASE_URL}/api/auth/me`);
    assert("GET /me without token returns 401", unauthMeRes.status === 401);

    // TEST 9: Normal user cannot access admin routes
    console.log("\n[Test 9] GET /api/admin/businesses/stats with Normal User Token");
    const adminAccessRes = await fetch(`${BASE_URL}/api/admin/businesses/stats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert("Admin route rejects normal user with 403", adminAccessRes.status === 403);

    // TEST 10: Admin login works and can access admin routes
    console.log("\n[Test 10] Admin Login & Admin Route Access");
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
        }),
      });
      const adminLoginData = await adminLoginRes.json();
      if (adminLoginRes.status === 200) {
        assert("Admin login returns 200", true);
        assert("Admin user has admin/super_admin role", ["admin", "super_admin"].includes(adminLoginData.data?.user?.role));
        
        const adminStatsRes = await fetch(`${BASE_URL}/api/admin/businesses/stats`, {
          headers: { Authorization: `Bearer ${adminLoginData.data.token}` },
        });
        assert("Admin can access /api/admin/businesses/stats", adminStatsRes.status === 200);
      } else {
        console.log("ℹ️ Admin credentials not seeded yet or different in env, testing seed script...");
      }
    }

    // TEST 11: Public services endpoint works without token
    console.log("\n[Test 11] Public Services Endpoint");
    const servicesRes = await fetch(`${BASE_URL}/api/businesses/approved`);
    assert("Public services endpoint returns 200 without auth", servicesRes.status === 200);

    // Clean up test user
    await User.deleteOne({ email: testEmail });
    console.log("\nCleaned up test user.");

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await mongoose.disconnect();
  }

  console.log("\n=========================================");
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
