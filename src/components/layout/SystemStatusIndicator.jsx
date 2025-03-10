import { useState, useEffect } from "react";
import axios from "axios";

export default function SystemStatusIndicator() {
  const [status, setStatus] = useState("unknown");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/system-status`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
            }
          }
        );
        setStatus(response.data.status);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'état du système:", error);
        setStatus("unknown");
        setIsLoading(false);
      }
    };

    fetchSystemStatus();
    const intervalId = setInterval(fetchSystemStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "optimal":
        return "bg-green-500";
      case "normal":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${getStatusColor()} ${isLoading ? 'animate-pulse' : ''}`}></div>
      <span className="text-xs hidden sm:inline">
        {status === "unknown" ? "État inconnu" : `Système: ${status}`}
      </span>
    </div>
  );
} 