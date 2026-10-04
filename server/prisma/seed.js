const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting SportSync Database Seeding ---');

  // 1. Seed Administrator
  let rawAdminEmail = process.env.ADMIN_EMAIL || 'admin@sportsync.local';
  rawAdminEmail = rawAdminEmail.trim();
  if (
    (rawAdminEmail.startsWith('"') && rawAdminEmail.endsWith('"')) ||
    (rawAdminEmail.startsWith("'") && rawAdminEmail.endsWith("'"))
  ) {
    rawAdminEmail = rawAdminEmail.slice(1, -1).trim();
  }
  const adminEmail = rawAdminEmail.toLowerCase();

  let rawAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@sportsync2026';
  rawAdminPassword = rawAdminPassword.trim();
  if (
    (rawAdminPassword.startsWith('"') && rawAdminPassword.endsWith('"')) ||
    (rawAdminPassword.startsWith("'") && rawAdminPassword.endsWith("'"))
  ) {
    rawAdminPassword = rawAdminPassword.slice(1, -1).trim();
  }
  const adminPassword = rawAdminPassword;

  let rawAdminName = process.env.ADMIN_NAME || 'System Administrator';
  rawAdminName = rawAdminName.trim();
  if (
    (rawAdminName.startsWith('"') && rawAdminName.endsWith('"')) ||
    (rawAdminName.startsWith("'") && rawAdminName.endsWith("'"))
  ) {
    rawAdminName = rawAdminName.slice(1, -1).trim();
  }
  const adminName = rawAdminName;

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { role: 'ADMIN' },
      ],
    },
  });

  let admin;
  if (existingAdmin) {
    admin = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    });
    console.log(`✓ Admin user updated: ${admin.email} (ID: ${admin.id}, Role: ${admin.role})`);
  } else {
    admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    });
    console.log(`✓ Admin user created: ${admin.email} (ID: ${admin.id}, Role: ${admin.role})`);
  }

  // 2. Seed Demo Players
  const defaultPlayerPasswordHash = await bcrypt.hash('Player@123', 10);
  const demoPlayersData = [
    { name: 'Rahul Sharma', email: 'rahul@sportsync.local' },
    { name: 'Anjali Verma', email: 'anjali@sportsync.local' },
    { name: 'Hemadri Roy', email: 'hemadri@sportsync.local' },
    { name: 'Arjun Das', email: 'arjun@sportsync.local' },
  ];

  const players = [];
  for (const p of demoPlayersData) {
    const player = await prisma.user.upsert({
      where: { email: p.email },
      update: {
        name: p.name,
        passwordHash: defaultPlayerPasswordHash,
        role: 'PLAYER',
      },
      create: {
        name: p.name,
        email: p.email,
        passwordHash: defaultPlayerPasswordHash,
        role: 'PLAYER',
      },
    });
    players.push(player);
  }
  console.log(`✓ Seeded ${players.length} demo players`);

  // 3. Seed Default Sports
  const defaultSports = [
    'Football',
    'Cricket',
    'Badminton',
    'Basketball',
    'Volleyball',
    'Tennis',
  ];

  const sports = [];
  for (const sportName of defaultSports) {
    const sport = await prisma.sport.upsert({
      where: { name: sportName },
      update: {},
      create: {
        name: sportName,
        createdById: admin.id,
      },
    });
    sports.push(sport);
  }
  console.log(`✓ Seeded ${sports.length} sports`);

  // 4. Seed Sample Sessions
  const football = sports.find((s) => s.name === 'Football') || sports[0];
  const cricket = sports.find((s) => s.name === 'Cricket') || sports[1];
  const badminton = sports.find((s) => s.name === 'Badminton') || sports[2];

  // Helper date generators
  const now = new Date();
  
  // Future dates
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const futureDateTime = new Date(`${tomorrowStr}T18:00:00.000Z`);

  const nextWeek = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  const nextWeekDateTime = new Date(`${nextWeekStr}T09:00:00.000Z`);

  // Past dates (for reports & completed sessions)
  const pastDate1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const pastDate1Str = pastDate1.toISOString().split('T')[0];
  const pastDateTime1 = new Date(`${pastDate1Str}T17:00:00.000Z`);

  const pastDate2 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pastDate2Str = pastDate2.toISOString().split('T')[0];
  const pastDateTime2 = new Date(`${pastDate2Str}T16:00:00.000Z`);

  // 4. Seed Sample Sessions (Idempotent: check if each sample session already exists before creating)
  async function seedSessionIfMissing(sessionData) {
    const existing = await prisma.sportSession.findFirst({
      where: {
        venue: sessionData.venue,
        creatorId: sessionData.creatorId,
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.sportSession.create({
      data: sessionData,
    });
  }

  // Create upcoming session 1
  await seedSessionIfMissing({
    sportId: football.id,
    creatorId: players[0].id, // Rahul
    sessionDate: tomorrowStr,
    sessionTime: '18:00',
    startDateTime: futureDateTime,
    venue: 'Main College Stadium - Field A',
    teamA: JSON.stringify(['Rahul', 'Hemadri']),
    teamB: JSON.stringify(['Anjali']),
    additionalPlayersRequired: 3,
    status: 'UPCOMING',
    participants: {
      create: [
        { userId: players[1].id, team: 'Team B' }, // Anjali joined
      ],
    },
  });

  // Create upcoming session 2
  await seedSessionIfMissing({
    sportId: cricket.id,
    creatorId: admin.id, // Admin can create sessions
    sessionDate: nextWeekStr,
    sessionTime: '09:00',
    startDateTime: nextWeekDateTime,
    venue: 'Green Valley Sports Complex',
    teamA: JSON.stringify(['Admin Player', 'Sam']),
    teamB: JSON.stringify(['Vikram']),
    additionalPlayersRequired: 4,
    status: 'UPCOMING',
  });

  // Create past completed sessions for reports
  await seedSessionIfMissing({
    sportId: football.id,
    creatorId: players[0].id,
    sessionDate: pastDate1Str,
    sessionTime: '17:00',
    startDateTime: pastDateTime1,
    venue: 'Downtown Turf Arena',
    teamA: JSON.stringify(['Rahul', 'Sunil']),
    teamB: JSON.stringify(['Karan', 'Dev']),
    additionalPlayersRequired: 2,
    status: 'COMPLETED',
    participants: {
      create: [
        { userId: players[1].id, team: 'Team A' },
        { userId: players[2].id, team: 'Team B' },
      ],
    },
  });

  await seedSessionIfMissing({
    sportId: cricket.id,
    creatorId: players[1].id,
    sessionDate: pastDate2Str,
    sessionTime: '16:00',
    startDateTime: pastDateTime2,
    venue: 'City Cricket Ground',
    teamA: JSON.stringify(['Anjali', 'Priya']),
    teamB: JSON.stringify(['Sneha', 'Ritu']),
    additionalPlayersRequired: 2,
    status: 'COMPLETED',
  });

  // Create a cancelled session to demonstrate cancellation reason
  await seedSessionIfMissing({
    sportId: badminton.id,
    creatorId: players[0].id,
    sessionDate: tomorrowStr,
    sessionTime: '20:00',
    startDateTime: new Date(`${tomorrowStr}T20:00:00.000Z`),
    venue: 'Indoor Badminton Court 2',
    teamA: JSON.stringify(['Rahul']),
    teamB: JSON.stringify(['Rohan']),
    additionalPlayersRequired: 2,
    status: 'CANCELLED',
    cancellationReason: 'Ground is unavailable due to maintenance work.',
    cancelledAt: new Date(),
    participants: {
      create: [
        { userId: players[1].id, team: 'Team A' },
      ],
    },
  });

  console.log('✓ Seeded sample upcoming, completed, and cancelled sessions');
  console.log('--- Database seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
