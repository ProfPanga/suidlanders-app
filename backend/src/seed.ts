import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Member } from './entities/member.entity';
import { TriageService } from './services/triage.service';

/**
 * Seed Script - Populate database with demo data for testing
 *
 * Creates members with different scenarios:
 * - Red Camp: Has chronic condition without medication
 * - Green Camp: Healthy or has medication
 */

const demoMembers = [
  {
    firstName: 'Pieter',
    lastName: 'van der Merwe',
    idNumber: '7801015800081',
    email: 'pieter@example.com',
    phone: '0821234567',
    familySize: 5,
    bloodType: 'A+',
    chronicConditions: 'Diabetes Type 2',
    medication: '', // RED CAMP - no medication!
    allergies: 'None',
  },
  {
    firstName: 'Johan',
    lastName: 'Botha',
    idNumber: '8205125800082',
    email: 'johan@example.com',
    phone: '0827654321',
    familySize: 3,
    bloodType: 'O+',
    chronicConditions: 'None',
    medication: 'None',
    allergies: 'Penicillin',
  },
  {
    firstName: 'Marie',
    lastName: 'du Plessis',
    idNumber: '9003135800083',
    email: 'marie@example.com',
    phone: '0829876543',
    familySize: 4,
    bloodType: 'B+',
    chronicConditions: 'None',
    medication: 'None',
    allergies: 'None',
  },
  {
    firstName: 'Susan',
    lastName: 'Kruger',
    idNumber: '7506155800084',
    email: 'susan@example.com',
    phone: '0823456789',
    familySize: 2,
    bloodType: 'AB-',
    chronicConditions: 'Hypertension',
    medication: '', // RED CAMP - no medication!
    allergies: 'None',
  },
  {
    firstName: 'Hendrik',
    lastName: 'Nel',
    idNumber: '8809015800085',
    email: 'hendrik@example.com',
    phone: '0825678901',
    familySize: 6,
    bloodType: 'O-',
    chronicConditions: 'None',
    medication: 'None',
    allergies: 'None',
  },
  {
    firstName: 'Anna',
    lastName: 'Venter',
    idNumber: '9212075800086',
    email: 'anna@example.com',
    phone: '0826789012',
    familySize: 3,
    bloodType: 'A-',
    chronicConditions: 'Asthma',
    medication: 'Ventolin inhaler', // GREEN CAMP - has medication
    allergies: 'Pollen',
  },
];

async function seed() {
  // Initialize SQLite connection
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'data/camp.db',
    entities: [Member],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('📦 Connected to SQLite database');

  const memberRepository = dataSource.getRepository(Member);
  const triageService = new TriageService();

  // Clear existing data
  await memberRepository.clear();
  console.log('🗑️  Cleared existing members');

  console.log('\n📥 Creating demo members...\n');

  // Create members with triage
  for (const memberData of demoMembers) {
    const member = memberRepository.create(memberData);

    // Perform triage
    const { campAssignment, triageReason } = triageService.performTriage(member);
    member.campAssignment = campAssignment;
    member.triageReason = triageReason;

    await memberRepository.save(member);

    const campEmoji = campAssignment === 'red' ? '🔴' : '🟢';
    console.log(
      `${campEmoji} ${member.firstName} ${member.lastName} → ${campAssignment.toUpperCase()} Camp (Family: ${member.familySize})`,
    );
  }

  console.log('\n✅ Seed data created successfully!');
  console.log(`📊 Total members: ${demoMembers.length}`);

  const redCount = demoMembers.filter(
    (m) => m.chronicConditions !== 'None' && (!m.medication || m.medication === ''),
  ).length;
  const greenCount = demoMembers.length - redCount;

  console.log(`🔴 Red Camp: ${redCount} members`);
  console.log(`🟢 Green Camp: ${greenCount} members`);

  console.log('\n💡 Start the backend: npm start');
  console.log('💡 Open Reception Dashboard: http://localhost:8100/reception\n');

  await dataSource.destroy();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
