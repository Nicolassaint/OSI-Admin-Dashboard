import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MessagePreview({ message }) {
  // Vérifier si le message est défini et a la bonne structure
  if (!message) {
    return <p className="text-sm text-muted-foreground">Aucune information disponible</p>;
  }

  // Normaliser la structure du message pour gérer différents formats
  const normalizedMessage = {
    label: message.label || message.Label || "",
    description: message.description || message.Description || "",
    status: message.status || "",
    bubbles: Array.isArray(message.bubbles) 
      ? message.bubbles 
      : Array.isArray(message.Bubbles) 
        ? message.Bubbles.map(b => ({
            text: b.text || b.Text || "",
            image: b.image || b.Image || "",
            video: b.video || b.Video || "",
            order: b.order || b.Order || 0
          }))
        : [],
    buttons: Array.isArray(message.buttons) 
      ? message.buttons 
      : Array.isArray(message.Buttons) 
        ? message.Buttons.map(b => ({
            label: b.label || b.Label || "",
            link: b.link || b.Link || "",
            type: b.type || b.Type || "link",
            order: b.order || b.Order || 0
          }))
        : []
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="font-medium text-sm">
          <span className="font-semibold">Message:</span> {normalizedMessage.label}
          {normalizedMessage.status && (
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              normalizedMessage.status === 'resolu' ? 'bg-green-100 text-green-800' :
              normalizedMessage.status === 'archive' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {normalizedMessage.status === 'resolu' ? 'Résolu' :
              normalizedMessage.status === 'archive' ? 'Archivé' : 'En attente'}
            </span>
          )}
        </p>
        
        {normalizedMessage.description && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Description:</span> {normalizedMessage.description}
          </p>
        )}
      </div>
      
      {normalizedMessage.bubbles && normalizedMessage.bubbles.length > 0 && (
        <div className="mt-2">
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              {normalizedMessage.bubbles.map((bubble, index) => {
                // Normaliser la structure de la bulle
                const normalizedBubble = {
                  text: bubble.text || bubble.Text || "",
                  image: bubble.image || bubble.Image || "",
                  video: bubble.video || bubble.Video || ""
                };
                
                return (
                  <div key={index} className="mb-3 last:mb-0">
                    {normalizedBubble.text && (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{normalizedBubble.text}</ReactMarkdown>
                      </div>
                    )}
                    {normalizedBubble.image && (
                      <div className="mt-2">
                        <img src={normalizedBubble.image} alt="" className="max-w-full h-auto rounded-lg border" />
                      </div>
                    )}
                    {normalizedBubble.video && (
                      <div className="mt-2">
                        <video src={normalizedBubble.video} controls className="max-w-full rounded-lg border" />
                      </div>
                    )}
                    {index < normalizedMessage.bubbles.length - 1 && (
                      <div className="border-b my-3"></div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
      
      {normalizedMessage.buttons && normalizedMessage.buttons.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {normalizedMessage.buttons.map((button, index) => {
              // Normaliser la structure du bouton
              const normalizedButton = {
                label: button.label || button.Label || "",
                link: button.link || button.Link || "",
                type: button.type || button.Type || "link"
              };
              
              return (
                <div key={index}>
                  <Button
                    variant={normalizedButton.type === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    className="pointer-events-none hover:bg-background hover:text-foreground"
                  >
                    {normalizedButton.label}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 