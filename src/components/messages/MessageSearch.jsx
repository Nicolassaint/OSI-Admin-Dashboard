import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function MessageSearch({ searchTerm, setSearchTerm }) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
} 