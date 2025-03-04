import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function StatCard({ name, value, icon: Icon }) {
  const [prevValue, setPrevValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPrevValue(value);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [value]);

  // Fonction pour séparer la valeur en caractères individuels
  const splitValue = (val) => {
    return val.toString().split('');
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
        <div className="text-2xl font-bold flex">
          {currentChars.map((char, index) => {
            const prevChar = prevChars[index];
            const hasChanged = prevChar !== char;

            return (
              <AnimatePresence mode="wait" key={`${index}-${char}`}>
                <motion.span
                  key={`${index}-${char}`}
                  initial={hasChanged ? { opacity: 0, y: -20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  {char}
                </motion.span>
              </AnimatePresence>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 