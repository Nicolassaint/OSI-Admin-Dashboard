export default function MessageFilter({ filter, setFilter }) {
  return (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="all">Tous</option>
      <option value="resolved">Résolus</option>
      <option value="pending">En attente</option>
    </select>
  );
} 