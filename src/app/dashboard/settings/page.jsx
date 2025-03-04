"use client";

import ConversationsSettings from "@/components/settings/ConversationsSettings";
import JsonFileSettings from "@/components/settings/JsonFileSettings";
import BackupManager from "@/components/settings/BackupManager";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
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