import { useState } from 'react';
import type { BoxEntry, InsertBoxEntry, UpdateBoxEntry } from '../types/types';

interface BoxFormProps {
  pokemonId: number;
  pokemonName: string;
  initialData?: BoxEntry;
  onSubmit: (data: InsertBoxEntry | UpdateBoxEntry) => void;
  onCancel: () => void;
}

export default function BoxForm({
  pokemonId,
  pokemonName,
  initialData,
  onSubmit,
  onCancel,
}: BoxFormProps) {
  const [location, setLocation] = useState(initialData?.location || '');
  const [level, setLevel] = useState(initialData?.level?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [errors, setErrors] = useState<{ location?: string; level?: string; notes?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { location?: string; level?: string; notes?: string } = {};

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    } else if (location.trim().length > 100) {
      newErrors.location = 'Location must be 100 characters or less';
    }

    const levelNum = parseInt(level, 10);
    if (!level || levelNum < 1 || levelNum > 100) {
      newErrors.level = 'Level must be between 1 and 100';
    }

    if (notes.trim().length > 400) {
      newErrors.notes = 'Notes must be 400 characters or less';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (initialData) {
      const updateData: UpdateBoxEntry = {
        location: location.trim(),
        level: levelNum,
      };
      const trimmedNotes = notes.trim();
      if (trimmedNotes) {
        updateData.notes = trimmedNotes;
      }
      onSubmit(updateData);
    } else {
      const insertData: InsertBoxEntry = {
        pokemonId,
        location: location.trim(),
        level: levelNum,
        createdAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
      };
      onSubmit(insertData);
    }
  };

  return (
    <div className="box-form">
      <h3>{initialData ? 'Edit' : 'Add'} {pokemonName} to Box</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Location <span className="required">*</span>
            <input
              type="text"
              value={location}
              maxLength={100}
              onChange={(e) => setLocation(e.target.value)}
              className={errors.location ? 'error' : ''}
            />
          </label>
          {errors.location && <div className="field-error">{errors.location}</div>}
        </div>
        <div className="form-group">
          <label>
            Level (1-100) <span className="required">*</span>
            <input
              type="number"
              min="1"
              max="100"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={errors.level ? 'error' : ''}
            />
          </label>
          {errors.level && <div className="field-error">{errors.level}</div>}
        </div>
        <div className="form-group">
          <label>
            Notes (optional, max 400 characters)
            <textarea
              value={notes}
              maxLength={400}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={errors.notes ? 'error' : ''}
            />
            <div className="char-count">{notes.length}/400</div>
          </label>
          {errors.notes && <div className="field-error">{errors.notes}</div>}
        </div>
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            {initialData ? 'Update' : 'Add to Box'}
          </button>
        </div>
      </form>
    </div>
  );
}
