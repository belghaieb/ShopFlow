'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cartApi } from '@/lib/api';
import { Cart } from '@/lib/types';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { Trash2, Tag, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');

  const loadCart = async () => {
    try { const { data } = await cartApi.get(); setCart(data); }
    catch { setCart(null); } finally { setLoading(false); }
  };

  useEffect(() => { loadCart(); }, []);

  const updateQty = async (itemId: number, quantite: number) => {
    try { const { data } = await cartApi.updateItem(itemId, { quantite }); setCart(data); }
    catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
  };

  const removeItem = async (itemId: number) => {
    try { const { data } = await cartApi.removeItem(itemId); setCart(data); }
    catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
  };

  const applyCoupon = async () => {
    if (!coupon) return;
    setCouponLoading(true);
    setCouponMsg('');
    try {
      const { data } = await cartApi.applyCoupon(coupon.toUpperCase());
      setCart(data);
      setCouponMsg('Code promo appliqué !');
    } catch (e: any) {
      setCouponMsg(e.response?.data?.message || 'Code invalide');
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = async () => {
    try { const { data } = await cartApi.removeCoupon(); setCart(data); setCoupon(''); setCouponMsg(''); }
    catch {}
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><Spinner /></div>;

  if (!cart || cart.lignes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Mon panier</h1>
        <EmptyState message="Votre panier est vide" action={
          <Link href="/products" className="btn-primary">Découvrir les produits</Link>
        } />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon panier ({cart.lignes.length} article{cart.lignes.length > 1 ? 's' : ''})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.lignes.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.productImage || 'https://via.placeholder.com/80'} alt={item.productNom} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-primary text-sm">
                  {item.productNom}
                </Link>
                {item.variantInfo && <p className="text-xs text-gray-500 mt-0.5">{item.variantInfo}</p>}
                <p className="text-primary font-bold mt-1">{item.prixUnitaire.toFixed(3)} DT</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => updateQty(item.id, item.quantite - 1)} disabled={item.quantite <= 1}
                    className="px-2 py-1 hover:bg-gray-50 disabled:opacity-30 text-sm">-</button>
                  <span className="px-3 py-1 text-sm">{item.quantite}</span>
                  <button onClick={() => updateQty(item.id, item.quantite + 1)}
                    className="px-2 py-1 hover:bg-gray-50 text-sm">+</button>
                </div>
                <p className="text-sm font-semibold">{item.sousTotal.toFixed(3)} DT</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Code promo
            </h3>
            {cart.couponCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-green-700">{cart.couponCode} appliqué</span>
                <button onClick={removeCoupon} className="text-red-500 text-xs hover:underline">Retirer</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input className="input text-sm flex-1" placeholder="Code promo" value={coupon}
                  onChange={e => setCoupon(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                <button onClick={applyCoupon} disabled={couponLoading}
                  className="btn-primary text-sm px-4">Appliquer</button>
              </div>
            )}
            {couponMsg && (
              <p className={`text-xs mt-2 ${couponMsg.includes('appliqué') ? 'text-green-600' : 'text-red-500'}`}>{couponMsg}</p>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span><span>{cart.sousTotal.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de livraison</span><span>{cart.fraisLivraison.toFixed(3)} DT</span>
              </div>
              {cart.remise > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remise</span><span>-{cart.remise.toFixed(3)} DT</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-lg">
                <span>Total TTC</span><span className="text-primary">{cart.totalTTC.toFixed(3)} DT</span>
              </div>
            </div>

            <Link href="/checkout"
              className="mt-5 w-full bg-accent text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <ShoppingBag className="w-5 h-5" /> Passer la commande <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-primary mt-3">
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
