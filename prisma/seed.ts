import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando la inyección masiva de datos (Seed de 10,000+ registros)...');

  // Limpieza previa opcional
  await prisma.sale.deleteMany();
  await prisma.inventoryTask.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 1. Crear 500 Usuarios
  console.log('👤 Creando usuarios...');
  const usersData = Array.from({ length: 500 }).map(() => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(['ADMIN', 'MANAGER', 'CUSTOMER']),
  }));
  await prisma.user.createMany({ data: usersData, skipDuplicates: true });
  const users = await prisma.user.findMany({ select: { id: true } });

  // 2. Crear 200 Productos
  console.log('📦 Creando productos...');
  const productsData = Array.from({ length: 200 }).map(() => ({
    name: faker.commerce.productName(),
    category: faker.commerce.department(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    stock: faker.number.int({ min: 0, max: 500 }),
  }));
  await prisma.product.createMany({ data: productsData });
  const products = await prisma.product.findMany({ select: { id: true, price: true } });

  // 3. Crear 10,000 Ventas (Relacionadas con Usuarios y Productos)
  console.log('💳 Inyectando 10,000 registros de Ventas...');
  const BATCH_SIZE = 2000;
  const TOTAL_SALES = 10000;

  for (let i = 0; i < TOTAL_SALES; i += BATCH_SIZE) {
    const salesBatch = Array.from({ length: BATCH_SIZE }).map(() => {
      const user = faker.helpers.arrayElement(users);
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      return {
        userId: user.id,
        productId: product.id,
        quantity: quantity,
        amount: product.price * quantity,
        createdAt: faker.date.past({ years: 1 }),
      };
    });
    await prisma.sale.createMany({ data: salesBatch });
    console.log(` -> Insertas ${i + BATCH_SIZE} de ${TOTAL_SALES} ventas...`);
  }

  // 4. Crear 50 Tareas Kanban de Inventario (para la sección Drag & Drop)
  console.log('📋 Creando tareas de inventario (Kanban)...');
  const tasksData = Array.from({ length: 50 }).map(() => ({
    title: `${faker.hacker.verb()} ${faker.commerce.productName()}`,
    status: faker.helpers.arrayElement(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
  }));
  await prisma.inventoryTask.createMany({ data: tasksData });

  console.log('✅ ¡Seed completado con éxito! Más de 10,000 registros insertados.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });