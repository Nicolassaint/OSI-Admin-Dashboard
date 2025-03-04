import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";

export default function MessagePreview({ message }) {
  return (
    <div className="space-y-4">
      <p className="font-medium text-sm">
        Message: {message.label}
      </p>
      {message.bubbles && message.bubbles.length > 0 && (
        <div className="mt-2 text-sm">
          {message.bubbles.map((bubble, index) => (
            <div key={index} className="mb-2">
              {bubble.text && (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{bubble.text}</ReactMarkdown>
                </div>
              )}
              {bubble.image && (
                <img src={bubble.image} alt="" className="mt-2 max-w-full h-auto rounded-lg" />
              )}
              {bubble.video && (
                <video src={bubble.video} controls className="mt-2 max-w-full rounded-lg" />
              )}
            </div>
          ))}
        </div>
      )}
      {message.buttons && message.buttons.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Boutons proposés à l'utilisateur :</p>
          <div className="flex flex-wrap gap-2">
            {message.buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.type === 'primary' ? 'default' : 'outline'}
                size="sm"
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 