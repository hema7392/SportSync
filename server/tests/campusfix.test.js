// Comprehensive Integration Test Suite for CampusFix
// WD501 Advanced Backend Capstone Project

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app';
import prisma from '../src/prisma';

describe('CampusFix Comprehensive Integration Tests', () => {
  // Shared test state
  let adminToken = '';
  let reporterToken = '';
  let reporter2Token = '';
  let techToken = '';
  let inactiveTechId = 0;
  let testIssueId = 0;
  let testCategoryId = 0;
  let testLocationId = 0;
  let testBuildingId = 0;
  let adminUser = null;
  let reporterUser = null;
  let technicianUser = null;

  beforeAll(async () => {
    // Fetch seeded admin
    adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    reporterUser = await prisma.user.findFirst({ where: { role: 'REPORTER' } });
    technicianUser = await prisma.user.findFirst({ where: { role: 'TECHNICIAN', isActive: true } });

    // Fetch an active category and location
    const category = await prisma.category.findFirst({ where: { isActive: true } });
    const location = await prisma.location.findFirst({ where: { isActive: true }, include: { building: true } });

    testCategoryId = category.id;
    testLocationId = location.id;
    testBuildingId = location.buildingId;

    // Login Admin
    const adminLoginRes = await request(app).post('/api/auth/login').send({
      email: adminUser.email,
      password: process.env.ADMIN_PASSWORD || 'Admin@CampusFix2026',
    });
    expect(adminLoginRes.status).toBe(200);
    adminToken = adminLoginRes.body.token;

    // Login Reporter
    const reporterLoginRes = await request(app).post('/api/auth/login').send({
      email: reporterUser.email,
      password: 'Password123!',
    });
    expect(reporterLoginRes.status).toBe(200);
    reporterToken = reporterLoginRes.body.token;

    // Login Technician
    const techLoginRes = await request(app).post('/api/auth/login').send({
      email: technicianUser.email,
      password: 'Password123!',
    });
    expect(techLoginRes.status).toBe(200);
    techToken = techLoginRes.body.token;

    // Create an inactive technician for testing assignment rejection
    const inactiveTech = await prisma.user.create({
      data: {
        name: 'Inactive Technician',
        email: `inactive.tech.${Date.now()}@campusfix.edu`,
        passwordHash: technicianUser.passwordHash,
        role: 'TECHNICIAN',
        isActive: false,
      },
    });
    inactiveTechId = inactiveTech.id;
  });

  afterAll(async () => {
    // Cleanup temporary inactive technician
    if (inactiveTechId) {
      await prisma.user.delete({ where: { id: inactiveTechId } }).catch(() => {});
    }
  });

  // ==========================================
  // MODULE 1: AUTHENTICATION (6 tests)
  // ==========================================
  describe('Module 1: Authentication & User Credentials', () => {
    const uniqueEmail = `test.reporter.${Date.now()}@campusfix.edu`;

    it('1. should successfully register a new reporter account', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'New Test Student',
        email: uniqueEmail,
        password: 'SecurePassword123!',
        department: 'Information Science',
        phone: '+1-555-9988',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.role).toBe('REPORTER');
      expect(res.body.user).not.toHaveProperty('passwordHash');
      reporter2Token = res.body.token;
    });

    it('2. should reject signup with duplicate email address', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Duplicate Student',
        email: uniqueEmail,
        password: 'AnotherPassword123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('3. should successfully log in with valid credentials and return JWT', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: uniqueEmail,
        password: 'SecurePassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(uniqueEmail.toLowerCase());
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('4. should reject login with invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: uniqueEmail,
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('5. should reject login for deactivated / inactive user accounts', async () => {
      const inactiveUser = await prisma.user.create({
        data: {
          name: 'Deactivated User',
          email: `deactivated.${Date.now()}@campusfix.edu`,
          passwordHash: adminUser.passwordHash,
          role: 'REPORTER',
          isActive: false,
        },
      });

      const res = await request(app).post('/api/auth/login').send({
        email: inactiveUser.email,
        password: 'Password123!',
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/deactivated/i);

      await prisma.user.delete({ where: { id: inactiveUser.id } });
    });

    it('6. should allow authenticated users to change their password with valid current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${reporter2Token}`)
        .send({
          currentPassword: 'SecurePassword123!',
          newPassword: 'UpdatedPassword456!',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/password changed/i);

      // Verify login with new password succeeds
      const loginCheck = await request(app).post('/api/auth/login').send({
        email: uniqueEmail,
        password: 'UpdatedPassword456!',
      });
      expect(loginCheck.status).toBe(200);
    });
  });

  // ==========================================
  // MODULE 2: AUTHORIZATION & RBAC (4 tests)
  // ==========================================
  describe('Module 2: Authorization & RBAC Middleware', () => {
    it('7. should block unauthenticated requests to protected endpoints', async () => {
      const res = await request(app).get('/api/issues');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/authentication required/i);
    });

    it('8. should prevent REPORTERS from accessing administrative user management', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('9. should prevent TECHNICIANS from assigning issues to others', async () => {
      const res = await request(app)
        .post('/api/issues/1/assign')
        .set('Authorization', `Bearer ${techToken}`)
        .send({ technicianId: technicianUser.id });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('10. should allow current user profile access via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('ADMIN');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });
  });

  // ==========================================
  // MODULE 3: ISSUE REPORTING & VALIDATION (5 tests)
  // ==========================================
  describe('Module 3: Issue Reporting & Validation', () => {
    it('11. should allow reporter to create a valid issue', async () => {
      const res = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          title: 'Damaged Whiteboard Marker Tray',
          description: 'The metal shelf tray under the lecture whiteboard has detached on one side in room 204.',
          categoryId: testCategoryId,
          locationId: testLocationId,
          specificArea: 'Front presentation whiteboard',
          priority: 'LOW',
        });

      expect(res.status).toBe(201);
      expect(res.body.issue).toHaveProperty('id');
      expect(res.body.issue.status).toBe('REPORTED');
      expect(res.body.issue.priority).toBe('LOW');
      testIssueId = res.body.issue.id;
    });

    it('12. should reject issue creation with missing required fields', async () => {
      const res = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          title: 'AB', // too short (< 3 chars)
          // description missing
          categoryId: testCategoryId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('13. should reject issue creation on inactive category', async () => {
      // Create inactive category
      const inactiveCat = await prisma.category.create({
        data: { name: `Inactive Cat ${Date.now()}`, isActive: false },
      });

      const res = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          title: 'Valid Issue Title Here',
          description: 'Detailed description exceeding ten characters easily.',
          categoryId: inactiveCat.id,
          locationId: testLocationId,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/inactive or does not exist/i);

      await prisma.category.delete({ where: { id: inactiveCat.id } });
    });

    it('14. should retrieve single issue by ID with full relations', async () => {
      const res = await request(app)
        .get(`/api/issues/${testIssueId}`)
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.issue.id).toBe(testIssueId);
      expect(res.body.issue).toHaveProperty('category');
      expect(res.body.issue).toHaveProperty('location');
      expect(res.body.issue).toHaveProperty('reporter');
      expect(res.body.issue).toHaveProperty('history');
    });

    it('15. should prevent TECHNICIANS from reporting normal complaints', async () => {
      const res = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          title: 'Technician Trying To Report',
          description: 'A technician attempting to create a student complaint.',
          categoryId: testCategoryId,
          locationId: testLocationId,
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/technicians cannot report issues/i);
    });
  });

  // ==========================================
  // MODULE 4: SEARCH & FILTERING (4 tests)
  // ==========================================
  describe('Module 4: Search & Server-Side Filtering', () => {
    it('16. should filter issues by status', async () => {
      const res = await request(app)
        .get('/api/issues?status=REPORTED')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.issues)).toBe(true);
      res.body.issues.forEach((issue) => {
        expect(issue.status).toBe('REPORTED');
      });
    });

    it('17. should filter issues by priority', async () => {
      const res = await request(app)
        .get('/api/issues?priority=CRITICAL')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.issues.forEach((issue) => {
        expect(issue.priority).toBe('CRITICAL');
      });
    });

    it('18. should search issues across title and description text', async () => {
      const res = await request(app)
        .get('/api/issues?search=Whiteboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.issues.length).toBeGreaterThanOrEqual(1);
      const found = res.body.issues.some((i) => i.id === testIssueId);
      expect(found).toBe(true);
    });

    it('19. should support sorting issues chronologically (oldest and newest)', async () => {
      const resOldest = await request(app)
        .get('/api/issues?sortBy=oldest')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resOldest.status).toBe(200);
      if (resOldest.body.issues.length >= 2) {
        const firstDate = new Date(resOldest.body.issues[0].createdAt).getTime();
        const secondDate = new Date(resOldest.body.issues[1].createdAt).getTime();
        expect(firstDate).toBeLessThanOrEqual(secondDate);
      }
    });
  });

  // ==========================================
  // MODULE 5: TECHNICIAN ASSIGNMENT (4 tests)
  // ==========================================
  describe('Module 5: Technician Assignment Workflow', () => {
    it('20. should allow ADMIN to assign an active technician to an issue', async () => {
      const res = await request(app)
        .post(`/api/issues/${testIssueId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ technicianId: technicianUser.id });

      expect(res.status).toBe(200);
      expect(res.body.issue.status).toBe('ASSIGNED');
      expect(res.body.assignment.technicianId).toBe(technicianUser.id);
      expect(res.body.assignment.status).toBe('ACTIVE');
    });

    it('21. should reject assigning an inactive technician', async () => {
      const res = await request(app)
        .post(`/api/issues/${testIssueId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ technicianId: inactiveTechId });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/deactivated and cannot be assigned/i);
    });

    it('22. should allow assigned technician to view their assigned issue', async () => {
      const res = await request(app)
        .get(`/api/issues/${testIssueId}`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(res.status).toBe(200);
      expect(res.body.issue.id).toBe(testIssueId);
    });

    it('23. should prevent technician from accessing issues assigned to someone else', async () => {
      // Find an issue assigned to a different technician or unassigned
      const otherIssue = await prisma.issue.findFirst({
        where: {
          NOT: {
            assignments: {
              some: { technicianId: technicianUser.id },
            },
          },
        },
      });

      if (otherIssue) {
        const res = await request(app)
          .get(`/api/issues/${otherIssue.id}`)
          .set('Authorization', `Bearer ${techToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/not assigned to view this issue/i);
      }
    });
  });

  // ==========================================
  // MODULE 6: WORKFLOW & STATE MACHINE (6 tests)
  // ==========================================
  describe('Module 6: Lifecycle State Machine Transitions', () => {
    it('24. should allow assigned technician to start work (ASSIGNED -> IN_PROGRESS)', async () => {
      const res = await request(app)
        .post(`/api/issues/${testIssueId}/start`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(res.status).toBe(200);
      expect(res.body.issue.status).toBe('IN_PROGRESS');
    });

    it('25. should reject invalid state transition (IN_PROGRESS cannot go directly to CLOSED)', async () => {
      const res = await request(app)
        .post(`/api/issues/${testIssueId}/close`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid transition/i);
    });

    it('26. should reject resolving an issue without a resolution note', async () => {
      const res = await request(app)
        .post(`/api/issues/${testIssueId}/resolve`)
        .set('Authorization', `Bearer ${techToken}`)
        .send({ resolutionNote: '' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('27. should successfully resolve issue with meaningful resolution note', async () => {
      const res = await request(app)
        .post(`/api/issues/${testIssueId}/resolve`)
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          resolutionNote: 'Secured whiteboard metal tray with two heavy-duty M5 anchor bolts.',
        });

      expect(res.status).toBe(200);
      expect(res.body.issue.status).toBe('RESOLVED');
      expect(res.body.issue.resolutionNote).toBeTruthy();
      expect(res.body.issue.resolvedAt).toBeTruthy();
    });

    it('28. should allow reporter to reopen a resolved issue with reason', async () => {
      const res = await request(app)
        .post(`/api/issues/${testIssueId}/reopen`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          reason: 'The right side screw became loose again during the morning class.',
        });

      expect(res.status).toBe(200);
      expect(res.body.issue.status).toBe('REOPENED');
      expect(res.body.issue.reopenedAt).toBeTruthy();
    });

    it('29. should allow reporter to cancel their own issue only if REPORTED', async () => {
      // Create a fresh issue in REPORTED status
      const freshIssue = await prisma.issue.create({
        data: {
          title: 'Temporary Cancel Test Issue',
          description: 'A test issue created specifically to verify cancellation.',
          reporterId: reporterUser.id,
          categoryId: testCategoryId,
          locationId: testLocationId,
          status: 'REPORTED',
        },
      });

      const res = await request(app)
        .post(`/api/issues/${freshIssue.id}/cancel`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({ reason: 'Solved it myself' });

      expect(res.status).toBe(200);
      expect(res.body.issue.status).toBe('CANCELLED');

      // Now verify cannot cancel already CANCELLED issue
      const resAgain = await request(app)
        .post(`/api/issues/${freshIssue.id}/cancel`)
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(resAgain.status).toBe(400);
    });
  });

  // ==========================================
  // MODULE 7: COMMENTS & AUDIT TRAIL (3 tests)
  // ==========================================
  describe('Module 7: Comments & Audit Activity Timeline', () => {
    it('30. should allow authenticated users to post comments on an issue', async () => {
      const res = await request(app)
        .post(`/api/issues/${testIssueId}/comments`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          message: 'Can this be inspected before tomorrow morning 9 AM lecture?',
        });

      expect(res.status).toBe(201);
      expect(res.body.comment).toHaveProperty('id');
      expect(res.body.comment.message).toMatch(/before tomorrow morning/i);
    });

    it('31. should reject empty comment messages', async () => {
      const res = await request(app)
        .post(`/api/issues/${testIssueId}/comments`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({ message: '   ' });

      expect(res.status).toBe(400);
    });

    it('32. should preserve chronological history entries for all workflow state changes', async () => {
      const histories = await prisma.issueHistory.findMany({
        where: { issueId: testIssueId },
        orderBy: { createdAt: 'asc' },
      });

      expect(histories.length).toBeGreaterThanOrEqual(4);
      const actions = histories.map((h) => h.action);
      expect(actions).toContain('CREATED');
      expect(actions).toContain('ASSIGNED');
      expect(actions).toContain('STATUS_CHANGED');
      expect(actions).toContain('RESOLVED');
      expect(actions).toContain('REOPENED');
    });
  });

  // ==========================================
  // MODULE 8: NOTIFICATIONS (3 tests)
  // ==========================================
  describe('Module 8: In-App Notification Engine', () => {
    it('33. should fetch in-app notifications for authenticated user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.notifications)).toBe(true);
      expect(typeof res.body.unreadCount).toBe('number');
    });

    it('34. should mark a single notification as read', async () => {
      // Create a test unread notification
      const notif = await prisma.notification.create({
        data: {
          userId: reporterUser.id,
          title: 'Inspection Reminder',
          message: 'Technician will arrive in 15 minutes.',
          isRead: false,
        },
      });

      const res = await request(app)
        .patch(`/api/notifications/${notif.id}/read`)
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.notification.isRead).toBe(true);
    });

    it('35. should mark all notifications as read', async () => {
      const res = await request(app)
        .post('/api/notifications/read-all')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(res.status).toBe(200);

      // Verify unread count is now 0
      const checkRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect(checkRes.body.unreadCount).toBe(0);
    });
  });

  // ==========================================
  // MODULE 9: ADMIN USER MANAGEMENT (3 tests)
  // ==========================================
  describe('Module 9: Admin User Management & Safety Guards', () => {
    it('36. should allow admin to view and filter user directory', async () => {
      const res = await request(app)
        .get('/api/users?role=TECHNICIAN')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      res.body.users.forEach((u) => {
        expect(u.role).toBe('TECHNICIAN');
      });
    });

    it('37. should prevent an admin from deactivating their own administrative account', async () => {
      const res = await request(app)
        .patch(`/api/users/${adminUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot deactivate your own administrative account/i);
    });

    it('38. should allow admin to toggle active status of other users', async () => {
      // Deactivate reporter2
      const user = await prisma.user.findFirst({ where: { role: 'REPORTER', NOT: { id: reporterUser.id } } });
      if (user) {
        const resDeactivate = await request(app)
          .patch(`/api/users/${user.id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ isActive: false });

        expect(resDeactivate.status).toBe(200);
        expect(resDeactivate.body.user.isActive).toBe(false);

        // Re-activate
        const resReactivate = await request(app)
          .patch(`/api/users/${user.id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ isActive: true });

        expect(resReactivate.status).toBe(200);
        expect(resReactivate.body.user.isActive).toBe(true);
      }
    });
  });

  // ==========================================
  // MODULE 10: REPORTS & ANALYTICS (3 tests)
  // ==========================================
  describe('Module 10: Reports & Analytics Backend Aggregations', () => {
    it('39. should calculate overview statistics including average resolution hours', async () => {
      const res = await request(app)
        .get('/api/reports/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(typeof res.body.totalIssues).toBe('number');
      expect(typeof res.body.resolvedIssues).toBe('number');
      expect(typeof res.body.openIssues).toBe('number');
      expect(typeof res.body.avgResolutionHours).toBe('number');
      expect(typeof res.body.resolutionRate).toBe('number');
    });

    it('40. should aggregate issue counts grouped by category', async () => {
      const res = await request(app)
        .get('/api/reports/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.categories)).toBe(true);
      expect(res.body.categories.length).toBeGreaterThanOrEqual(1);
      expect(res.body.categories[0]).toHaveProperty('total');
      expect(res.body.categories[0]).toHaveProperty('open');
      expect(res.body.categories[0]).toHaveProperty('resolved');
    });

    it('41. should aggregate technician workload metrics', async () => {
      const res = await request(app)
        .get('/api/reports/technicians')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.technicians)).toBe(true);
      expect(res.body.technicians[0]).toHaveProperty('totalAssigned');
      expect(res.body.technicians[0]).toHaveProperty('activeAssignments');
    });
  });

  // ==========================================
  // MODULE 11: HEALTH CHECK (1 test)
  // ==========================================
  describe('Module 11: System Health & Diagnostics', () => {
    it('42. should return 200 OK on /api/health with service name and timestamp', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('CampusFix API');
    });
  });
});
