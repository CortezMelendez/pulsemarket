'use server';

import { PrismaClient } from '@prisma/client';
import { unstable_cache } from 'next/cache';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Función interna que consulta la base de datos
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

// Servimos las métricas con caché en memoria de 30 segundos
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
    queryDuration: duration,
  };
}

// 2. Obtener tareas para el tablero Kanban
export async function getInventoryTasks() {
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

// 3. Actualizar estado (Drag and Drop)
export async function updateTaskStatus(taskId: string, newStatus: string) {
  return await prisma.inventoryTask.update({
    where: { id: taskId },
    data: { status: newStatus },
  });
}