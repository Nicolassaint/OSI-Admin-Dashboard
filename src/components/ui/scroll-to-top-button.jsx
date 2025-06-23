import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon } from "@radix-ui/react-icons";

export function ScrollToTopButton({ 
  threshold = 300, 
  className = "",
  containerSelector = 'main[class*="overflow-y-auto"]'
}) {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Fonction pour gérer le scroll et afficher/masquer le bouton retour en haut
  useEffect(() => {
    const handleScroll = (event) => {
      // Ne pas traiter les événements de scroll pendant l'animation
      if (isScrolling) return;
      
      // Le scroll se fait dans le conteneur spécifié, pas sur window
      const target = event.target;
      const scrolled = target.scrollTop;
      setShowScrollToTop(scrolled > threshold);
    };

    const windowScrollHandler = () => {
      // Ne pas traiter les événements de scroll pendant l'animation
      if (isScrolling) return;
      
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      setShowScrollToTop(scrolled > threshold);
    };

    // Trouver le conteneur de scroll principal
    const mainContainer = document.querySelector(containerSelector);
    
    if (mainContainer) {
      mainContainer.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        mainContainer.removeEventListener('scroll', handleScroll);
      };
    } else {
      // Fallback sur window si le conteneur n'est pas trouvé
      window.addEventListener('scroll', windowScrollHandler, { passive: true });
      return () => window.removeEventListener('scroll', windowScrollHandler);
    }
  }, [threshold, containerSelector, isScrolling]);

  // Fonction pour retourner en haut de page
  const scrollToTop = () => {
    if (isScrolling) return; // Éviter les clics multiples pendant l'animation
    
    setIsScrolling(true);
    
    // Trouver le conteneur de scroll principal
    const mainContainer = document.querySelector(containerSelector);
    
    // Créer une animation personnalisée pour un meilleur contrôle
    const startPosition = mainContainer ? mainContainer.scrollTop : window.pageYOffset;
    const startTime = performance.now();
    const duration = 800; // Animation plus douce
    
    let animationId = null;
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Fonction d'easing plus douce pour une meilleure expérience
      const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
      const easedProgress = easeInOutQuart(progress);
      
      const currentPosition = startPosition * (1 - easedProgress);
      
      // Appliquer le scroll de manière plus fluide
      try {
        if (mainContainer) {
          mainContainer.scrollTop = currentPosition;
        } else {
          window.scrollTo({ top: currentPosition, behavior: 'instant' });
        }
      } catch (error) {
        console.warn('Scroll error:', error);
      }
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animateScroll);
      } else {
        setIsScrolling(false);
        animationId = null;
        
        // Forcer la vérification de la position du scroll à la fin de l'animation
        setTimeout(() => {
          const finalPosition = mainContainer ? mainContainer.scrollTop : window.pageYOffset;
          setShowScrollToTop(finalPosition > threshold);
        }, 100);
      }
    };
    
    animationId = requestAnimationFrame(animateScroll);
    
    // Nettoyage de sécurité
    setTimeout(() => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        setIsScrolling(false);
      }
      
      // Vérification finale de la position
      const finalPosition = mainContainer ? mainContainer.scrollTop : window.pageYOffset;
      setShowScrollToTop(finalPosition > threshold);
    }, duration + 200);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${
        showScrollToTop
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      } ${className}`}
    >
      <Button
        onClick={scrollToTop}
        disabled={isScrolling}
        className={`
          rounded-full w-12 h-12 shadow-lg transition-all duration-300 ease-out backdrop-blur-sm
          ${isScrolling 
            ? 'bg-primary/80 scale-95 cursor-wait shadow-md' 
            : 'bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95'
          }
        `}
        size="icon"
        title={isScrolling ? "Défilement en cours..." : "Retour en haut"}
      >
        <ChevronUpIcon 
          className={`h-5 w-5 transition-all duration-300 ease-out ${
            isScrolling 
              ? 'scale-110 animate-pulse' 
              : 'group-hover:scale-110'
          }`} 
        />
      </Button>
    </div>
  );
} 