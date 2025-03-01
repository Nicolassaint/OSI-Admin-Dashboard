"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon } from "@radix-ui/react-icons";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    general: {
      chatbotName: "Assistant IA",
      welcomeMessage: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      maxMessagesPerUser: 100,
    },
    appearance: {
      primaryColor: "#0070f3",
      chatBubbleColor: "#f5f5f5",
      fontFamily: "Inter",
      darkMode: true,
    },
    performance: {
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      responseTimeout: 30,
    },
    security: {
      requireAuthentication: false,
      logUserQueries: true,
      filterSensitiveData: true,
      rateLimiting: true,
    },
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

  const handleToggle = (category, field) => {
    handleChange(category, field, !settings[category][field]);
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
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Paramètres généraux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Message d'accueil
              </label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md 
                focus:outline-none focus:ring-2 focus:ring-primary 
                bg-background text-foreground"
                value={settings.general.welcomeMessage}
                onChange={(e) => handleChange("general", "welcomeMessage", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
            <CardDescription>
              Personnalisation de l'interface du chatbot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="primaryColor" className="text-sm font-medium">
                Couleur principale
              </label>
              <div className="flex space-x-2">
                <input
                  id="primaryColor"
                  type="color"
                  value={settings.appearance.primaryColor}
                  onChange={(e) => handleChange("appearance", "primaryColor", e.target.value)}
                  className="w-10 h-10 rounded-md border"
                />
                <input
                  type="text"
                  value={settings.appearance.primaryColor}
                  onChange={(e) => handleChange("appearance", "primaryColor", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="fontFamily" className="text-sm font-medium">
                Police de caractères
              </label>
              <select
                id="fontFamily"
                value={settings.appearance.fontFamily}
                onChange={(e) => handleChange("appearance", "fontFamily", e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="darkMode"
                type="checkbox"
                checked={settings.appearance.darkMode}
                onChange={() => handleToggle("appearance", "darkMode")}
                className="rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="darkMode" className="text-sm font-medium">
                Mode sombre par défaut
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>
              Paramètres de performance du modèle IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="maxTokens" className="text-sm font-medium">
                Nombre maximum de tokens
              </label>
              <input
                id="maxTokens"
                type="number"
                value={settings.performance.maxTokens}
                onChange={(e) => handleChange("performance", "maxTokens", parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="temperature" className="text-sm font-medium">
                Température (0-1)
              </label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.performance.temperature}
                onChange={(e) => handleChange("performance", "temperature", parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Précis</span>
                <span>{settings.performance.temperature}</span>
                <span>Créatif</span>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="responseTimeout" className="text-sm font-medium">
                Délai d'attente de réponse (secondes)
              </label>
              <input
                id="responseTimeout"
                type="number"
                value={settings.performance.responseTimeout}
                onChange={(e) => handleChange("performance", "responseTimeout", parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Paramètres de sécurité et de confidentialité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                id="requireAuthentication"
                type="checkbox"
                checked={settings.security.requireAuthentication}
                onChange={() => handleToggle("security", "requireAuthentication")}
                className="rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="requireAuthentication" className="text-sm font-medium">
                Exiger l'authentification des utilisateurs
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="logUserQueries"
                type="checkbox"
                checked={settings.security.logUserQueries}
                onChange={() => handleToggle("security", "logUserQueries")}
                className="rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="logUserQueries" className="text-sm font-medium">
                Enregistrer les requêtes des utilisateurs
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="filterSensitiveData"
                type="checkbox"
                checked={settings.security.filterSensitiveData}
                onChange={() => handleToggle("security", "filterSensitiveData")}
                className="rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="filterSensitiveData" className="text-sm font-medium">
                Filtrer les données sensibles
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="rateLimiting"
                type="checkbox"
                checked={settings.security.rateLimiting}
                onChange={() => handleToggle("security", "rateLimiting")}
                className="rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="rateLimiting" className="text-sm font-medium">
                Activer la limitation de débit
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 