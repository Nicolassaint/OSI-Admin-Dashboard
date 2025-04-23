import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocItem } from "./doc-item";
import { Accordion } from "@/components/ui/accordion";
import { useEffect, useState } from "react";

// Associer des émojis à chaque catégorie de documentation
const categoryEmojis = {
  "getting-started": "🚀",
  "dashboard": "📊",
  "messages": "💬",
  "rag-database": "🧠",
  "settings": "⚙️"
};

export function DocsCategory({ category, docs, targetDocId, isActive }) {
  const [openItems, setOpenItems] = useState([]);
  
  // Mettre à jour les éléments ouverts quand la cible change et que cette catégorie est active
  useEffect(() => {
    if (isActive && targetDocId && docs.some(doc => doc.id === targetDocId)) {
      setOpenItems([targetDocId]);
    }
  }, [targetDocId, isActive, docs]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center">
          {categoryEmojis[category.id] || '📄'} {category.name}
        </h2>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      {docs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucune documentation disponible dans cette catégorie pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion 
          type="multiple" 
          className="space-y-4" 
          value={openItems}
          onValueChange={setOpenItems}
        >
          {docs.map((doc, index) => (
            <div 
              key={index} 
              id={`doc-${doc.id}`} 
              className={targetDocId === doc.id ? 'doc-target' : ''}
            >
              <DocItem doc={doc} />
            </div>
          ))}
        </Accordion>
      )}
    </div>
  );
} 