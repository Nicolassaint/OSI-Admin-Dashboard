import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function StatCard({ name, value, icon: Icon }) {
  const [prevValue, setPrevValue] = useState(value);
  
  useEffect(() => {
    // Mettre à jour la valeur précédente après l'animation
    const timer = setTimeout(() => {
      setPrevValue(value);
    }, 600); // Durée légèrement plus longue que l'animation
    
    return () => clearTimeout(timer);
  }, [value]);
  
  // Déterminer si la valeur a changé
  const hasChanged = prevValue !== value;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={value} // Changer la clé force une réanimation
            initial={hasChanged ? { opacity: 0, y: -10 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, position: 'absolute' }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold"
          >
            {value}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
} 