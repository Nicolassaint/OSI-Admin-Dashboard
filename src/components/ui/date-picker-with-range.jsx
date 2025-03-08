"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// Importations MUI
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

// Configuration de dayjs
dayjs.locale('fr');

export function DatePickerWithRange({
  dateRange,
  onDateRangeChange,
  className,
  singleDay = false,
  timeRange = "daily"
}) {
  // Convertir les dates en objets dayjs
  const convertToDayjs = (date) => date ? dayjs(date) : null;
  const convertFromDayjs = (dayjsDate) => dayjsDate ? dayjsDate.toDate() : null;

  const [date, setDate] = React.useState({
    start: convertToDayjs(dateRange?.from) || null,
    end: convertToDayjs(dateRange?.to) || null
  });
  const [open, setOpen] = React.useState(false);
  const [selectionStep, setSelectionStep] = React.useState(0); // 0: aucune sélection, 1: début sélectionné

  // Déterminer le mode d'affichage et si c'est un jour unique
  const isMonthView = timeRange === "monthly" || timeRange === "yearly" || timeRange === "all_time";
  const isWeekView = timeRange === "weekly";
  const effectiveSingleDay = singleDay || timeRange === "hourly";

  // Mettre à jour l'état local lorsque dateRange change
  React.useEffect(() => {
    if (dateRange?.from) {
      setDate({
        start: convertToDayjs(dateRange.from),
        end: effectiveSingleDay ? convertToDayjs(dateRange.from) : convertToDayjs(dateRange.to)
      });
    }
  }, [dateRange, effectiveSingleDay]);

  // Fonction générique pour gérer le changement de date
  const handleDateChange = (newValue) => {
    if (effectiveSingleDay) {
      // Mode jour unique
      setDate({ start: newValue, end: newValue });
      onDateRangeChange({ 
        from: convertFromDayjs(newValue), 
        to: convertFromDayjs(newValue) 
      });
      setTimeout(() => setOpen(false), 300);
      return;
    }

    if (selectionStep === 0) {
      // Première sélection (date de début)
      setDate({ start: newValue, end: null });
      setSelectionStep(1);
    } else {
      // Deuxième sélection (date de fin)
      let start, end;
      
      if (newValue.isBefore(date.start)) {
        // Si la date sélectionnée est avant la date de début, on inverse
        start = newValue;
        end = date.start;
      } else {
        start = date.start;
        end = newValue;
      }
      
      // Ajuster selon le mode de vue
      if (isMonthView) {
        start = start.startOf('month');
        end = end.endOf('month');
      } else if (isWeekView) {
        start = start.startOf('week');
        end = end.endOf('week');
      }
      
      setDate({ start, end });
      onDateRangeChange({
        from: convertFromDayjs(start),
        to: convertFromDayjs(end)
      });
      setSelectionStep(0);
      setTimeout(() => setOpen(false), 300);
    }
  };

  // Réinitialiser la sélection
  const resetSelection = () => {
    setSelectionStep(0);
    setDate({ start: null, end: null });
  };

  // Formater l'affichage de la date
  const formatDateDisplay = () => {
    if (!date.start) return "Sélectionner une date";
    
    const formatDate = (dayjsDate) => {
      if (!dayjsDate) return "";
      
      if (isMonthView) {
        return format(dayjsDate.toDate(), "MMMM yyyy", { locale: fr });
      } else if (isWeekView) {
        const startOfWeek = format(dayjsDate.startOf('week').toDate(), "dd MMM", { locale: fr });
        const endOfWeek = format(dayjsDate.endOf('week').toDate(), "dd MMM yyyy", { locale: fr });
        return `${startOfWeek} - ${endOfWeek}`;
      } else {
        return format(dayjsDate.toDate(), "PPP", { locale: fr });
      }
    };
    
    if (effectiveSingleDay) {
      return formatDate(date.start);
    }
    
    if (date.start && date.end) {
      if (isMonthView) {
        return `${format(date.start.toDate(), "MMMM yyyy", { locale: fr })} - ${format(date.end.toDate(), "MMMM yyyy", { locale: fr })}`;
      } else if (isWeekView) {
        return `${format(date.start.toDate(), "dd MMM yyyy", { locale: fr })} - ${format(date.end.toDate(), "dd MMM yyyy", { locale: fr })}`;
      } else {
        return `${formatDate(date.start)} - ${formatDate(date.end)}`;
      }
    }
    
    return formatDate(date.start);
  };

  // Appliquer la sélection actuelle
  const applyCurrentSelection = () => {
    if (date.start && selectionStep === 1) {
      let end;
      
      if (isMonthView) {
        end = date.start.endOf('month');
      } else if (isWeekView) {
        end = date.start.endOf('week');
      } else {
        end = date.start;
      }
      
      setDate({ start: date.start, end });
      onDateRangeChange({
        from: convertFromDayjs(date.start),
        to: convertFromDayjs(end)
      });
    }
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setSelectionStep(0);
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date.start && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{formatDateDisplay()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 bg-card border border-border shadow-lg rounded-lg">
          <div className="mb-3 border-b border-border pb-2">
            <h3 className="font-medium text-center">
              {effectiveSingleDay ? "Sélectionner un jour" : 
                selectionStep === 0 ? `Sélectionner la ${isMonthView ? "date" : isWeekView ? "semaine" : "date"} de début` : 
                `Sélectionner la ${isMonthView ? "date" : isWeekView ? "semaine" : "date"} de fin`}
            </h3>
          </div>
          
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
            {effectiveSingleDay ? (
              <DatePicker
                label="Date"
                value={date.start}
                onChange={(newValue) => handleDateChange(newValue)}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    size: 'small'
                  }
                }}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {date.start && (
                    <div className="text-sm">
                      <span className="font-medium">Début:</span> {
                        isMonthView ? format(date.start.toDate(), "MMMM yyyy", { locale: fr }) :
                        isWeekView ? `Semaine du ${format(date.start.toDate(), "dd MMM yyyy", { locale: fr })}` :
                        format(date.start.toDate(), "PPP", { locale: fr })
                      }
                    </div>
                  )}
                  {date.end && (
                    <div className="text-sm ml-4">
                      <span className="font-medium">Fin:</span> {
                        isMonthView ? format(date.end.toDate(), "MMMM yyyy", { locale: fr }) :
                        isWeekView ? `Semaine du ${format(date.end.toDate(), "dd MMM yyyy", { locale: fr })}` :
                        format(date.end.toDate(), "PPP", { locale: fr })
                      }
                    </div>
                  )}
                </div>
                
                <DateCalendar
                  value={selectionStep === 0 ? date.start : date.end}
                  onChange={(newValue) => handleDateChange(newValue)}
                  maxDate={dayjs()}
                  views={isMonthView ? ['month', 'year'] : ['day', 'month', 'year']}
                  openTo={isMonthView ? 'month' : 'day'}
                  disableHighlightToday={isMonthView}
                  showDaysOutsideCurrentMonth={isWeekView}
                  displayWeekNumber={isWeekView}
                />
              </div>
            )}
          </LocalizationProvider>
          
          {!effectiveSingleDay && (
            <div className="mt-3 border-t border-border pt-3 flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  resetSelection();
                  setOpen(false);
                }}
              >
                Annuler
              </Button>
              <Button 
                size="sm"
                onClick={applyCurrentSelection}
                disabled={!date.start}
              >
                {date.start && date.end ? "Appliquer" : "Sélectionner comme " + 
                  (isMonthView ? "mois unique" : isWeekView ? "semaine unique" : "jour unique")}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
} 