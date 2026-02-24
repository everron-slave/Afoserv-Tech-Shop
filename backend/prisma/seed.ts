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

  // Create sample products (based on current AFORSEV Canvas website)
  const products = [
    // Laptops
    {
      name: 'Premium Laptop Pro',
      description: 'High-performance laptop for professionals with 16GB RAM, 1TB SSD, and 4K display.',
      price: 1299.99,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 25,
      featured: true,
    },
    {
      name: 'Gaming Laptop Extreme',
      description: 'Powerful gaming laptop with RTX 4070, 32GB RAM, and 240Hz refresh rate.',
      price: 2199.99,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 15,
      featured: true,
    },
    {
      name: 'Ultrabook Slim',
      description: 'Lightweight and portable laptop with all-day battery life.',
      price: 899.99,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 30,
      featured: false,
    },
    {
      name: 'Business Laptop Elite',
      description: 'Secure business laptop with fingerprint reader and enterprise features.',
      price: 1499.99,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 20,
      featured: false,
    },

    // Smartphones
    {
      name: 'Flagship Phone X',
      description: 'Latest flagship smartphone with advanced camera and 5G connectivity.',
      price: 999.99,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 50,
      featured: true,
    },
    {
      name: 'Gaming Phone Pro',
      description: 'Dedicated gaming smartphone with high refresh rate display and cooling system.',
      price: 799.99,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 30,
      featured: false,
    },
    {
      name: 'Budget Phone Lite',
      description: 'Affordable smartphone with great features for everyday use.',
      price: 299.99,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 100,
      featured: false,
    },
    {
      name: 'Foldable Phone Z',
      description: 'Innovative foldable smartphone with flexible display.',
      price: 1799.99,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 10,
      featured: true,
    },

    // Accessories
    {
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling wireless headphones with 30-hour battery.',
      price: 199.99,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 75,
      featured: true,
    },
    {
      name: 'Smart Watch Pro',
      description: 'Feature-rich smartwatch with health monitoring and GPS.',
      price: 349.99,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 40,
      featured: true,
    },
    {
      name: 'USB-C Hub',
      description: 'Multi-port USB-C hub with 4K HDMI, Ethernet, and card readers.',
      price: 79.99,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 120,
      featured: false,
    },
    {
      name: 'Portable Power Bank',
      description: 'High-capacity 20000mAh power bank with fast charging.',
      price: 59.99,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      stock: 200,
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