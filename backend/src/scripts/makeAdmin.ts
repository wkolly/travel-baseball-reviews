import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    // Find the user by email (update this to your email)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'will@korebaseball.com' },
          { name: 'william koelliker' }
        ]
      }
    });

    if (!user) {
      console.error('User not found');
      return;
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true }
    });

    console.log('✅ User updated to admin:', updatedUser);
    
    // Also approve any existing teams created by this user
    const approvedTeams = await prisma.team.updateMany({
      where: { 
        createdBy: user.id,
        status: 'pending'
      },
      data: { 
        status: 'approved',
        approvedBy: user.id,
        approvedAt: new Date()
      }
    });

    console.log(`✅ Approved ${approvedTeams.count} existing teams`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();