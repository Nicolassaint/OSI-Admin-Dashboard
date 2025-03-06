"use client";

import * as React from "react";
import { format } from "date-fns";

export function DatePickerWithRange({
  dateRange,
  onDateRangeChange,
  className,
}) {
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value ? new Date(e.target.value) : null;
    if (onDateRangeChange) {
      onDateRangeChange({
        from: newStartDate,
        to: dateRange?.to
      });
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value ? new Date(e.target.value) : null;
    if (onDateRangeChange) {
      onDateRangeChange({
        from: dateRange?.from,
        to: newEndDate
      });
    }
  };

  // Formater les dates pour l'input HTML
  const formatDateForInput = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label htmlFor="start-date" className="text-sm whitespace-nowrap">Du:</label>
        <input
          id="start-date"
          type="date"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={formatDateForInput(dateRange?.from)}
          onChange={handleStartDateChange}
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="end-date" className="text-sm whitespace-nowrap">Au:</label>
        <input
          id="end-date"
          type="date"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={formatDateForInput(dateRange?.to)}
          onChange={handleEndDateChange}
        />
      </div>
    </div>
  );
} 