export default function MessageEvaluationFilter({ evaluationFilter, setEvaluationFilter }) {
  return (
    <select
      value={evaluationFilter}
      onChange={(e) => setEvaluationFilter(e.target.value)}
      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="all">Tous les avis</option>
      <option value="positive">Avis positifs</option>
      <option value="negative">Avis négatifs</option>
      <option value="no-feedback">Sans avis</option>
    </select>
  );
}