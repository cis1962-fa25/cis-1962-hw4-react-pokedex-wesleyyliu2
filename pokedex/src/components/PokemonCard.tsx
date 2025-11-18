import type { Pokemon } from '../types/types';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick: () => void;
  disabled?: boolean;
}

export default function PokemonCard({ pokemon, onClick, disabled = false }: PokemonCardProps) {
  const primaryType = pokemon.types[0];
  
  return (
    <div
      className={`pokemon-card ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      style={{
        backgroundColor: primaryType ? `${primaryType.color}20` : '#f5f5f5',
        borderColor: primaryType?.color || '#ddd',
      }}
    >
      <div className="pokemon-sprites">
        <img src={pokemon.sprites.front_default} className="pokemon-sprite" />
        <img src={pokemon.sprites.back_default} className="pokemon-sprite" />
      </div>
      <h3>{pokemon.name}</h3>
      <div className="pokemon-types">
        {pokemon.types.map((type) => (
          <span
            key={type.name}
            className="type-badge"
            style={{ backgroundColor: type.color }}
          >
            {type.name}
          </span>
        ))}
      </div>
    </div>
  );
}
