/**
 * Database Seed Script
 * 
 * Populates the database with initial test data for development.
 * Run with: npx prisma db seed
 */

import { PrismaClient, Category, CheckInStatus, VoucherType, VoucherStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (development only!)
  await prisma.webVital.deleteMany();
  await prisma.errorLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.place.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-001',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        username: 'alice',
        email: 'alice@zzik.app',
        displayName: 'Alice Kim',
        bio: '서울 맛집 탐험가',
        level: 5,
        totalPoints: 1250,
        currentStreak: 7,
        longestStreak: 15,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-002',
        walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        username: 'bob',
        email: 'bob@zzik.app',
        displayName: 'Bob Lee',
        bio: '카페 러버',
        level: 3,
        totalPoints: 580,
        currentStreak: 3,
        longestStreak: 8,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-003',
        walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
        username: 'charlie',
        displayName: 'Charlie Park',
        level: 1,
        totalPoints: 50,
        currentStreak: 1,
        longestStreak: 1,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} test users`);

  // Create places in Seoul Gangnam area
  const places = await Promise.all([
    prisma.place.create({
      data: {
        id: 'place-001',
        name: 'DropTop Seoul',
        category: Category.CAFE,
        latitude: 37.4979,
        longitude: 127.0276,
        addressFull: '서울특별시 강남구 테헤란로 123',
        addressCity: '서울',
        addressDistrict: '강남구',
        addressCountry: 'KR',
        wifiSsids: ['DropTop_Guest', 'DropTop_5G'],
        description: '루프탑 카페 with amazing city views',
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
        websiteUrl: 'https://droptop.kr',
        phoneNumber: '02-1234-5678',
        operatingHours: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '23:00' },
          saturday: { open: '10:00', close: '23:00' },
          sunday: { open: '10:00', close: '22:00' },
        },
        totalCheckIns: 156,
        averageRating: 4.5,
        isActive: true,
        isVerified: true,
      },
    }),
    prisma.place.create({
      data: {
        id: 'place-002',
        name: 'Gangnam BBQ House',
        category: Category.RESTAURANT,
        latitude: 37.4983,
        longitude: 127.0282,
        addressFull: '서울특별시 강남구 강남대로 456',
        addressCity: '서울',
        addressDistrict: '강남구',
        addressCountry: 'KR',
        wifiSsids: ['GangnamBBQ_Guest'],
        description: '정통 한국 고기집',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        phoneNumber: '02-2345-6789',
        operatingHours: {
          monday: { open: '11:00', close: '23:00' },
          tuesday: { open: '11:00', close: '23:00' },
          wednesday: { open: '11:00', close: '23:00' },
          thursday: { open: '11:00', close: '23:00' },
          friday: { open: '11:00', close: '00:00' },
          saturday: { open: '11:00', close: '00:00' },
          sunday: { open: '11:00', close: '23:00' },
        },
        totalCheckIns: 89,
        averageRating: 4.7,
        isActive: true,
        isVerified: true,
      },
    }),
    prisma.place.create({
      data: {
        id: 'place-003',
        name: 'Seoul Fashion Mall',
        category: Category.RETAIL,
        latitude: 37.4990,
        longitude: 127.0260,
        addressFull: '서울특별시 강남구 논현로 789',
        addressCity: '서울',
        addressDistrict: '강남구',
        addressCountry: 'KR',
        wifiSsids: ['FashionMall_Free'],
        description: 'Latest Korean fashion trends',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
        websiteUrl: 'https://seoulflashion.kr',
        phoneNumber: '02-3456-7890',
        operatingHours: {
          monday: { open: '10:30', close: '22:00' },
          tuesday: { open: '10:30', close: '22:00' },
          wednesday: { open: '10:30', close: '22:00' },
          thursday: { open: '10:30', close: '22:00' },
          friday: { open: '10:30', close: '22:30' },
          saturday: { open: '10:00', close: '22:30' },
          sunday: { open: '10:00', close: '22:00' },
        },
        totalCheckIns: 234,
        averageRating: 4.3,
        isActive: true,
        isVerified: true,
      },
    }),
    prisma.place.create({
      data: {
        id: 'place-004',
        name: 'K-Pop Dance Studio',
        category: Category.ENTERTAINMENT,
        latitude: 37.4975,
        longitude: 127.0290,
        addressFull: '서울특별시 강남구 역삼로 321',
        addressCity: '서울',
        addressDistrict: '강남구',
        addressCountry: 'KR',
        wifiSsids: ['KPopStudio_Guest'],
        description: 'Learn K-Pop dance from pros',
        imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e',
        websiteUrl: 'https://kpopdance.kr',
        phoneNumber: '02-4567-8901',
        operatingHours: {
          monday: { open: '10:00', close: '22:00' },
          tuesday: { open: '10:00', close: '22:00' },
          wednesday: { open: '10:00', close: '22:00' },
          thursday: { open: '10:00', close: '22:00' },
          friday: { open: '10:00', close: '23:00' },
          saturday: { open: '09:00', close: '23:00' },
          sunday: { open: '09:00', close: '21:00' },
        },
        totalCheckIns: 67,
        averageRating: 4.8,
        isActive: true,
        isVerified: true,
      },
    }),
    prisma.place.create({
      data: {
        id: 'place-005',
        name: 'Coex Artium',
        category: Category.ENTERTAINMENT,
        latitude: 37.5126,
        longitude: 127.0592,
        addressFull: '서울특별시 강남구 영동대로 513',
        addressCity: '서울',
        addressDistrict: '강남구',
        addressCountry: 'KR',
        wifiSsids: ['COEX_Free', 'COEX_5G'],
        description: 'Starfield Library & Cultural Space',
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
        websiteUrl: 'https://coex.co.kr',
        phoneNumber: '02-6000-0114',
        operatingHours: {
          monday: { open: '10:00', close: '22:00' },
          tuesday: { open: '10:00', close: '22:00' },
          wednesday: { open: '10:00', close: '22:00' },
          thursday: { open: '10:00', close: '22:00' },
          friday: { open: '10:00', close: '22:00' },
          saturday: { open: '10:00', close: '22:00' },
          sunday: { open: '10:00', close: '22:00' },
        },
        totalCheckIns: 892,
        averageRating: 4.9,
        isActive: true,
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${places.length} test places`);

  // Create check-ins
  const checkIns = await Promise.all([
    prisma.checkIn.create({
      data: {
        id: 'checkin-001',
        userId: 'user-001',
        placeId: 'place-001',
        status: CheckInStatus.APPROVED,
        latitude: 37.4979,
        longitude: 127.0276,
        accuracy: 5.0,
        integrityScore: 85,
        distanceScore: 40,
        wifiScore: 25,
        timeScore: 15,
        accuracyScore: 5,
        speedScore: 0,
        wifiData: { ssids: ['DropTop_Guest', 'DropTop_5G'] },
        distanceMeters: 3.5,
        approvedAt: new Date(),
      },
    }),
    prisma.checkIn.create({
      data: {
        id: 'checkin-002',
        userId: 'user-002',
        placeId: 'place-002',
        status: CheckInStatus.APPROVED,
        latitude: 37.4983,
        longitude: 127.0282,
        accuracy: 8.0,
        integrityScore: 78,
        distanceScore: 38,
        wifiScore: 25,
        timeScore: 15,
        accuracyScore: 0,
        speedScore: 0,
        wifiData: { ssids: ['GangnamBBQ_Guest'] },
        distanceMeters: 5.2,
        approvedAt: new Date(),
      },
    }),
    prisma.checkIn.create({
      data: {
        id: 'checkin-003',
        userId: 'user-001',
        placeId: 'place-003',
        status: CheckInStatus.REJECTED,
        latitude: 37.5020,
        longitude: 127.0300,
        accuracy: 15.0,
        integrityScore: 45,
        distanceScore: 20,
        wifiScore: 0,
        timeScore: 15,
        accuracyScore: 0,
        speedScore: 10,
        wifiData: null,
        distanceMeters: 350.0,
        rejectedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${checkIns.length} test check-ins`);

  // Create vouchers for approved check-ins
  const vouchers = await Promise.all([
    prisma.voucher.create({
      data: {
        id: 'voucher-001',
        userId: 'user-001',
        placeId: 'place-001',
        checkInId: 'checkin-001',
        type: VoucherType.PERCENTAGE,
        value: 15.0,
        description: '15% off any drink',
        status: VoucherStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    }),
    prisma.voucher.create({
      data: {
        id: 'voucher-002',
        userId: 'user-002',
        placeId: 'place-002',
        checkInId: 'checkin-002',
        type: VoucherType.FIXED,
        value: 5000.0,
        description: '₩5,000 discount',
        status: VoucherStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    }),
  ]);

  console.log(`✅ Created ${vouchers.length} test vouchers`);

  // Create reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: 'user-001',
        placeId: 'place-001',
        rating: 5,
        title: 'Amazing rooftop views!',
        content: 'The best rooftop cafe in Gangnam. Great coffee and atmosphere.',
        imageUrls: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb'],
        isApproved: true,
        helpfulCount: 12,
      },
    }),
    prisma.review.create({
      data: {
        userId: 'user-002',
        placeId: 'place-002',
        rating: 5,
        title: '최고의 고기집',
        content: '삼겹살이 정말 맛있어요. 직원분들도 친절하시고 분위기도 좋습니다.',
        imageUrls: ['https://images.unsplash.com/photo-1544025162-d76694265947'],
        isApproved: true,
        helpfulCount: 8,
      },
    }),
    prisma.review.create({
      data: {
        userId: 'user-001',
        placeId: 'place-005',
        rating: 5,
        title: 'Starfield Library is stunning',
        content: 'A must-visit place in Seoul. The library is beautiful and there are many shops.',
        imageUrls: ['https://images.unsplash.com/photo-1521587760476-6c12a4b040da'],
        videoUrl: 'https://www.youtube.com/watch?v=example',
        isApproved: true,
        helpfulCount: 25,
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} test reviews`);

  // Update place statistics
  await prisma.place.update({
    where: { id: 'place-001' },
    data: { averageRating: 5.0, totalCheckIns: 157 },
  });

  await prisma.place.update({
    where: { id: 'place-002' },
    data: { averageRating: 5.0, totalCheckIns: 90 },
  });

  await prisma.place.update({
    where: { id: 'place-005' },
    data: { averageRating: 5.0, totalCheckIns: 893 },
  });

  console.log('✅ Updated place statistics');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Places: ${places.length}`);
  console.log(`   - Check-ins: ${checkIns.length}`);
  console.log(`   - Vouchers: ${vouchers.length}`);
  console.log(`   - Reviews: ${reviews.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
