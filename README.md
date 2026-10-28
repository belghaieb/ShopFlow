ShopFlow — Système de Gestion d'une Boutique en Ligne

Marketplace B2C complète — Backend Spring Boot 3 + Frontend Next.js

  Stack Technique

| Couche | Technologie |
|--------|-------------|
| Backend | Java 21, Spring Boot 3.2, Spring Security 6, JWT |
| Base de données | H2 (dev) / PostgreSQL (prod) |
| ORM | Spring Data JPA, Hibernate |
| Utilitaires | Lombok, MapStruct, Springdoc OpenAPI |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Auth Frontend | Cookies HttpOnly + Intercepteur Axios |

 Structure du projet

```
shopflow/
├── backend/          ← Spring Boot 3
│   └── src/main/java/com/shopflow/
│       ├── config/       (Security, Swagger)
│       ├── controller/   (Auth, Product, Cart, Order, Review, Coupon, Dashboard)
│       ├── service/      (logique métier)
│       ├── repository/   (Spring Data JPA + Specifications)
│       ├── entity/       (12 entités JPA)
│       ├── dto/          (Request / Response)
│       ├── security/     (JWT filter, UserDetails)
│       └── exception/    (GlobalExceptionHandler)
└── frontend/         ← Next.js 14
    └── src/
        ├── app/          (pages : home, products, cart, checkout, auth, account, seller)
        ├── components/   (Navbar, ProductCard, RatingStars, OrderStatusBadge...)
        ├── contexts/     (AuthContext avec JWT)
        └── lib/          (api.ts avec intercepteur, types.ts)
```

  Lancement — Backend

 Prérequis
- Java 21+
- Maven 3.9+

 Démarrage (mode dev avec H2)
```bash
cd backend
mvn spring-boot:run
```

L'API démarre sur **http://localhost:8080**

- Swagger UI : http://localhost:8080/swagger-ui
- H2 Console : http://localhost:8080/h2-console (url: `jdbc:h2:mem:shopflowdb`)

 Passer en PostgreSQL (production)
Dans `application.properties`, remplacer la config H2 par :
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shopflowdb
spring.datasource.username=postgres
spring.datasource.password=votre_mot_de_passe
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

 Lancement — Frontend

 Prérequis
- Node.js 18+
- npm

 Démarrage
```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur **http://localhost:3000**

 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@shopflow.com | password123 |
| Vendeur | seller@shopflow.com | password123 |
| Client | client@shopflow.com | password123 |

 Endpoints API principaux

```
POST   /api/auth/register        — Inscription
POST   /api/auth/login           — Connexion (retourne JWT)
POST   /api/auth/refresh         — Refresh token
POST   /api/auth/logout          — Déconnexion

GET    /api/products             — Liste paginée + filtres
GET    /api/products/{id}        — Détail produit
POST   /api/products             — Créer (SELLER/ADMIN)
GET    /api/products/search?q=   — Recherche full-text

GET    /api/cart                 — Panier du client
POST   /api/cart/items           — Ajouter article
POST   /api/cart/coupon          — Appliquer coupon

POST   /api/orders               — Passer commande
GET    /api/orders/my            — Mes commandes
PUT    /api/orders/{id}/cancel   — Annuler commande

GET    /api/dashboard/admin      — Stats admin
GET    /api/dashboard/seller     — Stats vendeur
```

🏗️ Architecture

```
Client HTTP
     │
     ▼
Controller (@RestController)
     │  @Valid + DTOs
     ▼
Service (@Service + @Transactional)
     │  Logique métier, règles stock, coupon
     ▼
Repository (JpaRepository + Specifications)
     │  JPQL, filtres dynamiques, Pageable
     ▼
Entity (JPA) ──► PostgreSQL / H2
```

 Données de démo

Le fichier `backend/src/main/resources/data.sql` charge automatiquement :
- 5 utilisateurs (1 admin, 2 vendeurs, 2 clients)
- 8 produits avec images, variantes, catégories
- 3 codes promo (BIENVENUE10, REMISE5, SUMMER20)

 Fonctionnalités implémentées

 Backend
- [x] Authentification JWT (access + refresh token)
- [x] 3 rôles : ADMIN, SELLER, CUSTOMER
- [x] CRUD Produits avec soft delete
- [x] Variantes de produits (taille, couleur)
- [x] Catégories hiérarchiques (auto-référence)
- [x] Panier persistant en base
- [x] Codes promo (PERCENT / FIXED)
- [x] Commandes avec cycle de vie complet
- [x] Gestion du stock (vérification + décrément)
- [x] Avis avec modération (achat vérifié)
- [x] Dashboard Admin + Seller
- [x] Recherche full-text + filtres dynamiques
- [x] Pagination sur toutes les listes
- [x] Swagger UI documenté
- [x] GlobalExceptionHandler

 Frontend
- [x] Page d'accueil avec promotions + nouveautés
- [x] Catalogue avec filtres dynamiques
- [x] Fiche produit avec variantes + avis
- [x] Panier avec gestion coupon
- [x] Tunnel de commande
- [x] Espace client (mes commandes + annulation)
- [x] Dashboard vendeur (stats + commandes + produits)
- [x] Authentification (login + register)
- [x] Intercepteur Axios avec refresh automatique
- [x] Middleware de protection des routes
- [x] Design responsive (mobile-first)
- [x] Composants réutilisables (ProductCard, RatingStars, OrderStatusBadge...)

 🎓 Projet universitaire

