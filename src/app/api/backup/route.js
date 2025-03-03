// Nouveau fichier: src/app/api/backup/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/search.json');
const backupDir = path.join(process.cwd(), 'src/data/backups');

export async function POST(request) {
  try {
    // Vérifier si le répertoire de sauvegarde existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Vérifier si le fichier source existe
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json(
        { error: 'Fichier source non trouvé' },
        { status: 404 }
      );
    }

    // Générer un nom de fichier avec timestamp
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const backupFilePath = path.join(backupDir, `search_backup_${timestamp}.json`);

    // Copier le fichier
    fs.copyFileSync(dataFilePath, backupFilePath);

    // Nettoyer les anciennes sauvegardes (garder les 10 plus récentes)
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('search_backup_'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Supprimer les fichiers excédentaires
    if (files.length > 10) {
      files.slice(10).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sauvegarde créée avec succès',
      backupFile: backupFilePath
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Vérifier si le répertoire de sauvegarde existe
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({ backups: [] });
    }

    // Lister les sauvegardes
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('search_backup_'))
      .map(file => ({
        name: file,
        path: `/api/backup/${file}`,
        date: fs.statSync(path.join(backupDir, file)).mtime
      }))
      .sort((a, b) => b.date - a.date);

    return NextResponse.json({ backups });
  } catch (error) {
    console.error('Erreur lors de la récupération des sauvegardes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sauvegardes: ' + error.message },
      { status: 500 }
    );
  }
}

// Ajouter cette nouvelle route pour la suppression
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Nom de fichier non spécifié' },
        { status: 400 }
      );
    }

    const backupFilePath = path.join(backupDir, filename);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(backupFilePath)) {
      return NextResponse.json(
        { error: 'Fichier de sauvegarde non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que le fichier est bien une sauvegarde
    if (!filename.startsWith('search_backup_')) {
      return NextResponse.json(
        { error: 'Opération non autorisée' },
        { status: 403 }
      );
    }

    // Supprimer le fichier
    fs.unlinkSync(backupFilePath);

    return NextResponse.json({ 
      success: true, 
      message: 'Sauvegarde supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la sauvegarde:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression: ' + error.message },
      { status: 500 }
    );
  }
}