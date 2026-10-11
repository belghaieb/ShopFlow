'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Search, Menu, X, LayoutDashboard, LogOut, Package, ClipboardList } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isBuyer   = user?.role === 'CUSTOMER';
  const isDash    = user?.role === 'SELLER' || user?.role === 'ADMIN';

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo — seller/admin go straight to dashboard */}
          <Link href={user?.role === 'ADMIN' ? '/dashboard/admin' : isDash ? '/seller/dashboard' : '/'}
            className="text-2xl font-bold text-blue-300 hover:text-white transition-colors">
            Shop<span className="text-accent">Flow</span>
          </Link>

          {/* Search — visible for customers and guests */}
          {!isDash && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form action="/products" method="GET" className="w-full flex">
                <input name="q" type="text" placeholder="Rechercher des produits..."
                  className="w-full px-4 py-2 rounded-l-lg text-gray-900 text-sm focus:outline-none" />
                <button type="submit" className="bg-accent px-4 py-2 rounded-r-lg hover:opacity-90">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">

            {/* Customer links */}
            {!isDash && (
              <Link href="/products" className="text-sm hover:text-blue-300 transition-colors">Catalogue</Link>
            )}

            {/* Seller/Admin dashboard link */}
            {isDash && (
              <Link href={user?.role === 'ADMIN' ? '/dashboard/admin' : '/seller/dashboard'}
                className="text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                {user?.role === 'ADMIN' ? 'Administration' : 'Mon Dashboard'}
              </Link>
            )}

            {/* Cart — only for customers */}
            {isAuthenticated && isBuyer && (
              <Link href="/cart" className="hover:text-blue-300 transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </Link>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm hover:text-blue-300 transition-colors">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </div>
                  <span>{user?.prenom}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 text-gray-900 z-50">
                    {/* User info */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{user?.prenom} {user?.nom}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">{user?.role}</span>
                    </div>

                    {/* Customer menu */}
                    {isBuyer && (
                      <>
                        <Link href="/cart" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <ShoppingCart className="w-4 h-4" /> Mon panier
                        </Link>
                        <Link href="/account/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <Package className="w-4 h-4" /> Mes commandes
                        </Link>
                        <Link href="/account/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <LayoutDashboard className="w-4 h-4" /> Profil & Adresses
                        </Link>
                        <Link href="/account/reviews" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <ClipboardList className="w-4 h-4" /> Mes avis
                        </Link>
                      </>
                    )}

                    {/* Seller menu */}
                    {user?.role === 'SELLER' && (
                      <>
                        <Link href="/seller/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link href="/seller/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <ClipboardList className="w-4 h-4" /> Mes commandes
                        </Link>
                      </>
                    )}

                    {/* Admin menu */}
                    {user?.role === 'ADMIN' && (
                      <>
                        <Link href="/dashboard/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <LayoutDashboard className="w-4 h-4" /> Administration
                        </Link>
                        <Link href="/seller/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <Package className="w-4 h-4" /> Produits & Commandes
                        </Link>
                        <Link href="/account/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <ClipboardList className="w-4 h-4" /> Toutes les commandes
                        </Link>
                      </>
                    )}

                    <button onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-sm hover:text-blue-300">Connexion</Link>
                <Link href="/auth/register" className="bg-accent text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {!isDash && (
              <form action="/products" className="flex gap-2 mb-3">
                <input name="q" type="text" placeholder="Rechercher..."
                  className="flex-1 px-3 py-2 rounded-lg text-gray-900 text-sm" />
                <button type="submit" className="bg-accent px-3 py-2 rounded-lg">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            )}
            {!isDash && <Link href="/products" className="block py-2 text-sm hover:text-blue-300">Catalogue</Link>}
            {isAuthenticated ? (
              <>
                {isBuyer && <Link href="/cart" className="block py-2 text-sm">Panier</Link>}
                {isBuyer && <Link href="/account/orders" className="block py-2 text-sm">Mes commandes</Link>}
                {isBuyer && <Link href="/account/profile" className="block py-2 text-sm">Profil & Adresses</Link>}
                {isBuyer && <Link href="/account/reviews" className="block py-2 text-sm">Mes avis</Link>}
                {user?.role === 'SELLER' && <Link href="/seller/dashboard" className="block py-2 text-sm font-medium">Dashboard Vendeur</Link>}
                {user?.role === 'ADMIN' && <Link href="/dashboard/admin" className="block py-2 text-sm font-medium">Administration</Link>}
                {user?.role === 'ADMIN' && <Link href="/seller/dashboard" className="block py-2 text-sm">Produits & Commandes</Link>}
                <button onClick={logout} className="block py-2 text-sm text-red-300">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block py-2 text-sm">Connexion</Link>
                <Link href="/auth/register" className="block py-2 text-sm">S'inscrire</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
