"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import ConversationsSettings from "@/components/settings/ConversationsSettings";
import JsonFileSettings from "@/components/settings/JsonFileSettings";
import BackupManager from "@/components/settings/BackupManager";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    general: {
      welcomeMessages: ["Bonjour ! Comment puis-je vous aider aujourd'hui ?"]
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (category, field, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simuler une sauvegarde asynchrone
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <div className="flex items-center space-x-2">
          {saveSuccess && (
            <span className="text-green-600 flex items-center">
              <CheckIcon className="mr-1 h-4 w-4" /> Enregistré
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <ConversationsSettings />
          <JsonFileSettings />
        </div>
        
        <div>
          <BackupManager />
        </div>
      </div>
    </div>
  );
} 