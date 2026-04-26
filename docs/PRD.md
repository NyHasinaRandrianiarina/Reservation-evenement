# EventNest — Product Requirements Document

## Vision & objectif produit

La plateforme est un SaaS multi-tenant qui permet à n'importe quel organisateur de créer et gérer des événements de tout type, et à des participants de les découvrir et s'y inscrire — avec ou sans paiement. L'objectif est d'être le **"Shopify des événements"** : simple pour les organisateurs débutants, puissant pour les pros.

## Personas

Il y a trois personas distincts.

L’**organisateur** est une personne ou une organisation qui crée des événements. Il veut aller vite, ne pas avoir à toucher au code, et voir ses inscriptions en temps réel.

Le **participant** est quelqu’un qui découvre et s’inscrit à un événement. Il veut un parcours fluide, une confirmation immédiate et un billet accessible.

Le **super-admin** est l’équipe interne qui gère la plateforme. Il veut contrôler la qualité des événements publiés et les revenus.

## Problèmes résolus

Sans la plateforme, les organisateurs bricolent avec Google Forms, Excel et un virement manuel. Les participants reçoivent des confirmations floues, sans billet propre. Il n’y a aucune visibilité sur les inscriptions en direct.

## Hypothèses clés

On pose comme hypothèse que les organisateurs acceptent de payer une commission sur les billets payants (modèle Eventbrite), que la majorité des événements sont en présentiel avec une forte demande de QR code pour le check-in, et qu’on n’a pas besoin de live streaming dans la V1.

## Contraintes

La V1 doit supporter le multilingue (au minimum FR/EN), être mobile-first côté participant, et être conforme RGPD pour la collecte de données.

## User stories — par rôle

### Organisateur

> "En tant qu'organisateur, je veux créer un événement en moins de 10 minutes avec titre, description, date, lieu et une image de couverture, afin de publier rapidement."

> "En tant qu'organisateur, je veux définir plusieurs types de billets (ex : Early Bird, Standard, VIP) avec des prix, des quotas et des dates de vente différentes, afin de gérer ma billetterie finement."

> "En tant qu'organisateur, je veux créer un formulaire d'inscription personnalisé (champs libres, listes déroulantes, cases à cocher), afin de collecter les infos dont j'ai besoin."

> "En tant qu'organisateur, je veux voir en temps réel le nombre d'inscrits, le CA généré et les billets restants depuis mon dashboard, afin de piloter mon événement."

> "En tant qu'organisateur, je veux envoyer des emails groupés à mes inscrits (rappel, info de dernière minute), afin de communiquer sans quitter la plateforme."

> "En tant qu'organisateur, je veux exporter la liste des participants en CSV ou Excel, afin de l'importer dans mes outils existants."

> "En tant qu'organisateur, je veux scanner les QR codes des billets avec mon téléphone le jour J, afin de valider les entrées sans matériel spécifique."

### Participant

> "En tant que participant, je veux trouver un événement via une page publique ou un lien direct, sans avoir à créer un compte, afin de m'inscrire rapidement."

> "En tant que participant, je veux payer de façon sécurisée par carte bancaire, afin d'obtenir une confirmation immédiate."

> "En tant que participant, je veux recevoir un email de confirmation avec mon billet en PDF contenant un QR code, afin de pouvoir me présenter à l'événement."

> "En tant que participant, je veux accéder à mon billet depuis mon espace personnel ou directement depuis l'email, afin de ne pas le perdre."

> "En tant que participant, je veux pouvoir annuler mon inscription et être remboursé selon la politique de l'organisateur, afin d'avoir de la flexibilité."

> "En tant que participant, je veux m'inscrire à plusieurs sessions d'un même événement (ex : conférence multi-track), afin de personnaliser mon programme."

### Super-admin

> "En tant qu'admin, je veux approuver ou rejeter un événement avant sa publication, afin de garantir la qualité de la plateforme."

> "En tant qu'admin, je veux voir les revenus totaux, les commissions perçues et les événements les plus actifs, afin de suivre la santé du business."