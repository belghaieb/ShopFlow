'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { orderApi } from '@/lib/api';
import { Order, OrderStatus, PageResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import Spinner from '@/components/Spinner';
import { Package, ChevronDown, ChevronUp, X, MapPin, Calendar, Hash, Settings } from 'lucide-react';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:'En attente', PAID:'Payee', PROCESSING:'En preparation',
  SHIPPED:'Expediee', DELIVERED:'Livree', CANCELLED:'Annulee',
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading]   = useState<number | null>(null);
  const [statusLoading, setStatusLoading]   = useState<number | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const load = async () => {
    try {
      const res = isAdmin
        ? await orderApi.getAll({ size: 50, sort: 'dateCommande,desc' })
        : await orderApi.myOrders({ size: 50 });
      setOrders((res.data as PageResponse<Order>).content);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const cancel = async (id: number) => {
    if (!confirm("Confirmer l'annulation ?")) return;
    setCancelLoading(id);
    try { await orderApi.cancel(id); load(); }
    catch (e: any) { alert(e.response?.data?.message || "Impossible d'annuler"); }
    finally { setCancelLoading(null); }
  };

  const updateStatus = async (id: number, statut: string) => {
    setStatusLoading(id);
    try {
      await orderApi.updateStatus(id, statut);
      setOrders(prev => prev.map(o => o.id === id ? {...o, statut: statut as OrderStatus} : o));
    } catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
    finally { setStatusLoading(null); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-white"/>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Toutes les commandes' : 'Mes commandes'}
          </h1>
          <p className="text-gray-500 text-sm">{orders.length} commande{orders.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4"/>
          <p className="text-gray-400 text-lg mb-6">Aucune commande</p>
          <Link href="/products" className="btn-primary">Decouvrir les produits</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-semibold text-primary font-mono text-sm flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5"/>{order.numeroCommande}
                    </span>
                    <OrderStatusBadge statut={order.statut} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3"/>
                      {new Date(order.dateCommande).toLocaleDateString('fr-FR', {year:'numeric', month:'long', day:'numeric'})}
                    </span>
                    <span>·</span>
                    <span>{order.lignes.length} article{order.lignes.length > 1 ? 's' : ''}</span>
                    {isAdmin && <span className="text-blue-500 font-medium">· {order.customerNom}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-primary text-lg">{order.totalTTC.toFixed(3)} DT</p>
                  </div>
                  {expanded === order.id ? <ChevronUp className="w-5 h-5 text-gray-400"/> : <ChevronDown className="w-5 h-5 text-gray-400"/>}
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-gray-100 p-5 space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Articles</p>
                    <div className="space-y-2">
                      {order.lignes.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={item.productImage || 'https://via.placeholder.com/48'} alt={item.productNom} className="w-full h-full object-cover"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.productNom}</p>
                            {item.variantInfo && <p className="text-xs text-gray-400">{item.variantInfo}</p>}
                            <p className="text-xs text-gray-400">x{item.quantite} · {item.prixUnitaire.toFixed(3)} DT/unite</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{item.sousTotal.toFixed(3)} DT</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {order.adresseLivraison && (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3"/> Livraison
                        </p>
                        <p className="text-sm text-gray-700">{order.adresseLivraison.rue}</p>
                        <p className="text-sm text-gray-500">{order.adresseLivraison.ville}, {order.adresseLivraison.pays}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recapitulatif</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-gray-500"><span>Sous-total</span><span>{order.sousTotal.toFixed(3)} DT</span></div>
                        <div className="flex justify-between text-gray-500"><span>Livraison</span><span>{order.fraisLivraison.toFixed(3)} DT</span></div>
                        {order.remise > 0 && <div className="flex justify-between text-green-600"><span>Remise</span><span>-{order.remise.toFixed(3)} DT</span></div>}
                        <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5">
                          <span>Total</span><span className="text-primary">{order.totalTTC.toFixed(3)} DT</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin status control */}
                  {isAdmin && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5"/> Gestion admin — Statut commande
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
                          <button key={s} onClick={() => updateStatus(order.id, s)}
                            disabled={order.statut === s || statusLoading === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              order.statut === s
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                            } disabled:opacity-50`}>
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer cancel */}
                  {!isAdmin && (order.statut === 'PENDING' || order.statut === 'PAID') && (
                    <button onClick={() => cancel(order.id)} disabled={cancelLoading === order.id}
                      className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-50">
                      <X className="w-4 h-4"/>
                      {cancelLoading === order.id ? 'Annulation...' : 'Annuler la commande'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
