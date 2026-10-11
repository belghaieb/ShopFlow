'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi, orderApi, addressApi } from '@/lib/api';
import { Cart } from '@/lib/types';
import Spinner from '@/components/Spinner';
import { Check, ShoppingCart, MapPin, Phone, FileText, Package, Plus, ChevronDown, Truck } from 'lucide-react';

const GOUVERNORATS = [
  'Ariana','Béja','Ben Arous','Bizerte','Gabès','Gafsa','Jendouba',
  'Kairouan','Kasserine','Kébili','Kef','Mahdia','Manouba','Médenine',
  'Monastir','Nabeul','Sfax','Sidi Bouzid','Siliana','Sousse',
  'Tataouine','Tozeur','Tunis','Zaghouan'
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart]         = useState<Cart | null>(null);
  const [loading, setLoading]   = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered]   = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [form, setForm] = useState({
    rue: '', ville: 'Tunis', gouvernorat: '', telephone: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    cartApi.get()
      .then(r => setCart(r.data))
      .catch(() => router.push('/cart'))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.rue.trim())       e.rue         = 'Adresse requise';
    if (!form.gouvernorat)      e.gouvernorat = 'Sélectionnez un gouvernorat';
    if (!form.telephone.trim()) e.telephone   = 'Téléphone requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setOrdering(true);
    try {
      const addrRes = await addressApi.create({
        rue: form.rue,
        ville: form.ville || form.gouvernorat,
        codePostal: '0000',
        pays: 'Tunisie',
        principal: true,
      });
      const { data } = await orderApi.place({ addressId: addrRes.data.id });
      setOrdered(true);
      setOrderNum(data.numeroCommande);
    } catch (e: any) {
      const msg = e.response?.data?.message || e.response?.data || 'Erreur lors de la commande';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setOrdering(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner />
    </div>
  );

  // ── Success ───────────────────────────────────────────────────
  if (ordered) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
        <p className="text-gray-500 mb-4">Votre commande a été enregistrée avec succès.</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 inline-block">
          <p className="text-xs text-gray-400 mb-1">Numéro de commande</p>
          <p className="text-lg font-mono font-bold text-primary">{orderNum}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-left">
          <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Livraison estimée sous <strong>3 à 5 jours ouvrables</strong>
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push('/account/orders')}
            className="btn-primary w-full py-3 text-base">
            Suivre ma commande
          </button>
          <button onClick={() => router.push('/products')}
            className="btn-outline w-full py-3 text-base">
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );

  if (!cart || cart.lignes.length === 0) { router.push('/cart'); return null; }

  // ── Checkout ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Finaliser la commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cart items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Mon panier
              </h2>
              <div className="space-y-3">
                {cart.lignes.map(item => (
                  <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                      <img src={item.productImage || 'https://via.placeholder.com/56'}
                        alt={item.productNom} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.productNom}</p>
                      {item.variantInfo && <p className="text-xs text-gray-500 mt-0.5">{item.variantInfo}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">x{item.quantite}</p>
                    </div>
                    <p className="font-bold text-primary whitespace-nowrap">{item.sousTotal.toFixed(3)} DT</p>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/products')}
                className="mt-4 w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-xl text-sm hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Ajouter des produits
              </button>
            </div>

            {/* Delivery form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Informations de livraison
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Adresse */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Adresse <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className={`w-full border ${errors.rue ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                      placeholder="Rue, N°"
                      value={form.rue}
                      onChange={e => setForm(p => ({ ...p, rue: e.target.value }))} />
                  </div>
                  {errors.rue && <p className="text-red-500 text-xs mt-1">{errors.rue}</p>}
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Tunis"
                    value={form.ville}
                    onChange={e => setForm(p => ({ ...p, ville: e.target.value }))} />
                </div>

                {/* Gouvernorat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Gouvernorat <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={`w-full border ${errors.gouvernorat ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none bg-white`}
                      value={form.gouvernorat}
                      onChange={e => setForm(p => ({ ...p, gouvernorat: e.target.value }))}>
                      <option value="">Sélectionner...</option>
                      {GOUVERNORATS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.gouvernorat && <p className="text-red-500 text-xs mt-1">{errors.gouvernorat}</p>}
                </div>

                {/* Téléphone */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Numéro de téléphone <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className={`w-full border ${errors.telephone ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                      placeholder="+216 XX XXX XXX"
                      value={form.telephone}
                      onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} />
                  </div>
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Notes pour le livreur <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      placeholder="Ex: Sonner au gardien, 2ème étage..."
                      rows={3}
                      value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Delivery info */}
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Date de livraison estimée après confirmation : <strong>sous 3 à 5 jours ouvrables</strong>
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Récapitulatif
              </h2>

              {/* Items */}
              <div className="space-y-2.5 mb-5">
                {cart.lignes.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate flex-1 mr-2">
                      {item.productNom} <span className="text-gray-400">(x{item.quantite})</span>
                    </span>
                    <span className="text-gray-800 font-medium whitespace-nowrap">
                      {item.sousTotal.toFixed(3)} DT
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2 mb-6 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span><span>{cart.sousTotal.toFixed(3)} DT</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Livraison</span><span>{cart.fraisLivraison.toFixed(3)} DT</span>
                </div>
                {cart.remise > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Remise</span><span>-{cart.remise.toFixed(3)} DT</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3 text-base">
                  <span>Total TTC</span>
                  <span className="text-primary text-xl">{cart.totalTTC.toFixed(3)} DT</span>
                </div>
              </div>

              {/* Confirm */}
              <button onClick={placeOrder} disabled={ordering}
                className="w-full bg-accent hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-sm">
                {ordering
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Traitement...</>
                  : <><Check className="w-5 h-5" /> Confirmer la commande</>}
              </button>

              <button onClick={() => router.push('/products')}
                className="w-full mt-3 border border-gray-200 text-gray-500 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Ajouter des produits
              </button>

              {/* Trust badges */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
                {[
                  { icon: '🔒', text: 'Paiement 100% sécurisé' },
                  { icon: '🚚', text: 'Livraison sous 3-5 jours' },
                  { icon: '✅', text: 'Vendeurs certifiés ShopFlow' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{b.icon}</span><span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
