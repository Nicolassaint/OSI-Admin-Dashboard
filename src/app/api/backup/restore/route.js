import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier JSON
const dataFilePath = path.join(process.cwd(), 'src/data/search.json');
// Chemin vers le répertoire de sauvegarde
const backupDir = path.join(process.cwd(), 'src/data/backups');

export async function POST(request) {
  try {
    const { backupFile } = await request.json();
    
    if (!backupFile) {
      return NextResponse.json(
        { error: 'Nom de fichier de sauvegarde non spécifié' },
        { status: 400 }
      );
    }
    
    const backupFilePath = path.join(backupDir, backupFile);
    
    // Vérifier si le fichier de sauvegarde existe
    if (!fs.existsSync(backupFilePath)) {
      return NextResponse.json(
        { error: 'Fichier de sauvegarde non trouvé' },
        { status: 404 }
      );
    }
    
    // Créer une sauvegarde de l'état actuel avant restauration
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const preRestoreBackupPath = path.join(backupDir, `search_pre_restore_${timestamp}.json`);
    
    // Sauvegarder l'état actuel si le fichier existe
    if (fs.existsSync(dataFilePath)) {
      fs.copyFileSync(dataFilePath, preRestoreBackupPath);
    }
    
    // Restaurer la sauvegarde
    fs.copyFileSync(backupFilePath, dataFilePath);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sauvegarde restaurée avec succès',
      preRestoreBackup: path.basename(preRestoreBackupPath)
    });
  } catch (error) {
    console.error('Erreur lors de la restauration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la restauration: ' + error.message },
      { status: 500 }
    );
  }
} 