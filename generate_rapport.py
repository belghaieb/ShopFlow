#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génération du rapport académique ShopFlow en PDF.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import KeepTogether

OUTPUT = r"C:/Users/azizb/Documents/sujet sauvgardé/projectfederé/ShopFlow/ShopFlow/ShopFlow_Rapport.pdf"

# ─── Couleurs thème ────────────────────────────────────────────────────────────
BLEU_FONCE  = colors.HexColor("#1A3A5C")
BLEU_MOYEN  = colors.HexColor("#2D6A9F")
BLEU_CLAIR  = colors.HexColor("#E8F1FB")
VERT        = colors.HexColor("#27AE60")
GRIS_FONCE  = colors.HexColor("#2C3E50")
GRIS_MOYEN  = colors.HexColor("#7F8C8D")
GRIS_CLAIR  = colors.HexColor("#F4F6F8")
ORANGE      = colors.HexColor("#E67E22")
ROUGE       = colors.HexColor("#C0392B")
BLANC       = colors.white

W, H = A4  # 595 x 842 pts

# ─── Styles ───────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def make_style(name, parent="Normal", **kw):
    return ParagraphStyle(name, parent=styles[parent], **kw)

S = {
    "title_page_main": make_style("tpm",
        fontName="Helvetica-Bold", fontSize=28, textColor=BLANC,
        alignment=TA_CENTER, spaceAfter=6),
    "title_page_sub": make_style("tps",
        fontName="Helvetica-Bold", fontSize=16, textColor=BLEU_CLAIR,
        alignment=TA_CENTER, spaceAfter=4),
    "title_page_info": make_style("tpi",
        fontName="Helvetica", fontSize=11, textColor=BLANC,
        alignment=TA_CENTER, spaceAfter=3),
    "h1": make_style("h1",
        fontName="Helvetica-Bold", fontSize=15, textColor=BLEU_FONCE,
        spaceBefore=18, spaceAfter=8, borderPad=4),
    "h2": make_style("h2",
        fontName="Helvetica-Bold", fontSize=12, textColor=BLEU_MOYEN,
        spaceBefore=12, spaceAfter=5),
    "h3": make_style("h3",
        fontName="Helvetica-Bold", fontSize=10, textColor=GRIS_FONCE,
        spaceBefore=8, spaceAfter=4),
    "body": make_style("body",
        fontName="Helvetica", fontSize=10, textColor=GRIS_FONCE,
        leading=15, spaceAfter=5, alignment=TA_JUSTIFY),
    "bullet": make_style("bullet",
        fontName="Helvetica", fontSize=10, textColor=GRIS_FONCE,
        leading=14, spaceAfter=3, leftIndent=16, bulletIndent=4),
    "code": make_style("code",
        fontName="Courier", fontSize=8.5, textColor=GRIS_FONCE,
        backColor=GRIS_CLAIR, leading=12, spaceAfter=4,
        leftIndent=12, rightIndent=12),
    "toc_entry": make_style("toc",
        fontName="Helvetica", fontSize=10, textColor=GRIS_FONCE,
        leading=18),
    "caption": make_style("caption",
        fontName="Helvetica-Oblique", fontSize=9, textColor=GRIS_MOYEN,
        alignment=TA_CENTER, spaceAfter=6),
    "badge": make_style("badge",
        fontName="Helvetica-Bold", fontSize=9, textColor=BLANC,
        alignment=TA_CENTER),
}

# ─── Helpers ──────────────────────────────────────────────────────────────────
def h1(txt):  return Paragraph(txt, S["h1"])
def h2(txt):  return Paragraph(txt, S["h2"])
def h3(txt):  return Paragraph(txt, S["h3"])
def p(txt):   return Paragraph(txt, S["body"])
def bl(txt):  return Paragraph(f"• {txt}", S["bullet"])
def sp(n=6):  return Spacer(1, n)
def hr():     return HRFlowable(width="100%", thickness=0.5,
                                color=BLEU_MOYEN, spaceAfter=6)

def section_title(txt):
    """Titre de section avec fond coloré."""
    data = [[Paragraph(txt, make_style("st_inner",
                fontName="Helvetica-Bold", fontSize=13,
                textColor=BLANC, alignment=TA_LEFT))]]
    t = Table(data, colWidths=[W - 4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BLEU_FONCE),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
        ("ROUNDEDCORNERS", [4]),
    ]))
    return t

def info_box(txt, color=BLEU_CLAIR, text_color=BLEU_FONCE):
    data = [[Paragraph(txt, make_style("ib", fontName="Helvetica",
                fontSize=10, textColor=text_color, leading=14))]]
    t = Table(data, colWidths=[W - 4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), color),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
        ("BOX", (0,0), (-1,-1), 1, BLEU_MOYEN),
    ]))
    return t

def two_col_table(rows, title_left="", title_right=""):
    data = []
    if title_left or title_right:
        data.append([
            Paragraph(title_left, make_style("th", fontName="Helvetica-Bold",
                      fontSize=10, textColor=BLANC)),
            Paragraph(title_right, make_style("th2", fontName="Helvetica-Bold",
                      fontSize=10, textColor=BLANC)),
        ])
    for left, right in rows:
        data.append([
            Paragraph(left,  make_style("td_l", fontName="Helvetica-Bold",
                      fontSize=9, textColor=GRIS_FONCE, leading=12)),
            Paragraph(right, make_style("td_r", fontName="Helvetica",
                      fontSize=9, textColor=GRIS_FONCE, leading=12)),
        ])
    cw = [(W-4*cm)*0.35, (W-4*cm)*0.65]
    t = Table(data, colWidths=cw)
    style = [
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS", (0,0), (-1,-1),
         [GRIS_CLAIR, BLANC] * (len(data)//2 + 1)),
        ("GRID", (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]
    if title_left or title_right:
        style += [
            ("BACKGROUND", (0,0), (-1,0), BLEU_MOYEN),
            ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
        ]
    t.setStyle(TableStyle(style))
    return t

# ─── En-tête / Pied de page ───────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    page = doc.page

    if page == 1:   # page de garde → pas d'en-tête
        canvas.restoreState()
        return

    # En-tête
    canvas.setFillColor(BLEU_FONCE)
    canvas.rect(0, H - 1.2*cm, W, 1.2*cm, fill=1, stroke=0)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.setFillColor(BLANC)
    canvas.drawString(1.5*cm, H - 0.85*cm, "ShopFlow — Rapport de Projet")
    canvas.drawRightString(W - 1.5*cm, H - 0.85*cm,
                           "Système de Gestion d'une Boutique en Ligne")

    # Pied
    canvas.setFillColor(BLEU_FONCE)
    canvas.rect(0, 0, W, 1*cm, fill=1, stroke=0)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(BLANC)
    canvas.drawString(1.5*cm, 0.35*cm, "Projet Universitaire — 2025-2026")
    canvas.drawCentredString(W/2, 0.35*cm, f"— {page} —")
    canvas.drawRightString(W - 1.5*cm, 0.35*cm, "Dr. Ing. Ghada Feki")

    canvas.restoreState()


def build_cover():
    """Page de garde dessinée directement sur le canvas."""
    from reportlab.platypus import Flowable

    class CoverPage(Flowable):
        def __init__(self):
            Flowable.__init__(self)
            self.width  = W - 3*cm
            self.height = H - 2*cm

        def draw(self):
            c = self.canv
            # Fond dégradé simulé : deux rectangles
            c.setFillColor(BLEU_FONCE)
            c.rect(-1.5*cm, -1*cm, W, H*0.62, fill=1, stroke=0)
            c.setFillColor(BLEU_MOYEN)
            c.rect(-1.5*cm, H*0.62 - 1*cm, W, H*0.38, fill=1, stroke=0)

            # Trait décoratif
            c.setStrokeColor(ORANGE)
            c.setLineWidth(5)
            c.line(-1.5*cm, H*0.62 - 1*cm, W - 1.5*cm, H*0.62 - 1*cm)

            # Logo texte
            c.setFont("Helvetica-Bold", 52)
            c.setFillColor(BLANC)
            c.drawCentredString(W/2 - 1.5*cm, H*0.72, "ShopFlow")

            c.setFont("Helvetica", 14)
            c.setFillColor(BLEU_CLAIR)
            c.drawCentredString(W/2 - 1.5*cm, H*0.72 - 30,
                                "Système de Gestion d'une Boutique en Ligne")

            c.setStrokeColor(BLANC)
            c.setLineWidth(0.5)
            c.line(W*0.25 - 1.5*cm, H*0.72 - 44, W*0.75 - 1.5*cm, H*0.72 - 44)

            # Sous-titre
            c.setFont("Helvetica-Bold", 13)
            c.setFillColor(BLANC)
            c.drawCentredString(W/2 - 1.5*cm, H*0.72 - 64,
                                "Rapport de Projet de Fin d'Études")

            # Badges technos
            techs = ["Java 21", "Spring Boot 3", "Next.js 14",
                     "JWT", "PostgreSQL", "Tailwind CSS"]
            badge_w, badge_h = 80, 22
            total = len(techs) * badge_w + (len(techs)-1)*10
            start_x = (W - 3*cm - total) / 2
            y_badge = H*0.62 - 1*cm - 48
            for i, tech in enumerate(techs):
                bx = start_x + i*(badge_w+10)
                c.setFillColor(BLEU_MOYEN)
                c.roundRect(bx, y_badge, badge_w, badge_h, 5, fill=1, stroke=0)
                c.setFillColor(BLANC)
                c.setFont("Helvetica-Bold", 8)
                c.drawCentredString(bx + badge_w/2, y_badge + 7, tech)

            # Infos projet en bas
            infos = [
                ("Cours",      "Dr. Ing. Ghada Feki"),
                ("Année",      "2025 – 2026"),
                ("Notation",   "Backend 15 pts + Frontend 5 pts = 20 pts"),
                ("Type",       "Marketplace B2C — Projet Universitaire"),
            ]
            y_info = H*0.62 - 1*cm - 110
            for label, val in infos:
                c.setFont("Helvetica-Bold", 10)
                c.setFillColor(ORANGE)
                c.drawString(2*cm, y_info, f"{label} :")
                c.setFont("Helvetica", 10)
                c.setFillColor(BLANC)
                c.drawString(5.5*cm, y_info, val)
                y_info -= 20

    return CoverPage()


# ─── Construction du document ──────────────────────────────────────────────────
def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=1.8*cm, bottomMargin=1.5*cm,
        title="ShopFlow — Rapport de Projet",
        author="Projet Universitaire 2025-2026",
        subject="Système de Gestion d'une Boutique en Ligne",
    )

    story = []

    # ── 1. Page de garde ──────────────────────────────────────────────────────
    story.append(build_cover())
    story.append(PageBreak())

    # ── 2. Table des matières ─────────────────────────────────────────────────
    story.append(section_title("Table des Matières"))
    story.append(sp(10))

    toc_items = [
        ("1.", "Introduction et Contexte du Projet", "3"),
        ("2.", "Analyse des Besoins", "4"),
        ("  2.1", "Besoins Fonctionnels", "4"),
        ("  2.2", "Besoins Non-Fonctionnels", "4"),
        ("3.", "Conception et Architecture", "5"),
        ("  3.1", "Architecture Générale", "5"),
        ("  3.2", "Modèle de Données", "6"),
        ("4.", "Technologies Utilisées", "7"),
        ("5.", "Réalisation — Backend", "8"),
        ("  5.1", "Sécurité et Authentification JWT", "8"),
        ("  5.2", "Gestion des Produits", "9"),
        ("  5.3", "Panier et Commandes", "9"),
        ("  5.4", "Codes Promo et Avis", "10"),
        ("  5.5", "Tableaux de Bord", "10"),
        ("6.", "Réalisation — Frontend", "11"),
        ("7.", "API REST et Sécurité", "12"),
        ("8.", "Base de Données", "13"),
        ("9.", "Tests et Déploiement", "14"),
        ("10.", "Conclusion et Perspectives", "15"),
    ]

    for num, title, page in toc_items:
        dots = "." * max(1, 62 - len(num) - len(title) - len(page))
        txt = f'<font name="Helvetica-Bold">{num}</font>  {title} {dots} {page}'
        story.append(Paragraph(txt, S["toc_entry"]))

    story.append(PageBreak())

    # ── 3. Introduction ───────────────────────────────────────────────────────
    story.append(section_title("1. Introduction et Contexte du Projet"))
    story.append(sp(8))

    story.append(p(
        "<b>ShopFlow</b> est une plateforme de commerce électronique B2C complète, "
        "développée dans le cadre du cours du <b>Dr. Ing. Ghada Feki</b> pour l'année "
        "universitaire <b>2025–2026</b>. Ce projet vise à concevoir et implémenter une "
        "boutique en ligne fonctionnelle, couvrant l'intégralité du cycle de vie d'un "
        "achat : de l'inscription de l'utilisateur jusqu'à la livraison de la commande, "
        "en passant par la gestion du catalogue, du panier et des paiements."
    ))
    story.append(sp(4))
    story.append(p(
        "Le système adopte une <b>architecture multi-couches</b> respectant les "
        "bonnes pratiques du génie logiciel : séparation des responsabilités, "
        "inversion de dépendances, et exposition d'une API RESTful documentée. "
        "L'application est évaluée sur <b>20 points</b> (Backend 15 pts + Frontend 5 pts)."
    ))
    story.append(sp(8))

    story.append(info_box(
        "<b>Objectifs principaux :</b> Authentification sécurisée par JWT · "
        "Gestion multi-rôles (ADMIN / SELLER / CUSTOMER) · "
        "CRUD complet des produits avec variantes · "
        "Cycle de vie des commandes · "
        "Tableaux de bord analytiques · "
        "Interface responsive Next.js 14"
    ))
    story.append(sp(12))

    # ── 4. Analyse des Besoins ────────────────────────────────────────────────
    story.append(section_title("2. Analyse des Besoins"))
    story.append(sp(8))

    story.append(h2("2.1 Besoins Fonctionnels"))

    story.append(h3("Gestion des Utilisateurs"))
    for b in [
        "Inscription avec vérification d'e-mail unique et mot de passe chiffré (BCrypt)",
        "Connexion avec émission d'un access token JWT et d'un refresh token persistant",
        "Déconnexion avec invalidation du refresh token en base",
        "Gestion du profil utilisateur (prénom, nom, adresses de livraison)",
        "Administration des comptes par l'ADMIN (activation / désactivation)",
    ]:
        story.append(bl(b))

    story.append(sp(4))
    story.append(h3("Gestion du Catalogue"))
    for b in [
        "CRUD complet des produits par le SELLER (nom, description, prix, prix promo, stock)",
        "Soft delete des produits (champ <b>actif</b>) pour conserver l'historique",
        "Variantes de produits (taille, couleur) avec stock supplémentaire",
        "Catégories hiérarchiques auto-référencées (sous-catégories illimitées)",
        "Galerie d'images multiples par produit",
        "Recherche full-text et filtres dynamiques (prix, catégorie, vendeur, disponibilité)",
        "Pagination sur toutes les listes",
    ]:
        story.append(bl(b))

    story.append(sp(4))
    story.append(h3("Panier et Commandes"))
    for b in [
        "Panier persistant en base de données (associé à l'utilisateur connecté)",
        "Ajout, modification de quantité, suppression d'articles",
        "Application de codes promo (PERCENT = pourcentage, FIXED = montant fixe)",
        "Validation du stock avant passage de commande",
        "Décrément atomique du stock lors de la confirmation",
        "Cycle de vie : PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED",
        "Annulation possible par le client (statut PENDING uniquement)",
        "Snapshot du nom et prix produit dans la ligne de commande",
    ]:
        story.append(bl(b))

    story.append(sp(4))
    story.append(h3("Avis et Tableaux de Bord"))
    for b in [
        "Dépôt d'avis (note 1–5 + commentaire) réservé aux acheteurs vérifiés",
        "Dashboard ADMIN : chiffre d'affaires, top vendeurs, top produits, statistiques globales",
        "Dashboard SELLER : ses ventes, commandes en cours, produits les plus vendus",
        "Dashboard CUSTOMER : historique de commandes, dépenses totales",
    ]:
        story.append(bl(b))

    story.append(sp(8))
    story.append(h2("2.2 Besoins Non-Fonctionnels"))

    rows_nf = [
        ("Sécurité",        "Chiffrement BCrypt, JWT signé HMAC-SHA256, cookies HttpOnly, CORS configuré, filtrage par rôle"),
        ("Performance",     "Requêtes paginées, lazy loading JPA, index sur colonnes critiques (email, numeroCommande)"),
        ("Maintenabilité",  "Pattern en couches strict, DTOs dédiés, MapStruct, GlobalExceptionHandler centralisé"),
        ("Documentation",   "Swagger UI auto-généré (Springdoc OpenAPI), README complet, collection Postman"),
        ("Portabilité",     "H2 en développement, PostgreSQL en production, configuration externalisée"),
        ("Ergonomie",       "Interface responsive mobile-first (Tailwind CSS), composants réutilisables"),
    ]
    story.append(two_col_table(rows_nf, "Exigence", "Description"))
    story.append(PageBreak())

    # ── 5. Architecture ───────────────────────────────────────────────────────
    story.append(section_title("3. Conception et Architecture"))
    story.append(sp(8))

    story.append(h2("3.1 Architecture Générale"))
    story.append(p(
        "ShopFlow suit le patron architectural <b>MVC étendu</b> en couches strictement "
        "séparées. Chaque couche n'a connaissance que de la couche immédiatement "
        "inférieure, ce qui garantit un faible couplage et une haute cohésion."
    ))
    story.append(sp(6))

    arch_data = [
        ["Couche", "Technologie", "Responsabilité"],
        ["Présentation\n(Frontend)", "Next.js 14 + TypeScript\nTailwind CSS", "Rendu UI, navigation,\ngestion état authentification"],
        ["Contrôleur\n(Controller)", "Spring @RestController\n@Valid + DTO", "Validation des entrées,\nnégociation de contenu, HTTP"],
        ["Service\n(Business Logic)", "Spring @Service\n@Transactional", "Règles métier, gestion\ndu stock, calcul des totaux"],
        ["Accès Données\n(Repository)", "Spring Data JPA\nSpecifications + Pageable", "Requêtes JPQL, filtres\ndynamiques, pagination"],
        ["Persistance\n(Entity / DB)", "Hibernate JPA\nH2 / PostgreSQL", "12 entités JPA,\nschéma auto-généré"],
    ]
    t = Table(arch_data, colWidths=[(W-4*cm)*0.22, (W-4*cm)*0.35, (W-4*cm)*0.43])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_FONCE),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.4, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("BACKGROUND",    (0,1), (0,-1),  BLEU_CLAIR),
        ("FONTNAME",      (0,1), (0,-1),  "Helvetica-Bold"),
    ]))
    story.append(t)
    story.append(sp(6))
    story.append(Paragraph(
        "Tableau 1 — Architecture en couches de ShopFlow", S["caption"]))

    story.append(sp(10))
    story.append(h2("3.2 Modèle de Données — 12 Entités JPA"))

    entities = [
        ("User",           "id, email (unique), motDePasse (BCrypt), prenom, nom,\nrole (ADMIN/SELLER/CUSTOMER), actif, dateCreation"),
        ("SellerProfile",  "id, user (1:1), nomBoutique, description, note moyenne"),
        ("Product",        "id, seller (N:1), nom, description, prix, prixPromo,\nstock, actif, dateCreation, categories (N:N), images"),
        ("ProductVariant", "id, product (N:1), taille, couleur, stockSupplementaire"),
        ("Category",       "id, nom, parent (auto-ref — hiérarchie illimitée)"),
        ("Cart",           "id, user (1:1), items (1:N)"),
        ("CartItem",       "id, cart (N:1), product (N:1), quantite"),
        ("Order",          "id, customer (N:1), numeroCommande (unique), statut,\nadresseLivraison, sousTotal, fraisLivraison, remise, totalTTC, couponCode"),
        ("OrderItem",      "id, order (N:1), product (N:1), nomProduit (snapshot),\nquantite, prixUnitaire"),
        ("Address",        "id, user (N:1), rue, ville, codePostal, pays"),
        ("Coupon",         "id, code (unique), type (PERCENT/FIXED), valeur, actif,\ndateExpiration, utilisationsRestantes"),
        ("Review",         "id, product (N:1), customer (N:1), note (1-5),\ncommentaire, achatVerifie (boolean)"),
        ("RefreshToken",   "id, user (1:1), token (UUID), dateExpiration"),
    ]
    t2 = Table(
        [["Entité", "Attributs principaux"]] +
        [[Paragraph(e, make_style("e", fontName="Helvetica-Bold", fontSize=9,
                                  textColor=BLEU_FONCE)),
          Paragraph(a, make_style("a", fontName="Helvetica", fontSize=8.5,
                                  textColor=GRIS_FONCE, leading=12))]
         for e, a in entities],
        colWidths=[(W-4*cm)*0.28, (W-4*cm)*0.72]
    )
    t2.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_MOYEN),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0),  10),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("ALIGN",         (0,0), (-1, 0), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ]))
    story.append(t2)
    story.append(Paragraph("Tableau 2 — Entités JPA et leurs attributs", S["caption"]))
    story.append(PageBreak())

    # ── 6. Technologies ───────────────────────────────────────────────────────
    story.append(section_title("4. Technologies Utilisées"))
    story.append(sp(8))

    tech_data = [
        ["Technologie", "Version", "Rôle & Justification"],
        ["Java", "21 LTS", "Langage backend — support des records, switch expressions, performances JVM améliorées"],
        ["Spring Boot", "3.2.3", "Framework principal — auto-configuration, gestion du cycle de vie, starter packs"],
        ["Spring Security", "6.x", "Sécurité — filtre JWT, gestion des rôles, CORS, CSRF désactivé (API stateless)"],
        ["JJWT", "0.12.5", "Génération et validation des tokens JWT (HMAC-SHA256)"],
        ["Spring Data JPA", "3.2.x", "ORM — repository pattern, Specifications pour filtres dynamiques, Pageable"],
        ["Hibernate", "6.x", "Implémentation JPA — génération du schéma, lazy/eager loading"],
        ["Lombok", "1.18.38", "Réduction du boilerplate — @Builder, @Getter/@Setter, @AllArgsConstructor"],
        ["Springdoc OpenAPI", "2.3.0", "Documentation Swagger UI auto-générée depuis les annotations Spring"],
        ["H2 Database", "Runtime", "Base en mémoire pour développement — démarrage rapide, H2 Console intégrée"],
        ["PostgreSQL", "14+", "Base de données production — ACID, performances, types avancés"],
        ["Maven", "3.9+", "Gestionnaire de dépendances et build — cycle de vie standardisé"],
        ["Next.js", "14 (App Router)", "Framework React — SSR, routing file-based, middleware, Server Components"],
        ["TypeScript", "5.x", "Typage statique — détection d'erreurs au build, meilleure maintenabilité"],
        ["Tailwind CSS", "3.x", "CSS utilitaire — design responsive mobile-first, cohérence visuelle"],
        ["Axios", "1.x", "Client HTTP — intercepteur de requêtes pour injection du JWT et refresh automatique"],
    ]
    col_w = [(W-4*cm)*0.22, (W-4*cm)*0.14, (W-4*cm)*0.64]
    t3 = Table(tech_data, colWidths=col_w)
    t3.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_FONCE),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("FONTNAME",      (0,1), (0,-1),  "Helvetica-Bold"),
        ("TEXTCOLOR",     (0,1), (0,-1),  BLEU_FONCE),
    ]))
    story.append(t3)
    story.append(Paragraph("Tableau 3 — Stack technique complète", S["caption"]))
    story.append(PageBreak())

    # ── 7. Réalisation Backend ────────────────────────────────────────────────
    story.append(section_title("5. Réalisation — Backend"))
    story.append(sp(8))

    story.append(h2("5.1 Sécurité et Authentification JWT"))
    story.append(p(
        "Le système d'authentification repose sur deux tokens : un <b>access token</b> "
        "de courte durée (signé HMAC-SHA256) et un <b>refresh token</b> stocké en base "
        "de données. Le filtre <code>JwtAuthFilter</code> intercepte chaque requête HTTP "
        "et valide le token avant d'autoriser l'accès."
    ))
    story.append(sp(4))

    flow_data = [
        ["Étape", "Acteur", "Action"],
        ["1", "Client", "POST /api/auth/login avec email + mot de passe"],
        ["2", "AuthController", "Vérification BCrypt du mot de passe"],
        ["3", "JwtService", "Génération access token (15 min) + refresh token (7 jours)"],
        ["4", "RefreshTokenRepo", "Persistance du refresh token en base de données"],
        ["5", "Client", "Stockage access token (mémoire) + refresh token (cookie HttpOnly)"],
        ["6", "JwtAuthFilter", "Validation du token sur chaque requête protégée"],
        ["7", "Client", "POST /api/auth/refresh pour renouveler l'access token expiré"],
    ]
    tf = Table(flow_data, colWidths=[(W-4*cm)*0.07, (W-4*cm)*0.23, (W-4*cm)*0.70])
    tf.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  VERT),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [colors.HexColor("#F0FFF4"), BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("ALIGN",         (0,0), (0,-1),  "CENTER"),
        ("FONTNAME",      (0,1), (0,-1),  "Helvetica-Bold"),
        ("TEXTCOLOR",     (0,1), (0,-1),  VERT),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ]))
    story.append(tf)
    story.append(Paragraph("Tableau 4 — Flux d'authentification JWT", S["caption"]))

    story.append(sp(8))
    story.append(h3("Rôles et Permissions"))
    roles_data = [
        ["Endpoint / Fonctionnalité", "CUSTOMER", "SELLER", "ADMIN"],
        ["Consulter le catalogue",        "✓", "✓", "✓"],
        ["Gérer son panier / commander",  "✓", "✓", "✓"],
        ["Créer / modifier des produits", "✗", "✓", "✓"],
        ["Gérer les catégories",          "✗", "✗", "✓"],
        ["Gérer les coupons",             "✗", "✗", "✓"],
        ["Voir tous les utilisateurs",    "✗", "✗", "✓"],
        ["Dashboard vendeur",             "✗", "✓", "✓"],
        ["Dashboard admin global",        "✗", "✗", "✓"],
    ]
    tr = Table(roles_data, colWidths=[(W-4*cm)*0.55,(W-4*cm)*0.15,(W-4*cm)*0.15,(W-4*cm)*0.15])
    tr.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_FONCE),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("ALIGN",         (1,1), (-1,-1), "CENTER"),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("TEXTCOLOR",     (1,1), (-1,-1), VERT),
    ]))
    story.append(tr)
    story.append(Paragraph("Tableau 5 — Matrice des permissions par rôle", S["caption"]))

    story.append(sp(10))
    story.append(h2("5.2 Gestion des Produits"))
    story.append(p(
        "Le <code>ProductController</code> expose les opérations CRUD complètes. "
        "La recherche utilise l'API <b>Specifications JPA</b> pour construire "
        "dynamiquement les prédicats de filtrage (prix min/max, catégorie, vendeur, "
        "disponibilité, mot-clé). Le <b>soft delete</b> (champ <code>actif = false</code>) "
        "préserve l'intégrité des commandes historiques."
    ))
    story.append(sp(4))
    for b in [
        "GET /api/products?category=&minPrice=&maxPrice=&q= — liste paginée avec filtres dynamiques",
        "POST /api/products — création (SELLER/ADMIN) avec validation Bean Validation",
        "PUT /api/products/{id} — modification (propriétaire SELLER ou ADMIN uniquement)",
        "DELETE /api/products/{id} — soft delete, le produit reste visible dans les commandes passées",
        "GET /api/products/search?q= — recherche full-text sur nom et description",
    ]:
        story.append(bl(b))

    story.append(sp(8))
    story.append(h2("5.3 Panier et Commandes"))
    story.append(p(
        "Le panier est <b>persistant</b> : il survit à la déconnexion. "
        "La commande décrémente atomiquement le stock dans une transaction unique "
        "pour éviter les race conditions. Le cycle de vie est géré par une "
        "machine d'états simple dans <code>OrderService</code>."
    ))
    story.append(sp(4))

    cycle_data = [
        ["Statut", "Qui peut changer ?", "Transition autorisée"],
        ["PENDING",    "Système",  "→ CONFIRMED (automatique à la validation)"],
        ["CONFIRMED",  "SELLER / ADMIN", "→ SHIPPED"],
        ["SHIPPED",    "SELLER / ADMIN", "→ DELIVERED"],
        ["DELIVERED",  "—",        "Statut final"],
        ["CANCELLED",  "CUSTOMER (si PENDING) / ADMIN", "Statut final"],
    ]
    tc = Table(cycle_data, colWidths=[(W-4*cm)*0.22,(W-4*cm)*0.33,(W-4*cm)*0.45])
    tc.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  ORANGE),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [colors.HexColor("#FFF8F0"), BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("FONTNAME",      (0,1), (0,-1),  "Helvetica-Bold"),
        ("TEXTCOLOR",     (0,1), (0,-1),  ORANGE),
    ]))
    story.append(tc)
    story.append(Paragraph("Tableau 6 — Cycle de vie des commandes", S["caption"]))

    story.append(sp(8))
    story.append(h2("5.4 Codes Promo et Avis Clients"))
    story.append(p(
        "Les coupons supportent deux types : <b>PERCENT</b> (ex. 20% de remise) et "
        "<b>FIXED</b> (ex. 10 DA de réduction). Chaque coupon dispose d'une date "
        "d'expiration et d'un compteur d'utilisations restantes. "
        "Les avis ne peuvent être déposés que par des clients ayant effectivement "
        "commandé le produit (<code>achatVerifie = true</code>)."
    ))

    story.append(sp(8))
    story.append(h2("5.5 Tableaux de Bord"))
    for b in [
        "<b>DashboardAdminResponse</b> : chiffre d'affaires total, nombre de commandes, top 5 vendeurs, top 5 produits, répartition par statut",
        "<b>DashboardSellerResponse</b> : revenus du vendeur, commandes actives, produits en rupture de stock, commandes récentes",
        "<b>DashboardCustomerResponse</b> : total dépensé, nombre de commandes, dernières commandes",
    ]:
        story.append(bl(b))

    story.append(PageBreak())

    # ── 8. Réalisation Frontend ───────────────────────────────────────────────
    story.append(section_title("6. Réalisation — Frontend (Next.js 14)"))
    story.append(sp(8))

    story.append(p(
        "Le frontend est développé avec <b>Next.js 14 App Router</b>, offrant le "
        "Server-Side Rendering, le routing file-based et le middleware de protection "
        "des routes. L'interface est entièrement responsive grâce à <b>Tailwind CSS</b> "
        "avec une approche mobile-first."
    ))
    story.append(sp(6))

    pages_data = [
        ["Page / Composant", "Route", "Fonctionnalité"],
        ["Accueil",         "/",                    "Promotions, nouveautés, bannière hero"],
        ["Catalogue",       "/products",             "Filtres dynamiques, pagination, tri"],
        ["Fiche Produit",   "/products/[id]",        "Variantes, galerie, avis, ajout panier"],
        ["Panier",          "/cart",                 "Gestion articles, coupon, récapitulatif"],
        ["Commande",        "/checkout",             "Sélection adresse, confirmation, récap total"],
        ["Mes Commandes",   "/account/orders",       "Historique, détail, annulation"],
        ["Mon Profil",      "/account/profile",      "Modification infos, gestion adresses"],
        ["Mes Avis",        "/account/reviews",      "Avis déposés par le client"],
        ["Dashboard Vendeur","/seller/dashboard",    "Stats ventes, produits, commandes"],
        ["Dashboard Admin", "/dashboard/admin",      "Vue globale, gestion utilisateurs"],
        ["Connexion",       "/auth/login",           "Formulaire JWT, gestion erreurs"],
        ["Inscription",     "/auth/register",        "Validation côté client + serveur"],
    ]
    tp = Table(pages_data, colWidths=[(W-4*cm)*0.28,(W-4*cm)*0.30,(W-4*cm)*0.42])
    tp.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_MOYEN),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("FONTNAME",      (0,1), (0,-1),  "Helvetica-Bold"),
        ("TEXTCOLOR",     (0,1), (0,-1),  BLEU_FONCE),
        ("FONTNAME",      (1,1), (1,-1),  "Courier"),
        ("FONTSIZE",      (1,1), (1,-1),  8),
        ("TEXTCOLOR",     (1,1), (1,-1),  BLEU_MOYEN),
    ]))
    story.append(tp)
    story.append(Paragraph("Tableau 7 — Pages et composants frontend", S["caption"]))

    story.append(sp(8))
    story.append(h2("Composants Réutilisables"))
    comp_data = [
        ["Composant",         "Description"],
        ["Navbar",            "Barre de navigation responsive avec panier, profil, déconnexion"],
        ["ProductCard",       "Carte produit avec image, prix promo, note, bouton ajout panier"],
        ["RatingStars",       "Affichage de note 1-5 avec demi-étoiles"],
        ["OrderStatusBadge",  "Badge coloré selon le statut de commande (PENDING/SHIPPED/etc.)"],
        ["EmptyState",        "Composant d'état vide réutilisable avec icône et message"],
        ["Spinner",           "Indicateur de chargement animé"],
    ]
    tk = Table(comp_data, colWidths=[(W-4*cm)*0.30, (W-4*cm)*0.70])
    tk.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_FONCE),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("FONTNAME",      (0,1), (0,-1),  "Helvetica-Bold"),
        ("TEXTCOLOR",     (0,1), (0,-1),  BLEU_MOYEN),
    ]))
    story.append(tk)
    story.append(Paragraph("Tableau 8 — Composants réutilisables", S["caption"]))

    story.append(sp(8))
    story.append(h2("Gestion de l'Authentification Frontend"))
    story.append(p(
        "L'<code>AuthContext</code> (React Context API) expose l'état de l'utilisateur "
        "connecté à toute l'application. L'intercepteur Axios dans <code>lib/api.ts</code> "
        "injecte automatiquement le JWT dans les en-têtes <code>Authorization</code> de "
        "chaque requête, et appelle <code>/api/auth/refresh</code> en cas d'expiration "
        "avant de re-tenter la requête originale. Le middleware Next.js protège les routes "
        "selon le rôle de l'utilisateur."
    ))
    story.append(PageBreak())

    # ── 9. API REST ───────────────────────────────────────────────────────────
    story.append(section_title("7. API REST et Sécurité"))
    story.append(sp(8))

    endpoints = [
        ["Méthode", "Endpoint", "Rôle requis", "Description"],
        ["POST", "/api/auth/register",       "Public",         "Inscription nouvel utilisateur"],
        ["POST", "/api/auth/login",          "Public",         "Connexion — retourne JWT"],
        ["POST", "/api/auth/refresh",        "Public",         "Renouvellement access token"],
        ["POST", "/api/auth/logout",         "Authentifié",    "Invalidation refresh token"],
        ["GET",  "/api/products",            "Public",         "Liste paginée + filtres dynamiques"],
        ["GET",  "/api/products/{id}",       "Public",         "Détail d'un produit"],
        ["GET",  "/api/products/search?q=",  "Public",         "Recherche full-text"],
        ["POST", "/api/products",            "SELLER / ADMIN", "Créer un produit"],
        ["PUT",  "/api/products/{id}",       "SELLER / ADMIN", "Modifier un produit"],
        ["DELETE","/api/products/{id}",      "SELLER / ADMIN", "Soft delete d'un produit"],
        ["GET",  "/api/cart",                "CUSTOMER",       "Récupérer le panier"],
        ["POST", "/api/cart/items",          "CUSTOMER",       "Ajouter un article"],
        ["PUT",  "/api/cart/items/{id}",     "CUSTOMER",       "Modifier la quantité"],
        ["DELETE","/api/cart/items/{id}",    "CUSTOMER",       "Supprimer un article"],
        ["POST", "/api/cart/coupon",         "CUSTOMER",       "Appliquer un coupon"],
        ["POST", "/api/orders",              "CUSTOMER",       "Passer une commande"],
        ["GET",  "/api/orders/my",           "CUSTOMER",       "Mes commandes"],
        ["PUT",  "/api/orders/{id}/cancel",  "CUSTOMER",       "Annuler une commande"],
        ["PUT",  "/api/orders/{id}/status",  "SELLER / ADMIN", "Changer le statut"],
        ["GET",  "/api/dashboard/admin",     "ADMIN",          "Statistiques globales"],
        ["GET",  "/api/dashboard/seller",    "SELLER",         "Statistiques vendeur"],
        ["GET",  "/api/dashboard/customer",  "CUSTOMER",       "Statistiques client"],
        ["POST", "/api/products/{id}/reviews","CUSTOMER",      "Déposer un avis"],
        ["GET",  "/api/coupons",             "ADMIN",          "Lister les coupons"],
        ["POST", "/api/coupons",             "ADMIN",          "Créer un coupon"],
    ]

    method_colors = {
        "GET":    colors.HexColor("#27AE60"),
        "POST":   colors.HexColor("#2980B9"),
        "PUT":    colors.HexColor("#E67E22"),
        "DELETE": colors.HexColor("#C0392B"),
    }

    def make_method_cell(method):
        return Paragraph(
            method,
            make_style(f"m{method}", fontName="Helvetica-Bold", fontSize=8,
                       textColor=BLANC, alignment=TA_CENTER)
        )

    ep_table_data = [["Méth.", "Endpoint", "Accès", "Description"]]
    for row in endpoints[1:]:
        ep_table_data.append([
            make_method_cell(row[0]),
            Paragraph(row[1], make_style("ep", fontName="Courier", fontSize=7.5,
                               textColor=BLEU_FONCE)),
            Paragraph(row[2], make_style("ro", fontName="Helvetica-Bold", fontSize=8,
                               textColor=GRIS_FONCE)),
            Paragraph(row[3], make_style("desc", fontName="Helvetica", fontSize=8.5,
                               textColor=GRIS_FONCE)),
        ])

    te = Table(ep_table_data,
               colWidths=[(W-4*cm)*0.08,(W-4*cm)*0.35,(W-4*cm)*0.20,(W-4*cm)*0.37])
    style_ep = [
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_FONCE),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0),  9),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("ALIGN",         (0,1), (0,-1),  "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]
    for i, row in enumerate(endpoints[1:], start=1):
        method = row[0]
        if method in method_colors:
            style_ep.append(("BACKGROUND", (0,i), (0,i), method_colors[method]))
    te.setStyle(TableStyle(style_ep))
    story.append(te)
    story.append(Paragraph("Tableau 9 — Endpoints API REST", S["caption"]))
    story.append(PageBreak())

    # ── 10. Base de Données ───────────────────────────────────────────────────
    story.append(section_title("8. Base de Données"))
    story.append(sp(8))

    story.append(p(
        "ShopFlow utilise <b>H2 en mémoire</b> pour le développement (démarrage instantané, "
        "console web intégrée) et <b>PostgreSQL</b> en production. Le schéma est "
        "auto-généré par Hibernate (<code>ddl-auto=create-drop</code> en dev, "
        "<code>update</code> en prod). Un fichier <code>data.sql</code> initialise "
        "les données de démonstration au démarrage."
    ))
    story.append(sp(8))

    story.append(h2("Données de Démonstration"))
    demo_data = [
        ["Entité",          "Données chargées"],
        ["Utilisateurs",    "5 comptes : 1 admin, 2 vendeurs, 2 clients"],
        ["Produits",        "8 produits avec images, variantes (taille/couleur), catégories"],
        ["Catégories",      "Hiérarchie : Vêtements > Hommes / Femmes, Électronique > Téléphones / PC"],
        ["Codes promo",     "BIENVENUE10 (10%), REMISE5 (5 DA fixe), SUMMER20 (20%)"],
        ["Adresses",        "Adresses de livraison pour chaque client"],
    ]
    td = Table(demo_data, colWidths=[(W-4*cm)*0.25, (W-4*cm)*0.75])
    td.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_MOYEN),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("FONTNAME",      (0,1), (0,-1),  "Helvetica-Bold"),
    ]))
    story.append(td)
    story.append(Paragraph("Tableau 10 — Données de démonstration", S["caption"]))

    story.append(sp(8))
    story.append(h2("Comptes de Démonstration"))
    accounts = [
        ["Rôle",      "Email",                    "Mot de passe", "Description"],
        ["ADMIN",     "admin@shopflow.com",        "password123",  "Accès total — gestion globale"],
        ["SELLER",    "seller@shopflow.com",       "password123",  "Vendeur — gestion de ses produits"],
        ["SELLER",    "seller2@shopflow.com",      "password123",  "Second vendeur"],
        ["CUSTOMER",  "client@shopflow.com",       "password123",  "Client — achats et avis"],
        ["CUSTOMER",  "client2@shopflow.com",      "password123",  "Second client"],
    ]
    ta = Table(accounts, colWidths=[(W-4*cm)*0.15,(W-4*cm)*0.32,(W-4*cm)*0.18,(W-4*cm)*0.35])
    ta.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_FONCE),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("FONTNAME",      (1,1), (1,-1),  "Courier"),
        ("FONTSIZE",      (1,1), (1,-1),  8),
    ]))
    story.append(ta)
    story.append(Paragraph("Tableau 11 — Comptes de démonstration", S["caption"]))
    story.append(PageBreak())

    # ── 11. Tests & Déploiement ───────────────────────────────────────────────
    story.append(section_title("9. Tests et Déploiement"))
    story.append(sp(8))

    story.append(h2("9.1 Tests Backend"))
    story.append(p(
        "Les tests unitaires sont écrits avec <b>JUnit 5</b> et <b>Mockito 5.14</b>. "
        "Spring Security Test est utilisé pour simuler les contextes d'authentification. "
        "Le build Maven (<code>mvn test</code>) exécute automatiquement tous les tests "
        "avant le packaging."
    ))
    story.append(sp(4))
    for b in [
        "Tests unitaires des services : logique métier, calcul des totaux, gestion du stock",
        "Tests des contrôleurs : validation des DTOs, codes HTTP, gestion des erreurs",
        "Tests de sécurité : accès refusé sans token, accès refusé avec mauvais rôle",
        "GlobalExceptionHandler testé pour toutes les exceptions métier",
    ]:
        story.append(bl(b))

    story.append(sp(8))
    story.append(h2("9.2 Tests API — Collection Postman"))
    story.append(p(
        "Une collection Postman complète (<code>shopflow.postman_collection.json</code>) "
        "est fournie avec le projet. Elle couvre l'intégralité des endpoints avec des "
        "scénarios de test pour chaque rôle (admin, vendeur, client) et gère "
        "automatiquement les tokens JWT via des variables d'environnement."
    ))

    story.append(sp(8))
    story.append(h2("9.3 Déploiement"))

    deploy_data = [
        ["Environnement", "Base de données", "Configuration", "URL"],
        ["Développement",    "H2 In-Memory",   "application.properties (défaut)", "localhost:8080 / localhost:3000"],
        ["Production",       "PostgreSQL 14+",  "Variables d'environnement\n(DB_URL, DB_USER, DB_PASS)", "À configurer selon l'hébergeur"],
    ]
    tde = Table(deploy_data, colWidths=[(W-4*cm)*0.20,(W-4*cm)*0.22,(W-4*cm)*0.33,(W-4*cm)*0.25])
    tde.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_FONCE),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(tde)
    story.append(Paragraph("Tableau 12 — Environnements de déploiement", S["caption"]))

    story.append(sp(8))
    story.append(h2("9.4 Commandes de Démarrage"))
    story.append(Paragraph(
        "# Backend (mode développement)\n"
        "cd backend\n"
        "mvn spring-boot:run\n"
        "# → API sur http://localhost:8080\n"
        "# → Swagger UI : http://localhost:8080/swagger-ui\n"
        "# → H2 Console : http://localhost:8080/h2-console\n\n"
        "# Frontend\n"
        "cd frontend\n"
        "npm install\n"
        "npm run dev\n"
        "# → Interface sur http://localhost:3000",
        S["code"]
    ))
    story.append(PageBreak())

    # ── 12. Conclusion ────────────────────────────────────────────────────────
    story.append(section_title("10. Conclusion et Perspectives"))
    story.append(sp(8))

    story.append(p(
        "Le projet <b>ShopFlow</b> constitue une implémentation complète et fonctionnelle "
        "d'une marketplace B2C, couvrant l'intégralité des fonctionnalités attendues d'une "
        "boutique en ligne moderne. L'architecture choisie respecte les bonnes pratiques "
        "du développement logiciel : séparation des responsabilités, sécurité par conception, "
        "API documentée et interface utilisateur responsive."
    ))
    story.append(sp(6))

    story.append(p(
        "Les choix technologiques (Spring Boot 3, Next.js 14, JWT) sont alignés avec "
        "les standards de l'industrie en 2025, garantissant la maintenabilité et "
        "l'évolutivité du système."
    ))
    story.append(sp(8))

    story.append(h2("Bilan des Fonctionnalités Réalisées"))
    bilan = [
        ["Fonctionnalité",                              "Backend", "Frontend"],
        ["Authentification JWT (access + refresh)",     "✓",      "✓"],
        ["Gestion multi-rôles (ADMIN/SELLER/CUSTOMER)", "✓",      "✓"],
        ["CRUD produits avec variantes",                "✓",      "✓"],
        ["Catégories hiérarchiques",                    "✓",      "✓"],
        ["Panier persistant",                           "✓",      "✓"],
        ["Codes promo (PERCENT + FIXED)",               "✓",      "✓"],
        ["Cycle de vie des commandes",                  "✓",      "✓"],
        ["Gestion du stock atomique",                   "✓",      "—"],
        ["Avis avec vérification d'achat",              "✓",      "✓"],
        ["Dashboard Admin + Seller",                    "✓",      "✓"],
        ["Recherche full-text + filtres dynamiques",    "✓",      "✓"],
        ["Pagination",                                  "✓",      "✓"],
        ["Swagger UI documenté",                        "✓",      "—"],
        ["Design responsive mobile-first",              "—",      "✓"],
    ]
    tb = Table(bilan, colWidths=[(W-4*cm)*0.64,(W-4*cm)*0.18,(W-4*cm)*0.18])
    tb.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  BLEU_FONCE),
        ("TEXTCOLOR",     (0,0), (-1,0),  BLANC),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("ALIGN",         (1,0), (-1,-1), "CENTER"),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [GRIS_CLAIR, BLANC]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("TEXTCOLOR",     (1,1), (1,-1),  VERT),
        ("TEXTCOLOR",     (2,1), (2,-1),  VERT),
        ("FONTNAME",      (1,1), (-1,-1), "Helvetica-Bold"),
    ]))
    story.append(tb)
    story.append(Paragraph("Tableau 13 — Bilan des fonctionnalités", S["caption"]))

    story.append(sp(10))
    story.append(h2("Perspectives d'Amélioration"))
    for b in [
        "<b>Paiement en ligne</b> : intégration d'une passerelle de paiement (Stripe, PayPal)",
        "<b>Notifications en temps réel</b> : WebSockets pour alertes de commande et chat vendeur/client",
        "<b>Système de recommandation</b> : suggestions basées sur l'historique d'achat",
        "<b>Internationalisation (i18n)</b> : support multilingue (arabe, français, anglais)",
        "<b>Tests E2E</b> : Playwright ou Cypress pour les scénarios utilisateur complets",
        "<b>CI/CD</b> : pipeline GitHub Actions pour build, tests et déploiement automatique",
        "<b>Images produits</b> : upload vers un service cloud (AWS S3, Cloudinary)",
        "<b>Application mobile</b> : React Native en réutilisant la même API REST",
    ]:
        story.append(bl(b))

    story.append(sp(12))
    story.append(info_box(
        "<b>ShopFlow</b> est un projet académique complet qui démontre la maîtrise "
        "des technologies web modernes, des bonnes pratiques architecturales et de "
        "la sécurité applicative. Il constitue une base solide, extensible vers "
        "un produit de production.",
        color=colors.HexColor("#F0FFF4"),
        text_color=colors.HexColor("#1A6B3A")
    ))

    # ── Build ─────────────────────────────────────────────────────────────────
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f"PDF généré : {OUTPUT}")


if __name__ == "__main__":
    build()
