/**
 * Database Seeding Script
 * Populates database with sample data for development
 */

import { PrismaClient, Category, CheckInStatus, VoucherType, VoucherStatus } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

/**
 * Sample users
 */
const sampleUsers = [
  {
    walletAddress: '0x1234567890123456789012345678901234567890',
    username: 'alice',
    email: 'alice@example.com',
    displayName: 'Alice Smith',
    bio: 'Love exploring new cafes and restaurants!',
    level: 5,
    totalPoints: 1250,
    currentStreak: 7,
    longestStreak: 15,
  },
  {
    walletAddress: '0x2345678901234567890123456789012345678901',
    username: 'bob',
    email: 'bob@example.com',
    displayName: 'Bob Johnson',
    bio: 'Foodie and coffee enthusiast',
    level: 3,
    totalPoints: 780,
    currentStreak: 3,
    longestStreak: 8,
  },
  {
    walletAddress: '0x3456789012345678901234567890123456789012',
    username: 'charlie',
    email: 'charlie@example.com',
    displayName: 'Charlie Brown',
    bio: 'Always on the hunt for the best deals',
    level: 7,
    totalPoints: 2340,
    currentStreak: 12,
    longestStreak: 20,
  },
];

/**
 * Sample places
 */
const samplePlaces = [
  {
    name: 'Cafe Mono',
    category: Category.CAFE,
    latitude: 37.5665,
    longitude: 126.9780,
    addressFull: '123 Main St, Seoul, South Korea',
    addressCity: 'Seoul',
    addressDistrict: 'Gangnam',
    wifiSsids: ['CafeMono_Guest', 'CafeMono_5G'],
    description: 'Minimalist cafe with great coffee and pastries',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
    websiteUrl: 'https://cafemono.example.com',
    phoneNumber: '+82-2-1234-5678',
    operatingHours: {
      monday: '08:00-22:00',
      tuesday: '08:00-22:00',
      wednesday: '08:00-22:00',
      thursday: '08:00-22:00',
      friday: '08:00-23:00',
      saturday: '09:00-23:00',
      sunday: '09:00-21:00',
    },
    totalCheckIns: 145,
    averageRating: 4.5,
    isActive: true,
    isVerified: true,
  },
  {
    name: 'Restaurant ABC',
    category: Category.RESTAURANT,
    latitude: 37.5700,
    longitude: 126.9800,
    addressFull: '456 Food St, Seoul, South Korea',
    addressCity: 'Seoul',
    addressDistrict: 'Gangnam',
    wifiSsids: ['RestaurantABC'],
    description: 'Traditional Korean restaurant with modern twist',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    totalCheckIns: 89,
    averageRating: 4.8,
    isActive: true,
    isVerified: true,
  },
  {
    name: 'Shop XYZ',
    category: Category.RETAIL,
    latitude: 37.5650,
    longitude: 126.9760,
    addressFull: '789 Shopping Ave, Seoul, South Korea',
    addressCity: 'Seoul',
    addressDistrict: 'Gangnam',
    wifiSsids: ['ShopXYZ_Free'],
    description: 'Fashion and lifestyle store',
    totalCheckIns: 67,
    averageRating: 4.2,
    isActive: true,
    isVerified: false,
  },
];

/**
 * Main seed function
 */
async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clean existing data (development only!)
  console.log('🗑️  Cleaning existing data...');
  await prisma.review.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.place.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  
  // Create users
  console.log('👥 Creating users...');
  const users = await Promise.all(
    sampleUsers.map((userData) =>
      prisma.user.create({
        data: userData,
      })
    )
  );
  console.log(`✅ Created ${users.length} users`);
  
  // Create places
  console.log('📍 Creating places...');
  const places = await Promise.all(
    samplePlaces.map((placeData) =>
      prisma.place.create({
        data: placeData,
      })
    )
  );
  console.log(`✅ Created ${places.length} places`);
  
  // Create check-ins
  console.log('✓ Creating check-ins...');
  const checkIns = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const place = places[i % places.length];
    
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: user.id,
        placeId: place.id,
        status: CheckInStatus.APPROVED,
        latitude: place.latitude,
        longitude: place.longitude,
        accuracy: 10.5,
        integrityScore: 95,
        distanceScore: 100,
        wifiScore: 100,
        timeScore: 90,
        accuracyScore: 95,
        speedScore: 100,
        distanceMeters: 5.2,
        wifiData: {
          networks: [
            { ssid: place.wifiSsids[0], signalStrength: -45 },
          ],
        },
        approvedAt: new Date(),
      },
    });
    
    checkIns.push(checkIn);
  }
  console.log(`✅ Created ${checkIns.length} check-ins`);
  
  // Create vouchers
  console.log('🎁 Creating vouchers...');
  const vouchers = [];
  
  for (let i = 0; i < checkIns.length; i++) {
    const checkIn = checkIns[i];
    
    const voucher = await prisma.voucher.create({
      data: {
        userId: checkIn.userId,
        placeId: checkIn.placeId,
        checkInId: checkIn.id,
        type: i % 2 === 0 ? VoucherType.PERCENTAGE : VoucherType.FIXED,
        value: i % 2 === 0 ? 10 : 5,
        description: i % 2 === 0 ? '10% off your next purchase' : '$5 off coupon',
        status: VoucherStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
    
    vouchers.push(voucher);
  }
  console.log(`✅ Created ${vouchers.length} vouchers`);
  
  // Create reviews
  console.log('⭐ Creating reviews...');
  const reviews = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const place = places[i % places.length];
    
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        placeId: place.id,
        rating: 4 + (i % 2),
        title: 'Great experience!',
        content: 'Really enjoyed my visit. Will definitely come back!',
        imageUrls: [],
        isApproved: true,
        isHidden: false,
        helpfulCount: i * 2,
      },
    });
    
    reviews.push(review);
  }
  console.log(`✅ Created ${reviews.length} reviews`);
  
  console.log('✨ Database seed completed!');
  console.log('\n📊 Summary:');
  console.log(`  - ${users.length} users`);
  console.log(`  - ${places.length} places`);
  console.log(`  - ${checkIns.length} check-ins`);
  console.log(`  - ${vouchers.length} vouchers`);
  console.log(`  - ${reviews.length} reviews`);
}

/**
 * Execute seed
 */
main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
