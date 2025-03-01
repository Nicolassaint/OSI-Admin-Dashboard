import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import MessageBubble from "./message-bubble";
import MessageButton from "./message-button";

export default function MessagesTab({ entry, setEntry }) {
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  const addMessage = () => {
    const newMessages = [...entry.details.messages, {
      label: `Message ${entry.details.messages.length + 1}`,
      description: "",
      bubbles: [{
        text: "",
        image: "",
        video: "",
        order: 0
      }],
      buttons: []
    }];
    
    setEntry({
      ...entry,
      isDecisionTree: newMessages.length > 1,
      details: {
        ...entry.details,
        messages: newMessages
      }
    });
    
    // Activer le nouvel onglet de message
    setActiveMessageIndex(newMessages.length - 1);
  };

  const addBubble = (messageIndex) => {
    const updatedMessages = [...entry.details.messages];
    const bubbles = [...(updatedMessages[messageIndex].bubbles || [])];
    
    bubbles.push({
      text: "",
      image: "",
      video: "",
      order: bubbles.length
    });
    
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      bubbles
    };
    
    setEntry({
      ...entry,
      details: {
        ...entry.details,
        messages: updatedMessages
      }
    });
  };

  const addButton = (messageIndex) => {
    const updatedMessages = [...entry.details.messages];
    const buttons = [...(updatedMessages[messageIndex].buttons || [])];
    
    buttons.push({
      label: "",
      link: "",
      type: "link",
      order: buttons.length
    });
    
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      buttons
    };
    
    setEntry({
      ...entry,
      details: {
        ...entry.details,
        messages: updatedMessages
      }
    });
  };

  const removeMessage = (index) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ce message ?`)) {
      const updatedMessages = [...entry.details.messages];
      updatedMessages.splice(index, 1);
      
      setEntry({
        ...entry,
        isDecisionTree: updatedMessages.length > 1,
        details: {
          ...entry.details,
          messages: updatedMessages
        }
      });
      
      // Ajuster l'index actif si nécessaire
      if (activeMessageIndex >= updatedMessages.length) {
        setActiveMessageIndex(Math.max(0, updatedMessages.length - 1));
      }
    }
  };

  const removeBubble = (messageIndex, bubbleIndex) => {
    const updatedMessages = [...entry.details.messages];
    const bubbles = [...updatedMessages[messageIndex].bubbles];
    bubbles.splice(bubbleIndex, 1);
    
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      bubbles
    };
    
    setEntry({
      ...entry,
      details: {
        ...entry.details,
        messages: updatedMessages
      }
    });
  };

  const removeButton = (messageIndex, buttonIndex) => {
    const updatedMessages = [...entry.details.messages];
    const buttons = [...updatedMessages[messageIndex].buttons];
    buttons.splice(buttonIndex, 1);
    
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      buttons
    };
    
    setEntry({
      ...entry,
      details: {
        ...entry.details,
        messages: updatedMessages
      }
    });
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Messages</h2>
        <Button onClick={addMessage}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Ajouter un message
        </Button>
      </div>
      
      {entry.details.messages.length > 0 && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {entry.details.messages.map((message, idx) => (
                    <li 
                      key={idx}
                      className={`p-3 cursor-pointer flex justify-between items-center ${
                        idx === activeMessageIndex 
                          ? 'bg-primary/10 border-l-4 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setActiveMessageIndex(idx)}
                    >
                      <span className="font-medium truncate">
                        {message.label || `Message ${idx + 1}`}
                      </span>
                      {entry.details.messages.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMessage(idx);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>
                  {entry.details.messages[activeMessageIndex]?.label || `Message ${activeMessageIndex + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Libellé</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md bg-background"
                    value={entry.details.messages[activeMessageIndex]?.label || ''}
                    onChange={(e) => {
                      const updatedMessages = [...entry.details.messages];
                      updatedMessages[activeMessageIndex] = {
                        ...updatedMessages[activeMessageIndex],
                        label: e.target.value
                      };
                      setEntry({
                        ...entry,
                        details: {...entry.details, messages: updatedMessages}
                      });
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    className="w-full p-2 border rounded-md bg-background"
                    rows="2"
                    value={entry.details.messages[activeMessageIndex]?.description || ''}
                    onChange={(e) => {
                      const updatedMessages = [...entry.details.messages];
                      updatedMessages[activeMessageIndex] = {
                        ...updatedMessages[activeMessageIndex],
                        description: e.target.value
                      };
                      setEntry({
                        ...entry,
                        details: {...entry.details, messages: updatedMessages}
                      });
                    }}
                  />
                </div>
                
                {/* Section des bulles */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Bulles</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addBubble(activeMessageIndex)}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Ajouter une bulle
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {entry.details.messages[activeMessageIndex]?.bubbles?.map((bubble, bidx) => (
                      <MessageBubble 
                        key={bidx}
                        bubble={bubble}
                        onRemove={() => removeBubble(activeMessageIndex, bidx)}
                        onChange={(updatedBubble) => {
                          const updatedMessages = [...entry.details.messages];
                          const updatedBubbles = [...updatedMessages[activeMessageIndex].bubbles];
                          updatedBubbles[bidx] = updatedBubble;
                          updatedMessages[activeMessageIndex] = {
                            ...updatedMessages[activeMessageIndex],
                            bubbles: updatedBubbles
                          };
                          setEntry({
                            ...entry,
                            details: {...entry.details, messages: updatedMessages}
                          });
                        }}
                      />
                    ))}
                    
                    {(!entry.details.messages[activeMessageIndex]?.bubbles || 
                      entry.details.messages[activeMessageIndex].bubbles.length === 0) && (
                      <div className="text-center py-8 border border-dashed rounded-md">
                        <p className="text-muted-foreground">Aucune bulle</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => addBubble(activeMessageIndex)}
                        >
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Ajouter une bulle
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Section des boutons */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Boutons</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addButton(activeMessageIndex)}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Ajouter un bouton
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {entry.details.messages[activeMessageIndex]?.buttons?.map((button, btnIdx) => (
                      <MessageButton
                        key={btnIdx}
                        button={button}
                        onRemove={() => removeButton(activeMessageIndex, btnIdx)}
                        onChange={(updatedButton) => {
                          const updatedMessages = [...entry.details.messages];
                          const updatedButtons = [...updatedMessages[activeMessageIndex].buttons];
                          updatedButtons[btnIdx] = updatedButton;
                          updatedMessages[activeMessageIndex] = {
                            ...updatedMessages[activeMessageIndex],
                            buttons: updatedButtons
                          };
                          setEntry({
                            ...entry,
                            details: {...entry.details, messages: updatedMessages}
                          });
                        }}
                      />
                    ))}
                    
                    {(!entry.details.messages[activeMessageIndex]?.buttons || 
                      entry.details.messages[activeMessageIndex].buttons.length === 0) && (
                      <div className="text-center py-8 border border-dashed rounded-md">
                        <p className="text-muted-foreground">Aucun bouton</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => addButton(activeMessageIndex)}
                        >
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Ajouter un bouton
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
} 