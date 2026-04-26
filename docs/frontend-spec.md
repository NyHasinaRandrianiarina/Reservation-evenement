# Frontend Spec — Plateforme d'inscription événements
> Stack : React + Vite · TailwindCSS · shadcn/ui · TypeScript

---

## Table des matières

1. [Conventions globales](#1-conventions-globales)
2. [Architecture des routes](#2-architecture-des-routes)
3. [Design system & composants partagés](#3-design-system--composants-partagés)
4. [Portail public](#4-portail-public)
   - 4.1 Page d'accueil / catalogue
   - 4.2 Page détail événement
   - 4.3 Tunnel d'inscription — Étape 1 : Sélection billets
   - 4.4 Tunnel d'inscription — Étape 2 : Formulaire participant
   - 4.5 Tunnel d'inscription — Étape 3 : Paiement
   - 4.6 Page confirmation d'inscription
   - 4.7 Espace participant (mon compte)
5. [Dashboard organisateur](#5-dashboard-organisateur)
   - 5.1 Accueil dashboard
   - 5.2 Créer / éditer un événement — Étape 1 : Infos générales
   - 5.3 Créer / éditer un événement — Étape 2 : Billetterie
   - 5.4 Créer / éditer un événement — Étape 3 : Formulaire personnalisé
   - 5.5 Créer / éditer un événement — Étape 4 : Récap & publication
   - 5.6 Liste des participants
   - 5.7 Analytics
   - 5.8 Campagne email
   - 5.9 Check-in jour J (mobile)
6. [Back-office admin](#6-back-office-admin)
   - 6.1 Dashboard admin
   - 6.2 Modération des événements
   - 6.3 Gestion des organisateurs
   - 6.4 Finance
7. [Pages transversales](#7-pages-transversales)
   - 7.1 Auth — Connexion / Inscription
   - 7.2 404 / Erreur

---

## 1. Conventions globales

### Stack & tooling

```
React 18+       Composants fonctionnels + hooks uniquement. Pas de class components.
TypeScript      Strict mode activé. Props toujours typées avec interface.
Vite            Pas de CRA. Import alias configuré : @/ → src/
TailwindCSS     Utility-first. Pas de CSS modules sauf cas exceptionnel.
shadcn/ui       Composants de base : Button, Input, Select, Dialog, Toast, Table, Badge…
                Toujours importer depuis @/components/ui/
React Router v6 Routing côté client. Layouts imbriqués via <Outlet />.
React Query     Fetching, cache, mutations. Pas de fetch natif nu dans les composants.
React Hook Form Gestion des formulaires. Validation avec Zod.
Zustand         State global léger (panier billet, session user…).
```

### Conventions de nommage

```
Pages           PascalCase, suffixe "Page" :  EventDetailPage.tsx
Composants      PascalCase :                  TicketCard.tsx
Hooks           camelCase, préfixe "use" :    useRegistration.ts
Types           PascalCase, fichier dédié :   types/event.ts
```

### Structure de dossiers recommandée

```
src/
├── components/
│   ├── ui/              # shadcn/ui (ne pas modifier)
│   └── shared/          # composants réutilisables custom
├── features/
│   ├── catalog/
│   ├── registration/
│   ├── organizer/
│   └── admin/
├── pages/               # une page = un fichier
├── hooks/               # hooks custom
├── lib/                 # utils, api client, zod schemas
├── stores/              # zustand stores
└── types/               # types globaux
```

### Bonnes pratiques générales

- Chaque page exporte un composant default avec son propre `<title>` via `react-helmet-async`.
- Les appels API passent tous par un client Axios centralisé dans `lib/api.ts` avec intercepteur d'auth (JWT Bearer).
- Les formulaires utilisent `react-hook-form` + `zodResolver`. Le schéma Zod est déclaré en dehors du composant.
- Les états de chargement, erreur et données vides ont tous un rendu explicite (skeleton, alert, empty state).
- Toutes les actions destructrices (annuler une inscription, supprimer un événement) sont confirmées via `<AlertDialog>` de shadcn.
- Les toasts de succès/erreur utilisent le `useToast` de shadcn, appelé depuis les `onSuccess`/`onError` de React Query.
- Mobile-first : la grille passe de 1 col (mobile) à 2 cols (md) à 3 cols (lg) partout sauf indication contraire.
- Les couleurs sémantiques (succès, erreur, warning) passent par les variables CSS de Tailwind, pas des valeurs hardcodées.
- `loading` prop sur `<Button>` pour les soumissions async : afficher un spinner inline, désactiver le bouton.
- Tout texte visible par l'utilisateur est en français par défaut. Prévoir les clés i18n dans `lib/i18n.ts` pour l'internationalisation future.

---

## 2. Architecture des routes

```
/                                   → Catalog (public)
/events/:slug                       → EventDetailPage (public)
/events/:slug/register              → RegistrationLayout (public, sans compte requis)
  /events/:slug/register/tickets    → Step1TicketsPage
  /events/:slug/register/info       → Step2InfoPage
  /events/:slug/register/payment    → Step3PaymentPage
/events/:slug/confirmation          → ConfirmationPage (public)

/account                            → AccountLayout (auth participant requis)
  /account/registrations            → MyRegistrationsPage
  /account/tickets/:id              → TicketDetailPage
  /account/profile                  → ProfilePage

/auth/login                         → LoginPage
/auth/signup                        → SignupPage
/auth/forgot-password               → ForgotPasswordPage

/organizer                          → OrganizerLayout (auth organisateur requis)
  /organizer/dashboard              → OrgDashboardPage
  /organizer/events                 → OrgEventListPage
  /organizer/events/new             → EventWizardPage (création)
  /organizer/events/:id/edit        → EventWizardPage (édition, même composant)
  /organizer/events/:id/attendees   → AttendeesPage
  /organizer/events/:id/analytics   → AnalyticsPage
  /organizer/events/:id/email       → EmailCampaignPage
  /organizer/events/:id/checkin     → CheckInPage

/admin                              → AdminLayout (auth admin requis)
  /admin/dashboard                  → AdminDashboardPage
  /admin/events                     → AdminEventModerationPage
  /admin/organizers                 → AdminOrganizersPage
  /admin/finance                    → AdminFinancePage
```

**Route guards** : un `<RequireAuth role="organizer">` wrapper vérifie le token et le rôle avant de rendre les layouts protégés. Redirection vers `/auth/login?redirect=<url>` si non authentifié.

---

## 3. Design system & composants partagés

### Tokens Tailwind (à configurer dans `tailwind.config.ts`)

```ts
colors: {
  brand: {
    50:  '#eff6ff',
    500: '#3b82f6',   // couleur principale
    600: '#2563eb',
    700: '#1d4ed8',
  },
  success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
  warning: { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
  danger:  { 50: '#fef2f2', 500: '#ef4444', 700: '#b91c1c' },
}
```

### Composants shared réutilisables

#### `<PageHeader>`
Props : `title`, `description?`, `actions?` (slot React pour boutons)
Usage : en-tête de toutes les pages dashboard. Titre en `text-2xl font-semibold`, description en `text-muted-foreground`.

#### `<DataTable>`
Wrapper autour du `<Table>` shadcn avec tri, pagination locale et slot pour filtre. Props : `columns`, `data`, `isLoading`, `emptyMessage`.

#### `<StatusBadge>`
Badge coloré selon le statut. Variants : `draft` (gris), `published` (bleu), `sold_out` (orange), `cancelled` (rouge), `past` (gris clair).

#### `<TicketCard>`
Carte billet affichant nom du type, prix, places restantes et un selector de quantité. Utilisé dans le tunnel et dans la page détail.

#### `<EventCard>`
Carte événement pour le catalogue. Contient : image (aspect-ratio 16/9), badge catégorie, titre, date, ville, prix min, état (complet / quelques places).

#### `<EmptyState>`
Composant d'état vide avec icône SVG, titre et description. Props : `icon`, `title`, `description`, `action?`.

#### `<SkeletonCard>` / `<SkeletonTable>`
Squelettes de chargement pour les listes. Toujours affichés pendant `isLoading`.

#### `<ConfirmDialog>`
Wrapper `<AlertDialog>` avec props `title`, `description`, `onConfirm`, `isLoading`. Bouton de confirmation en `variant="destructive"` si action dangereuse.

---

## 4. Portail public

---

### 4.1 Page d'accueil / catalogue

**Route** : `/`
**Fichier** : `pages/CatalogPage.tsx`
**Accès** : public

#### Layout

```
<Header />              sticky top, logo + nav + bouton connexion/compte
<HeroBanner />          optionnel selon config plateforme
<FilterBar />           barre de filtres et recherche
<EventGrid />           grille de résultats
<Pagination />
<Footer />
```

#### `<Header>`

- Logo à gauche (lien vers `/`)
- Navigation centrale (optionnelle en v1) ou vide
- À droite : si non connecté → `Connexion` (Button outline) + `S'inscrire` (Button primary) ; si connecté → avatar + dropdown (Mon compte, Déconnexion)
- Sur mobile : hamburger menu avec drawer latéral

#### `<FilterBar>`

Sticky sous le header. Contient :
- `<Input>` recherche plein texte (placeholder : "Rechercher un événement…") avec icône loupe à gauche. Déclenche la recherche avec debounce 300ms.
- `<Select>` Catégorie : Tout, Conférence, Concert, Formation, Corporate, Sport
- `<Select>` Date : Tout, Ce week-end, Cette semaine, Ce mois-ci, Choisir une date (ouvre un `<DatePicker>`)
- `<Select>` Lieu : liste des villes disponibles ou "En ligne"
- `<Select>` Prix : Tout, Gratuit, Payant
- Bouton `Réinitialiser` (visible si au moins un filtre actif, `variant="ghost"`)
- Sur mobile : collapse en `Filtres (N actifs)` qui ouvre un bottom sheet

**État** : les filtres sont synchronisés avec les query params URL (`?category=conference&date=weekend…`) pour permettre le partage de lien.

#### `<EventGrid>`

Grille responsive : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

Chaque cellule est un `<EventCard>` (voir composants partagés).

**État vide** : `<EmptyState icon={CalendarX} title="Aucun événement trouvé" description="Essayez d'élargir vos filtres.">` avec bouton Réinitialiser.

**État chargement** : 6 `<SkeletonCard>` pendant le fetch.

#### `<Pagination>`

Pagination numérique shadcn. Paramètre `?page=N` dans l'URL. 12 événements par page par défaut.

#### Comportements

- Au premier chargement, les événements publiés les plus proches en date sont affichés.
- Les événements complets affichent un badge "Complet" sur la carte et le bouton "S'inscrire" est désactivé.
- Les événements passés ne sont pas affichés sauf si filtre "Passés" activé.

---

### 4.2 Page détail événement

**Route** : `/events/:slug`
**Fichier** : `pages/EventDetailPage.tsx`
**Accès** : public

#### Layout

```
<EventHero />           image pleine largeur + overlay titre
<ContentLayout>
  <MainColumn>
    <EventDescription />
    <AgendaSection />      si sessions définies
    <OrganizerCard />
  </MainColumn>
  <StickyAside>
    <TicketSelector />
    <CTAButton />
  </StickyAside>
</ContentLayout>
```

Sur mobile : l'aside passe en bas de page, avec un bouton CTA ancré (`fixed bottom-0`).

#### `<EventHero>`

- Image de couverture en `aspect-video` ou hauteur fixe 400px avec `object-cover`
- Overlay gradient sombre en bas
- Sur l'overlay : badge catégorie, titre `text-3xl font-bold text-white`, date + lieu en icônes

#### `<MainColumn>` — Description

- Description riche (HTML sanitisé via `dompurify`). Classes Tailwind prose appliquées.
- Section "Informations pratiques" : Date et heure, Durée, Adresse (avec lien Google Maps), Événement en ligne (lien visio si applicable).

#### `<AgendaSection>`

Visible uniquement si l'événement a des sessions. Timeline verticale avec horaire, titre de session et intervenant. Si multi-tracks : onglets par track.

#### `<OrganizerCard>`

Avatar, nom de l'organisateur, description courte, lien vers profil public (v2).

#### `<TicketSelector>` (aside sticky)

- Titre "Billets disponibles"
- Liste des `<TicketCard>` pour chaque type de billet :
  - Nom du type (ex : "Early Bird")
  - Prix (ou "Gratuit")
  - Description courte (ex : "Accès plénière uniquement")
  - Jauge ou texte "X places restantes" (en rouge si ≤ 10)
  - Selector quantité (+/- ou `<Select>`) de 0 à min(quota_restant, 10)
  - Badge "Épuisé" et selector désactivé si sold out
- Sous-total dynamique mis à jour en temps réel
- Bouton `S'inscrire` (primary, full-width) : désactivé si aucun billet sélectionné
- Mention frais de service si applicable (ex : "+ 1,50 € de frais")
- Politique de remboursement en `text-xs text-muted-foreground`

#### `<CTAButton>` mobile

Barre fixe en bas d'écran sur mobile uniquement (`fixed bottom-0 left-0 right-0`). Affiche le sous-total et le bouton "S'inscrire". Disparaît quand le `<TicketSelector>` est visible à l'écran (Intersection Observer).

#### Comportements

- SEO : `<title>` = `{titre événement} — {nom plateforme}`, `<meta description>` = premier paragraphe de description, Open Graph avec image de couverture.
- Si l'événement est complet : bouton remplacé par "Rejoindre la liste d'attente" (v2) ou "Événement complet" (v1, désactivé).
- Si l'événement est passé : bouton masqué, bandeau "Cet événement est terminé".
- Partage : bouton "Partager" avec Web Share API (fallback copie de l'URL).

---

### 4.3 Tunnel — Étape 1 : Sélection billets

**Route** : `/events/:slug/register/tickets`
**Fichier** : `pages/registration/Step1TicketsPage.tsx`
**Accès** : public (pas de compte requis)

#### Layout

```
<RegistrationLayout>      header simplifié (logo + X pour quitter) + stepper
  <TicketList />
  <OrderSummary />        sticky sur desktop, en bas sur mobile
  <NavigationButtons />   Retour (→ page détail) + Continuer
</RegistrationLayout>
```

#### `<RegistrationLayout>`

Header simplifié : logo à gauche, bouton X (quitter, retour vers page détail avec confirmation si billets sélectionnés), nom de l'événement au centre.

Stepper horizontal : `1. Billets → 2. Informations → 3. Paiement`. Étapes passées en bleu, étape courante en bleu + bold, étapes futures en gris.

#### Contenu principal

Identique au `<TicketSelector>` de la page détail, mais en pleine page. Chaque `<TicketCard>` est plus grande avec la description complète du type de billet.

#### `<OrderSummary>`

Récap en temps réel :
- Ligne par type de billet sélectionné : `Nom × quantité … prix`
- Sous-total HT
- Frais de service (si applicable)
- Total TTC en `text-xl font-semibold`
- Message "Inscription gratuite" si total = 0

#### Validation avant de passer à l'étape 2

- Au moins un billet sélectionné
- Quantité dans les limites du quota disponible

---

### 4.4 Tunnel — Étape 2 : Formulaire participant

**Route** : `/events/:slug/register/info`
**Fichier** : `pages/registration/Step2InfoPage.tsx`
**Accès** : public

#### Layout

```
<RegistrationLayout>
  <ContactForm />          champs de contact de base
  <CustomForm />           champs personnalisés par l'organisateur
  <OrderSummaryMini />     récap compact (lecture seule)
  <NavigationButtons />    Retour + Continuer
</RegistrationLayout>
```

#### `<ContactForm>`

Titre : "Vos coordonnées"

Champs obligatoires :
- Prénom (`Input`, required)
- Nom (`Input`, required)
- Email (`Input type="email"`, required, validé par Zod)
- Téléphone (`Input type="tel"`, optionnel sauf si requis par l'orga)

Checkbox "Créer un compte pour retrouver mes billets facilement" (pré-cochée si non connecté). Si cochée, affiche un champ `Mot de passe` supplémentaire.

Si déjà connecté : les champs sont pré-remplis depuis le profil, avec une mention "Données issues de votre compte" et un lien "Modifier".

#### `<CustomForm>`

Rendu dynamique des champs créés par l'organisateur. Chaque champ peut être :

| Type de champ       | Composant shadcn rendu              |
|---------------------|-------------------------------------|
| `text`              | `<Input>`                          |
| `textarea`          | `<Textarea>`                       |
| `email`             | `<Input type="email">`             |
| `phone`             | `<Input type="tel">`               |
| `number`            | `<Input type="number">`            |
| `select`            | `<Select>` avec les options        |
| `multiselect`       | `<CheckboxGroup>` custom           |
| `radio`             | `<RadioGroup>`                     |
| `checkbox`          | `<Checkbox>` (champ booléen)       |
| `date`              | `<DatePicker>`                     |
| `file`              | `<Input type="file">` avec preview |

Chaque champ affiche son label, une description optionnelle en `text-sm text-muted-foreground`, et le message d'erreur Zod en rouge sous le champ.

Les champs requis ont un astérisque rouge après le label.

Si l'événement a plusieurs billets sélectionnés de types différents : le formulaire est répété pour chaque participant (ex : "Participant 1 — Billet VIP", "Participant 2 — Billet Standard").

#### Validation

Validée côté client via Zod au submit. Aucun appel API à cette étape (données stockées dans le store Zustand `registrationStore`).

---

### 4.5 Tunnel — Étape 3 : Paiement

**Route** : `/events/:slug/register/payment`
**Fichier** : `pages/registration/Step3PaymentPage.tsx`
**Accès** : public

#### Layout

```
<RegistrationLayout>
  <OrderSummaryFinal />    récap complet lecture seule
  <PaymentSection />       carte bancaire ou "gratuit"
  <LegalMentions />
  <NavigationButtons />    Retour + Confirmer
</RegistrationLayout>
```

#### `<OrderSummaryFinal>`

Récap lecture seule de tout ce qui a été saisi :
- Événement (nom, date, lieu)
- Billets : type × quantité × prix unitaire = sous-total
- Infos participant(s) (prénom, nom, email)
- Total TTC en `text-2xl font-bold`
- Bouton "Modifier" pour chaque section (retour à l'étape concernée)

#### `<PaymentSection>`

**Si total = 0 (gratuit)** :
- Message "Inscription gratuite — aucun paiement requis"
- Bouton "Confirmer mon inscription" (primary, full-width)

**Si total > 0 (payant)** :
- Intégration Stripe Elements (composant `<CardElement>` de `@stripe/react-stripe-js`)
- `<CardElement>` stylisé avec les variables CSS Tailwind
- Champ "Titulaire de la carte" (`<Input>`)
- Sous-total, frais et total rappelés
- Bouton "Payer {montant}" (primary, full-width)
- Icônes Visa / Mastercard / CB en bas
- Mention "Paiement sécurisé par Stripe — vos données ne sont jamais stockées"

**Flux Stripe recommandé** :
1. Au submit, appeler l'API backend `POST /api/registrations/intent` qui crée un `PaymentIntent` et retourne le `clientSecret`.
2. Appeler `stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })`.
3. Si succès → redirect vers `/events/:slug/confirmation?registration_id=xxx`.
4. Si erreur → afficher le message Stripe dans un `<Alert variant="destructive">` sous le bouton.

#### `<LegalMentions>`

Texte en `text-xs text-muted-foreground` :
- "En confirmant, vous acceptez les [conditions générales](#) et la [politique de confidentialité](#)."
- Politique de remboursement de l'organisateur (si définie).

#### États du bouton

- Idle : "Payer 25,00 €" ou "Confirmer mon inscription"
- Loading : spinner inline + texte "Traitement en cours…", bouton désactivé
- Erreur : bouton réactivé, `<Alert>` avec le message d'erreur Stripe

---

### 4.6 Page confirmation d'inscription

**Route** : `/events/:slug/confirmation`
**Fichier** : `pages/ConfirmationPage.tsx`
**Accès** : public (accessible via lien email)

#### Layout

```
<Header />
<ConfirmationCard />
<NextSteps />
<Footer />
```

#### `<ConfirmationCard>`

Centré, max-width `max-w-lg mx-auto`. Contient :
- Icône de succès animée (cercle vert avec checkmark, animation CSS keyframe)
- Titre "Inscription confirmée !" en `text-2xl font-bold`
- Sous-titre "Un email de confirmation avec votre billet a été envoyé à {email}"
- Résumé : événement (nom, date, lieu), billet(s), numéro de commande
- Bouton "Télécharger mon billet (PDF)" → appel `GET /api/registrations/:id/ticket`
- Bouton "Ajouter au calendrier" (génère un fichier `.ics`, Web Share API en fallback)
- Bouton "Voir tous mes billets" (→ `/account/registrations`) si connecté

#### `<NextSteps>`

Section "Et maintenant ?" avec 3 cards icônes :
1. "Consultez votre email" — vérifier les spams
2. "Sauvegardez votre billet" — billet disponible dans l'espace compte
3. "Partagez l'événement" — bouton partage

---

### 4.7 Espace participant — Mes inscriptions

**Route** : `/account/registrations`
**Fichier** : `pages/account/MyRegistrationsPage.tsx`
**Accès** : authentifié (participant)

#### Layout

```
<AccountLayout>           sidebar ou tabs (Mes inscriptions / Mon profil)
  <UpcomingRegistrations />
  <PastRegistrations />
</AccountLayout>
```

#### `<AccountLayout>`

Sur desktop : sidebar fixe à gauche (200px) avec liens de navigation. Sur mobile : tabs en haut.

#### `<UpcomingRegistrations>`

Titre "À venir". Liste de `<RegistrationCard>` pour chaque inscription future, triée par date croissante.

#### `<RegistrationCard>`

- Image miniature de l'événement
- Nom de l'événement
- Date et heure (ex : "Sam. 15 mars 2025 · 14h00")
- Lieu
- Type de billet et quantité
- Bouton "Voir mon billet" → ouvre un modal avec le QR code et les infos, + bouton téléchargement PDF
- Bouton "Annuler" (si la politique de l'organisateur le permet) → `<ConfirmDialog>` avant action

#### `<PastRegistrations>`

Titre "Passés". Même liste mais avec un badge "Terminé" et sans bouton d'annulation. Bouton "Voir la fiche" uniquement.

---

## 5. Dashboard organisateur

> Toutes les pages de cette section sont sous `<OrganizerLayout>` qui inclut une sidebar de navigation.

### `<OrganizerLayout>`

Sidebar gauche (256px, collapsable) :
- Logo + nom de l'organisation
- Navigation : Tableau de bord, Mes événements, Paramètres
- En bas : lien "Voir mon profil public", Déconnexion

Zone de contenu à droite. Header interne avec breadcrumb et bouton "Nouvel événement".

---

### 5.1 Accueil dashboard

**Route** : `/organizer/dashboard`
**Fichier** : `pages/organizer/OrgDashboardPage.tsx`

#### Métriques en cartes (KPI cards)

Grille `grid-cols-2 lg:grid-cols-4 gap-4`. Chaque card :
- Icône
- Valeur principale en `text-3xl font-bold`
- Label descriptif
- Tendance (ex : `+12% vs mois dernier`) en vert/rouge

| Métrique              | Icône     |
|-----------------------|-----------|
| Inscrits aujourd'hui  | Users     |
| CA du mois            | Euro      |
| Billets restants      | Ticket    |
| Événements actifs     | Calendar  |

#### Liste des événements actifs

Titre "Vos événements". Tableau ou liste de cards avec :
- Nom de l'événement
- Date
- Statut (`<StatusBadge>`)
- Inscrits / capacité totale (ex : "120 / 200")
- Barre de progression de remplissage
- Actions rapides : Voir les inscrits, Modifier, Partager le lien

Bouton "Créer un nouvel événement" en haut à droite (primary).

---

### 5.2–5.5 Créer / éditer un événement (Wizard 4 étapes)

**Route** : `/organizer/events/new` et `/organizer/events/:id/edit`
**Fichier** : `pages/organizer/EventWizardPage.tsx`

#### `<EventWizardLayout>`

Stepper vertical sur desktop (sidebar gauche), horizontal en haut sur mobile.
Étapes : `1. Infos générales → 2. Billetterie → 3. Formulaire → 4. Récap`

Sauvegarde automatique en brouillon toutes les 30s (mutation React Query avec debounce). Indicateur "Sauvegarde en cours…" / "Sauvegardé" discret.

---

#### Étape 1 : Infos générales

Champs :
- **Titre** : `<Input>` requis, max 100 caractères. Compteur de caractères en bas à droite.
- **Slug/URL** : `<Input>` auto-généré depuis le titre (slugify), modifiable. Mention de l'URL publique finale en live.
- **Catégorie** : `<Select>` (Conférence, Concert, Formation, Corporate, Sport, Autre)
- **Description** : éditeur rich text (Tiptap recommandé). Barre d'outils : gras, italique, listes, liens, titres H2/H3.
- **Date de début** : `<DateTimePicker>` requis
- **Date de fin** : `<DateTimePicker>` requis (doit être après début, validation Zod)
- **Type de lieu** : Radio "En présentiel" / "En ligne" / "Hybride"
  - Si présentiel : champs Adresse, Ville, Code postal, Pays. Carte Google Maps en preview (v2).
  - Si en ligne : champ URL de visioconférence (optionnel, visible uniquement après inscription)
- **Image de couverture** : dropzone (`react-dropzone`). Accepte JPEG/PNG/WebP, max 5 Mo. Preview immédiate avec recadrage (crop 16:9 recommandé). Bouton de suppression.
- **Capacité maximale** : `<Input type="number">` (optionnel). Si vide = illimité.
- **Événement public / privé** : Toggle. Si privé, génère un lien unique (accès uniquement par lien direct).
- **Tags** : `<TagInput>` (multi-valeurs libres, ex : "IA", "Startup", "Réseau")

---

#### Étape 2 : Billetterie

Section "Types de billets". Au moins un type de billet requis.

**`<TicketTypeList>`** :
- Liste des types créés, drag & drop pour réordonner (DnD Kit).
- Bouton `+ Ajouter un type de billet` (ouvre un panel latéral ou un accordion inline).

**`<TicketTypeForm>`** (pour chaque type) :
- **Nom** : `<Input>` requis (ex : "Early Bird", "Standard", "VIP")
- **Type de prix** : Radio "Gratuit" / "Payant"
  - Si payant : `<Input type="number">` Prix (€), HT ou TTC au choix (Toggle)
- **Quota** : `<Input type="number">` (optionnel, si vide = quota de l'événement ou illimité)
- **Description courte** : `<Input>` (ex : "Accès plénière + cocktail")
- **Ventes du … au …** : deux `<DateTimePicker>` pour la période de vente
- **Limite par commande** : `<Input type="number">` min/max de billets par transaction (ex : 1 à 5)
- **Visible publiquement** : Toggle. Si désactivé, billet accessible uniquement par code promo (v2).
- Bouton "Supprimer" (icône corbeille, avec confirmation si des inscriptions existent déjà)

**Récap billetterie** :
- Tableau des types créés avec colonnes : Nom, Prix, Quota, Vendu, Restant, Statut

**Politique de remboursement** :
- `<Select>` : Aucun remboursement / Remboursement jusqu'à 7j avant / Remboursement jusqu'à 48h avant / Remboursement libre
- `<Textarea>` : Précisions libres (optionnel)

---

#### Étape 3 : Formulaire personnalisé

**`<FormBuilder>`** : builder drag & drop (DnD Kit).

Zone de construction avec deux colonnes :
- **Gauche** : palette de types de champs disponibles (draggables)
- **Droite** : canvas du formulaire (zone de dépôt)

**Types de champs disponibles** (palette) :
- Texte court, Texte long, Email, Téléphone, Nombre, Date, URL
- Liste déroulante (options à définir)
- Choix multiples (checkboxes)
- Choix unique (radio)
- Case à cocher (acceptation, consentement)
- Upload fichier

**Configuration d'un champ** (panel latéral qui s'ouvre au clic) :
- Label du champ (requis)
- Texte d'aide (placeholder ou description)
- Obligatoire : Toggle
- Pour Select/Radio/Checkbox : liste des options (ajout/suppression)
- Pour Fichier : types acceptés, taille max

**Champs système toujours présents** (non supprimables, grisés dans le canvas) :
- Prénom, Nom, Email (pré-remplis depuis le contact form)

**Prévisualisation** : bouton "Prévisualiser" ouvre un Dialog avec le formulaire tel que le participant le verra.

**Champs par billet** : Toggle "Appliquer un formulaire différent par type de billet" (v2, désactivé en v1 avec tooltip explicatif).

---

#### Étape 4 : Récapitulatif & publication

Récap lecture seule de tout l'événement :
- Infos générales (titre, date, lieu, image)
- Billetterie (tableau des types)
- Aperçu du formulaire (liste des champs)

**Checklist de publication** (chaque item coché ou avec warning) :
- ✅ Titre renseigné
- ✅ Date et lieu définis
- ✅ Au moins un type de billet créé
- ⚠️ Aucune image de couverture (warning, pas bloquant)
- ⚠️ Description vide (warning)

**Boutons d'action** :
- "Enregistrer en brouillon" (secondary) — sauvegarde sans publier
- "Publier l'événement" (primary) — envoie une demande de modération si modération activée, publie directement sinon
- Si modération activée : message "Votre événement sera visible après validation par notre équipe (sous 24h)."

---

### 5.6 Liste des participants

**Route** : `/organizer/events/:id/attendees`
**Fichier** : `pages/organizer/AttendeesPage.tsx`

#### Layout

```
<PageHeader title="Participants" actions={<ExportButton />} />
<StatsRow />
<FiltersBar />
<AttendeesTable />
```

#### `<StatsRow>`

3 métriques en cards compactes : Total inscrits, Ayant payé, Check-in effectué (le jour J).

#### `<FiltersBar>`

- `<Input>` recherche par nom ou email
- `<Select>` Filtrer par type de billet
- `<Select>` Filtrer par statut paiement (Payé, Gratuit, En attente, Remboursé)
- `<Select>` Filtrer par statut check-in (Tous, Présent, Non venu)

#### `<AttendeesTable>` (DataTable)

Colonnes :
| Colonne         | Tri | Description                            |
|-----------------|-----|----------------------------------------|
| Participant     | ✅  | Prénom + Nom + email en sous-titre     |
| Type de billet  |     | `<Badge>` nom du type                  |
| Paiement        |     | `<StatusBadge>` Payé / Gratuit / etc.  |
| Inscription le  | ✅  | Date formatée                          |
| Check-in        |     | Icône ✓ si scanné                      |
| Actions         |     | Menu dropdown                          |

Actions par ligne (menu dropdown) :
- Voir les réponses au formulaire
- Envoyer un email à ce participant
- Annuler l'inscription (avec remboursement si applicable)
- Marquer comme présent manuellement

**Sélection multiple** : checkbox par ligne. Actions en masse : Envoyer un email, Annuler les inscriptions sélectionnées.

#### `<ExportButton>`

Dropdown : "Exporter en CSV", "Exporter en Excel (.xlsx)". Déclenche un appel `GET /api/events/:id/attendees/export?format=csv`.

---

### 5.7 Analytics

**Route** : `/organizer/events/:id/analytics`
**Fichier** : `pages/organizer/AnalyticsPage.tsx`

#### Contenu

**Métriques résumées** (KPI cards en grid 4 colonnes) :
- Total inscrits
- CA total
- Taux de remplissage (%)
- Taux de présence (check-ins / inscrits)

**Graphique "Inscriptions dans le temps"** :
- Courbe (recharts `<LineChart>`) avec l'axe X = date, Y = cumul inscrits
- Sélecteur de période : 7j, 30j, Tout

**Graphique "Répartition par type de billet"** :
- `<PieChart>` ou `<BarChart>` recharts
- Légende avec couleurs

**Tableau des billets** :
| Billet     | Vendus | Quota | Restants | CA      |
|------------|--------|-------|----------|---------|
| Early Bird | 50     | 50    | 0        | 1 250 € |
| Standard   | 80     | 150   | 70       | 3 200 € |

**Bouton "Exporter le rapport (PDF)"** en haut à droite.

---

### 5.8 Campagne email

**Route** : `/organizer/events/:id/email`
**Fichier** : `pages/organizer/EmailCampaignPage.tsx`

#### Layout

```
<PageHeader title="Envoyer un email" />
<RecipientSelector />
<EmailEditor />
<SendOptions />
```

#### `<RecipientSelector>`

- Radio : Tous les inscrits / Filtrer par type de billet / Filtrer par statut
- Si filtre : `<CheckboxGroup>` pour sélectionner les sous-groupes
- Compteur live : "X destinataires sélectionnés"

#### `<EmailEditor>`

- `<Input>` Objet de l'email (requis)
- `<Textarea>` Corps du message (texte simple en v1, rich text en v2)
- Variables disponibles (liste cliquable qui insère `{{prenom}}`, `{{nom_evenement}}`…)
- Prévisualisation : bouton qui ouvre un Dialog avec l'email rendu

#### `<SendOptions>`

- Radio : Envoyer maintenant / Planifier
  - Si planifier : `<DateTimePicker>`
- Bouton "Envoyer" (primary) → `<ConfirmDialog>` "Vous allez envoyer X emails. Confirmer ?"

---

### 5.9 Check-in jour J (mobile)

**Route** : `/organizer/events/:id/checkin`
**Fichier** : `pages/organizer/CheckInPage.tsx`

> Page conçue pour une utilisation mobile uniquement. Layout full-screen, pas de sidebar.

#### Layout

```
<CheckInHeader />    nom événement + compteur en live
<ScannerView />      ou <ManualSearch />
<ResultOverlay />    affichage plein écran du résultat du scan
```

#### `<CheckInHeader>`

Header compact : nom de l'événement, compteur "X / Y présents" mis à jour en temps réel (polling toutes les 10s ou WebSocket).

Bouton "Recherche manuelle" (toggle).

#### `<ScannerView>`

Utilise `@zxing/browser` ou `html5-qrcode` pour accéder à la caméra.
Cadre de scan centré avec animation de scan (ligne qui défile).
Feedback haptic si disponible (Vibration API).

#### `<ManualSearch>`

`<Input>` recherche par nom ou numéro de billet. Liste de résultats en temps réel (debounce 300ms).

#### `<ResultOverlay>`

Plein écran (ou bannière haute) après chaque scan :

**Succès (billet valide, première entrée)** :
- Fond vert
- Icône ✓ grande
- Nom du participant, type de billet
- Bouton "Suivant" (ferme l'overlay, réinitialise le scanner)

**Déjà scanné** :
- Fond orange
- Icône ⚠️
- "Ce billet a déjà été scanné le {date} à {heure}"
- Option "Valider quand même" (cas d'erreur) + "Annuler"

**Invalide** :
- Fond rouge
- Icône ✗
- "Billet non reconnu" ou "Billet d'un autre événement"

---

## 6. Back-office admin

> Accessible uniquement aux super-admins. Layout `<AdminLayout>` avec sidebar distincte de l'espace organisateur.

### 6.1 Dashboard admin

**Route** : `/admin/dashboard`

KPI globaux :
- Total des événements publiés
- Total des inscriptions (tous organisateurs)
- CA de la plateforme (commissions)
- Événements en attente de modération (avec badge rouge si > 0)

Graphique d'activité global (inscriptions par jour sur 30j, recharts).

---

### 6.2 Modération des événements

**Route** : `/admin/events`

Onglets : "En attente (N)" / "Publiés" / "Rejetés" / "Tous"

**Tableau** : Titre, Organisateur, Date création, Date événement, Catégorie, Actions.

**Actions par ligne** :
- "Voir l'aperçu" → ouvre un Dialog avec un preview de la page publique
- "Approuver" → passe le statut à `published`, envoie un email à l'organisateur
- "Rejeter" → ouvre un Dialog avec un `<Textarea>` pour indiquer le motif, envoie un email

---

### 6.3 Gestion des organisateurs

**Route** : `/admin/organizers`

Tableau : Nom, Email, Date inscription, Nb événements, Statut (actif/suspendu), Actions.

Actions par ligne :
- Voir le profil complet + liste de ses événements
- Suspendre le compte (avec motif)
- Réactiver le compte

---

### 6.4 Finance

**Route** : `/admin/finance`

**KPI** : Revenus bruts, Commissions encaissées, Remboursements, Revenus nets.

**Tableau des transactions** : Date, Organisateur, Événement, Montant, Commission, Statut.
Filtres : par période (DateRangePicker), par organisateur, par statut.

Bouton "Export comptable (CSV)" pour la période sélectionnée.

---

## 7. Pages transversales

### 7.1 Auth — Connexion / Inscription

**Routes** : `/auth/login`, `/auth/signup`, `/auth/forgot-password`

#### Connexion

Form centré, max-w-sm, card avec ombre légère.
- Email + Mot de passe
- "Se souvenir de moi" (checkbox)
- Lien "Mot de passe oublié ?"
- Bouton "Se connecter" (primary, full-width)
- Séparateur "ou"
- Bouton "Continuer avec Google" (OAuth, v2)
- Lien "Pas encore de compte ? S'inscrire"

#### Inscription

- Prénom, Nom, Email, Mot de passe, Confirmation mot de passe
- `<Select>` Vous êtes : Participant / Organisateur (détermine le rôle initial)
- Checkbox "J'accepte les conditions d'utilisation" (requis)
- Bouton "Créer mon compte"
- Confirmation par email avant activation du compte

#### Mot de passe oublié

- Email uniquement
- Bouton "Envoyer le lien de réinitialisation"
- Message de succès : "Si cet email existe, un lien de réinitialisation vous a été envoyé."

---

### 7.2 Pages d'erreur

**404** : illustration simple, titre "Page introuvable", description, bouton "Retour à l'accueil".
**500** : titre "Une erreur est survenue", description, bouton "Réessayer" (reload).
**Forbidden (403)** : titre "Accès refusé", description, bouton "Se connecter" ou "Retour".

---

## Annexe : types TypeScript principaux

```ts
// types/event.ts
interface Event {
  id: string
  slug: string
  title: string
  description: string         // HTML sanitisé
  coverImageUrl: string | null
  category: EventCategory
  startDate: string           // ISO 8601
  endDate: string
  locationType: 'in_person' | 'online' | 'hybrid'
  address: Address | null
  onlineUrl: string | null
  capacity: number | null     // null = illimité
  status: 'draft' | 'pending' | 'published' | 'cancelled'
  organizerId: string
  createdAt: string
}

interface TicketType {
  id: string
  eventId: string
  name: string
  price: number               // en centimes (0 si gratuit)
  quota: number | null
  sold: number
  saleStart: string | null
  saleEnd: string | null
  minPerOrder: number
  maxPerOrder: number
  description: string | null
}

interface Registration {
  id: string
  eventId: string
  userId: string | null       // null si inscription sans compte
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
  paymentStatus: 'free' | 'paid' | 'pending' | 'refunded'
  items: RegistrationItem[]
  attendeeInfo: Record<string, unknown>   // réponses formulaire
  checkedInAt: string | null
  createdAt: string
}

interface RegistrationItem {
  ticketTypeId: string
  quantity: number
  unitPrice: number
}

type EventCategory = 
  | 'conference'
  | 'concert'
  | 'training'
  | 'corporate'
  | 'sport'
  | 'other'
```

---

*Document généré dans le cadre du brainstorm BMAD — version 1.0*
*À maintenir à jour à chaque évolution du périmètre fonctionnel.*
