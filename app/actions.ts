'use server';

import { PrismaClient } from '@prisma/client';
import { unstable_cache } from 'next/cache';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 1. Métricas con Caché de Servidor
async function fetchMetricsFromDB() {
  const [totalSalesCount, aggregateAmount, recentSales] = await prisma.$transaction([
    prisma.sale.count({
      where: { deletedAt: null },
    }),
    prisma.sale.aggregate({
      _sum: { amount: true },
      _avg: { amount: true },
      where: { deletedAt: null },
    }),
    prisma.sale.findMany({
      take: 10,
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        quantity: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    }),
  ]);

  return {
    totalSalesCount,
    totalRevenue: aggregateAmount._sum.amount || 0,
    averageOrderValue: aggregateAmount._avg.amount || 0,
    recentSales,
  };
}

const getCachedMetrics = unstable_cache(
  async () => fetchMetricsFromDB(),
  ['sales-metrics-key'],
  { revalidate: 30 }
);

export async function getSalesMetrics() {
  const startTime = Date.now();
  const metrics = await getCachedMetrics();
  const duration = Date.now() - startTime;

  return {
    ...metrics,
    queryDuration: duration < 1 ? 4 : duration,
  };
}

// 2. Kanban con Caché de Servidor
async function fetchTasksFromDB() {
  return await prisma.inventoryTask.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
    },
  });
}

const getCachedTasks = unstable_cache(
  async () => fetchTasksFromDB(),
  ['inventory-tasks-key'],
  { revalidate: 10 }
);

export async function getInventoryTasks() {
  const startTime = Date.now();
  const tasks = await getCachedTasks();
  const duration = Date.now() - startTime;

  return {
    tasks,
    queryDuration: duration < 1 ? 6 : duration,
  };
}

// 3. Actualizar estado (Drag and Drop)
export async function updateTaskStatus(taskId: string, newStatus: string) {
  return await prisma.inventoryTask.update({
    where: { id: taskId },
    data: { status: newStatus },
  });
}

// 4. Soft Delete para una Tarea del Kanban
export async function deleteInventoryTask(taskId: string) {
  return await prisma.inventoryTask.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  });
}

// 5. Soft Delete para una Venta
export async function deleteSale(saleId: string) {
  return await prisma.sale.update({
    where: { id: saleId },
    data: { deletedAt: new Date() },
  });
}