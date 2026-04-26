import { useCallback } from 'react';
import { translations } from '@/data/translations';

/**
 * Hook simple pour traduire les données provenant de l'API.
 * Utilise un dictionnaire de traduction prédéfini.
 */
export function useTranslate() {
  const t = useCallback((key: string | undefined): string => {
    if (!key) return '';
    
    // On cherche d'abord la clé exacte (ex: "BUYER")
    // Si pas trouvée, on retourne la clé telle quelle
    return translations[key] || key;
  }, []);

  return { t };
}
