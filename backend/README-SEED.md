# Seeds CLI - Eventnest

## Usage

```bash
npm run seed <seed>          Lance un seed spécifique
npm run seed all             Lance tous les seeds
npm run seed --help          Affiche l’aide
```

### Seeds disponibles

- `admin` : Crée ou met à jour le compte admin (non destructif)
- `events` : Insère/met à jour des événements de test et un organizer si nécessaire
- `all` : Lance tous les seeds

### Options

- `--reset-password` (admin only) : Réinitialise le mot de passe admin avec la valeur ADMIN_EMAIL/ADMIN_PASSWORD du .env

## Exemples

```bash
# Créer l’admin (si inexistant)
npm run seed admin

# Réinitialiser le mot de passe admin
npm run seed admin -- --reset-password

# Lancer tous les seeds
npm run seed all
```

## Variables d’environnement requises

Dans `.env` :

```env
ADMIN_EMAIL="admin@eventnest.dev"
ADMIN_PASSWORD="MotDePasseSecret123!"
```

## Ajouter un nouveau seed

1. Créer `src/seeds/<nom>.seed.ts`
2. Exporter une fonction `seed<Name>(options?: any)`
3. L’ajouter dans `src/seeds/index.ts`
4. Lancer avec `npm run seed <nom>`
