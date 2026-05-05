'use client';

import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/ordenes':     'Órdenes',
  '/clientes':    'Clientes',
  '/inventario':  'Inventario',
  '/proveedores': 'Proveedores',
  '/personal':    'Personal',
  '/gastos':      'Gastos',
  '/entregas':    'Entregas',
  '/balance':     'Balance',
};

export function TopBar() {
  const pathname = usePathname();
  const section  = '/' + pathname.split('/')[1];
  const title    = TITLES[section] ?? 'Gestión';

  return (
    <header className="flex h-16 items-center gap-4 border-b border-white/5 bg-surface-100 px-6">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
    </header>
  );
}
