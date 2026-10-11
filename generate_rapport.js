#!/usr/bin/env node
'use strict';

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'ShopFlow_Rapport.pdf');

const C = {
  blueDark:  '#1A3A5C',
  blueMid:   '#2D6A9F',
  blueLight: '#E8F1FB',
  green:     '#27AE60',
  orange:    '#E67E22',
  grayDark:  '#2C3E50',
  grayMid:   '#7F8C8D',
  grayLight: '#F4F6F8',
  white:     '#FFFFFF',
};

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 60, bottom: 55, left: 55, right: 55 },
  bufferPages: true,
  info: {
    Title: 'ShopFlow — Rapport de Projet',
    Author: 'Projet Universitaire 2025-2026',
    Subject: "Système de Gestion d'une Boutique en Ligne",
  },
});

const W = doc.page.width;
const M = 55;
const CW = W - 2 * M;

const stream = fs.createWriteStream(OUTPUT);
doc.pipe(stream);

// ─── page header / footer (appelé sur pageAdded) ──────────────────────────
let pageNum = 0;
let inPageAdded = false;
doc.on('pageAdded', () => {
  pageNum++;
  if (pageNum <= 2) return; // garde + toc : pas d'en-tête
  if (inPageAdded) return;
  inPageAdded = true;

  const pH = doc.page.height;

  // header
  doc.rect(0, 0, W, 32).fill(C.blueDark);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
     .text('ShopFlow — Rapport de Projet', 55, 11, { lineBreak: false });
  doc.font('Helvetica').fontSize(8).fillColor(C.white)
     .text("Systeme de Gestion d'une Boutique en Ligne", 0, 11,
           { align: 'right', width: W - 55, lineBreak: false });

  // footer
  doc.rect(0, pH - 32, W, 32).fill(C.blueDark);
  doc.font('Helvetica').fontSize(7.5).fillColor(C.white)
     .text('Projet Universitaire — 2025-2026', 55, pH - 22, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.white)
     .text(String(pageNum - 1), W / 2 - 10, pH - 22, { lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(C.white)
     .text('Dr. Ing. Ghada Feki', 0, pH - 22,
           { align: 'right', width: W - 55, lineBreak: false });

  inPageAdded = false;
});

// ─── Helpers ──────────────────────────────────────────────────────────────
function sectionBar(title) {
  const y = doc.y + 6;
  doc.rect(M, y, CW, 26).fill(C.blueDark);
  doc.font('Helvetica-Bold').fontSize(12.5).fillColor(C.white)
     .text(title, M + 10, y + 6, { width: CW - 15, lineBreak: false });
  doc.y = y + 32;
}

function h2(txt) {
  doc.y += 6;
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(C.blueMid)
     .text(txt, M, doc.y);
  doc.y += 3;
}

function h3(txt) {
  doc.y += 4;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C.grayDark)
     .text(txt, M, doc.y);
  doc.y += 2;
}

function para(txt) {
  doc.font('Helvetica').fontSize(9.5).fillColor(C.grayDark)
     .text(txt, M, doc.y, { width: CW, align: 'justify' });
  doc.y += 5;
}

function bullet(txt) {
  const y0 = doc.y;
  doc.font('Helvetica').fontSize(9.5).fillColor(C.blueMid)
     .text('\u2022', M + 8, y0, { width: 12, lineBreak: false });
  doc.fillColor(C.grayDark)
     .text(txt, M + 20, y0, { width: CW - 20, align: 'justify' });
  doc.y += 2;
}

function infoBox(txt, bg, border, tc) {
  bg = bg || C.blueLight; border = border || C.blueMid; tc = tc || C.blueDark;
  const y = doc.y + 4;
  const textH = doc.heightOfString(txt, { width: CW - 22 });
  const bh = textH + 18;
  doc.rect(M, y, CW, bh).fillColor(bg).fill();
  doc.rect(M, y, CW, bh).strokeColor(border).lineWidth(0.8).stroke();
  doc.font('Helvetica').fontSize(9.5).fillColor(tc)
     .text(txt, M + 11, y + 9, { width: CW - 22 });
  doc.y = y + bh + 8;
}

function caption(txt) {
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(C.grayMid)
     .text(txt, M, doc.y + 2, { width: CW, align: 'center' });
  doc.y += 12;
}

// Simple table — draws all cells manually without save/restore in loops
function drawTable(header, rows, opts) {
  opts = opts || {};
  const hBg    = opts.hBg    || C.blueDark;
  const rh     = opts.rh     || 20;
  const fs_    = opts.fontSize || 8.5;
  const pad    = 5;

  const cols   = header.map(h => h.w);
  const labels = header.map(h => h.label);
  const aligns = header.map(h => h.align || 'left');
  const bolds  = header.map(h => !!h.bold);
  const colors_ = header.map(h => h.color || C.grayDark);

  function drawRow(cells, y, rowH, isHeader) {
    // background
    if (isHeader) {
      doc.rect(M, y, CW, rowH).fillColor(hBg).fill();
    }

    let x = M;
    cells.forEach((cell, ci) => {
      const cellH = doc.heightOfString(String(cell),
        { width: cols[ci] - pad * 2, fontSize: fs_ }) + pad * 2;
      if (!isHeader && opts.altBg !== false) {
        // already handled per-row
      }
      const font = isHeader ? 'Helvetica-Bold' : (bolds[ci] ? 'Helvetica-Bold' : 'Helvetica');
      const fcolor = isHeader ? C.white : colors_[ci];
      doc.font(font).fontSize(fs_).fillColor(fcolor)
         .text(String(cell), x + pad, y + pad,
               { width: cols[ci] - pad * 2, align: aligns[ci], lineBreak: true });
      x += cols[ci];
    });

    // borders
    doc.strokeColor('#CCCCCC').lineWidth(0.3);
    let bx = M;
    cols.forEach(cw => {
      doc.moveTo(bx, y).lineTo(bx, y + rowH).stroke();
      bx += cw;
    });
    doc.moveTo(M + CW, y).lineTo(M + CW, y + rowH).stroke();
    doc.moveTo(M, y).lineTo(M + CW, y).stroke();
    doc.moveTo(M, y + rowH).lineTo(M + CW, y + rowH).stroke();
  }

  // header
  let y = doc.y + 4;
  drawRow(labels, y, rh, true);
  y += rh;

  // data rows
  rows.forEach((row, ri) => {
    // estimate height
    let maxH = rh;
    row.forEach((cell, ci) => {
      const ch = doc.heightOfString(String(cell),
        { width: cols[ci] - pad * 2, fontSize: fs_ }) + pad * 2;
      if (ch > maxH) maxH = ch + 4;
    });

    if (y + maxH > doc.page.height - 60) {
      doc.addPage();
      y = doc.y + 4;
    }

    // alternating bg
    if (opts.altBg !== false) {
      doc.rect(M, y, CW, maxH).fillColor(ri % 2 === 0 ? C.grayLight : C.white).fill();
    }

    drawRow(row, y, maxH, false);
    y += maxH;
  });

  doc.y = y + 4;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE DE GARDE
// ─────────────────────────────────────────────────────────────────────────────
const pH = doc.page.height;

// fond dégradé simulé
doc.rect(0, 0, W, pH * 0.55).fill(C.blueDark);
doc.rect(0, pH * 0.55, W, pH * 0.45).fill(C.blueMid);
doc.rect(0, pH * 0.55 - 4, W, 8).fill(C.orange);

// Logo
doc.font('Helvetica-Bold').fontSize(58).fillColor(C.white)
   .text('ShopFlow', 0, 120, { align: 'center', width: W, lineBreak: false });

doc.font('Helvetica').fontSize(14).fillColor(C.blueLight)
   .text("Système de Gestion d'une Boutique en Ligne", 0, 196,
         { align: 'center', width: W, lineBreak: false });

doc.strokeColor(C.white).lineWidth(0.5)
   .moveTo(W * 0.25, 220).lineTo(W * 0.75, 220).stroke();

doc.font('Helvetica-Bold').fontSize(12).fillColor(C.white)
   .text("Rapport de Projet de Fin d'Études", 0, 230,
         { align: 'center', width: W, lineBreak: false });

// Badges
const techs = ['Java 21', 'Spring Boot 3', 'Next.js 14', 'JWT', 'PostgreSQL', 'Tailwind'];
const bw = 76, bh_ = 21, gap_ = 8;
const total_ = techs.length * bw + (techs.length - 1) * gap_;
let bx_ = (W - total_) / 2;
const by_ = pH * 0.55 - 58;
techs.forEach(tech => {
  doc.roundedRect(bx_, by_, bw, bh_, 4).fill(C.blueMid);
  doc.strokeColor(C.blueLight).lineWidth(0.6).roundedRect(bx_, by_, bw, bh_, 4).stroke();
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
     .text(tech, bx_, by_ + 6, { width: bw, align: 'center', lineBreak: false });
  bx_ += bw + gap_;
});

// Infos
const infos = [
  ['Cours',    'Dr. Ing. Ghada Feki'],
  ['Année',    '2025 – 2026'],
  ['Notation', 'Backend 15 pts + Frontend 5 pts = 20 pts'],
  ['Type',     'Marketplace B2C — Projet Universitaire'],
];
let iy = pH * 0.58;
infos.forEach(([label, val]) => {
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C.orange)
     .text(label + ' :', 90, iy, { lineBreak: false, width: 110 });
  doc.font('Helvetica').fontSize(11).fillColor(C.white)
     .text(val, 210, iy, { lineBreak: false });
  iy += 24;
});

// ─────────────────────────────────────────────────────────────────────────────
// TABLE DES MATIÈRES
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('Table des Matières');
doc.y += 8;

const toc = [
  ['1.',   "Introduction et Contexte du Projet",          '3'],
  ['2.',   "Analyse des Besoins",                         '4'],
  ['  2.1',"Besoins Fonctionnels",                       '4'],
  ['  2.2',"Besoins Non-Fonctionnels",                   '4'],
  ['3.',   "Conception et Architecture",                  '5'],
  ['  3.1',"Architecture Générale",                      '5'],
  ['  3.2',"Modèle de Données — 12 Entités JPA",        '6'],
  ['4.',   "Technologies Utilisées",                      '7'],
  ['5.',   "Réalisation — Backend",                      '8'],
  ['  5.1',"Sécurité et Authentification JWT",           '8'],
  ['  5.2',"Gestion des Produits",                       '9'],
  ['  5.3',"Panier et Commandes",                        '9'],
  ['  5.4',"Codes Promo et Avis Clients",               '10'],
  ['  5.5',"Tableaux de Bord",                          '10'],
  ['6.',   "Réalisation — Frontend (Next.js 14)",       '11'],
  ['7.',   "API REST et Sécurité",                      '12'],
  ['8.',   "Base de Données",                           '13'],
  ['9.',   "Tests et Déploiement",                      '14'],
  ['10.',  "Conclusion et Perspectives",                '15'],
];
toc.forEach(([num, title, pg]) => {
  const isMain = !num.startsWith('  ');
  const y0 = doc.y;
  doc.font(isMain ? 'Helvetica-Bold' : 'Helvetica')
     .fontSize(9.5).fillColor(C.grayDark);
  doc.text(num.trim(), M, y0, { width: 28, lineBreak: false });
  doc.text(title, M + 28, y0, { width: CW - 50, lineBreak: false });
  doc.text(pg, M + CW - 20, y0, { width: 20, align: 'right', lineBreak: false });
  doc.y = y0 + 17;
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. INTRODUCTION
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('1. Introduction et Contexte du Projet');
doc.y += 6;

para(
  "ShopFlow est une plateforme de commerce électronique B2C complète, développée dans " +
  "le cadre du cours du Dr. Ing. Ghada Feki pour l'année universitaire 2025–2026. " +
  "Ce projet vise à concevoir et implémenter une boutique en ligne fonctionnelle, " +
  "couvrant l'intégralité du cycle de vie d'un achat : de l'inscription de l'utilisateur " +
  "jusqu'à la livraison de la commande, en passant par la gestion du catalogue, " +
  "du panier et des codes promo."
);
para(
  "Le système adopte une architecture multi-couches respectant les bonnes pratiques " +
  "du génie logiciel : séparation des responsabilités, inversion de dépendances, et " +
  "exposition d'une API RESTful documentée via Swagger UI. L'application est évaluée " +
  "sur 20 points (Backend 15 pts + Frontend 5 pts)."
);
infoBox(
  "Objectifs principaux : Authentification sécurisée JWT · Gestion multi-rôles " +
  "(ADMIN / SELLER / CUSTOMER) · CRUD complet des produits avec variantes · " +
  "Cycle de vie des commandes · Tableaux de bord analytiques · Interface responsive Next.js 14"
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. ANALYSE DES BESOINS
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('2. Analyse des Besoins');
doc.y += 6;

h2('2.1 Besoins Fonctionnels');
h3('Gestion des Utilisateurs');
["Inscription avec vérification d'e-mail unique et mot de passe chiffré (BCrypt)",
 "Connexion avec émission d'un access token JWT et d'un refresh token persistant",
 "Déconnexion avec invalidation du refresh token en base de données",
 "Gestion du profil utilisateur (prénom, nom, adresses de livraison)",
 "Administration des comptes par l'ADMIN (activation / désactivation)",
].forEach(bullet);

h3('Gestion du Catalogue');
["CRUD complet des produits par le SELLER (nom, description, prix, prix promo, stock)",
 "Soft delete des produits (champ actif=false) pour conserver l'historique des commandes",
 "Variantes de produits (taille, couleur) avec stock supplémentaire par variante",
 "Catégories hiérarchiques auto-référencées (sous-catégories illimitées)",
 "Galerie d'images multiples par produit",
 "Recherche full-text et filtres dynamiques (prix, catégorie, vendeur, disponibilité)",
 "Pagination sur toutes les listes de produits",
].forEach(bullet);

h3('Panier et Commandes');
["Panier persistant en base de données associé à l'utilisateur connecté",
 "Ajout, modification de quantité et suppression d'articles",
 "Application de codes promo (PERCENT = pourcentage, FIXED = montant fixe)",
 "Validation du stock avant passage de commande",
 "Décrément atomique du stock lors de la confirmation",
 "Cycle de vie : PENDING -> CONFIRMED -> SHIPPED -> DELIVERED / CANCELLED",
 "Annulation possible par le client (statut PENDING uniquement)",
 "Snapshot du nom et prix produit dans chaque ligne de commande",
].forEach(bullet);

h3('Avis et Tableaux de Bord');
["Dépôt d'avis (note 1-5 + commentaire) réservé aux acheteurs vérifiés",
 "Dashboard ADMIN : chiffre d'affaires, top vendeurs, top produits, statistiques globales",
 "Dashboard SELLER : ses ventes, commandes en cours, produits les plus vendus",
 "Dashboard CUSTOMER : historique de commandes, dépenses totales",
].forEach(bullet);

doc.y += 8;
h2('2.2 Besoins Non-Fonctionnels');
drawTable(
  [
    { label: 'Exigence',    w: CW * 0.22, bold: true, color: C.blueDark },
    { label: 'Description', w: CW * 0.78 },
  ],
  [
    ["Sécurité",       "Chiffrement BCrypt, JWT signé HMAC-SHA256, cookies HttpOnly, CORS configuré, filtrage par rôle"],
    ["Performance",    "Requêtes paginées, lazy loading JPA, index sur colonnes critiques (email, numeroCommande)"],
    ["Maintenabilité", "Pattern en couches strict, DTOs dédiés, MapStruct, GlobalExceptionHandler centralisé"],
    ["Documentation",  "Swagger UI auto-généré (Springdoc OpenAPI), README complet, collection Postman fournie"],
    ["Portabilité",    "H2 en développement, PostgreSQL en production, configuration externalisée"],
    ["Ergonomie",      "Interface responsive mobile-first (Tailwind CSS), composants réutilisables"],
  ]
);
caption('Tableau 1 — Exigences non-fonctionnelles');

// ─────────────────────────────────────────────────────────────────────────────
// 3. ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('3. Conception et Architecture');
doc.y += 6;

h2('3.1 Architecture Générale');
para(
  "ShopFlow suit le patron architectural MVC étendu en couches strictement séparées. " +
  "Chaque couche n'a connaissance que de la couche immédiatement inférieure, ce qui " +
  "garantit un faible couplage et une haute cohésion."
);

drawTable(
  [
    { label: 'Couche',             w: CW * 0.24, bold: true, color: C.blueDark },
    { label: 'Technologie',        w: CW * 0.33 },
    { label: 'Responsabilité',     w: CW * 0.43 },
  ],
  [
    ["Présentation (Frontend)",   "Next.js 14 + TypeScript\nTailwind CSS",      "Rendu UI, navigation, gestion état authentification"],
    ["Contrôleur (Controller)",   "Spring @RestController\n@Valid + DTO",        "Validation des entrées, négociation de contenu, HTTP"],
    ["Service (Business Logic)",  "Spring @Service\n@Transactional",            "Règles métier, gestion du stock, calcul des totaux"],
    ["Accès Données (Repository)","Spring Data JPA\nSpecifications + Pageable", "Requêtes JPQL, filtres dynamiques, pagination"],
    ["Persistance (Entity / DB)", "Hibernate JPA\nH2 / PostgreSQL",             "12 entités JPA, schéma auto-généré"],
  ],
  { rh: 30 }
);
caption('Tableau 2 — Architecture en couches de ShopFlow');

doc.y += 4;
h2('3.2 Modèle de Données — 12 Entités JPA');

drawTable(
  [
    { label: 'Entité',               w: CW * 0.24, bold: true, color: C.blueMid },
    { label: 'Attributs principaux', w: CW * 0.76 },
  ],
  [
    ["User",          "id, email (unique), motDePasse (BCrypt), prenom, nom, role (ADMIN/SELLER/CUSTOMER), actif, dateCreation"],
    ["SellerProfile", "id, user (1:1), nomBoutique, description, note moyenne"],
    ["Product",       "id, seller (N:1), nom, description, prix, prixPromo, stock, actif, dateCreation, categories (N:N), images"],
    ["ProductVariant","id, product (N:1), taille, couleur, stockSupplementaire"],
    ["Category",      "id, nom, parent (auto-référence — hiérarchie illimitée)"],
    ["Cart",          "id, user (1:1), items (1:N)"],
    ["CartItem",      "id, cart (N:1), product (N:1), quantite"],
    ["Order",         "id, customer (N:1), numeroCommande (unique), statut, adresseLivraison, sousTotal, fraisLivraison, remise, totalTTC, couponCode"],
    ["OrderItem",     "id, order (N:1), product (N:1), nomProduit (snapshot), quantite, prixUnitaire"],
    ["Address",       "id, user (N:1), rue, ville, codePostal, pays"],
    ["Coupon",        "id, code (unique), type (PERCENT/FIXED), valeur, actif, dateExpiration, utilisationsRestantes"],
    ["Review",        "id, product (N:1), customer (N:1), note (1-5), commentaire, achatVerifie (boolean)"],
    ["RefreshToken",  "id, user (1:1), token (UUID), dateExpiration"],
  ],
  { hBg: C.blueMid, fontSize: 8.5 }
);
caption('Tableau 3 — Entités JPA et leurs attributs');

// ─────────────────────────────────────────────────────────────────────────────
// 4. TECHNOLOGIES
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('4. Technologies Utilisées');
doc.y += 6;

drawTable(
  [
    { label: 'Technologie',         w: CW * 0.22, bold: true, color: C.blueDark },
    { label: 'Version',             w: CW * 0.14 },
    { label: 'Rôle & Justification',w: CW * 0.64 },
  ],
  [
    ["Java",              "21 LTS",          "Langage backend — support records, switch expressions, performances JVM améliorées"],
    ["Spring Boot",       "3.2.3",           "Framework principal — auto-configuration, gestion cycle de vie, starter packs"],
    ["Spring Security",   "6.x",             "Sécurité — filtre JWT, gestion rôles, CORS, CSRF désactivé (API stateless)"],
    ["JJWT",              "0.12.5",          "Génération et validation des tokens JWT (HMAC-SHA256)"],
    ["Spring Data JPA",   "3.2.x",           "ORM — repository pattern, Specifications pour filtres dynamiques, Pageable"],
    ["Hibernate",         "6.x",             "Implémentation JPA — génération schéma, lazy/eager loading optimisé"],
    ["Lombok",            "1.18.38",         "Réduction boilerplate — @Builder, @Getter/@Setter, @AllArgsConstructor"],
    ["Springdoc OpenAPI", "2.3.0",           "Documentation Swagger UI auto-générée depuis les annotations Spring"],
    ["H2 Database",       "Runtime",         "Base en mémoire pour développement — démarrage rapide, H2 Console intégrée"],
    ["PostgreSQL",        "14+",             "Base de données production — ACID, performances, types avancés"],
    ["Maven",             "3.9+",            "Gestionnaire de dépendances et build — cycle de vie standardisé"],
    ["Next.js",           "14 (App Router)", "Framework React — SSR, routing file-based, middleware, Server Components"],
    ["TypeScript",        "5.x",             "Typage statique — détection d'erreurs au build, meilleure maintenabilité"],
    ["Tailwind CSS",      "3.x",             "CSS utilitaire — design responsive mobile-first, cohérence visuelle"],
    ["Axios",             "1.x",             "Client HTTP — intercepteur pour injection JWT et refresh automatique"],
  ],
  { fontSize: 8.5 }
);
caption('Tableau 4 — Stack technique complète');

// ─────────────────────────────────────────────────────────────────────────────
// 5. BACKEND
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('5. Réalisation — Backend');
doc.y += 6;

h2('5.1 Sécurité et Authentification JWT');
para(
  "Le système d'authentification repose sur deux tokens : un access token de courte " +
  "durée (signé HMAC-SHA256) et un refresh token stocké en base de données. " +
  "Le filtre JwtAuthFilter intercepte chaque requête HTTP et valide le token avant " +
  "d'autoriser l'accès aux ressources protégées."
);

drawTable(
  [
    { label: 'Étape', w: CW * 0.08, bold: true },
    { label: 'Acteur', w: CW * 0.24 },
    { label: 'Action', w: CW * 0.68 },
  ],
  [
    ['1', 'Client',           "POST /api/auth/login avec email + mot de passe"],
    ['2', 'AuthController',   "Vérification BCrypt du mot de passe haché"],
    ['3', 'JwtService',       "Génération access token (15 min) + refresh token (7 jours)"],
    ['4', 'RefreshTokenRepo', "Persistance du refresh token en base de données"],
    ['5', 'Client',           "Stockage access token (mémoire) + refresh token (cookie HttpOnly)"],
    ['6', 'JwtAuthFilter',    "Validation du token sur chaque requête protégée"],
    ['7', 'Client',           "POST /api/auth/refresh pour renouveler l'access token expiré"],
  ],
  { hBg: C.green }
);
caption('Tableau 5 — Flux d\'authentification JWT');

h3('Matrice des Permissions');
drawTable(
  [
    { label: 'Fonctionnalité',           w: CW * 0.52 },
    { label: 'CUSTOMER', w: CW * 0.16, align: 'center' },
    { label: 'SELLER',   w: CW * 0.16, align: 'center' },
    { label: 'ADMIN',    w: CW * 0.16, align: 'center' },
  ],
  [
    ["Consulter le catalogue",              "oui", "oui", "oui"],
    ["Gérer son panier / commander",        "oui", "oui", "oui"],
    ["Créer / modifier des produits",       "non", "oui", "oui"],
    ["Gérer les catégories",                "non", "non", "oui"],
    ["Gérer les coupons",                   "non", "non", "oui"],
    ["Voir tous les utilisateurs",          "non", "non", "oui"],
    ["Dashboard vendeur",                   "non", "oui", "oui"],
    ["Dashboard admin global",              "non", "non", "oui"],
  ]
);
caption('Tableau 6 — Matrice des permissions par rôle');

h2('5.2 Gestion des Produits');
para(
  "Le ProductController expose les opérations CRUD complètes. La recherche utilise " +
  "l'API Specifications JPA pour construire dynamiquement les prédicats de filtrage " +
  "(prix min/max, catégorie, vendeur, disponibilité, mot-clé). Le soft delete " +
  "(actif=false) préserve l'intégrité des commandes historiques."
);
["GET /api/products?category=&minPrice=&maxPrice=&q= — liste paginée avec filtres dynamiques",
 "POST /api/products — création (SELLER/ADMIN) avec validation Bean Validation",
 "PUT /api/products/{id} — modification (propriétaire SELLER ou ADMIN uniquement)",
 "DELETE /api/products/{id} — soft delete, visible dans les commandes passées",
 "GET /api/products/search?q= — recherche full-text sur nom et description",
].forEach(bullet);

h2('5.3 Panier et Commandes');
para(
  "Le panier est persistant : il survit à la déconnexion. La commande décrémente " +
  "atomiquement le stock dans une transaction unique pour éviter les race conditions."
);

drawTable(
  [
    { label: 'Statut',                w: CW * 0.20, bold: true, color: C.orange },
    { label: 'Qui peut modifier ?',   w: CW * 0.33 },
    { label: 'Transition autorisée',  w: CW * 0.47 },
  ],
  [
    ["PENDING",   "Système (automatique)",         "-> CONFIRMED à la validation du panier"],
    ["CONFIRMED", "SELLER / ADMIN",                "-> SHIPPED"],
    ["SHIPPED",   "SELLER / ADMIN",                "-> DELIVERED"],
    ["DELIVERED", "—",                             "Statut final (immuable)"],
    ["CANCELLED", "CUSTOMER (si PENDING) / ADMIN", "Statut final (immuable)"],
  ],
  { hBg: C.orange }
);
caption('Tableau 7 — Cycle de vie des commandes');

h2('5.4 Codes Promo et Avis Clients');
para(
  "Les coupons supportent deux types : PERCENT (ex. 20% de remise) et FIXED " +
  "(ex. 10 DA de réduction). Chaque coupon dispose d'une date d'expiration et " +
  "d'un compteur d'utilisations restantes. Les avis ne peuvent être déposés que " +
  "par des clients ayant effectivement commandé le produit (achatVerifie = true)."
);

h2('5.5 Tableaux de Bord');
["DashboardAdminResponse : chiffre d'affaires total, nombre de commandes, top 5 vendeurs, top 5 produits, répartition par statut",
 "DashboardSellerResponse : revenus du vendeur, commandes actives, produits en rupture de stock",
 "DashboardCustomerResponse : total dépensé, nombre de commandes, dernières commandes",
].forEach(bullet);

// ─────────────────────────────────────────────────────────────────────────────
// 6. FRONTEND
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar("6. Réalisation — Frontend (Next.js 14)");
doc.y += 6;

para(
  "Le frontend est développé avec Next.js 14 App Router, offrant le Server-Side " +
  "Rendering, le routing file-based et le middleware de protection des routes. " +
  "L'interface est entièrement responsive grâce à Tailwind CSS avec une approche mobile-first."
);

drawTable(
  [
    { label: 'Page',           w: CW * 0.26, bold: true, color: C.blueDark },
    { label: 'Route',          w: CW * 0.30 },
    { label: 'Fonctionnalité', w: CW * 0.44 },
  ],
  [
    ["Accueil",           "/",                   "Promotions, nouveautés, bannière hero"],
    ["Catalogue",         "/products",           "Filtres dynamiques, pagination, tri"],
    ["Fiche Produit",     "/products/[id]",      "Variantes, galerie, avis, ajout panier"],
    ["Panier",            "/cart",               "Gestion articles, coupon, récapitulatif"],
    ["Commande",          "/checkout",           "Sélection adresse, confirmation, récap"],
    ["Mes Commandes",     "/account/orders",     "Historique, détail, annulation"],
    ["Mon Profil",        "/account/profile",    "Modification infos, gestion adresses"],
    ["Mes Avis",          "/account/reviews",    "Avis déposés par le client"],
    ["Dashboard Vendeur", "/seller/dashboard",   "Stats ventes, produits, commandes"],
    ["Dashboard Admin",   "/dashboard/admin",    "Vue globale, gestion utilisateurs"],
    ["Connexion",         "/auth/login",         "Formulaire JWT, gestion erreurs"],
    ["Inscription",       "/auth/register",      "Validation côté client + serveur"],
  ],
  { hBg: C.blueMid, fontSize: 8.5 }
);
caption('Tableau 8 — Pages frontend');

h2('Composants Réutilisables');
drawTable(
  [
    { label: 'Composant',   w: CW * 0.28, bold: true, color: C.blueMid },
    { label: 'Description', w: CW * 0.72 },
  ],
  [
    ["Navbar",           "Barre de navigation responsive avec panier, profil, déconnexion"],
    ["ProductCard",      "Carte produit avec image, prix promo, note, bouton ajout panier"],
    ["RatingStars",      "Affichage de note 1-5 avec demi-étoiles"],
    ["OrderStatusBadge", "Badge coloré selon le statut de commande"],
    ["EmptyState",       "Composant d'état vide réutilisable avec icône et message"],
    ["Spinner",          "Indicateur de chargement animé"],
  ]
);
caption('Tableau 9 — Composants réutilisables');

h2("Gestion de l'Authentification Frontend");
para(
  "L'AuthContext (React Context API) expose l'état de l'utilisateur connecté à toute " +
  "l'application. L'intercepteur Axios dans lib/api.ts injecte automatiquement le JWT " +
  "dans les en-têtes Authorization de chaque requête, et appelle /api/auth/refresh en " +
  "cas d'expiration avant de re-tenter la requête originale. Le middleware Next.js " +
  "protège les routes selon le rôle de l'utilisateur connecté."
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. API REST
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('7. API REST et Sécurité');
doc.y += 6;

drawTable(
  [
    { label: 'Méth.',       w: CW * 0.10, align: 'center' },
    { label: 'Endpoint',    w: CW * 0.36 },
    { label: 'Accès',       w: CW * 0.22 },
    { label: 'Description', w: CW * 0.32 },
  ],
  [
    ["POST",    "/api/auth/register",        "Public",          "Inscription nouvel utilisateur"],
    ["POST",    "/api/auth/login",           "Public",          "Connexion — retourne JWT"],
    ["POST",    "/api/auth/refresh",         "Public",          "Renouvellement access token"],
    ["POST",    "/api/auth/logout",          "Authentifié",     "Invalidation refresh token"],
    ["GET",     "/api/products",             "Public",          "Liste paginée + filtres dynamiques"],
    ["GET",     "/api/products/{id}",        "Public",          "Détail d'un produit"],
    ["GET",     "/api/products/search?q=",   "Public",          "Recherche full-text"],
    ["POST",    "/api/products",             "SELLER / ADMIN",  "Créer un produit"],
    ["PUT",     "/api/products/{id}",        "SELLER / ADMIN",  "Modifier un produit"],
    ["DELETE",  "/api/products/{id}",        "SELLER / ADMIN",  "Soft delete d'un produit"],
    ["GET",     "/api/cart",                 "CUSTOMER",        "Récupérer le panier"],
    ["POST",    "/api/cart/items",           "CUSTOMER",        "Ajouter un article"],
    ["PUT",     "/api/cart/items/{id}",      "CUSTOMER",        "Modifier la quantité"],
    ["DELETE",  "/api/cart/items/{id}",      "CUSTOMER",        "Supprimer un article"],
    ["POST",    "/api/cart/coupon",          "CUSTOMER",        "Appliquer un coupon"],
    ["POST",    "/api/orders",              "CUSTOMER",        "Passer une commande"],
    ["GET",     "/api/orders/my",            "CUSTOMER",        "Mes commandes"],
    ["PUT",     "/api/orders/{id}/cancel",   "CUSTOMER",        "Annuler une commande"],
    ["PUT",     "/api/orders/{id}/status",   "SELLER / ADMIN",  "Changer le statut"],
    ["GET",     "/api/dashboard/admin",      "ADMIN",           "Statistiques globales"],
    ["GET",     "/api/dashboard/seller",     "SELLER",          "Statistiques vendeur"],
    ["GET",     "/api/dashboard/customer",   "CUSTOMER",        "Statistiques client"],
    ["POST",    "/api/products/{id}/reviews","CUSTOMER",        "Déposer un avis"],
    ["GET",     "/api/coupons",              "ADMIN",           "Lister les coupons"],
    ["POST",    "/api/coupons",              "ADMIN",           "Créer un coupon"],
  ],
  { fontSize: 8 }
);
caption('Tableau 10 — Endpoints API REST');

// ─────────────────────────────────────────────────────────────────────────────
// 8. BASE DE DONNÉES
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('8. Base de Données');
doc.y += 6;

para(
  "ShopFlow utilise H2 en mémoire pour le développement (démarrage instantané, " +
  "console web intégrée) et PostgreSQL en production. Le schéma est auto-généré " +
  "par Hibernate (ddl-auto=create-drop en dev, update en prod). Un fichier data.sql " +
  "initialise les données de démonstration au démarrage."
);

h2('Données de Démonstration');
drawTable(
  [
    { label: 'Entité',   w: CW * 0.25, bold: true },
    { label: 'Données',  w: CW * 0.75 },
  ],
  [
    ["Utilisateurs", "5 comptes : 1 admin, 2 vendeurs, 2 clients"],
    ["Produits",     "8 produits avec images, variantes (taille/couleur), catégories"],
    ["Catégories",   "Hiérarchie : Vêtements > Hommes / Femmes, Électronique > Téléphones / PC"],
    ["Codes promo",  "BIENVENUE10 (10%), REMISE5 (5 DA fixe), SUMMER20 (20%)"],
    ["Adresses",     "Adresses de livraison pour chaque client"],
  ],
  { hBg: C.blueMid }
);
caption('Tableau 11 — Données de démonstration');

h2('Comptes de Démonstration');
drawTable(
  [
    { label: 'Rôle',          w: CW * 0.16, bold: true },
    { label: 'Email',          w: CW * 0.34 },
    { label: 'Mot de passe',   w: CW * 0.20 },
    { label: 'Description',    w: CW * 0.30 },
  ],
  [
    ["ADMIN",    "admin@shopflow.com",    "password123", "Accès total — gestion globale"],
    ["SELLER",   "seller@shopflow.com",   "password123", "Vendeur — gestion de ses produits"],
    ["SELLER",   "seller2@shopflow.com",  "password123", "Second vendeur"],
    ["CUSTOMER", "client@shopflow.com",   "password123", "Client — achats et avis"],
    ["CUSTOMER", "client2@shopflow.com",  "password123", "Second client"],
  ]
);
caption('Tableau 12 — Comptes de démonstration');

// ─────────────────────────────────────────────────────────────────────────────
// 9. TESTS & DÉPLOIEMENT
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('9. Tests et Déploiement');
doc.y += 6;

h2('9.1 Tests Backend');
para(
  "Les tests unitaires sont écrits avec JUnit 5 et Mockito 5.14. Spring Security Test " +
  "est utilisé pour simuler les contextes d'authentification. Le build Maven (mvn test) " +
  "exécute automatiquement tous les tests avant le packaging."
);
["Tests unitaires des services : logique métier, calcul des totaux, gestion du stock",
 "Tests des contrôleurs : validation des DTOs, codes HTTP, gestion des erreurs",
 "Tests de sécurité : accès refusé sans token, accès refusé avec mauvais rôle",
 "GlobalExceptionHandler testé pour toutes les exceptions métier",
].forEach(bullet);

h2('9.2 Tests API — Collection Postman');
para(
  "Une collection Postman complète (shopflow.postman_collection.json) est fournie. " +
  "Elle couvre l'intégralité des endpoints avec des scénarios de test pour chaque " +
  "rôle et gère automatiquement les tokens JWT via des variables d'environnement."
);

h2('9.3 Environnements de Déploiement');
drawTable(
  [
    { label: 'Env.',              w: CW * 0.18 },
    { label: 'Base de données',   w: CW * 0.22 },
    { label: 'Configuration',     w: CW * 0.35 },
    { label: 'URL',               w: CW * 0.25 },
  ],
  [
    ["Développement", "H2 In-Memory",  "application.properties (défaut)",               "localhost:8080 / localhost:3000"],
    ["Production",    "PostgreSQL 14+", "Variables env. DB_URL, DB_USER, DB_PASS",       "Selon l'hébergeur"],
  ]
);
caption("Tableau 13 — Environnements de déploiement");

h2('9.4 Commandes de Démarrage');
const codeY = doc.y + 4;
const code =
  "# Backend (mode développement)\n" +
  "cd backend && mvn spring-boot:run\n" +
  "# API : http://localhost:8080\n" +
  "# Swagger : http://localhost:8080/swagger-ui\n\n" +
  "# Frontend\n" +
  "cd frontend && npm install && npm run dev\n" +
  "# Interface : http://localhost:3000";
const codeH_ = doc.heightOfString(code, { width: CW - 22, fontSize: 9 }) + 20;
doc.rect(M, codeY, CW, codeH_).fill(C.grayLight);
doc.font('Courier').fontSize(9).fillColor(C.grayDark)
   .text(code, M + 11, codeY + 10, { width: CW - 22 });
doc.y = codeY + codeH_ + 10;

// ─────────────────────────────────────────────────────────────────────────────
// 10. CONCLUSION
// ─────────────────────────────────────────────────────────────────────────────
doc.addPage();
sectionBar('10. Conclusion et Perspectives');
doc.y += 6;

para(
  "Le projet ShopFlow constitue une implémentation complète et fonctionnelle d'une " +
  "marketplace B2C, couvrant l'intégralité des fonctionnalités attendues d'une boutique " +
  "en ligne moderne. L'architecture choisie respecte les bonnes pratiques du développement " +
  "logiciel : séparation des responsabilités, sécurité par conception, API documentée " +
  "et interface utilisateur responsive."
);
para(
  "Les choix technologiques (Spring Boot 3.2, Next.js 14, JWT JJWT 0.12.5) sont alignés " +
  "avec les standards de l'industrie en 2025, garantissant la maintenabilité et " +
  "l'évolutivité du système."
);

h2('Bilan des Fonctionnalités Réalisées');
drawTable(
  [
    { label: 'Fonctionnalité',  w: CW * 0.64 },
    { label: 'Backend',         w: CW * 0.18, align: 'center', bold: true },
    { label: 'Frontend',        w: CW * 0.18, align: 'center', bold: true },
  ],
  [
    ["Authentification JWT (access + refresh)",     "oui", "oui"],
    ["Gestion multi-rôles (ADMIN/SELLER/CUSTOMER)", "oui", "oui"],
    ["CRUD produits avec variantes",                "oui", "oui"],
    ["Catégories hiérarchiques",                    "oui", "oui"],
    ["Panier persistant",                           "oui", "oui"],
    ["Codes promo (PERCENT + FIXED)",              "oui", "oui"],
    ["Cycle de vie des commandes",                  "oui", "oui"],
    ["Gestion du stock atomique",                   "oui", "—"],
    ["Avis avec vérification d'achat",              "oui", "oui"],
    ["Dashboard Admin + Seller",                    "oui", "oui"],
    ["Recherche full-text + filtres dynamiques",    "oui", "oui"],
    ["Pagination",                                  "oui", "oui"],
    ["Swagger UI documenté",                        "oui", "—"],
    ["Design responsive mobile-first",              "—",   "oui"],
  ]
);
caption('Tableau 14 — Bilan des fonctionnalités réalisées');

h2("Perspectives d'Amélioration");
["Paiement en ligne : intégration d'une passerelle (Stripe, PayPal)",
 "Notifications en temps réel : WebSockets pour alertes de commande et chat",
 "Système de recommandation : suggestions basées sur l'historique d'achat",
 "Internationalisation (i18n) : support multilingue (arabe, français, anglais)",
 "Tests E2E : Playwright ou Cypress pour les scénarios utilisateur complets",
 "CI/CD : pipeline GitHub Actions pour build, tests et déploiement automatique",
 "Images produits : upload vers un service cloud (AWS S3, Cloudinary)",
 "Application mobile : React Native en réutilisant la même API REST",
].forEach(bullet);

doc.y += 10;
infoBox(
  "ShopFlow est un projet académique complet qui démontre la maîtrise des technologies " +
  "web modernes, des bonnes pratiques architecturales et de la sécurité applicative. " +
  "Il constitue une base solide, extensible vers un produit de production.",
  '#F0FFF4', '#27AE60', '#1A6B3A'
);

// ─────────────────────────────────────────────────────────────────────────────
doc.end();
stream.on('finish', () => console.log('PDF genere : ' + OUTPUT));
stream.on('error',  err => { console.error(err); process.exit(1); });
