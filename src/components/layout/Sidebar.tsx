'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  Truck,
  UserCog,
  Receipt,
  PackageCheck,
  BarChart2,
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/ordenes',     label: 'Órdenes',       icon: ClipboardList },
  { href: '/clientes',    label: 'Clientes',      icon: Users },
  { href: '/inventario',  label: 'Inventario',    icon: Package },
  { href: '/proveedores', label: 'Proveedores',   icon: Truck },
  { href: '/personal',    label: 'Personal',      icon: UserCog },
  { href: '/gastos',      label: 'Gastos',        icon: Receipt },
  { href: '/entregas',    label: 'Entregas',      icon: PackageCheck },
  { href: '/balance',     label: 'Balance',       icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col bg-sidebar border-r border-white/5">
      <div className="flex h-16 items-center px-6 border-b border-white/5">
        <span className="text-lg font-bold text-emerald-400">Lavandería</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
