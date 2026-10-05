import dotenv from "dotenv";
dotenv.config();

import prisma from "../api/config/database";
import { hashPassword } from "../api/src/utils/password";
import { loginUser, refreshSession, logoutSession, unlockUser } from "../api/src/modules/auth/auth.service";
import { requestPasswordReset, completePasswordReset } from "../api/src/modules/auth/password-reset.service";
import { HttpError } from "../api/src/utils/http-error";

// Mock Express Request
const mockReq = (ip = "127.0.0.1", userAgent = "TestAgent/1.0") =>
  ({
    headers: { "user-agent": userAgent },
    socket: { remoteAddress: ip },
    ip,
  } as any);

async function runAuthAuditSuite() {
  console.log("=======================================================");
  console.log("LABCORE ELIS OS — AUTH & SECURITY AUDIT TEST SUITE");
  console.log("=======================================================\n");

  const testEmail = "audit.operator@labcore.local";
  const testEmpCode = "AUDIT_OP_001";
  const initialPassword = "StrongPassword#2026!";
  const newPassword = "NewStrongPassword#2026!";

  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? `: ${detail}` : ""}`);
      failCount++;
    }
  }

  try {
    // 0. Clean up pre-existing test data
    console.log("0. Cleaning up prior test state...");
    await prisma.user.deleteMany({
      where: { OR: [{ email: testEmail }, { employeeCode: testEmpCode }] },
    });

    // 1. Seed test user
    console.log("\n1. Seeding test operator user...");
    const passwordHash = await hashPassword(initialPassword);
    const testUser = await prisma.user.create({
      data: {
        employeeCode: testEmpCode,
        fullName: "Audit Operator",
        email: testEmail,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
    });
    assert(Boolean(testUser.id), "User created successfully in database");

    // 2. Test: Successful Login with Valid Credentials
    console.log("\n2. Testing: Successful Login with Valid Credentials");
    const validLoginRes = (await loginUser(testEmail, initialPassword, mockReq())) as any;
    assert(Boolean(validLoginRes.accessToken), "Access token generated");
    assert(Boolean(validLoginRes.refreshToken), "Refresh token generated");
    assert(validLoginRes.user?.email === testEmail, "Correct user payload returned");

    // 3. Test: Login with Wrong Password
    console.log("\n3. Testing: Login with Wrong Password");
    try {
      await loginUser(testEmail, "WrongPassword123!", mockReq());
      assert(false, "Should fail on wrong password");
    } catch (err: any) {
      const status = err.statusCode || err.status;
      assert(err instanceof HttpError && status === 401, "Returned 401 Unauthorized");
      assert(err.message.includes("Invalid email"), "Surfaced generic, secure error message");
    }

    // 4. Test: Login with Non-Existent User
    console.log("\n4. Testing: Login with Non-Existent User");
    try {
      await loginUser("nonexistent@labcore.local", initialPassword, mockReq());
      assert(false, "Should fail on non-existent user");
    } catch (err: any) {
      const status = err.statusCode || err.status;
      assert(err instanceof HttpError && status === 401, "Returned 401 Unauthorized for unknown user");
      assert(err.message === "Invalid email, employee code or password", "Generic message masks user existence");
    }

    // 5. Test: Login with Empty Fields
    console.log("\n5. Testing: Login with Empty Fields");
    try {
      await loginUser("", "", mockReq());
      assert(false, "Should fail on empty fields");
    } catch (err: any) {
      const status = err.statusCode || err.status;
      assert(err instanceof HttpError && status === 400, "Returned 400 Bad Request");
    }

    // 6. Test: Account Lockout after 5 Failed Attempts
    console.log("\n6. Testing: Account Lockout Threshold");
    for (let i = 0; i < 4; i++) {
      try {
        await loginUser(testEmail, "WrongPass!", mockReq());
      } catch (e) {
        /* expected failed login */
      }
    }
    // 5th failed attempt should trigger lockout
    try {
      await loginUser(testEmail, "WrongPass!", mockReq());
      assert(false, "5th attempt should throw account lockout error");
    } catch (err: any) {
      const status = err.statusCode || err.status;
      assert(err instanceof HttpError && status === 423, "Returned 423 Locked Status");
      assert(err.code === "ACCOUNT_LOCKED", "Lockout code is ACCOUNT_LOCKED");
    }

    // Verify database state is LOCKED
    const lockedDbUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert(lockedDbUser?.status === "LOCKED", "Database user status set to LOCKED");

    // 7. Test: Unlock Account
    console.log("\n7. Testing: Admin Account Unlock");
    await unlockUser(testUser.id);
    const unlockedDbUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert(unlockedDbUser?.status === "ACTIVE", "User status restored to ACTIVE");

    // 8. Test: Session Refresh
    console.log("\n8. Testing: Session Refresh");
    const freshLogin = (await loginUser(testEmail, initialPassword, mockReq())) as any;
    const refreshed = await refreshSession(freshLogin.refreshToken, mockReq());
    assert(Boolean(refreshed.accessToken), "New access token issued via refresh token");
    assert(refreshed.refreshToken !== freshLogin.refreshToken, "Refresh token rotated");

    // 9. Test: Password Reset (Forgot Password OTP Flow)
    console.log("\n9. Testing: Password Reset Full OTP Flow");
    const reqResetRes = await requestPasswordReset(testEmail, mockReq());
    assert(
      reqResetRes.message === "If an account exists for that address, a reset code has been sent to it.",
      "Generic neutral message returned on forgot password request"
    );

    // Retrieve active OTP from DB for testing
    const tokenRow = await prisma.emailVerificationToken.findFirst({
      where: { userId: testUser.id, purpose: "PASSWORD_RESET", consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    assert(Boolean(tokenRow), "6-digit OTP token hashed and stored in database");

    // Test Invalid OTP
    try {
      await completePasswordReset({
        email: testEmail,
        code: "000000",
        newPassword,
        req: mockReq(),
      });
      assert(false, "Should fail with invalid OTP");
    } catch (err: any) {
      const status = err.statusCode || err.status;
      assert(err instanceof HttpError && status === 400, "Invalid OTP returned 400 Bad Request");
    }

    // Test Valid OTP Reset
    const testCode = "654321";
    const { issueEmailCode } = require("../api/src/modules/auth/email-token.service");
    await issueEmailCode({ userId: testUser.id, purpose: "PASSWORD_RESET" });
    
    // Replace latest token with known hash for deterministic test
    const crypto = require("crypto");
    const secret = process.env.EMAIL_CODE_SECRET || process.env.JWT_SECRET;
    const knownHash = crypto.createHmac("sha256", secret).update(testCode).digest("hex");
    
    const latestToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: testUser.id, purpose: "PASSWORD_RESET", consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (latestToken) {
      await prisma.emailVerificationToken.update({
        where: { id: latestToken.id },
        data: { codeHash: knownHash },
      });
    }

    const resetComplete = await completePasswordReset({
      email: testEmail,
      code: testCode,
      newPassword,
      req: mockReq(),
    });
    assert(resetComplete.ok === true, "Password reset completed successfully with valid OTP");

    // 10. Test: Invalidation of Previous Sessions after Reset
    console.log("\n10. Testing: Invalidation of Old Sessions After Password Reset");
    const activeSessions = await prisma.userSession.findMany({
      where: { userId: testUser.id, revokedAt: null },
    });
    assert(activeSessions.length === 0, "All prior user sessions revoked on password reset");

    // 11. Test: Login with New Password
    console.log("\n11. Testing: Login with New Password");
    const newPassLogin = (await loginUser(testEmail, newPassword, mockReq())) as any;
    assert(Boolean(newPassLogin.accessToken), "Logged in successfully with new password");

    // 12. Test: Logout
    console.log("\n12. Testing: Logout Flow");
    await logoutSession(newPassLogin.sessionId, testUser.id);
    const loggedOutSession = await prisma.userSession.findUnique({
      where: { id: newPassLogin.sessionId },
    });
    assert(Boolean(loggedOutSession?.revokedAt), "User session marked as revoked in DB");

    // Clean up test user
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log("\nCleaned up test user.");

  } catch (error) {
    console.error("\n❌ Test suite failure:", error);
    failCount++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n=======================================================");
  console.log(`SUMMARY: ${passCount} Passed, ${failCount} Failed`);
  console.log("=======================================================\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

runAuthAuditSuite();
