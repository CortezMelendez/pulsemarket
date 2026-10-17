import { describe, it, expect } from 'vitest';

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function calculateFinancialMetrics(sales: number[], averageCost: number) {
  const totalRevenue = sales.reduce((acc, curr) => acc + curr, 0);
  const totalMargin = totalRevenue - sales.length * averageCost;
  return { totalRevenue, totalMargin };
}

export function validateProductSchema(product: { name: string; price: number; stock: number }) {
  if (!product.name || product.name.trim() === '') return false;
  if (product.price <= 0) return false;
  if (product.stock < 0) return false;
  return true;
}

export function predictInventoryRestock(stock: number, salesRatePerDay: number): number {
  if (salesRatePerDay <= 0) return 999;
  return Math.floor(stock / salesRatePerDay);
}

describe('Suite de Pruebas Unitarias de Negocio PulseMarket', () => {
  it('1. Debe formatear adecuadamente un valor numérico a moneda USD', () => {
    expect(formatCurrency(150.5)).toBe('$150.50');
  });

  it('2. Debe formatear montos en cero correctamente', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('3. Debe calcular el ingreso total correctamente a partir de un arreglo de ventas', () => {
    const { totalRevenue } = calculateFinancialMetrics([100, 200, 300], 50);
    expect(totalRevenue).toBe(600);
  });

  it('4. Debe calcular el margen financiero descontando los costos operativos', () => {
    const { totalMargin } = calculateFinancialMetrics([100, 200, 300], 50);
    expect(totalMargin).toBe(450);
  });

  it('5. Debe validar un producto correctamente cuando todos sus datos son válidos', () => {
    const validProduct = { name: 'Laptop Pro', price: 1200, stock: 15 };
    expect(validateProductSchema(validProduct)).toBe(true);
  });

  it('6. Debe rechazar la validación si el precio del producto es cero o negativo', () => {
    const invalidProduct = { name: 'Laptop Pro', price: -10, stock: 15 };
    expect(validateProductSchema(invalidProduct)).toBe(false);
  });

  it('7. Debe rechazar productos con nombres vacíos', () => {
    const invalidProduct = { name: '', price: 100, stock: 5 };
    expect(validateProductSchema(invalidProduct)).toBe(false);
  });

  it('8. Debe predecir correctamente los días restantes antes de agotar inventario', () => {
    const daysLeft = predictInventoryRestock(100, 10);
    expect(daysLeft).toBe(10);
  });

  it('9. Debe retornar valor por defecto si la tasa de venta diaria es cero', () => {
    const daysLeft = predictInventoryRestock(100, 0);
    expect(daysLeft).toBe(999);
  });

  it('10. Debe rechazar productos con cantidades de stock negativas', () => {
    const invalidStock = { name: 'Teclado', price: 50, stock: -5 };
    expect(validateProductSchema(invalidStock)).toBe(false);
  });
});