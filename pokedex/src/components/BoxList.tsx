import type { BoxEntry, Pokemon } from '../types/types';
import BoxCard from './BoxCard';

interface BoxListProps {
  entries: BoxEntry[];
  pokemonMap: Map<number, Pokemon>;
  onEdit: (entry: BoxEntry) => void;
  onDelete: (id: string) => void;
}

export default function BoxList({
  entries,
  pokemonMap,
  onEdit,
  onDelete,
}: BoxListProps) {
  if (entries.length === 0) {
    return (
      <div>
        <h2>My Box</h2>
        <p>No Pokemon caught.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>My Box</h2>
      <div>
        {entries.map((entry) => {
          const pokemon = pokemonMap.get(entry.pokemonId);
          if (!pokemon) {
            return (
              <div key={entry.id}>
                <p>Loading Pokemon data</p>
              </div>
            );
          }
          return (
            <BoxCard
              key={entry.id}
              entry={entry}
              pokemon={pokemon}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </div>
  );
}
