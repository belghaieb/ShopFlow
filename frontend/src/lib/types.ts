export interface User {
  userId: number;
  email: string;
  prenom: string;
  nom: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
}

export interface AuthResponse extends User {
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: number;
  nom: string;
  description?: string;
  parentId?: number;
  sousCategories?: Category[];
}

export interface ProductVariant {
  id: number;
  attribut: string;
  valeur: string;
  stockSupplementaire: number;
  prixDelta: number;
}

export interface Product {
  id: number;
  sellerId: number;
  sellerNom: string;
  nomBoutique?: string;
  nom: string;
  description?: string;
  prix: number;
  prixPromo?: number;
  stock: number;
  actif: boolean;
  dateCreation: string;
  categories: Category[];
  images: string[];
  variantes: ProductVariant[];
  noteMoyenne?: number;
  nombreAvis: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productNom: string;
  productImage?: string;
  variantId?: number;
  variantInfo?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface Cart {
  id: number;
  lignes: CartItem[];
  couponCode?: string;
  sousTotal: number;
  fraisLivraison: number;
  remise: number;
  totalTTC: number;
}

export interface Address {
  id: number;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  productNom: string;
  productImage?: string;
  variantInfo?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: number;
  numeroCommande: string;
  statut: OrderStatus;
  adresseLivraison?: Address;
  sousTotal: number;
  fraisLivraison: number;
  remise: number;
  totalTTC: number;
  couponCode?: string;
  dateCommande: string;
  lignes: OrderItem[];
  customerNom: string;
  customerEmail: string;
}

export interface Review {
  id: number;
  productId: number;
  customerNom: string;
  note: number;
  commentaire?: string;
  dateCreation: string;
  approuve: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DashboardSeller {
  revenus: number;
  commandesEnAttente: number;
  totalProduits: number;
  alertesStockFaible: Product[];
  commandesRecentes: Order[];
}

export interface DashboardAdmin {
  chiffreAffairesGlobal: number;
  totalCommandes: number;
  commandesEnAttente: number;
  totalUtilisateurs: number;
  topProduits: Product[];
  commandesRecentes: Order[];
}

export interface Coupon {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  valeur: number;
  dateExpiration?: string;
  usagesMax?: number;
  usagesActuels: number;
  actif: boolean;
}

export interface UserAdmin {
  userId: number;
  email: string;
  prenom: string;
  nom: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
  actif: boolean;
  dateCreation: string;
}
