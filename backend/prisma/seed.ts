import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - use with caution in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aforsev.com' },
    update: {},
    create: {
      email: 'admin@aforsev.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      phone: '+1234567890',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('User123!', 12);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: userPassword,
      name: 'John Doe',
      phone: '+1987654321',
      role: 'USER',
      emailVerified: true,
    },
  });

  // Create sample products (based on current AFORSEV homepage products)
  const products = [
    // UBIQUITI Products
    {
      name: 'Ubiquiti UniFi Dream Machine Pro',
      description: 'Enterprise-grade security gateway with network controller',
      price: 379,
      category: 'UBIQUITI',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBBxHiae8lQEwz6d0l881cbrh8Q6rgGklJosWPrD18cw&s',
      stock: 15,
      featured: true,
    },
    {
      name: 'Ubiquiti UniFi 6 Lite Access Point',
      description: 'Wi-Fi 6 access point for high-density environments',
      price: 99,
      category: 'UBIQUITI',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgcNSiCsmH7XnsIEwgqPOy1n1p5L8UwoTTBg&s',
      stock: 25,
      featured: false,
    },
    {
      name: 'Ubiquiti UniFi Switch 24 PoE',
      description: '24-port Gigabit PoE+ managed switch',
      price: 299,
      category: 'UBIQUITI',
      imageUrl: 'https://images.svc.ui.com/?u=https%3A%2F%2Fcdn.ecomm.ui.com%2Fproducts%2F467359c4-e5c3-487b-ae00-f6b7de29c6fc%2Fc719c8e0-8958-4255-82e8-a966e35c9fd1.png&q=75&w=3840',
      stock: 10,
      featured: false,
    },
    {
      name: 'Ubiquiti UniFi Protect Camera G4 Pro',
      description: '4K outdoor security camera with AI detection',
      price: 449,
      category: 'UBIQUITI',
      imageUrl: 'https://www.netxl.com/_next/image/?url=https%3A%2F%2Fstorage.googleapis.com%2Fnxl-content%2Fubiquiti%2Fuvc-g4-pro-3-pack-image-1-.jpg&w=2560&q=75',
      stock: 8,
      featured: false,
    },

    // HDD Products
    {
      name: 'Seagate IronWolf 8TB NAS HDD',
      description: 'Network-attached storage hard drive, 7200 RPM',
      price: 199,
      category: 'HDD',
      imageUrl: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&h=600&fit=crop',
      stock: 20,
      featured: true,
    },
    {
      name: 'Western Digital Black 4TB Performance HDD',
      description: 'High-performance desktop hard drive',
      price: 149,
      category: 'HDD',
      imageUrl: 'https://i.pcmag.com/imagery/reviews/06JIS9vlECVO3EWbYjQwqtC-5..v1569479740.jpg',
      stock: 30,
      featured: false,
    },
    {
      name: 'Toshiba N300 6TB NAS HDD',
      description: '7200 RPM NAS-optimized hard drive',
      price: 159,
      category: 'HDD',
      imageUrl: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&h=600&fit=crop',
      stock: 18,
      featured: false,
    },
    {
      name: 'Seagate BarraCuda 2TB Desktop HDD',
      description: 'Reliable storage for everyday computing',
      price: 69,
      category: 'HDD',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfFUW8sZA7j-KJMX1lygWwVKm56T9u0JYRiA&s',
      stock: 40,
      featured: false,
    },

    // APPLE Products
    {
      name: 'MacBook Pro 16" M3 Pro',
      description: 'Apple M3 Pro chip, 36GB RAM, 1TB SSD',
      price: 2499,
      category: 'APPLE',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
      stock: 12,
      featured: true,
    },
    {
      name: 'iPhone 15 Pro Max 256GB',
      description: 'Titanium design, A17 Pro chip, 5x telephoto',
      price: 1199,
      category: 'APPLE',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600&fit=crop',
      stock: 25,
      featured: false,
    },
    {
      name: 'iPad Pro 12.9" M2',
      description: 'Liquid Retina XDR display, 1TB storage',
      price: 1499,
      category: 'APPLE',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop',
      stock: 15,
      featured: false,
    },
    {
      name: 'Apple Watch Ultra 2',
      description: 'Rugged smartwatch with advanced fitness features',
      price: 799,
      category: 'APPLE',
      imageUrl: 'https://images.unsplash.com/photo-1434493650001-5d43a6fea0a6?w=800&h=600&fit=crop',
      stock: 20,
      featured: false,
    },

    // HPE AURA SWITCHES Products
    {
      name: 'HPE Aruba 2930F 48G PoE+ Switch',
      description: '48-port Gigabit PoE+ switch with Layer 3 features',
      price: 1899,
      category: 'HPE AURA SWITCHES',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtowPh93yDqldf0cGu-b7p2FetGvnHwnyEwQ&s',
      stock: 8,
      featured: true,
    },
    {
      name: 'HPE Aruba 6300 24-port Switch',
      description: 'High-performance campus core and aggregation switch',
      price: 2999,
      category: 'HPE AURA SWITCHES',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTC47ZeId5fcFMgUZZcgoD_lUNsVaB1ySnsw&s',
      stock: 5,
      featured: false,
    },
    {
      name: 'HPE Aruba 3810 48-port Switch',
      description: 'Modular switch for enterprise networks',
      price: 3499,
      category: 'HPE AURA SWITCHES',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPtWqU4qWZ-DwKlmOQr7XLFMP-r1HY0CV0tQ&s',
      stock: 4,
      featured: false,
    },
    {
      name: 'HPE Aruba 2540 24G PoE+ Switch',
      description: 'Easy-to-manage access layer switch',
      price: 899,
      category: 'HPE AURA SWITCHES',
      imageUrl: 'https://www.menke-it.de/media/7a/81/5e/1669297953/JL356A-REF-02.jpeg',
      stock: 12,
      featured: false,
    },

    // PROJECTORS Products
    {
      name: 'Acer H6542BDi Projector, 1920 x 1080 Full HD, 5200 Lumen',
      description: 'High-brightness Full HD home cinema projector using DLP technology with Dynamic Black, 100% Rec709 coverage, automatic keystone correction, 3D mode, football mode, included wireless dongle, integrated speaker, and compact lightweight design.',
      price: 700,
      category: 'PROJECTORS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000028513/en/acer/Acer-H6542BDi-Projector-1920-x-1080-Full-HD-5200-Lumen.webp',
      stock: 10,
      featured: true,
    },
    {
      name: 'Acer HL6542i Full HD Gaming Laser Projector',
      description: 'Gaming-focused Full HD laser projector with 240Hz refresh rate, 1ms low input lag, VRR support, 4000 ANSI lumens, up to 30,000-hour laser life, 360° projection, optional wireless casting, and dust-resistant design.',
      price: 900,
      category: 'PROJECTORS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000037117/en/acer/Acer-HL6542i-Full-HD-Gaming-Laser-Projector.webp',
      stock: 8,
      featured: false,
    },

    // SCREENS Products
    {
      name: 'celexon HomeCinema UST high contrast framed screen BrightOnyx, 100"',
      description: 'Premium fixed-frame ultra short throw high-contrast projection screen using BrightOnyx 9-layer surface technology. Combines Fresnel and CLR advantages with strong ambient light rejection, deep blacks, wide viewing angle, high colour fidelity, and slim display-style frame for Laser TV setups.',
      price: 1500,
      category: 'SCREENS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000030628/en/celexon/celexon-HomeCinema-UST-high-contrast-framed-screen-BrightOnyx-100.webp',
      stock: 8,
      featured: true,
    },
    {
      name: 'celexon CLR HomeCinema Plus UST High Contrast Electric Floor Projector Screen 100"',
      description: 'Motorized floor-rising ultra short throw CLR high-contrast projector screen designed for Laser TV installations. Retractable cabinet design, electric flap opening, remote control, trigger automation, tensioned fabric, wide viewing angle and furniture-friendly installation.',
      price: 2000,
      category: 'SCREENS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000025597/en/celexon/celexon-CLR-HomeCinema-Plus-UST-High-Contrast-Electric-Floor-Projector-Screen-100-Black.webp',
      stock: 6,
      featured: false,
    },

    // DISPLAYS Products
    {
      name: 'ViewSonic ViewBoard IFP8634 EDLA-certified 86" 4K interactive display',
      description: '86-inch 4K interactive touch display designed for classrooms and meeting spaces. Features Android 14 with EDLA certification, Google Play access, Ultra-Fine Touch with 40 touch points, dual USB-C connectivity, integrated collaboration tools, wireless AirSync casting, and centralized device management.',
      price: 5000,
      category: 'DISPLAYS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000034934/en/viewsonic/ViewSonic-ViewBoard-IFP8634-EDLA-certified-86-4K-interactive-display.webp',
      stock: 5,
      featured: true,
    },
    {
      name: 'Kindermann TD-1286 86" 4K touch display with Google EDLA-certified Android 14',
      description: '86-inch 4K collaborative touch display for education and business use. Includes Google EDLA-certified Android 14, 50 touch points, antibacterial front glass, 8-core SoC, 8GB RAM, 128GB storage, Wi-Fi 6, Bluetooth, dual USB-C, integrated 60W 2.1 sound system, and wireless screen sharing.',
      price: 3750,
      category: 'DISPLAYS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000035554/en/kindermann/Kindermann-TD-1286-86-4K-touch-display-with-Google-EDLA-certified-Android-14.webp',
      stock: 7,
      featured: false,
    },

    // MONITORS Products
    {
      name: 'LG 27BA400-B 27" IPS Monitor, 1920 x 1080 Full HD',
      description: '27-inch Full HD IPS business monitor designed for office, customer service, and productivity environments. Features 100Hz refresh rate, integrated speakers, wide viewing angles, eye-care modes including Low Blue Light and Flicker Safe, and slim near-borderless design.',
      price: 236,
      category: 'MONITORS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000033146/en/lg/LG-27BA400-B-27-Monitor.webp',
      stock: 15,
      featured: true,
    },
    {
      name: 'Samsung 27" Odyssey G90XF 4K Gaming Monitor',
      description: '27-inch 4K gaming monitor featuring glasses-free 3D with eye-tracking and view-mapping technology. Includes AI 2D-to-3D conversion, 165Hz refresh rate, 1ms response time, HDR10+, AMD FreeSync Premium, G-Sync support, and integrated speakers with spatial audio.',
      price: 2500,
      category: 'MONITORS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000034861/en/samsung/Samsung-27-Odyssey-G90XF-4K-Gaming-Monitor.webp',
      stock: 8,
      featured: false,
    },

    // LED WALLS Products
    {
      name: 'LG LAEC015-GN2 LED All-In-One',
      description: '136-inch all-in-one LED wall built for corporate presentations, conference rooms, and premium commercial spaces. Includes integrated speakers, built-in control system, webOS smart platform, quad-core SoC, LG One:Quick Share wireless casting, simple two-cabinet installation, magnetic front maintenance, and optional motorized stand support.',
      price: 32000,
      category: 'LED WALLS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000026397/en/lg/LG-LAEC015-GN2-LED-All-In-One.webp',
      stock: 3,
      featured: true,
    },
    {
      name: 'Samsung Indoor LED All-in-One IAC Series IA015C',
      description: '130-inch all-in-one indoor LED wall designed for meeting rooms, boardrooms, and high-impact business displays. Features Samsung Quick Build installation, integrated control box, built-in speakers, LED HDR processing, Dynamic Peaking image optimization, matte finish, and simplified turnkey deployment.',
      price: 23000,
      category: 'LED WALLS',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000029743/en/samsung/Samsung-Indoor-LED-All-in-One-IAC-Series-IA015C.webp',
      stock: 4,
      featured: false,
    },

    // VIDEO CONFERENCING Products
    {
      name: 'Poly Studio X72 Video Conferencing System',
      description: 'All-in-one premium video conferencing bar for medium to large meeting rooms. Integrates camera, microphones, speakers, and native conferencing app support. Designed for Microsoft Teams Rooms, Zoom Rooms, and BYOD collaboration environments.',
      price: 7100,
      category: 'VIDEO CONFERENCING',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000034323/en/poly/Poly-Studio-X72-Premium-All-In-One-video-bar-for-large-conference-rooms.webp',
      stock: 6,
      featured: true,
    },
    {
      name: 'celexon VKS2040 PTZ Camera, 1920 x 1080 Full HD, 2.1 MP, 30 fps, 72°',
      description: 'Full HD PTZ video conferencing system for small to medium meeting rooms. Includes motorized pan/tilt/zoom camera, speakerphone module, 10x optical zoom, autofocus, remote presets, plug-and-play USB connectivity, and integrated echo cancellation/noise reduction.',
      price: 500,
      category: 'VIDEO CONFERENCING',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000016010/en/celexon/celexon-PTZ-camera-Full-HD-video-conferencing-system-VKS2040.webp',
      stock: 12,
      featured: false,
    },

    // AUDIO Products
    {
      name: 'celexon Active speaker set 2-way 525-W',
      description: 'Compact active/passive 2-way speaker set for conference rooms, classrooms, and small presentation spaces. Connects directly to audio sources without external amplifier. Features Class-D amplification, bass reflex tuning, adjustable bass/treble/volume controls, and included wall mounts.',
      price: 125,
      category: 'AUDIO',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000003391/en/celexon/celexon-Active-speaker-set-2-way-525-W.webp',
      stock: 20,
      featured: true,
    },
    {
      name: 'Hisense HT Saturn 4.1.2 channel wireless home cinema speaker system',
      description: 'Premium wireless 4.1.2 home cinema speaker system with Dolby Atmos and DTS:X. Includes four wireless satellite speakers, wireless subwoofer, central connection hub, Devialet tuning, Bluetooth 5.3, room optimization features, and up to 720W total system power.',
      price: 999,
      category: 'AUDIO',
      imageUrl: 'https://images.visunextgroup.com/images/D/750/1/1000035243/en/hisense/Hisense-HT-Saturn-4-1-2-channel-wireless-home-cinema-speaker-system-for-cinema-quality-3D-sound-at-home.webp',
      stock: 8,
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
    console.log(`✅ Created product: ${product.name}`);
  }

  console.log('🎉 Database seeding completed!');
  console.log(`👤 Admin user: ${adminUser.email} / Admin123!`);
  console.log(`👤 Regular user: ${regularUser.email} / User123!`);
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });