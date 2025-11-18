import type { Pokemon } from '../types/types';
import PokemonCard from './PokemonCard';

interface PokemonListProps {
  pokemon: Pokemon[];
  onPokemonClick: (pokemon: Pokemon) => void;
  currentPage: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  hasNextPage: boolean;
  loading?: boolean;
  loadingDetails?: boolean;
}

export default function PokemonList({
  pokemon,
  onPokemonClick,
  currentPage,
  onPreviousPage,
  onNextPage,
  hasNextPage,
  loading = false,
  loadingDetails = false,
}: PokemonListProps) {
  if (loading && pokemon.length === 0) {
    return <div className="loading">Loading Pokemon</div>;
  }

  return (
    <div className={loadingDetails ? 'loading-overlay-active' : ''}>
      <div className="pokemon-grid">
        {pokemon.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            onClick={() => onPokemonClick(p)}
            disabled={loadingDetails}
          />
        ))}
      </div>
      <div className="pagination">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1 || loading || loadingDetails}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="page-info">Page {currentPage}</span>
        <button
          onClick={onNextPage}
          disabled={!hasNextPage || loading || loadingDetails}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
