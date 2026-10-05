// Idempotent Seed Script for CampusFix
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting CampusFix Database Seed ---');

  // Password hashing helper
  const hashPassword = async (pwd) => {
    return await bcrypt.hash(pwd, 10);
  };

  const defaultPasswordHash = await hashPassword('Password123!');

  // 1. Seed Admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@campusfix.edu').toLowerCase();
  const adminName = process.env.ADMIN_NAME || 'Campus Facilities Administrator';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@CampusFix2026';
  const adminPasswordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: 'ADMIN',
      isActive: true,
      passwordHash: adminPasswordHash,
      department: 'Campus Facilities Directorate',
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      department: 'Campus Facilities Directorate',
      phone: '+1-555-0100',
      isActive: true,
    },
  });
  console.log(`Admin account ready: ${admin.email}`);

  // 2. Seed Reporters
  const reportersData = [
    {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@campusfix.edu',
      department: 'Computer Science & Engineering',
      phone: '+1-555-0201',
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@campusfix.edu',
      department: 'Biotechnology & Health',
      phone: '+1-555-0202',
    },
    {
      name: 'Arjun Nair',
      email: 'arjun.nair@campusfix.edu',
      department: 'Student Affairs Council',
      phone: '+1-555-0203',
    },
    {
      name: 'Dr. Sanjay Mehta',
      email: 'dr.mehta@campusfix.edu',
      department: 'Faculty of Pure Sciences',
      phone: '+1-555-0204',
    },
  ];

  const reporters = [];
  for (const r of reportersData) {
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {
        name: r.name,
        role: 'REPORTER',
        department: r.department,
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
      create: {
        name: r.name,
        email: r.email,
        passwordHash: defaultPasswordHash,
        role: 'REPORTER',
        department: r.department,
        phone: r.phone,
        isActive: true,
      },
    });
    reporters.push(user);
  }
  console.log(`Seeded ${reporters.length} Reporters.`);

  // 3. Seed Technicians
  const techniciansData = [
    {
      name: 'Vikram Singh',
      email: 'vikram.electrician@campusfix.edu',
      department: 'Electrical Maintenance',
      phone: '+1-555-0301',
    },
    {
      name: 'Suresh Kumar',
      email: 'suresh.plumber@campusfix.edu',
      department: 'Plumbing & Water Systems',
      phone: '+1-555-0302',
    },
    {
      name: 'Ananya Sen',
      email: 'ananya.ittech@campusfix.edu',
      department: 'IT Infrastructure & Networks',
      phone: '+1-555-0303',
    },
  ];

  const technicians = [];
  for (const t of techniciansData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {
        name: t.name,
        role: 'TECHNICIAN',
        department: t.department,
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
      create: {
        name: t.name,
        email: t.email,
        passwordHash: defaultPasswordHash,
        role: 'TECHNICIAN',
        department: t.department,
        phone: t.phone,
        isActive: true,
      },
    });
    technicians.push(user);
  }
  console.log(`Seeded ${technicians.length} Technicians.`);

  // 4. Seed Categories
  const categoriesData = [
    { name: 'Electrical', description: 'Power sockets, lighting fixtures, circuit breakers, and switches', icon: 'Zap' },
    { name: 'Plumbing', description: 'Water leakage, faucet repairs, washroom fixtures, and pipes', icon: 'Droplets' },
    { name: 'Furniture', description: 'Desks, chairs, doors, window latches, and classroom podiums', icon: 'Armchair' },
    { name: 'Cleanliness', description: 'Waste bins, sanitation, spill cleanup, and pest control', icon: 'Sparkles' },
    { name: 'Internet & Network', description: 'Campus Wi-Fi connectivity, LAN wall ports, and routers', icon: 'Wifi' },
    { name: 'Security & Safety', description: 'Door electronic locks, fire alarms, emergency lights, and CCTV', icon: 'ShieldCheck' },
    { name: 'Classroom Equipment', description: 'Overhead projectors, smart boards, HDMI cables, and microphones', icon: 'Monitor' },
    { name: 'Laboratory Equipment', description: 'Lab gas regulators, ventilation fume hoods, and water baths', icon: 'FlaskConical' },
    { name: 'HVAC & Climate Control', description: 'Air conditioning, central heating, and ventilation louvers', icon: 'Fan' },
  ];

  const categoryMap = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { name: c.name },
      update: { description: c.description, icon: c.icon, isActive: true },
      create: {
        name: c.name,
        description: c.description,
        icon: c.icon,
        isActive: true,
      },
    });
    categoryMap[c.name] = cat;
  }
  console.log(`Seeded ${Object.keys(categoryMap).length} Categories.`);

  // 5. Seed Buildings and Locations
  const buildingsData = [
    {
      name: 'Academic Block A',
      code: 'ACAD-A',
      description: 'Main lecture halls, administrative deanery, and student affairs',
      locations: [
        { name: 'Lecture Hall 101', floor: 'Ground Floor' },
        { name: 'Room 204 Computer Lab', floor: '2nd Floor' },
        { name: 'Faculty Staff Room 302', floor: '3rd Floor' },
        { name: 'Ground Floor Restroom (East)', floor: 'Ground Floor' },
      ],
    },
    {
      name: 'Science & Engineering Wing',
      code: 'ENGG-SCI',
      description: 'Undergraduate and research laboratories, robotics workshop',
      locations: [
        { name: 'Advanced Electronics Lab 105', floor: '1st Floor' },
        { name: 'Chemistry Research Lab 210', floor: '2nd Floor' },
        { name: 'Seminar Hall 3', floor: '3rd Floor' },
        { name: 'Server & Rack Room', floor: 'Basement' },
      ],
    },
    {
      name: 'Central Library',
      code: 'LIB',
      description: 'Multi-level library with quiet zones and digital research carrels',
      locations: [
        { name: 'Main Reading Room', floor: '1st Floor' },
        { name: 'Digital Archives Section', floor: '2nd Floor' },
        { name: 'Periodicals Lounge', floor: 'Ground Floor' },
      ],
    },
    {
      name: 'Student Hostel Block 1',
      code: 'HSTL-1',
      description: 'Men undergraduate residency wing',
      locations: [
        { name: 'Room 112 (Wing B)', floor: '1st Floor' },
        { name: '2nd Floor Common Washroom', floor: '2nd Floor' },
        { name: 'Recreation & TV Lounge', floor: 'Ground Floor' },
      ],
    },
    {
      name: 'Student Hostel Block 2',
      code: 'HSTL-2',
      description: 'Women undergraduate residency wing',
      locations: [
        { name: 'Room 205 (Wing A)', floor: '2nd Floor' },
        { name: '3rd Floor Study Hall', floor: '3rd Floor' },
        { name: 'Ground Floor Laundry Facility', floor: 'Ground Floor' },
      ],
    },
    {
      name: 'Campus Cafeteria & Food Court',
      code: 'CAFE',
      description: 'Central dining hall, food preparation kitchen, and cafe patio',
      locations: [
        { name: 'Main Dining Hall', floor: 'Ground Floor' },
        { name: 'Kitchen Dishwashing Area', floor: 'Ground Floor' },
        { name: 'Outdoor Patio Seating', floor: 'Outdoor' },
      ],
    },
    {
      name: 'Indoor Sports Complex',
      code: 'SPORTS',
      description: 'Badminton courts, fitness gym, and athletic locker rooms',
      locations: [
        { name: 'Gymnasium & Weight Room', floor: 'Ground Floor' },
        { name: 'Badminton Court 2', floor: '1st Floor' },
        { name: 'Locker Rooms & Shower Area', floor: 'Ground Floor' },
      ],
    },
  ];

  const locationList = [];
  for (const b of buildingsData) {
    const building = await prisma.building.upsert({
      where: { name: b.name },
      update: { code: b.code, description: b.description, isActive: true },
      create: {
        name: b.name,
        code: b.code,
        description: b.description,
        isActive: true,
      },
    });

    for (const loc of b.locations) {
      let location = await prisma.location.findFirst({
        where: { buildingId: building.id, name: loc.name },
      });

      if (!location) {
        location = await prisma.location.create({
          data: {
            buildingId: building.id,
            name: loc.name,
            floor: loc.floor,
            isActive: true,
          },
        });
      }
      locationList.push(location);
    }
  }
  console.log(`Seeded ${buildingsData.length} Buildings and ${locationList.length} Locations.`);

  // 6. Seed Realistic Issues (16+ sample issues with varying statuses, priorities, and audit trails)
  const sampleIssues = [
    {
      title: 'Ceiling Fluorescent Light Flickering Rapidly',
      description: 'The overhead tube light right above row 4 in Lecture Hall 101 has been flickering constantly during lectures, causing severe eye strain.',
      category: 'Electrical',
      buildingIndex: 0,
      locationIndex: 0,
      specificArea: 'Row 4, seat 12 ceiling panel',
      priority: 'MEDIUM',
      status: 'REPORTED',
      reporterIndex: 0,
    },
    {
      title: 'Water Pipe Leaking Under Sink in 2nd Floor Restroom',
      description: 'Continuous water drip from the main inlet valve under sink #3 is causing a large puddle on the tile floor, making it slippery and dangerous.',
      category: 'Plumbing',
      buildingIndex: 0,
      locationIndex: 3,
      specificArea: 'Under handwash sink #3',
      priority: 'HIGH',
      status: 'ASSIGNED',
      reporterIndex: 1,
      assignedTechIndex: 1, // Suresh Kumar (Plumber)
    },
    {
      title: 'Wi-Fi Access Point Dropping Connection Intermittently',
      description: 'The 5GHz campus SSID disconnects every 10 minutes in the 2nd Floor Digital Archives, preventing students from downloading research journals.',
      category: 'Internet & Network',
      buildingIndex: 2,
      locationIndex: 8,
      specificArea: 'Ceiling mount near Study Carrel 14',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      reporterIndex: 2,
      assignedTechIndex: 2, // Ananya Sen (IT)
    },
    {
      title: 'Broken Wooden Armrest on Auditorium Chair',
      description: 'Seat B-18 in Lecture Hall 101 has a jagged, splintered wooden armrest that tore a student sweater this morning.',
      category: 'Furniture',
      buildingIndex: 0,
      locationIndex: 0,
      specificArea: 'Auditorium Seat B-18',
      priority: 'LOW',
      status: 'RESOLVED',
      reporterIndex: 0,
      assignedTechIndex: 0, // Vikram
      resolutionNote: 'Replaced the damaged wooden armrest with a new varnished beech unit. Inspected neighboring chairs as well.',
      resolvedAgoDays: 2,
    },
    {
      title: 'Air Conditioning Unit Blowing Warm Air in Chemistry Lab',
      description: 'The split AC unit in Chemistry Research Lab 210 is not cooling. Room temperature has reached 31°C, which is affecting sensitive volatile reagents.',
      category: 'HVAC & Climate Control',
      buildingIndex: 1,
      locationIndex: 5,
      specificArea: 'North wall AC unit #2',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      reporterIndex: 3, // Dr. Sanjay Mehta
      assignedTechIndex: 1, // Suresh
    },
    {
      title: 'HDMI Display Output Not Working on Podium Projector',
      description: 'Connecting laptop via HDMI in Seminar Hall 3 shows "No Signal" on the main Sony overhead projector.',
      category: 'Classroom Equipment',
      buildingIndex: 1,
      locationIndex: 6,
      specificArea: 'Speaker podium AV wall plate',
      priority: 'HIGH',
      status: 'RESOLVED',
      reporterIndex: 3,
      assignedTechIndex: 2, // Ananya
      resolutionNote: 'Faulty 10m high-speed HDMI cable behind the wall faceplate replaced. Video and audio test passed with 1080p source.',
      resolvedAgoDays: 5,
      closed: true,
    },
    {
      title: 'Washroom Shower Head Detached in Hostel 1',
      description: 'The showerhead in the second floor communal washroom broke off at the threaded elbow joint, spraying water directly into the light fitting.',
      category: 'Plumbing',
      buildingIndex: 3,
      locationIndex: 10,
      specificArea: 'Cubicle 2 shower stall',
      priority: 'HIGH',
      status: 'REOPENED',
      reporterIndex: 0,
      assignedTechIndex: 1,
      reopenReason: 'The replacement fixture started leaking around the seal again after 2 hours of use. Water pressure causes it to drip.',
    },
    {
      title: 'Main Entrance Magnetic Access Card Reader Beeping Constantly',
      description: 'The RFID badge scanner at the Server & Rack room basement entrance is beeping continuously and not unlocking the electromagnetic strike.',
      category: 'Security & Safety',
      buildingIndex: 1,
      locationIndex: 7,
      specificArea: 'Basement server room secure double door',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      reporterIndex: 2,
      assignedTechIndex: 2,
    },
    {
      title: 'Spilled Beverage Left Sticky Residue on Carpet',
      description: 'A large dark stain and sticky sugary residue on the carpet near the entrance of the Main Reading Room in the library.',
      category: 'Cleanliness',
      buildingIndex: 2,
      locationIndex: 7,
      specificArea: 'Aisle 3 carpeted floor',
      priority: 'LOW',
      status: 'REPORTED',
      reporterIndex: 1,
    },
    {
      title: 'Exhaust Fume Hood Velocity Sensor Alarm Beeping in Lab 210',
      description: 'The fume hood velocity monitor is indicating face velocity below 80 FPM and triggering the loud audible buzzer.',
      category: 'Laboratory Equipment',
      buildingIndex: 1,
      locationIndex: 5,
      specificArea: 'Fume Hood Bay #4',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      reporterIndex: 3,
      assignedTechIndex: 0,
    },
    {
      title: 'Gymnasium Treadmill #3 Emergency Stop Button Sticking',
      description: 'The magnetic safety key clamp is fine, but the physical red mushroom button on Treadmill 3 does not reset smoothly after being pressed.',
      category: 'Furniture',
      buildingIndex: 6,
      locationIndex: 15,
      specificArea: 'Cardio equipment zone treadmill 3',
      priority: 'MEDIUM',
      status: 'REPORTED',
      reporterIndex: 0,
    },
    {
      title: 'Ethernet Wall Port Broken in Computer Lab 204',
      description: 'The RJ45 clip housing on Jack 18 has snapped off. Patch cables slip right out whenever a student slightly nudges the desk.',
      category: 'Internet & Network',
      buildingIndex: 0,
      locationIndex: 1,
      specificArea: 'Workstation 18 lower wall jack',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      reporterIndex: 0,
      assignedTechIndex: 2,
      resolutionNote: 'Re-punched a new Cat6 keystone jack and installed faceplate. Cable certifier verified gigabit speeds.',
      resolvedAgoDays: 7,
      closed: true,
    },
    {
      title: 'Cafeteria Handwash Basin Drain Backing Up',
      description: 'Water drains very slowly from the twin stainless basins near the dining entrance, creating a backup during peak lunch hours.',
      category: 'Plumbing',
      buildingIndex: 5,
      locationIndex: 13,
      specificArea: 'Patron handwash station right basin',
      priority: 'HIGH',
      status: 'ASSIGNED',
      reporterIndex: 1,
      assignedTechIndex: 1,
    },
    {
      title: 'Classroom 101 Wall Clock Stopped at 3:15',
      description: 'The analog wall clock has run out of battery. Both students and professors rely on it during timed in-class quizzes.',
      category: 'Classroom Equipment',
      buildingIndex: 0,
      locationIndex: 0,
      specificArea: 'Front wall above whiteboard',
      priority: 'LOW',
      status: 'RESOLVED',
      reporterIndex: 0,
      assignedTechIndex: 0,
      resolutionNote: 'Replaced AA alkaline battery and synchronized time to standard atomic time.',
      resolvedAgoDays: 10,
      closed: true,
    },
    {
      title: 'Outdoor Patio Light Pole Fixture Lens Cracked',
      description: 'Heavy wind branch impact cracked the glass weather enclosure on pole light 4 outside the cafeteria patio.',
      category: 'Electrical',
      buildingIndex: 5,
      locationIndex: 14,
      specificArea: 'Patio lamp post #4',
      priority: 'MEDIUM',
      status: 'REPORTED',
      reporterIndex: 2,
    },
  ];

  for (const s of sampleIssues) {
    const reporter = reporters[s.reporterIndex];
    const category = categoryMap[s.category] || categoryMap['Electrical'];
    const location = locationList[s.locationIndex] || locationList[0];

    // Check if issue with this title already exists
    let issue = await prisma.issue.findFirst({
      where: { title: s.title, reporterId: reporter.id },
    });

    if (!issue) {
      const resolvedAtDate = s.status === 'RESOLVED' || s.closed
        ? new Date(Date.now() - (s.resolvedAgoDays || 1) * 24 * 60 * 60 * 1000)
        : null;

      const closedAtDate = s.closed ? new Date(Date.now() - (s.resolvedAgoDays - 1 || 0.5) * 24 * 60 * 60 * 1000) : null;
      const reopenedAtDate = s.status === 'REOPENED' ? new Date() : null;

      issue = await prisma.issue.create({
        data: {
          title: s.title,
          description: s.description,
          reporterId: reporter.id,
          categoryId: category.id,
          locationId: location.id,
          specificArea: s.specificArea,
          priority: s.priority,
          status: s.closed ? 'CLOSED' : s.status,
          resolutionNote: s.resolutionNote || null,
          resolvedAt: resolvedAtDate,
          closedAt: closedAtDate,
          reopenedAt: reopenedAtDate,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Created 2 weeks ago
        },
      });

      // Initial history
      await prisma.issueHistory.create({
        data: {
          issueId: issue.id,
          userId: reporter.id,
          action: 'CREATED',
          fromStatus: null,
          toStatus: 'REPORTED',
          description: `Issue reported by ${reporter.name}`,
          createdAt: issue.createdAt,
        },
      });

      // Assignment if applicable
      if (s.assignedTechIndex !== undefined) {
        const tech = technicians[s.assignedTechIndex];
        const isCompleted = ['RESOLVED', 'CLOSED'].includes(issue.status);

        await prisma.issueAssignment.create({
          data: {
            issueId: issue.id,
            technicianId: tech.id,
            assignedById: admin.id,
            status: isCompleted ? 'COMPLETED' : 'ACTIVE',
            assignedAt: new Date(issue.createdAt.getTime() + 2 * 60 * 60 * 1000),
            completedAt: resolvedAtDate,
          },
        });

        await prisma.issueHistory.create({
          data: {
            issueId: issue.id,
            userId: admin.id,
            action: 'ASSIGNED',
            fromStatus: 'REPORTED',
            toStatus: 'ASSIGNED',
            description: `Assigned to technician ${tech.name} by ${admin.name}`,
            createdAt: new Date(issue.createdAt.getTime() + 2 * 60 * 60 * 1000),
          },
        });

        if (['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'].includes(issue.status)) {
          await prisma.issueHistory.create({
            data: {
              issueId: issue.id,
              userId: tech.id,
              action: 'STATUS_CHANGED',
              fromStatus: 'ASSIGNED',
              toStatus: 'IN_PROGRESS',
              description: `Work started by ${tech.name}`,
              createdAt: new Date(issue.createdAt.getTime() + 4 * 60 * 60 * 1000),
            },
          });
        }

        if (s.resolutionNote) {
          await prisma.issueHistory.create({
            data: {
              issueId: issue.id,
              userId: tech.id,
              action: 'RESOLVED',
              fromStatus: 'IN_PROGRESS',
              toStatus: 'RESOLVED',
              description: `Resolved: "${s.resolutionNote}"`,
              createdAt: resolvedAtDate,
            },
          });

          // Add a technician comment
          await prisma.issueComment.create({
            data: {
              issueId: issue.id,
              userId: tech.id,
              message: `Completed repair and testing. Note: ${s.resolutionNote}`,
              isInternal: false,
              createdAt: resolvedAtDate,
            },
          });
        }

        if (s.closed) {
          await prisma.issueHistory.create({
            data: {
              issueId: issue.id,
              userId: reporter.id,
              action: 'CLOSED',
              fromStatus: 'RESOLVED',
              toStatus: 'CLOSED',
              description: `Confirmed repaired and closed by ${reporter.name}`,
              createdAt: closedAtDate,
            },
          });
        }

        if (s.reopenReason) {
          await prisma.issueHistory.create({
            data: {
              issueId: issue.id,
              userId: reporter.id,
              action: 'REOPENED',
              fromStatus: 'RESOLVED',
              toStatus: 'REOPENED',
              description: `Reopened by ${reporter.name}: "${s.reopenReason}"`,
              createdAt: reopenedAtDate,
            },
          });

          await prisma.issueComment.create({
            data: {
              issueId: issue.id,
              userId: reporter.id,
              message: s.reopenReason,
              isInternal: false,
              createdAt: reopenedAtDate,
            },
          });
        }
      }
    }
  }

  // 7. Seed Sample Notifications
  const sampleNotifications = [
    {
      userId: technicians[0].id,
      title: 'New Issue Assignment',
      message: 'You have been assigned to issue: "Classroom 101 Wall Clock Stopped at 3:15"',
    },
    {
      userId: reporters[0].id,
      title: 'Issue Status Updated',
      message: 'Your report "Ceiling Fluorescent Light Flickering Rapidly" was received and is pending technician dispatch.',
    },
    {
      userId: reporters[1].id,
      title: 'Issue Assigned',
      message: 'Your plumbing report has been assigned to Technician Suresh Kumar.',
    },
  ];

  for (const n of sampleNotifications) {
    const existing = await prisma.notification.findFirst({
      where: { userId: n.userId, title: n.title },
    });
    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: n.userId,
          title: n.title,
          message: n.message,
          isRead: false,
        },
      });
    }
  }

  console.log('--- CampusFix Database Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
