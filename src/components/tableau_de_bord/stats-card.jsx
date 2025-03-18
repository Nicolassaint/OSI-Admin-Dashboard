import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export function StatCard({ name, value, icon: Icon }) {
  const [prevValue, setPrevValue] = useState(value);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    // Nettoyer le timeout précédent si existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Mettre à jour la valeur précédente après un délai
    timeoutRef.current = setTimeout(() => {
      setPrevValue(value);
    }, 600);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  // Fonction pour séparer la valeur en caractères individuels
  const splitValue = (val) => {
    // S'assurer que la valeur est une chaîne et préserver les espaces
    const str = val?.toString() || '';
    // Utiliser un regex qui capture explicitement les espaces
    return str.match(/\s|\S/g) || [];
  };

  const prevChars = splitValue(prevValue);
  const currentChars = splitValue(value);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex flex-wrap">
          <AnimatePresence mode="wait">
            {currentChars.map((char, index) => {
              const prevChar = prevChars[index];
              const hasChanged = prevChar !== char;

              return (
                <motion.span
                  key={`${index}-${char}`}
                  initial={hasChanged ? { opacity: 0, y: -20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  style={{ 
                    display: 'inline-block',
                    whiteSpace: 'pre'
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
} 