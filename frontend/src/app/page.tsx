'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';
import { ArrowRight, Package, Truck, Shield, Star, Tag } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.getAll({ size: 8, sort: 'dateCreation,desc' }),
      productApi.getAll({ promo: true, size: 4 }),
    ]).then(([newRes, promoRes]) => {
      setProducts(newRes.data.content || []);
      setPromoProducts(promoRes.data.content || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hasProducts = products.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="bg-white/10 border border-white/20 text-sm px-3 py-1 rounded-full inline-block mb-4">
              Livraison offerte des 50 DT
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Tout ce dont vous avez besoin,<br />
              <span className="text-blue-300">au meilleur prix</span>
            </h1>
            <p className="text-blue-200 text-lg mb-8 max-w-xl">
              Des produits de vendeurs certifies en Dinar Tunisien.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2">
                Explorer le catalogue <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/register" className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
                Devenir vendeur
              </Link>
            </div>
          </div>
          <div className="hidden md:flex flex-1 justify-center">
            <div className="grid grid-cols-2 gap-4 opacity-80">
              {['👗','📱','🏠','⭐'].map((e,i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-8 text-5xl text-center backdrop-blur-sm">{e}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Truck className="w-5 h-5 text-primary"/>, title: 'Livraison rapide', desc: 'Sous 3-5 jours' },
            { icon: <Shield className="w-5 h-5 text-primary"/>, title: 'Paiement securise', desc: '100% securise' },
            { icon: <Star className="w-5 h-5 text-primary"/>, title: 'Vendeurs certifies', desc: 'Qualite garantie' },
            { icon: <Tag className="w-5 h-5 text-primary"/>, title: 'Prix en DT', desc: 'Dinar Tunisien' },
          ].map((f,i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-xl">{f.icon}</div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {loading ? <Spinner /> : !hasProducts ? (
          // Empty state
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Bientot disponible</h2>
            <p className="text-gray-500 mb-2 max-w-md mx-auto">
              Notre marketplace est prete. Les vendeurs ajoutent leurs produits.
            </p>
            <p className="text-gray-400 text-sm mb-8">Revenez bientot pour decouvrir notre catalogue.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register" className="btn-primary flex items-center gap-2">
                Devenir vendeur <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/products" className="btn-outline">
                Voir le catalogue
              </Link>
            </div>
          </div>
        ) : (
          <>
            {promoProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Offres du moment</h2>
                  <Link href="/products?promo=true" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                    Voir tout <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {promoProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nouveautes</h2>
                <Link href="/products" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
