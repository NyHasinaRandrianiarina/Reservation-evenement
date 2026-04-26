import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Mapping of static routes to human-readable titles.
 */
const routeTitles: Record<string, string> = {
  '/': 'Accueil',
  '/catalogue': 'Catalogue',
  '/vendeurs': 'Annuaire des Vendeurs',
  '/categories': 'Catégories',
  '/checkout': 'Paiement',
  '/commande-validee': 'Commande Confirmée',
  '/profil': 'Mon Profil',
  '/devenir-vendeur': 'Devenir Vendeur',
  '/inscription': 'Inscription',
  '/connexion': 'Connexion',
  '/connexion/2fa': 'Vérification 2FA',
  '/espace-vendeur': 'Espace Vendeur',
};

/**
 * Hook to dynamically set the page title.
 * @param manualTitle Optional manual title to override the automatic one.
 */
export const usePageTitle = (manualTitle?: string) => {
  const location = useLocation();
  const siteName = 'TrackIt';

  useEffect(() => {
    let title = '';

    if (manualTitle) {
      title = manualTitle;
    } else {
      const path = location.pathname;
      
      // Check for static mapping
      if (routeTitles[path]) {
        title = routeTitles[path];
      } else {
        // Fallback: Try to derive title from the last segment of the path
        // e.g., /espace-vendeur/mon-profil -> "Mon Profil"
        const segments = path.split('/').filter(Boolean);
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          // Clean up the segment (replace hyphens with spaces, capitalize)
          title = lastSegment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        } else {
          title = 'TrackIt';
        }
      }
    }

    document.title = `${title} | ${siteName}`;
  }, [location, manualTitle]);
};
