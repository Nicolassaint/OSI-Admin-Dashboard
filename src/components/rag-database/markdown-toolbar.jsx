import { Button } from "@/components/ui/button";
import { 
  FontBoldIcon, 
  FontItalicIcon, 
  ListBulletIcon,
  Link1Icon,
  HeadingIcon,
  CodeIcon,
  QuoteIcon,
  ArrowLeftIcon
} from "@radix-ui/react-icons";
import { useState, useEffect } from "react";

export default function MarkdownToolbar({ textareaRef }) {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Surveiller les changements dans le textarea et mettre à jour l'historique
  useEffect(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    
    const handleInput = () => {
      const value = textarea.value;
      
      // Ne pas ajouter à l'historique si c'est la même valeur
      if (history[currentIndex] === value) return;
      
      // Tronquer l'historique si nous sommes au milieu
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(value);
      
      // Limiter la taille de l'historique (optionnel)
      if (newHistory.length > 50) newHistory.shift();
      
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    };
    
    textarea.addEventListener('input', handleInput);
    
    // Initialiser l'historique avec la valeur actuelle
    if (history.length === 0 && textarea.value) {
      setHistory([textarea.value]);
      setCurrentIndex(0);
    }
    
    return () => {
      textarea.removeEventListener('input', handleInput);
    };
  }, [textareaRef, history, currentIndex]);

  const insertMarkdown = (prefix, suffix = "") => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    const newText = beforeText + prefix + selectedText + suffix + afterText;
    textarea.value = newText;
    
    // Déclencher un événement de changement pour mettre à jour l'état
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
    
    // Replacer le curseur après le texte formaté
    textarea.focus();
    const newCursorPos = selectedText.length > 0 
      ? start + prefix.length + selectedText.length + suffix.length
      : start + prefix.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  };

  const undo = () => {
    if (currentIndex <= 0) return;
    
    const newIndex = currentIndex - 1;
    const previousValue = history[newIndex];
    
    if (!textareaRef.current || !previousValue) return;
    
    textareaRef.current.value = previousValue;
    setCurrentIndex(newIndex);
    
    // Déclencher un événement de changement pour mettre à jour l'état
    const event = new Event('input', { bubbles: true });
    textareaRef.current.dispatchEvent(event);
  };

  return (
    <div className="flex flex-wrap gap-1 mb-1 bg-muted/30 p-1 rounded-md">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        title="Annuler"
        onClick={undo}
        disabled={currentIndex <= 0}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-8 bg-border mx-1"></div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        title="Gras"
        onClick={() => insertMarkdown('**', '**')}
      >
        <FontBoldIcon className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        title="Italique"
        onClick={() => insertMarkdown('*', '*')}
      >
        <FontItalicIcon className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        title="Titre"
        onClick={() => insertMarkdown('## ')}
      >
        <HeadingIcon className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        title="Liste à puces"
        onClick={() => insertMarkdown('- ')}
      >
        <ListBulletIcon className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        title="Lien"
        onClick={() => insertMarkdown('[', '](url)')}
      >
        <Link1Icon className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        title="Code"
        onClick={() => insertMarkdown('`', '`')}
      >
        <CodeIcon className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        title="Citation"
        onClick={() => insertMarkdown('> ')}
      >
        <QuoteIcon className="h-4 w-4" />
      </Button>
    </div>
  );
} 