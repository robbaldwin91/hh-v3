#!/usr/bin/env node
const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create a customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Premium Fruits Ltd',
    },
  });

  // Create a site
  const site = await prisma.site.create({
    data: {
      name: 'Main Processing Facility',
    },
  });

  // Create production lines
  const line1 = await prisma.productionLine.create({
    data: {
      name: 'Line 1 - Premium',
      siteId: site.id,
    },
  });

  const line2 = await prisma.productionLine.create({
    data: {
      name: 'Line 2 - Standard',
      siteId: site.id,
    },
  });

  // Create punnet sizes
  const small = await prisma.punnetSize.create({
    data: {
      name: '125g',
      sizeGrams: 125,
    },
  });

  const medium = await prisma.punnetSize.create({
    data: {
      name: '250g',
      sizeGrams: 250,
    },
  });

  const large = await prisma.punnetSize.create({
    data: {
      name: '500g',
      sizeGrams: 500,
    },
  });

  // Create fruits and variants
  const strawberry = await prisma.fruit.create({
    data: {
      name: 'Strawberry',
      variants: {
        create: [
          { name: 'Sweet Charlie' },
          { name: 'Chandler' },
          { name: 'Festival' },
        ],
      },
    },
    include: {
      variants: true,
    },
  });

  const blueberry = await prisma.fruit.create({
    data: {
      name: 'Blueberry',
      variants: {
        create: [
          { name: 'Duke' },
          { name: 'Bluecrop' },
          { name: 'Jersey' },
        ],
      },
    },
    include: {
      variants: true,
    },
  });

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Premium Strawberries 250g',
        customerId: customer.id,
        punnetSizeId: medium.id,
        multiType: false,
        varieties: {
          create: [
            {
              fruitVariantId: strawberry.variants[0].id,
              preferred: true,
            },
          ],
        },
      },
    }),
    
    prisma.product.create({
      data: {
        name: 'Mixed Berry Punnet 500g',
        customerId: customer.id,
        punnetSizeId: large.id,
        multiType: true,
        varieties: {
          create: [
            {
              fruitVariantId: strawberry.variants[1].id,
              preferred: true,
            },
            {
              fruitVariantId: blueberry.variants[0].id,
              preferred: true,
            },
          ],
        },
      },
    }),
    
    prisma.product.create({
      data: {
        name: 'Blueberry Select 125g',
        customerId: customer.id,
        punnetSizeId: small.id,
        multiType: false,
        varieties: {
          create: [
            {
              fruitVariantId: blueberry.variants[1].id,
              preferred: true,
            },
          ],
        },
      },
    }),
  ]);

  // Create master run rates
  await prisma.masterRunRate.createMany({
    data: [
      { punnetSizeId: small.id, lineId: line1.id, packsPerMinute: 180 },
      { punnetSizeId: medium.id, lineId: line1.id, packsPerMinute: 150 },
      { punnetSizeId: large.id, lineId: line1.id, packsPerMinute: 120 },
      { punnetSizeId: small.id, lineId: line2.id, packsPerMinute: 160 },
      { punnetSizeId: medium.id, lineId: line2.id, packsPerMinute: 130 },
      { punnetSizeId: large.id, lineId: line2.id, packsPerMinute: 100 },
    ],
  });

  // Create specific run rates (overrides for specific products)
  await prisma.specificRunRate.createMany({
    data: [
      { productId: products[1].id, lineId: line1.id, packsPerMinute: 90 }, // Mixed berry is slower
    ],
  });

  // Create master changeover times
  await prisma.masterChangeover.createMany({
    data: [
      { fromPunnetSizeId: small.id, toPunnetSizeId: medium.id, minutes: 15 },
      { fromPunnetSizeId: medium.id, toPunnetSizeId: large.id, minutes: 20 },
      { fromPunnetSizeId: large.id, toPunnetSizeId: small.id, minutes: 25 },
      { fromPunnetSizeId: medium.id, toPunnetSizeId: small.id, minutes: 10 },
      { fromPunnetSizeId: large.id, toPunnetSizeId: medium.id, minutes: 15 },
      { fromPunnetSizeId: small.id, toPunnetSizeId: large.id, minutes: 30 },
    ],
  });

  // Create specific changeover times
  await prisma.specificChangeover.createMany({
    data: [
      { fromProductId: products[0].id, toProductId: products[1].id, minutes: 45 }, // Strawberry to mixed berry
      { fromProductId: products[1].id, toProductId: products[2].id, minutes: 35 }, // Mixed berry to blueberry
    ],
  });

  // Create sample orders
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  await prisma.order.createMany({
    data: [
      {
        customerId: customer.id,
        productId: products[0].id,
        quantityPacks: 1000,
        dueAt: tomorrow,
        status: 'pending',
      },
      {
        customerId: customer.id,
        productId: products[1].id,
        quantityPacks: 500,
        dueAt: tomorrow,
        status: 'pending',
      },
      {
        customerId: customer.id,
        productId: products[2].id,
        quantityPacks: 1500,
        dueAt: dayAfter,
        status: 'pending',
      },
    ],
  });

  console.log('Seeding completed successfully!');
  console.log(`Created:
  - 1 customer: ${customer.name}
  - 1 site: ${site.name}
  - 2 production lines
  - 3 punnet sizes
  - 2 fruits with variants
  - 3 products (1 multi-type)
  - Run rates and changeover times
  - 3 sample orders`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
