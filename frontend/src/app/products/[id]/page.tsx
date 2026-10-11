'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productApi, cartApi, reviewApi } from '@/lib/api';
import { Product, Review, ProductVariant, PageResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import RatingStars from '@/components/RatingStars';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import Spinner from '@/components/Spinner';
import { ShoppingCart, Check, ChevronLeft, Star } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [newReview, setNewReview] = useState({ note: 5, commentaire: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          productApi.getById(Number(id)),
          reviewApi.getByProduct(Number(id)),
        ]);
        setProduct(pRes.data);
        const reviewData: PageResponse<Review> = rRes.data;
        setReviews(reviewData.content || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    setCartLoading(true);
    try {
      await cartApi.addItem({ productId: product.id, variantId: selectedVariant?.id, quantite: quantity });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erreur lors de l\'ajout au panier');
    } finally { setCartLoading(false); }
  };

  const submitReview = async () => {
    if (!product) return;
    setReviewLoading(true);
    try {
      await reviewApi.create({ productId: product.id, ...newReview });
      const rRes = await reviewApi.getByProduct(product.id);
      setReviews(rRes.data.content);
      setNewReview({ note: 5, commentaire: '' });
      alert('Avis soumis ! Il sera visible après modération.');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis');
    } finally { setReviewLoading(false); }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><Spinner /></div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">Produit introuvable</div>;

  const prix = selectedVariant
    ? (product.prixPromo || product.prix) + selectedVariant.prixDelta
    : (product.prixPromo || product.prix);

  const variantsByAttribut = product.variantes.reduce((acc, v) => {
    if (!acc[v.attribut]) acc[v.attribut] = [];
    acc[v.attribut].push(v);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
        <ChevronLeft className="w-4 h-4" /> Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-2xl overflow-hidden mb-4 aspect-square">
            <img
              src={product.images[selectedImage] || 'https://via.placeholder.com/500'}
              alt={product.nom}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-primary' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.nomBoutique && (
            <p className="text-blue-600 font-medium text-sm mb-1">{product.nomBoutique}</p>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.nom}</h1>

          <div className="flex items-center gap-3 mb-4">
            <RatingStars note={product.noteMoyenne || 0} />
            <span className="text-sm text-gray-500">{product.noteMoyenne?.toFixed(1) || '0'} ({product.nombreAvis} avis)</span>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">{prix.toFixed(3)} DT</span>
            {product.prixPromo && (
              <>
                <span className="text-xl text-gray-400 line-through ml-3">{product.prix.toFixed(3)} DT</span>
                <span className="ml-2 bg-accent text-white text-sm px-2 py-0.5 rounded-full">
                  -{Math.round(((product.prix - product.prixPromo) / product.prix) * 100)}%
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
          )}

          {/* Variants */}
          {Object.entries(variantsByAttribut).map(([attribut, variants]) => (
            <div key={attribut} className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">{attribut}</p>
              <div className="flex flex-wrap gap-2">
                {variants.map(v => (
                  <button key={v.id} onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}>
                    {v.valeur}
                    {v.prixDelta > 0 && <span className="text-xs ml-1">(+{v.prixDelta} DT)</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm font-medium text-gray-700">Quantité</p>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50">-</button>
              <span className="px-4 py-2 text-center min-w-[40px]">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 hover:bg-gray-50">+</button>
            </div>
            <span className={`text-sm ${product.stock < 10 ? 'text-orange-500' : 'text-gray-500'}`}>
              {product.stock} en stock
            </span>
          </div>

          {/* Add to cart */}
          {user?.role === 'CUSTOMER' ? (
            <button onClick={addToCart} disabled={cartLoading || product.stock === 0 || addedToCart}
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                addedToCart ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-dark'
              } disabled:opacity-50`}>
              {addedToCart ? <><Check className="w-5 h-5" /> Ajouté au panier !</> : cartLoading ? 'Ajout...' : <><ShoppingCart className="w-5 h-5" /> Ajouter au panier</>}
            </button>
          ) : !user ? (
            <Link href="/auth/login" className="w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-dark">
              <ShoppingCart className="w-5 h-5" /> Connectez-vous pour acheter
            </Link>
          ) : null}

          {/* Categories */}
          {product.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.categories.map(c => (
                <Link key={c.id} href={`/products?categorie=${c.nom}`}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200">
                  {c.nom}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-gray-100 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Avis clients ({reviews.length})</h2>

        {user?.role === 'CUSTOMER' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Laisser un avis</h3>
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Note</p>
              <RatingStars note={newReview.note} interactive onChange={n => setNewReview(p => ({ ...p, note: n }))} />
            </div>
            <textarea className="input mb-4" rows={3} placeholder="Votre commentaire..."
              value={newReview.commentaire}
              onChange={e => setNewReview(p => ({ ...p, commentaire: e.target.value }))} />
            <button onClick={submitReview} disabled={reviewLoading} className="btn-primary">
              {reviewLoading ? 'Envoi...' : 'Publier l\'avis'}
            </button>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Aucun avis approuvé pour ce produit.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{r.customerNom}</p>
                    <RatingStars note={r.note} small />
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(r.dateCreation).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {r.commentaire && <p className="text-gray-600 text-sm mt-2">{r.commentaire}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
