#!/bin/bash

PID_FILE="./app.pid"
LOGS_DIR="./logs"
DEFAULT_PORT=3333

# Fonction pour arrêter l'application
stop_app() {
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        echo "Recherche des processus liés au port $DEFAULT_PORT..."
        
        # Utiliser netstat pour trouver le processus lié au port
        port_pids=$(sudo netstat -tulnp | grep $DEFAULT_PORT | awk '{print $7}' | cut -d'/' -f1)
        
        if [ ! -z "$port_pids" ]; then
            echo "Arrêt des processus sur le port $DEFAULT_PORT (PIDs: $port_pids)..."
            for pid in $port_pids; do
                if [ ! -z "$pid" ]; then
                    echo "Arrêt du processus $pid..."
                    sudo kill -9 $pid 2>/dev/null
                fi
            done
        else
            echo "Aucun processus trouvé sur le port $DEFAULT_PORT."
        fi
        
        rm -f "$PID_FILE"
        echo "Application arrêtée."
    else
        echo "Aucune instance en cours d'exécution selon le fichier PID."
        
        # Vérifier quand même si des processus utilisent le port
        port_pids=$(sudo netstat -tulnp | grep $DEFAULT_PORT | awk '{print $7}' | cut -d'/' -f1)
        
        if [ ! -z "$port_pids" ]; then
            echo "Des processus utilisent toujours le port $DEFAULT_PORT (PIDs: $port_pids)."
            read -p "Voulez-vous les arrêter ? (o/n): " kill_orphans
            if [ "$kill_orphans" = "o" ] || [ "$kill_orphans" = "O" ]; then
                for pid in $port_pids; do
                    if [ ! -z "$pid" ]; then
                        echo "Arrêt du processus $pid..."
                        sudo kill -9 $pid 2>/dev/null
                    fi
                done
                echo "Processus arrêtés."
            fi
        else
            echo "Aucun processus n'utilise le port $DEFAULT_PORT."
        fi
    fi
}


# Fonction pour vérifier si un port est utilisé
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port est utilisé
    else
        return 1  # Port est libre
    fi
}

# Fonction pour kill un processus utilisant un port
kill_port_process() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        echo "Port $port est utilisé par le processus $pid"
        read -p "Voulez-vous kill ce processus ? (o/n): " kill_process
        if [ "$kill_process" = "o" ] || [ "$kill_process" = "O" ]; then
            kill -9 $pid
            echo "Processus $pid terminé"
            return 0
        fi
        return 1
    fi
}

# Fonction pour démarrer l'application
start_app() {
    if [ -f "$PID_FILE" ]; then
        echo "Une instance est déjà en cours d'exécution."
        exit 1
    fi

    # Configuration du port
    port=$DEFAULT_PORT
    valid_port=false

    while [ "$valid_port" = false ]; do
        read -p "Voulez-vous utiliser le port $port ? (o/n): " use_port
        
        if [ "$use_port" = "o" ] || [ "$use_port" = "O" ]; then
            if check_port $port; then
                echo "Le port $port est déjà utilisé"
                if ! kill_port_process $port; then
                    read -p "Entrez un autre port: " new_port
                    if [[ "$new_port" =~ ^[0-9]+$ ]]; then
                        port=$new_port
                        continue
                    fi
                fi
            fi
            valid_port=true
        else
            read -p "Entrez le nouveau port souhaité: " new_port
            if [[ "$new_port" =~ ^[0-9]+$ ]]; then
                port=$new_port
                if check_port $port; then
                    echo "Le port $port est déjà utilisé"
                    if ! kill_port_process $port; then
                        continue
                    fi
                fi
            else
                echo "Port invalide. Veuillez entrer un nombre."
                continue
            fi
            valid_port=true
        fi
    done

    # Sauvegarder et supprimer .env.local s'il existe pour éviter qu'il ne soit pris en compte
    if [ -f ".env.local" ]; then
        echo "Sauvegarde temporaire de .env.local..."
        mv .env.local .env.local.bak
    fi

    # Demande si l'utilisateur veut build
    read -p "Voulez-vous exécuter npm run build ? (o/n): " do_build

    if [ "$do_build" = "o" ] || [ "$do_build" = "O" ]; then
        echo "Suppression du dossier .next existant..."
        rm -rf .next
        echo "Exécution de npm run build..."
        npm run build
    fi

    # Configuration des logs
    read -p "Voulez-vous enregistrer les logs ? (o/n): " save_logs
    
    if [ "$save_logs" = "o" ] || [ "$save_logs" = "O" ]; then
        if [ ! -d "$LOGS_DIR" ]; then
            mkdir -p "$LOGS_DIR"
        fi
        LOG_FILE="$LOGS_DIR/app-$(date +%Y%m%d-%H%M%S).log"
        echo "Les logs seront enregistrés dans: $LOG_FILE"
    else
        LOG_FILE="/dev/null"
        echo "Les logs ne seront pas enregistrés"
    fi

    echo "Démarrage de l'application sur le port $port..."
    
    nohup npm run start -- -p $port > "$LOG_FILE" 2>&1 &
    sleep 2  # Attendre que le processus next-server démarre
    port_pid=$(lsof -ti :$port)  # Récupérer le vrai PID
    echo $port_pid > "$PID_FILE"
    echo "Application démarrée avec PID: $port_pid"
    
    # Restaurer .env.local s'il a été sauvegardé
    if [ -f ".env.local.bak" ]; then
        echo "Restauration de .env.local..."
        mv .env.local.bak .env.local
    fi
}

# Fonction pour redémarrer l'application
restart_app() {
    echo "Redémarrage de l'application..."
    stop_app
    sleep 2
    start_app
}

# Gestion des commandes
case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac 