import type {
  BoxEntry,
  InsertBoxEntry,
  Pokemon,
  UpdateBoxEntry,
} from '../types/types';

const BASE_URL = 'https://hw4.cis1962.esinx.net/api/';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJwZW5ua2V5Ijoid2VzbGl1IiwiaWF0IjoxNzU5MDk4MjE4LCJpc3MiOiJlZHU6dXBlbm46c2VhczpjaXMxOTYyIiwiYXVkIjoiZWR1OnVwZW5uOnNlYXM6Y2lzMTk2MiIsImV4cCI6MTc2NDI4MjIxOH0.xgi7EptTR8tWZwLTrjpW5DK6iuo1wO_lNsmU7ztOoLg';

class PokemonAPI {
  #baseUrl: string;
  #token: string;

  constructor(baseUrl: string = BASE_URL, token: string = JWT_TOKEN) {
    this.#baseUrl = baseUrl;
    this.#token = token;
  }

  private async handleResponseErrors<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Error occurred';

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401) {
        errorMessage = 'Invalid/missing authentication token';
      } else if (response.status === 404) {
        errorMessage = 'Entry does not exist';
      } else if (response.status === 400) {
        errorMessage = errorMessage || 'Invalid request';
      } else if (response.status === 500) {
        errorMessage = 'Internal server error.';
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  async getPokemon(limit: number, offset: number): Promise<Pokemon[]> {
    const url = `${this.#baseUrl}pokemon/?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
    try {
      const response = await fetch(url);
      return this.handleResponseErrors<Pokemon[]>(response);
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to fetch Pokemon');
    }
  }

  async getPokemonByName(name: string): Promise<Pokemon> {
    const url = `${this.#baseUrl}pokemon/${encodeURIComponent(name)}`;
    try {
      const response = await fetch(url);
      return this.handleResponseErrors<Pokemon>(response);
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to fetch Pokemon.');
    }
  }

  async getBoxEntryIds(): Promise<string[]> {
    const url = `${this.#baseUrl}box/`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.#token}`,
        },
      });
      return this.handleResponseErrors<string[]>(response);
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to fetch Box entries');
    }
  }

  async createBoxEntry(entry: InsertBoxEntry): Promise<BoxEntry> {
    const url = `${this.#baseUrl}box/`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.#token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      return this.handleResponseErrors<BoxEntry>(response);
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to create Box entry');
    }
  }

  async getBoxEntry(id: string): Promise<BoxEntry> {
    const url = `${this.#baseUrl}box/${encodeURIComponent(id)}`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.#token}`,
          'Content-Type': 'application/json',
        },
      });
      return this.handleResponseErrors<BoxEntry>(response);
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to fetch Box entry');
    }
  }

  async updateBoxEntry(id: string, entry: UpdateBoxEntry): Promise<BoxEntry> {
    const url = `${this.#baseUrl}box/${encodeURIComponent(id)}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.#token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      return this.handleResponseErrors<BoxEntry>(response);
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to update Box entry');
    }
  }

  async deleteBoxEntry(id: string): Promise<void> {
    const url = `${this.#baseUrl}box/${encodeURIComponent(id)}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.#token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete Box entry';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to delete Box entry');
    }
  }
}

export const pokemonAPI = new PokemonAPI();
