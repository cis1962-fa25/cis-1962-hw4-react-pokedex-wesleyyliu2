import type { BoxEntry, Pokemon } from '../types/types';

interface BoxCardProps {
  entry: BoxEntry;
  pokemon: Pokemon;
  onEdit: (entry: BoxEntry) => void;
  onDelete: (id: string) => void;
}

export default function BoxCard({
  entry,
  pokemon,
  onEdit,
  onDelete,
}: BoxCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const type = pokemon.types[0];

  return (
    <div
      className="box-card"
      style={{
        borderColor: type?.color || '#ddd',
        backgroundColor: type ? `${type.color}10` : '#fff',
      }}
    >
      <div className="box-card-content">
        <div className="box-sprites">
          <img src={pokemon.sprites.front_default} className="box-sprite" />
          <img src={pokemon.sprites.back_default} className="box-sprite" />
          <img src={pokemon.sprites.front_shiny} className="box-sprite" />
          <img src={pokemon.sprites.back_shiny} className="box-sprite" />
        </div>
        <div className="box-info">
          <h3>{pokemon.name}</h3>
          <div className="box-details">
            <p><strong>Level:</strong> {entry.level}</p>
            <p><strong>Location:</strong> {entry.location}</p>
            <p><strong>Caught:</strong> {formatDate(entry.createdAt)}</p>
            {entry.notes && (
              <p className="notes">
                Notes: {entry.notes}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="box-actions">
        <button onClick={() => onEdit(entry)} className="edit-button">
          Edit
        </button>
        <button onClick={() => onDelete(entry.id)} className="delete-button">
          Delete
        </button>
      </div>
    </div>
  );
}
