'use client';

import { useEffect, useState } from 'react';
import { reviewApi } from '@/lib/api';
import { Review, PageResponse } from '@/lib/types';
import Spinner from '@/components/Spinner';
import RatingStars from '@/components/RatingStars';
import { Star, MessageSquare } from 'lucide-react';

export default function MyReviewsPage() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    reviewApi.getByProduct(0) // fallback — ideally backend exposes /api/reviews/my
      .catch(() => ({ data: { content: [] } }))
      .finally(() => setLoading(false));

    // Try dedicated endpoint for customer's own reviews
    (async () => {
      try {
        // Some backends expose /api/reviews/my; adapt to what's available
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/reviews/my`,
          {
            headers: {
              Authorization: `Bearer ${document.cookie
                .split('; ')
                .find(r => r.startsWith('access_token='))
                ?.split('=')[1] ?? ''}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setReviews(Array.isArray(data) ? data : data.content ?? []);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner /></div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
          <Star className="w-5 h-5 text-yellow-500"/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mes avis</h1>
          <p className="text-xs text-gray-400">{reviews.length} avis publiés</p>
        </div>
      </div>

      {/* Account nav */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {[
          { href: '/account/orders',  label: '📦 Mes commandes' },
          { href: '/account/profile', label: '👤 Profil & Adresses' },
          { href: '/account/reviews', label: '⭐ Mes avis', active: true },
        ].map(link => (
          <a key={link.href} href={link.href}
            className={`flex-1 text-center py-2.5 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              link.active ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}>
            {link.label}
          </a>
        ))}
      </div>

      {/* Content */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <MessageSquare className="w-14 h-14 text-gray-200 mx-auto mb-4"/>
          <p className="text-gray-500 text-lg font-medium">Aucun avis pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Vous pouvez laisser un avis après avoir acheté un produit</p>
          <a href="/products" className="btn-primary inline-block">Découvrir les produits</a>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-yellow-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <RatingStars note={r.note} small/>
                    <span className="text-xs text-gray-400">
                      {new Date(r.dateCreation).toLocaleDateString('fr-FR', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.approuve ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.approuve ? 'Approuvé' : 'En attente de modération'}
                    </span>
                  </div>
                  {r.commentaire ? (
                    <p className="text-sm text-gray-700">{r.commentaire}</p>
                  ) : (
                    <p className="text-sm italic text-gray-400">Aucun commentaire</p>
                  )}
                  <a href={`/products/${r.productId}`}
                    className="text-xs text-primary hover:underline mt-2 inline-block">
                    Voir le produit →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
