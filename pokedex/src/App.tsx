import { useEffect, useState } from 'react';
import { pokemonAPI } from './api/PokemonAPI';
import type { BoxEntry, InsertBoxEntry, Pokemon, UpdateBoxEntry } from './types/types';
import PokemonList from './components/PokemonList';
import PokemonDetails from './components/PokemonDetails';
import BoxList from './components/BoxList';
import BoxForm from './components/BoxForm';
import Modal from './components/Modal';
import ConfirmDialog from './components/ConfirmDialog';
import './App.css';

const PAGE_SIZE = 10;
const MAX_POKEMON_ID = 874;

function App() {
  const [view, setView] = useState<'pokemon' | 'box'>('pokemon');
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [boxEntries, setBoxEntries] = useState<BoxEntry[]>([]);
  const [pokemonMap, setPokemonMap] = useState<Map<number, Pokemon>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [loadingBox, setLoadingBox] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pokemonDetails, setPokemonDetails] = useState<Pokemon | null>(null);
  const [pokemonToCatch, setPokemonToCatch] = useState<Pokemon | null>(null);
  const [editingBoxEntry, setEditingBoxEntry] = useState<BoxEntry | null>(null);
  const [creatingBoxEntry, setCreatingBoxEntry] = useState<boolean>(false);
  const [updatingBoxEntry, setUpdatingBoxEntry] = useState<boolean>(false);
  const [boxRefreshTrigger, setBoxRefreshTrigger] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const addPokemonToMap = (pokemonList: Pokemon[]) => {
    setPokemonMap((prev) => {
      const newMap = new Map(prev);
      pokemonList.forEach((p) => newMap.set(p.id, p));
      return newMap;
    });
  };

  useEffect(() => {
    const fetchPokemon = async () => {
      setLoading(true);
      setError(null);
      try {
        const offset = (currentPage - 1) * PAGE_SIZE;
        if (offset >= MAX_POKEMON_ID) {
          setPokemon([]);
          return;
        }
        const limit = Math.min(PAGE_SIZE, MAX_POKEMON_ID - offset);
        const data = await pokemonAPI.getPokemon(limit, offset);
        setPokemon(data);
        // Some clarification: we only add pokemon to map
        // as we open page by page. If we open box with
        // pokemon not in here, it will be lazily fetched
        // through the next useEffect
        addPokemonToMap(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
      } finally {
        setLoading(false);
      }
    };
    if (view === 'pokemon') {
      fetchPokemon();
    }
  }, [currentPage, view]);

  useEffect(() => {
    const fetchBoxEntries = async () => {
      if (view !== 'box') return;

      setLoadingBox(true);
      setError(null);
      try {
        const entryIds = await pokemonAPI.getBoxEntryIds();
        const entries = await Promise.all(
          entryIds.map((id) => pokemonAPI.getBoxEntry(id))
        );

        setBoxEntries(entries);

        const pokemonToFetch = new Set<number>();
        entries.forEach((entry) => {
          if (!pokemonMap.has(entry.pokemonId)) {
            pokemonToFetch.add(entry.pokemonId);
          }
        });

        if (pokemonToFetch.size > 0) {
          const pokemonFetchPromises: Promise<Pokemon[]>[] = [];
          
          for (const pokemonId of pokemonToFetch) {
            pokemonFetchPromises.push(
              pokemonAPI.getPokemon(1, pokemonId - 1)
            );
          }
          
          const fetchedBatches = await Promise.all(pokemonFetchPromises);
          const fetchedPokemon = fetchedBatches.flat();
          addPokemonToMap(fetchedPokemon);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Box entries');
      }
      setLoadingBox(false);
    };
    fetchBoxEntries();
    // Need to disable linting here to prevent infinite loop when adding pokemon to map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, boxRefreshTrigger]);

  const handlePokemonClick = async (pokemon: Pokemon) => {
    try {
      setLoadingDetails(true);
      const details = await pokemonAPI.getPokemonByName(pokemon.name);
      setPokemonDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const nextOffset = currentPage * PAGE_SIZE;
    if (nextOffset < MAX_POKEMON_ID) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleCloseModal = () => {
    setPokemonDetails(null);
  };

  const handleCatch = (pokemon: Pokemon) => {
    setPokemonToCatch(pokemon);
  };

  const handleBoxFormCancel = () => {
    setPokemonToCatch(null);
    setEditingBoxEntry(null);
  };

  const handleBoxFormSubmit = async (data: InsertBoxEntry | UpdateBoxEntry) => {
    if (editingBoxEntry) {
      setUpdatingBoxEntry(true);
      setError(null);
      try {
        const updateData = data as UpdateBoxEntry;
        await pokemonAPI.updateBoxEntry(editingBoxEntry.id, updateData);
        setEditingBoxEntry(null);
        setBoxRefreshTrigger((prev) => !prev);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update Box entry');
        console.error('Update error:', err);
      }
      setUpdatingBoxEntry(false);
    } else if (pokemonToCatch) {
      setCreatingBoxEntry(true);
      setError(null);
      try {
        const insertData = data as InsertBoxEntry;
        await pokemonAPI.createBoxEntry(insertData);
        setPokemonToCatch(null);
        setPokemonDetails(null);
        setBoxRefreshTrigger((prev) => !prev);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create Box entry');
        console.error('Create error:', err);
      }
      setCreatingBoxEntry(false);
    }
  };

  const handleEditBoxEntry = (entry: BoxEntry) => {
    setEditingBoxEntry(entry);
  };

  const handleDeleteBoxEntry = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    setError(null);
    try {
      await pokemonAPI.deleteBoxEntry(deleteConfirmId);
      setDeleteConfirmId(null);
      setBoxRefreshTrigger((prev) => !prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete Box entry');
      console.error('Delete error:', err);
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (loading && pokemon.length === 0 && view === 'pokemon') {
    return (
      <div className="app">
        <h1>Pokedex</h1>
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading Pokemon...</p>
        </div>
      </div>
    );
  }

  if (error && pokemon.length === 0 && view === 'pokemon') {
    return (
      <div className="app">
        <h1>Pokedex</h1>
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Pokedex</h1>
      <div className="view-switcher">
        <button
          onClick={() => setView('pokemon')}
          className={view === 'pokemon' ? 'active' : ''}
          disabled={loading || loadingBox || loadingDetails}
        >
          All Pokemon
        </button>
        <button
          onClick={() => setView('box')}
          className={view === 'box' ? 'active' : ''}
          disabled={loading || loadingBox || loadingDetails}
        >
          My Box
        </button>
      </div>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {view === 'pokemon' ? (
        <PokemonList
          pokemon={pokemon}
          onPokemonClick={handlePokemonClick}
          currentPage={currentPage}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          hasNextPage={currentPage * PAGE_SIZE < MAX_POKEMON_ID}
          loading={loading}
          loadingDetails={loadingDetails}
        />
      ) : (
        <BoxList
          entries={boxEntries}
          pokemonMap={pokemonMap}
          onEdit={handleEditBoxEntry}
          onDelete={handleDeleteBoxEntry}
        />
      )}
      {loadingBox && view === 'box' && (
        <div className="loading">Loading Box...</div>
      )}
      <Modal isOpen={(pokemonDetails !== null || loadingDetails) && pokemonToCatch === null && editingBoxEntry === null} onClose={handleCloseModal}>
        {loadingDetails ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading Pokemon details...</p>
          </div>
        ) : pokemonDetails ? (
          <PokemonDetails
            pokemon={pokemonDetails}
            onClose={handleCloseModal}
            onCatch={handleCatch}
          />
        ) : null}
      </Modal>
      <Modal isOpen={pokemonToCatch !== null || editingBoxEntry !== null} onClose={handleBoxFormCancel}>
        {pokemonToCatch && (
          <>
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
            {creatingBoxEntry ? (
              <div>Creating Box entry...</div>
            ) : (
              <BoxForm
                pokemonId={pokemonToCatch.id}
                pokemonName={pokemonToCatch.name}
                onSubmit={handleBoxFormSubmit}
                onCancel={handleBoxFormCancel}
              />
            )}
          </>
        )}
        {editingBoxEntry && (
          <>
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
            {updatingBoxEntry ? (
              <div>Updating Box entry...</div>
            ) : (
              <BoxForm
                pokemonId={editingBoxEntry.pokemonId}
                pokemonName={pokemonMap.get(editingBoxEntry.pokemonId)?.name || 'Unknown'}
                initialData={editingBoxEntry}
                onSubmit={handleBoxFormSubmit}
                onCancel={handleBoxFormCancel}
              />
            )}
          </>
        )}
      </Modal>
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Delete Box Entry"
        message="Are you sure you want to delete this Pokemon from your Box?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default App;
