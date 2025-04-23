import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ClipboardIcon, CheckIcon } from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";

// Fonction utilitaire pour filtrer les props spécifiques de React Markdown
const filterMarkdownProps = (props, excludedProps = ['ordered', 'node']) => {
  const newProps = { ...props };
  
  // Supprimer les propriétés à exclure
  excludedProps.forEach(prop => {
    delete newProps[prop];
  });
  
  return newProps;
};

export function DocItem({ doc }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AccordionItem 
      value={doc.id} 
      className="border rounded-lg overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 bg-card hover:bg-accent text-left font-medium">
        {doc.title}
      </AccordionTrigger>
      <AccordionContent className="px-4 py-3 border-t">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              // Personnalisation des éléments Markdown
              h1: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...filterMarkdownProps(props)} />,
              h2: ({ node, ...props }) => <h4 className="text-lg font-bold mt-3 mb-2" {...filterMarkdownProps(props)} />,
              h3: ({ node, ...props }) => <h5 className="text-md font-bold mt-2 mb-1" {...filterMarkdownProps(props)} />,
              p: ({ node, ...props }) => <p className="mb-3" {...filterMarkdownProps(props)} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3" {...filterMarkdownProps(props)} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3" {...filterMarkdownProps(props)} />,
              li: ({ node, ordered, ...props }) => <li className="mb-1" {...filterMarkdownProps(props)} />,
              code: ({ node, inline, ...props }) => 
                inline ? (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm" {...filterMarkdownProps(props)} />
                ) : (
                  <div className="relative bg-muted rounded-md p-3 my-3">
                    <code className="block text-sm font-mono" {...filterMarkdownProps(props)} />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-7 w-7 opacity-70 hover:opacity-100"
                      onClick={() => copyToClipboard(props.children)}
                    >
                      {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                )
            }}
          >
            {doc.content}
          </ReactMarkdown>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
} 