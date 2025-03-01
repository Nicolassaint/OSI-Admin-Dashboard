import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

export default function MessageSort({ sortOrder, setSortOrder }) {
  return (
    <Button
      variant="outline"
      onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
      className="flex items-center gap-1 px-3 py-2 h-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {sortOrder === "desc" ? (
        <>
          <ArrowDownIcon className="h-4 w-4" />
          Plus récent
        </>
      ) : (
        <>
          <ArrowUpIcon className="h-4 w-4" />
          Plus ancien
        </>
      )}
    </Button>
  );
} 