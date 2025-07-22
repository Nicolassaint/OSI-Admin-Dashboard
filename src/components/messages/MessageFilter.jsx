export default function MessageFilter({ filter, setFilter }) {
  return (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="all">Tous</option>
      <option value="resolu">Résolus</option>
      <option value="en_attente">En attente</option>
      <option value="en_attente_negatif">En attente + négatifs</option>
      <option value="archive">Archivés</option>
    </select>
  );
} 