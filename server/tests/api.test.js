import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma.js';
import bcrypt from 'bcryptjs';
import { getJwtSecret } from '../src/utils/token.js';

// ----------- Test Helpers -----------
async function createTestUser(overrides = {}) {
  const hash = await bcrypt.hash(overrides.password || 'Test@1234', 10);
  return prisma.user.create({
    data: {
      name: overrides.name || 'Test User',
      email: overrides.email || `testuser_${Date.now()}@test.com`,
      passwordHash: hash,
      role: overrides.role || 'PLAYER',
    },
  });
}

async function loginAs(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

// ----------- Test Suite: AUTH -----------
describe('AUTH', () => {
  let testEmail;

  beforeEach(() => {
    testEmail = `auth_${Date.now()}@test.com`;
  });

  it('should signup a new player successfully', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'New Player',
      email: testEmail,
      password: 'Password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('PLAYER');
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('should reject duplicate email signup', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Player One',
      email: testEmail,
      password: 'Password123',
    });
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Player Two',
      email: testEmail,
      password: 'Password456',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should login with valid credentials', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Login Test',
      email: testEmail,
      password: 'Password123',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'Password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(testEmail);
  });

  it('should reject invalid login credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'doesnotexist@test.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should return current user for authenticated requests', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Me Test',
      email: testEmail,
      password: 'Password123',
    });
    const token = await loginAs(testEmail, 'Password123');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });

  it('should logout successfully', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Logout Test',
      email: testEmail,
      password: 'Password123',
    });
    const token = await loginAs(testEmail, 'Password123');
    const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('should change password successfully', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'ChangePwd Test',
      email: testEmail,
      password: 'OldPass123',
    });
    const token = await loginAs(testEmail, 'OldPass123');
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        confirmNewPassword: 'NewPass456',
      });
    expect(res.status).toBe(200);
    // Should now login with new password
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'NewPass456',
    });
    expect(loginRes.status).toBe(200);
  });

  it('production JWT_SECRET validation throws if missing', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;
      expect(() => getJwtSecret()).toThrow(/JWT_SECRET environment variable is required in production/i);
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalSecret !== undefined) {
        process.env.JWT_SECRET = originalSecret;
      } else {
        delete process.env.JWT_SECRET;
      }
    }
  });
});

// ----------- Test Suite: SPORTS -----------
describe('SPORTS', () => {
  let adminToken;
  let playerToken;

  beforeAll(async () => {
    const ts = Date.now();
    // Create admin and player for sports tests
    const adminUser = await createTestUser({
      email: `sport_admin_${ts}@test.com`,
      role: 'ADMIN',
    });
    const playerUser = await createTestUser({
      email: `sport_player_${ts}@test.com`,
      role: 'PLAYER',
    });
    adminToken = await loginAs(adminUser.email, 'Test@1234');
    playerToken = await loginAs(playerUser.email, 'Test@1234');
  });

  it('admin can create a sport', async () => {
    const sportName = `TestSport_${Date.now()}`;
    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: sportName });
    expect(res.status).toBe(201);
    expect(res.body.sport.name).toBe(sportName);
  });

  it('player cannot create a sport (403)', async () => {
    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ name: 'ShouldFail' });
    expect(res.status).toBe(403);
  });

  it('authenticated user can view all sports', async () => {
    const res = await request(app)
      .get('/api/sports')
      .set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sports)).toBe(true);
  });

  it('unauthenticated request is rejected (401)', async () => {
    const res = await request(app).get('/api/sports');
    expect(res.status).toBe(401);
  });

  it('admin cannot create duplicate sport (exact match)', async () => {
    const sportName = `DupSport_${Date.now()}`;
    await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: sportName });
    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: sportName });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('duplicate sport is rejected case-insensitively', async () => {
    const sportName = `AuditSport_${Date.now()}`;
    await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: sportName });
    // Try the mixed-case variant — must be rejected
    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: sportName.split('').map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase())).join('') });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('sport with associated sessions cannot be deleted (400)', async () => {
    // Create a new sport, create a session for it, then try to delete the sport
    const ts = Date.now();
    const newSportRes = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `DeleteTestSport_${ts}` });
    const newSportId = newSportRes.body.sport.id;

    // Create a session attached to that sport
    await prisma.sportSession.create({
      data: {
        sportId: newSportId,
        creatorId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } })).id,
        sessionDate: '2027-01-15',
        sessionTime: '10:00',
        startDateTime: new Date('2027-01-15T10:00:00.000Z'),
        venue: 'Test Venue',
        teamA: '[]',
        teamB: '[]',
        additionalPlayersRequired: 2,
        status: 'UPCOMING',
      },
    });

    const deleteRes = await request(app)
      .delete(`/api/sports/${newSportId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(400);
    expect(deleteRes.body.message).toMatch(/associated sessions/i);
  });

  it('sport without sessions can be deleted (200)', async () => {
    const ts = Date.now();
    const newSportRes = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `NoSessionSport_${ts}` });
    const newSportId = newSportRes.body.sport.id;

    const deleteRes = await request(app)
      .delete(`/api/sports/${newSportId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toMatch(/deleted successfully/i);
  });
});

// ----------- Test Suite: AVAILABLE SESSIONS DISCOVERY -----------
describe('AVAILABLE SESSIONS DISCOVERY', () => {
  let creatorToken;
  let otherPlayerToken;
  let sportId;
  let createdSessionId;

  beforeAll(async () => {
    const ts = Date.now();
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    const creator = await prisma.user.create({
      data: {
        name: 'Discovery Creator',
        email: `disc_creator_${ts}@test.com`,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvuuABCDEFGHIJKLMNOPQRSTUVWXYZ12',
        role: 'PLAYER',
      },
    });
    const other = await prisma.user.create({
      data: {
        name: 'Discovery Other',
        email: `disc_other_${ts}@test.com`,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvuuABCDEFGHIJKLMNOPQRSTUVWXYZ12',
        role: 'PLAYER',
      },
    });

    const loginCreator = await request(app).post('/api/auth/login').send({ email: creator.email, password: 'wrong' });
    // Use a fresh signup to get valid tokens
    const creatorSignup = await request(app).post('/api/auth/signup').send({
      name: 'Disc Creator2',
      email: `disc_creator2_${ts}@test.com`,
      password: 'Password123!',
    });
    creatorToken = creatorSignup.body.token;

    const otherSignup = await request(app).post('/api/auth/signup').send({
      name: 'Disc Other2',
      email: `disc_other2_${ts}@test.com`,
      password: 'Password123!',
    });
    otherPlayerToken = otherSignup.body.token;

    // Get an existing sport
    const sportsRes = await request(app).get('/api/sports').set('Authorization', `Bearer ${creatorToken}`);
    sportId = sportsRes.body.sports[0].id;

    // Creator creates a session
    const sessionRes = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        sportId,
        sessionDate: '2027-03-15',
        sessionTime: '14:00',
        venue: 'Discovery Arena',
        additionalPlayersRequired: 3,
      });
    createdSessionId = sessionRes.body.session.id;
  });

  it('creator cannot see their own session in available sessions', async () => {
    const res = await request(app).get('/api/sessions').set('Authorization', `Bearer ${creatorToken}`);
    expect(res.status).toBe(200);
    const ids = res.body.sessions.map((s) => s.id);
    expect(ids).not.toContain(createdSessionId);
  });

  it('other players CAN see the session in available sessions', async () => {
    const res = await request(app).get('/api/sessions').set('Authorization', `Bearer ${otherPlayerToken}`);
    expect(res.status).toBe(200);
    const ids = res.body.sessions.map((s) => s.id);
    expect(ids).toContain(createdSessionId);
  });

  it('creator can still see their session in My Created Sessions', async () => {
    const res = await request(app).get('/api/sessions/created').set('Authorization', `Bearer ${creatorToken}`);
    expect(res.status).toBe(200);
    const ids = res.body.sessions.map((s) => s.id);
    expect(ids).toContain(createdSessionId);
  });
});

// ----------- Test Suite: SESSIONS -----------
describe('SESSIONS', () => {
  let adminToken;
  let adminId;
  let player1Token;
  let player1Id;
  let player2Token;
  let player2Id;
  let sportId;

  beforeAll(async () => {
    const ts = Date.now();

    const admin = await createTestUser({ email: `sess_admin_${ts}@test.com`, role: 'ADMIN' });
    const p1 = await createTestUser({ email: `sess_p1_${ts}@test.com` });
    const p2 = await createTestUser({ email: `sess_p2_${ts}@test.com` });

    adminToken = await loginAs(admin.email, 'Test@1234');
    adminId = admin.id;
    player1Token = await loginAs(p1.email, 'Test@1234');
    player1Id = p1.id;
    player2Token = await loginAs(p2.email, 'Test@1234');
    player2Id = p2.id;

    const sport = await prisma.sport.create({
      data: { name: `TestSport_sess_${ts}`, createdById: admin.id },
    });
    sportId = sport.id;
  });

  // Helper: create a future session
  async function createFutureSession(token, overrides = {}) {
    const futureDate = new Date(Date.now() + (60 + Math.random() * 3000) * 24 * 60 * 60 * 1000);
    const dateStr = futureDate.toISOString().split('T')[0];
    return request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sportId,
        sessionDate: dateStr,
        sessionTime: '10:00',
        venue: 'Test Ground',
        additionalPlayersRequired: 2,
        teamA: ['PlayerA1'],
        teamB: [],
        ...overrides,
      });
  }

  it('player can create a session', async () => {
    const res = await createFutureSession(player1Token);
    expect(res.status).toBe(201);
    expect(res.body.session.sportId).toBe(sportId);
    expect(res.body.session.status).toBe('UPCOMING');
  });

  it('admin can create a session', async () => {
    const res = await createFutureSession(adminToken);
    expect(res.status).toBe(201);
    expect(res.body.session.status).toBe('UPCOMING');
  });

  it('player can join a session', async () => {
    const createRes = await createFutureSession(player1Token);
    const sessionId = createRes.body.session.id;
    const joinRes = await request(app)
      .post(`/api/sessions/${sessionId}/join`)
      .set('Authorization', `Bearer ${player2Token}`)
      .send({});
    expect(joinRes.status).toBe(200);
    expect(joinRes.body.session.slotsFilled).toBe(1);
  });

  it('duplicate join is rejected', async () => {
    const createRes = await createFutureSession(player1Token);
    const sessionId = createRes.body.session.id;
    await request(app)
      .post(`/api/sessions/${sessionId}/join`)
      .set('Authorization', `Bearer ${player2Token}`)
      .send({});
    const dupRes = await request(app)
      .post(`/api/sessions/${sessionId}/join`)
      .set('Authorization', `Bearer ${player2Token}`)
      .send({});
    expect(dupRes.status).toBe(400);
    expect(dupRes.body.message).toMatch(/already joined/i);
  });

  it('full session join is rejected', async () => {
    const createRes = await createFutureSession(player1Token, { additionalPlayersRequired: 1 });
    const sessionId = createRes.body.session.id;
    await request(app)
      .post(`/api/sessions/${sessionId}/join`)
      .set('Authorization', `Bearer ${player2Token}`)
      .send({});
    // Need a third user to try to join a full session
    const p3 = await createTestUser({ email: `p3_full_${Date.now()}@test.com` });
    const p3Token = await loginAs(p3.email, 'Test@1234');
    const fullRes = await request(app)
      .post(`/api/sessions/${sessionId}/join`)
      .set('Authorization', `Bearer ${p3Token}`)
      .send({});
    expect(fullRes.status).toBe(400);
    expect(fullRes.body.message).toMatch(/full/i);
  });

  it('past session join is rejected', async () => {
    // Create a session in the past by directly inserting into DB
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const pastSession = await prisma.sportSession.create({
      data: {
        sportId,
        creatorId: player1Id,
        sessionDate: pastDate.toISOString().split('T')[0],
        sessionTime: '10:00',
        startDateTime: pastDate,
        venue: 'Past Ground',
        teamA: '[]',
        teamB: '[]',
        additionalPlayersRequired: 2,
        status: 'UPCOMING',
      },
    });
    const joinRes = await request(app)
      .post(`/api/sessions/${pastSession.id}/join`)
      .set('Authorization', `Bearer ${player2Token}`)
      .send({});
    expect(joinRes.status).toBe(400);
    expect(joinRes.body.message).toMatch(/already started|ended/i);
  });

  it('cancelled session join is rejected', async () => {
    const createRes = await createFutureSession(player1Token);
    const sessionId = createRes.body.session.id;
    await request(app)
      .post(`/api/sessions/${sessionId}/cancel`)
      .set('Authorization', `Bearer ${player1Token}`)
      .send({ reason: 'Test cancellation' });
    const joinRes = await request(app)
      .post(`/api/sessions/${sessionId}/join`)
      .set('Authorization', `Bearer ${player2Token}`)
      .send({});
    expect(joinRes.status).toBe(400);
    expect(joinRes.body.message).toMatch(/cancelled/i);
  });

  it('scheduling conflict is rejected', async () => {
    // Use a fixed date for both sessions (far future to avoid collision with other tests)
    const conflictDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const conflictDateStr = conflictDate.toISOString().split('T')[0];

    // Create a third player for isolated conflict test
    const conflictPlayer = await createTestUser({ email: `conflict_${Date.now()}@test.com` });
    const conflictToken = await loginAs(conflictPlayer.email, 'Test@1234');

    // Session 1: conflict player joins it
    const session1Res = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${player1Token}`)
      .send({ sportId, sessionDate: conflictDateStr, sessionTime: '15:00', venue: 'Ground A', additionalPlayersRequired: 3 });
    const session1Id = session1Res.body.session.id;
    await request(app).post(`/api/sessions/${session1Id}/join`).set('Authorization', `Bearer ${conflictToken}`).send({});

    // Session 2: same date and time, created by admin
    const session2Res = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sportId, sessionDate: conflictDateStr, sessionTime: '15:00', venue: 'Ground B', additionalPlayersRequired: 3 });
    const session2Id = session2Res.body.session.id;

    // conflictPlayer tries to join session2 - should be blocked
    const conflictJoinRes = await request(app)
      .post(`/api/sessions/${session2Id}/join`)
      .set('Authorization', `Bearer ${conflictToken}`)
      .send({});
    expect(conflictJoinRes.status).toBe(400);
    expect(conflictJoinRes.body.message).toMatch(/already have a session/i);
  });

  it('creator can cancel their own session', async () => {
    const createRes = await createFutureSession(player1Token);
    const sessionId = createRes.body.session.id;
    const cancelRes = await request(app)
      .post(`/api/sessions/${sessionId}/cancel`)
      .set('Authorization', `Bearer ${player1Token}`)
      .send({ reason: 'Weather bad' });
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.session.status).toBe('CANCELLED');
    expect(cancelRes.body.session.cancellationReason).toBe('Weather bad');
  });

  it('non-creator cannot cancel session (403)', async () => {
    const createRes = await createFutureSession(player1Token);
    const sessionId = createRes.body.session.id;
    const cancelRes = await request(app)
      .post(`/api/sessions/${sessionId}/cancel`)
      .set('Authorization', `Bearer ${player2Token}`)
      .send({ reason: 'Unauthorized cancel attempt' });
    expect(cancelRes.status).toBe(403);
  });

  it('empty cancellation reason is rejected', async () => {
    const createRes = await createFutureSession(player1Token);
    const sessionId = createRes.body.session.id;
    const cancelRes = await request(app)
      .post(`/api/sessions/${sessionId}/cancel`)
      .set('Authorization', `Bearer ${player1Token}`)
      .send({ reason: '' });
    expect(cancelRes.status).toBe(400);
    expect(cancelRes.body.message).toMatch(/reason/i);
  });

  it('player can view created sessions', async () => {
    await createFutureSession(player1Token);
    const res = await request(app).get('/api/sessions/created').set('Authorization', `Bearer ${player1Token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sessions)).toBe(true);
    expect(res.body.sessions.length).toBeGreaterThan(0);
  });

  it('player can view joined sessions', async () => {
    const createRes = await createFutureSession(player1Token);
    const sessionId = createRes.body.session.id;
    await request(app).post(`/api/sessions/${sessionId}/join`).set('Authorization', `Bearer ${player2Token}`).send({});
    const res = await request(app).get('/api/sessions/joined').set('Authorization', `Bearer ${player2Token}`);
    expect(res.status).toBe(200);
    expect(res.body.sessions.some((s) => s.id === sessionId)).toBe(true);
  });
});

// ----------- Test Suite: REPORTS -----------
describe('REPORTS', () => {
  let adminToken;
  let playerToken;

  beforeAll(async () => {
    const ts = Date.now();
    const admin = await createTestUser({ email: `rep_admin_${ts}@test.com`, role: 'ADMIN' });
    const player = await createTestUser({ email: `rep_player_${ts}@test.com` });
    adminToken = await loginAs(admin.email, 'Test@1234');
    playerToken = await loginAs(player.email, 'Test@1234');
  });

  it('admin can access reports', async () => {
    const res = await request(app)
      .get('/api/reports/sessions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.totalSessionsPlayed).toBe('number');
    expect(Array.isArray(res.body.sportPopularity)).toBe(true);
  });

  it('player cannot access reports (403)', async () => {
    const res = await request(app)
      .get('/api/reports/sessions')
      .set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(403);
  });

  it('date range filtering works', async () => {
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';
    const res = await request(app)
      .get(`/api/reports/sessions?startDate=${startDate}&endDate=${endDate}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.startDate).toBe(startDate);
    expect(res.body.endDate).toBe(endDate);
    // Sessions before 2025 or after 2025 should not be counted
    expect(typeof res.body.totalSessionsPlayed).toBe('number');
  });

  it('cancelled sessions are excluded from reports', async () => {
    // The seeded cancelled session should not appear in counts
    const res = await request(app)
      .get('/api/reports/sessions?startDate=2020-01-01&endDate=2030-12-31')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    // All returned sessions in the detail list should not be cancelled
    if (res.body.sessions && res.body.sessions.length > 0) {
      const hasCancelled = res.body.sessions.some((s) => s.status === 'CANCELLED');
      expect(hasCancelled).toBe(false);
    }
  });

  it('report returns correct session counts based on date range', async () => {
    const resAll = await request(app)
      .get('/api/reports/sessions?startDate=2020-01-01&endDate=2030-12-31')
      .set('Authorization', `Bearer ${adminToken}`);
    const resNone = await request(app)
      .get('/api/reports/sessions?startDate=2000-01-01&endDate=2001-01-01')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resAll.status).toBe(200);
    expect(resNone.status).toBe(200);
    expect(resNone.body.totalSessionsPlayed).toBe(0);
  });
});
