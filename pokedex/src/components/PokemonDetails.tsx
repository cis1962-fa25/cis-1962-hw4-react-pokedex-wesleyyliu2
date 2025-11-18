import type { Pokemon } from '../types/types';

interface PokemonDetailsProps {
  pokemon: Pokemon;
  onClose: () => void;
  onCatch: (pokemon: Pokemon) => void;
}

export default function PokemonDetails({
  pokemon,
  onClose,
  onCatch,
}: PokemonDetailsProps) {
  const type = pokemon.types[0];

  return (
    <div className="pokemon-details">
      <button onClick={onClose} className="close-button">×</button>
      <div className="details-header" style={{ borderColor: type?.color }}>
        <h2>{pokemon.name}</h2>
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
      <p className="description">{pokemon.description}</p>
      <div className="sprites">
        <div>
          <p>Front</p>
          <img src={pokemon.sprites.front_default} />
        </div>
        <div>
          <p>Back</p>
          <img src={pokemon.sprites.back_default} />
        </div>
        <div>
          <p>Front Shiny</p>
          <img src={pokemon.sprites.front_shiny} />
        </div>
        <div>
          <p>Back Shiny</p>
          <img src={pokemon.sprites.back_shiny} />
        </div>
      </div>
      <div className="stats-section">
        <h3>Stats</h3>
        <div className="stats-grid">
          <div>HP: {pokemon.stats.hp}</div>
          <div>Attack: {pokemon.stats.attack}</div>
          <div>Defense: {pokemon.stats.defense}</div>
          <div>Sp. Atk: {pokemon.stats.specialAttack}</div>
          <div>Sp. Def: {pokemon.stats.specialDefense}</div>
          <div>Speed: {pokemon.stats.speed}</div>
        </div>
      </div>
      <div className="moves-section">
        <h3>Moves</h3>
        <div className="moves-list">
          {pokemon.moves.map((move) => (
            <div key={move.name} className="move-item">
              <strong>{move.name}</strong>
              {move.power && <span className="power">({move.power} power)</span>}
              <span className="move-type" style={{ backgroundColor: move.type.color }}>
                {move.type.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => onCatch(pokemon)} className="catch-button">
        Add to Box
      </button>
    </div>
  );
}
