'use client';

import { useEffect, useState } from 'react';
import { orderApi, productApi, categoryApi, dashboardApi } from '@/lib/api';
import { Order, Product, Category, PageResponse, DashboardSeller } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import Spinner from '@/components/Spinner';
import {
  Plus, Trash2, X, Check, Package, ShoppingBag,
  TrendingUp, AlertTriangle, Clock, Settings,
  ChevronDown, ChevronUp, Hash
} from 'lucide-react';

interface ProductForm {
  nom: string; description: string;
  prix: string; prixPromo: string;
  stock: string; categorieIds: number[]; images: string;
}
const emptyForm: ProductForm = { nom:'', description:'', prix:'', prixPromo:'', stock:'', categorieIds:[], images:'' };
type Tab = 'pending' | 'orders' | 'products';

const STATUS_LABELS: Record<string, string> = {
  PENDING:'En attente', PAID:'Payee', PROCESSING:'En preparation',
  SHIPPED:'Expediee', DELIVERED:'Livree', CANCELLED:'Annulee',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [tab, setTab]             = useState<Tab>('pending');
  const [loading, setLoading]     = useState(true);
  const [products, setProducts]   = useState<Product[]>([]);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [pending, setPending]     = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSeller | null>(null);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState<ProductForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);

  const flatCats = (cats: Category[]): Category[] => {
    const r: Category[] = [];
    const go = (list: Category[]) => list.forEach(c => { r.push(c); if (c.sousCategories?.length) go(c.sousCategories); });
    go(cats);
    return r;
  };

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [catsRes, ordersRes, prodsRes] = await Promise.all([
        categoryApi.getAll(),
        isAdmin ? orderApi.getAll({ size: 100, sort: 'dateCommande,desc' }) : orderApi.sellerOrders({ size: 100 }),
        productApi.getAll(isAdmin ? { size: 100 } : { sellerId: user.userId, size: 100 }),
      ]);
      setCategories(flatCats(catsRes.data));
      const allOrders: Order[] = (ordersRes.data as PageResponse<Order>).content;
      setOrders(allOrders);
      setPending(allOrders.filter(o => o.statut === 'PENDING'));
      setProducts((prodsRes.data as PageResponse<Product>).content);
      if (!isAdmin) { const d = await dashboardApi.seller(); setDashboard(d.data); }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.nom || !form.prix || !form.stock) { setFormError('Nom, prix et stock sont obligatoires'); return; }
    setFormLoading(true);
    try {
      await productApi.create({
        nom: form.nom, description: form.description,
        prix: parseFloat(form.prix),
        prixPromo: form.prixPromo ? parseFloat(form.prixPromo) : null,
        stock: parseInt(form.stock),
        categorieIds: form.categorieIds,
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      setShowAdd(false); setForm(emptyForm); load();
    } catch(err: any) { setFormError(err.response?.data?.message || 'Erreur lors de la creation'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleteLoading(true);
    try {
      await productApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
    } catch(err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setDeleteLoading(false); }
  };

  const updateStatus = async (orderId: number, statut: string) => {
    setStatusLoading(orderId);
    try {
      await orderApi.updateStatus(orderId, statut);
      const upd = (list: Order[]) => list.map(o => o.id === orderId ? {...o, statut: statut as any} : o);
      setOrders(upd);
      setPending(prev => statut === 'PENDING' ? prev : prev.filter(o => o.id !== orderId));
    } catch(err: any) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setStatusLoading(null); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner /></div>;

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex flex-wrap items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-primary font-mono text-sm flex items-center gap-1">
              <Hash className="w-3.5 h-3.5"/>{order.numeroCommande}
            </span>
            <OrderStatusBadge statut={order.statut} />
          </div>
          <p className="text-xs text-gray-400">
            {isAdmin && <span className="text-blue-500 font-medium mr-2">{order.customerNom}</span>}
            {new Date(order.dateCommande).toLocaleDateString('fr-FR', {day:'numeric',month:'short',year:'numeric'})}
            {' · '}{order.lignes.length} article{order.lignes.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-primary">{order.totalTTC.toFixed(3)} DT</span>
          {expanded === order.id ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
        </div>
      </div>
      {expanded === order.id && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          <div className="space-y-2">
            {order.lignes.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.productImage || 'https://via.placeholder.com/40'} alt={item.productNom} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productNom}</p>
                  <p className="text-xs text-gray-400">x{item.quantite} · {item.prixUnitaire.toFixed(3)} DT</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.sousTotal.toFixed(3)} DT</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5"/> Changer le statut
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_LABELS).map(([s, label]) => (
                <button key={s} onClick={() => updateStatus(order.id, s)}
                  disabled={order.statut === s || statusLoading === order.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    order.statut === s
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                  } disabled:opacity-50`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Administration ShopFlow' : 'Dashboard Vendeur'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Bonjour {user?.prenom}&nbsp;
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{user?.role}</span>
          </p>
        </div>
        <button onClick={() => { setShowAdd(true); setForm(emptyForm); setFormError(''); }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4"/> Ajouter un produit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'En attente', value: pending.length, icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
          { label: 'Total commandes', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          { label: 'Produits', value: products.filter(p => p.actif).length, icon: Package, color: 'text-green-600 bg-green-50 border-green-100' },
          {
            label: isAdmin ? 'CA total' : 'Revenus',
            value: isAdmin
              ? `${orders.filter(o => o.statut !== 'CANCELLED').reduce((s,o) => s + o.totalTTC, 0).toFixed(0)} DT`
              : `${(dashboard?.revenus || 0).toFixed(0)} DT`,
            icon: TrendingUp, color: 'text-purple-600 bg-purple-50 border-purple-100'
          },
        ].map((s,i) => (
          <div key={i} className={`rounded-xl border p-5 ${s.color.split(' ').slice(1).join(' ')}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-white ${s.color.split(' ')[0]}`}>
              <s.icon className="w-5 h-5"/>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {([
          { id: 'pending' as Tab, label: 'Commandes en attente', badge: pending.length },
          { id: 'orders'  as Tab, label: 'Toutes les commandes' },
          { id: 'products' as Tab, label: 'Produits' },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-all ${
              tab === t.id ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}>
            {t.id === 'pending' ? '🔔' : t.id === 'orders' ? '📦' : '🛍️'} {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-accent text-white' : 'bg-yellow-100 text-yellow-700'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* PENDING TAB */}
      {tab === 'pending' && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500"/>
              </div>
              <p className="text-gray-500 text-lg font-medium">Aucune commande en attente</p>
              <p className="text-gray-400 text-sm mt-1">Toutes les commandes ont ete traitees</p>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 flex items-center gap-2 text-yellow-700 text-sm mb-2">
                <Clock className="w-4 h-4 flex-shrink-0"/>
                <strong>{pending.length} commande{pending.length > 1 ? 's' : ''}</strong>&nbsp;en attente de traitement
              </div>
              {pending.map(o => <OrderCard key={o.id} order={o} />)}
            </>
          )}
        </div>
      )}

      {/* ALL ORDERS TAB */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0
            ? <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">Aucune commande</div>
            : orders.map(o => <OrderCard key={o.id} order={o} />)
          }
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === 'products' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{products.length} produit{products.length > 1 ? 's' : ''}</p>
            <button onClick={() => { setShowAdd(true); setForm(emptyForm); setFormError(''); }}
              className="btn-primary text-sm flex items-center gap-1.5 px-4 py-2">
              <Plus className="w-4 h-4"/> Ajouter
            </button>
          </div>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <Package className="w-14 h-14 text-gray-200 mx-auto mb-4"/>
              <p className="text-gray-500 text-lg font-medium mb-1">Aucun produit</p>
              <p className="text-gray-400 text-sm mb-6">Commencez par ajouter votre premier produit</p>
              <button onClick={() => { setShowAdd(true); setForm(emptyForm); setFormError(''); }}
                className="btn-primary flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4"/> Ajouter un produit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-44 bg-gray-100 relative">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.nom} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-gray-300"/></div>
                    }
                    {!p.actif && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold bg-red-500 px-3 py-1 rounded-full">Desactive</span>
                      </div>
                    )}
                    {isAdmin && p.nomBoutique && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">{p.nomBoutique}</span>
                    )}
                    {p.prixPromo && (
                      <span className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        -{Math.round(((p.prix - p.prixPromo) / p.prix) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 truncate mb-0.5">{p.nom}</p>
                    <p className="text-xs text-gray-400 truncate mb-3">{p.description || 'Aucune description'}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold text-primary">{(p.prixPromo || p.prix).toFixed(3)} DT</span>
                        {p.prixPromo && <span className="text-xs text-gray-400 line-through ml-1.5">{p.prix.toFixed(3)} DT</span>}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        p.stock === 0 ? 'bg-red-100 text-red-600'
                        : p.stock < 5 ? 'bg-orange-100 text-orange-600'
                        : 'bg-green-100 text-green-600'
                      }`}>{p.stock} en stock</span>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/products/${p.id}`} className="flex-1 text-center text-xs border border-gray-200 py-2 rounded-lg hover:bg-gray-50 font-medium">Voir</a>
                      <button onClick={() => setDeleteId(p.id)}
                        className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 font-medium">
                        <Trash2 className="w-3.5 h-3.5"/> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Ajouter un produit</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-accent">*</span></label>
                <input className="input" placeholder="Ex: T-Shirt Classic" required
                  value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input" rows={2} placeholder="Decrivez votre produit..."
                  value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DT) <span className="text-accent">*</span></label>
                  <input className="input" type="number" step="0.001" min="0" placeholder="89.900" required
                    value={form.prix} onChange={e => setForm(p => ({...p, prix: e.target.value}))}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix promo <span className="text-gray-400 text-xs">(opt.)</span></label>
                  <input className="input" type="number" step="0.001" min="0" placeholder="59.900"
                    value={form.prixPromo} onChange={e => setForm(p => ({...p, prixPromo: e.target.value}))}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock <span className="text-accent">*</span></label>
                <input className="input" type="number" min="0" placeholder="50" required
                  value={form.stock} onChange={e => setForm(p => ({...p, stock: e.target.value}))}/>
              </div>
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded accent-primary"
                          checked={form.categorieIds.includes(cat.id)}
                          onChange={e => setForm(p => ({...p,
                            categorieIds: e.target.checked ? [...p.categorieIds, cat.id] : p.categorieIds.filter(id => id !== cat.id)
                          }))}/>
                        <span className="text-sm text-gray-700">{cat.nom}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL image <span className="text-gray-400 text-xs">(opt.)</span></label>
                <input className="input" placeholder="https://exemple.com/photo.jpg"
                  value={form.images} onChange={e => setForm(p => ({...p, images: e.target.value}))}/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-blue-900 disabled:opacity-50 flex items-center justify-center gap-2">
                  {formLoading ? 'Creation...' : <><Check className="w-4 h-4"/> Creer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500"/>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce produit ?</h3>
            <p className="text-gray-500 text-sm mb-6">Il sera desactive et retire du catalogue.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50">Annuler</button>
              <button onClick={() => handleDelete(deleteId!)} disabled={deleteLoading}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 disabled:opacity-50">
                {deleteLoading ? 'Suppression...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
