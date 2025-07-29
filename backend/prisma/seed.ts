import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a system user for seeded data
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@travelballhub.com' },
    update: {},
    create: {
      email: 'system@travelballhub.com',
      password: 'hashed_password',
      name: 'System',
      role: 'ADMIN'
    }
  });

  console.log('✅ Created/found system user:', systemUser.name);

  // Create global chat room
  const existingGlobalRoom = await prisma.chatRoom.findFirst({
    where: { name: 'General Discussion' }
  });
  
  const globalRoom = existingGlobalRoom || await prisma.chatRoom.create({
    data: {
      name: 'General Discussion',
      type: 'GLOBAL'
    }
  });

  console.log('✅ Created global chat room:', globalRoom.name);

  // Create state-specific chat rooms for popular baseball states
  const popularStates = [
    { code: 'CA', name: 'California' },
    { code: 'TX', name: 'Texas' },
    { code: 'FL', name: 'Florida' },
    { code: 'NY', name: 'New York' },
    { code: 'GA', name: 'Georgia' },
    { code: 'IL', name: 'Illinois' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'OH', name: 'Ohio' },
    { code: 'MI', name: 'Michigan' },
    { code: 'NC', name: 'North Carolina' }
  ];

  for (const state of popularStates) {
    const existingStateRoom = await prisma.chatRoom.findFirst({
      where: { name: `${state.name} Teams` }
    });
    
    const stateRoom = existingStateRoom || await prisma.chatRoom.create({
      data: {
        name: `${state.name} Teams`,
        type: 'STATE',
        state: state.code
      }
    });
    console.log('✅ Created state chat room:', stateRoom.name);
  }

  // Create tournaments
  const tournaments = [
    { name: 'Summer Classic Championship', location: 'Atlanta, GA', createdBy: systemUser.id },
    { name: 'National Travel Ball Showcase', location: 'Dallas, TX', createdBy: systemUser.id },
    { name: 'Fall Championship Series', location: 'Phoenix, AZ', createdBy: systemUser.id },
    { name: 'East Coast Elite Tournament', location: 'Virginia Beach, VA', createdBy: systemUser.id },
    { name: 'Midwest Championship', location: 'Kansas City, MO', createdBy: systemUser.id },
    { name: 'California Diamond Classic', location: 'San Diego, CA', createdBy: systemUser.id },
  ];

  for (const tournamentData of tournaments) {
    const existingTournament = await prisma.tournament.findFirst({
      where: { name: tournamentData.name }
    });
    
    if (!existingTournament) {
      const tournament = await prisma.tournament.create({
        data: tournamentData
      });
      console.log('✅ Created tournament:', tournament.name);
    }
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });