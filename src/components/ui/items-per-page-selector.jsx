import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_OPTIONS = [5, 10, 20, 50];

export function ItemsPerPageSelector({ 
  itemsPerPage, 
  onItemsPerPageChange, 
  options = DEFAULT_OPTIONS,
  label = "Entrées par page :",
  className = ""
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <Select 
        value={itemsPerPage.toString()} 
        onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 