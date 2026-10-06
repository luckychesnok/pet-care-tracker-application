import { useEffect, useState, type FormEvent } from 'react';
import { Scissors, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { usePetCare } from '@/lib/petcare/store';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type RecordId = string | number;

export interface GroomingRecord {
  id: RecordId;
  pet_id: RecordId;
  title: string;
  event_date: string; // 'YYYY-MM-DD'
  notes: string | null;
  created_at: string; // ISO timestamp
}

export interface GroomingDraft {
  title: string;
  event_date: string;
  notes: string;
}

/* -------------------------------------------------------------------------- */
/* Pure helpers                                                               */
/* -------------------------------------------------------------------------- */

export const GROOMING_TYPES = [
  'Nail trimming',
  'Coat brushing',
  'Ear cleaning',
  'Bath & Shampoo',
] as const;

export const DEFAULT_TITLE = 'Nail trimming';
export const NOTES_MAX = 1000;

export const todayLocal = (now: Date = new Date()): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const validateDraft = (draft: GroomingDraft): string | null => {
  if (!draft.title.trim()) return 'Please select a procedure';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.event_date)) return 'Please specify a valid date';
  if (draft.notes.length > NOTES_MAX) return `Notes exceed ${NOTES_MAX} characters`;
  return null;
};

export const sortRecords = (rows: GroomingRecord[]): GroomingRecord[] =>
  [...rows].sort(
    (a, b) =>
      b.event_date.localeCompare(a.event_date) || b.created_at.localeCompare(a.created_at),
  );

export const formatDate = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const normalizeNotes = (notes: string): string | null => notes.trim() || null;

const toMessage = (e: unknown): string =>
  e instanceof Error
    ? e.message
    : typeof e === 'object' && e !== null && 'message' in e
      ? String((e as { message: unknown }).message)
      : 'Unknown error';

/* -------------------------------------------------------------------------- */
/* Data layer                                                                 */
/* -------------------------------------------------------------------------- */

export interface GroomingRepo {
  list(petId: RecordId): Promise<GroomingRecord[]>;
  create(petId: RecordId, draft: GroomingDraft): Promise<GroomingRecord>;
  update(id: RecordId, draft: GroomingDraft): Promise<GroomingRecord>;
  remove(id: RecordId): Promise<void>;
}

const TABLE = 'grooming_records';

export const createGroomingRepo = (client: SupabaseClient): GroomingRepo => ({
  async list(petId) {
    const { data, error } = await client
      .from(TABLE)
      .select('*')
      .eq('pet_id', petId)
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as GroomingRecord[];
  },

  async create(petId, draft) {
    const { data, error } = await client
      .from(TABLE)
      .insert({
        pet_id: petId,
        title: draft.title,
        event_date: draft.event_date,
        notes: normalizeNotes(draft.notes),
      })
      .select()
      .single();
    if (error) throw error;
    return data as GroomingRecord;
  },

  async update(id, draft) {
    const { data, error } = await client
      .from(TABLE)
      .update({ title: draft.title, event_date: draft.event_date, notes: normalizeNotes(draft.notes) })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as GroomingRecord;
  },

  async remove(id) {
    const { data, error } = await client.from(TABLE).delete().eq('id', id).select('id');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Record not found or access denied');
  },
});

const defaultRepo = createGroomingRepo(supabase);

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

interface GroomingProps {
  petId?: RecordId | null;
  repo?: GroomingRepo;
}

const emptyDraft = (): GroomingDraft => ({ title: DEFAULT_TITLE, event_date: todayLocal(), notes: '' });

const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
  'focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30';

export function GroomingPanel({ petId: propPetId, repo = defaultRepo }: GroomingProps) {
  const { pet } = usePetCare();
  const petId = propPetId !== undefined ? propPetId : pet?.id;

  const [records, setRecords] = useState<GroomingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<GroomingDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<RecordId | null>(null);
  const [editDraft, setEditDraft] = useState<GroomingDraft>(emptyDraft);
  const [busyId, setBusyId] = useState<RecordId | null>(null);

  useEffect(() => {
    setRecords([]);
    setEditingId(null);
    setError(null);
    setLoading(petId != null);
    if (petId == null) return;

    let cancelled = false;
    repo
      .list(petId)
      .then((rows) => !cancelled && setRecords(rows))
      .catch((e) => !cancelled && setError(toMessage(e)))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [petId, repo]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (petId == null || submitting) return;
    const invalid = validateDraft(draft);
    if (invalid) return setError(invalid);

    setSubmitting(true);
    setError(null);
    try {
      const created = await repo.create(petId, draft);
      setRecords((prev) => sortRecords([created, ...prev]));
      setDraft(emptyDraft());
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (r: GroomingRecord) => {
    setEditingId(r.id);
    setEditDraft({ title: r.title, event_date: r.event_date, notes: r.notes ?? '' });
    setError(null);
  };

  const handleUpdate = async (id: RecordId) => {
    const invalid = validateDraft(editDraft);
    if (invalid) return setError(invalid);

    setBusyId(id);
    setError(null);
    try {
      const updated = await repo.update(id, editDraft);
      setRecords((prev) => sortRecords(prev.map((r) => (r.id === id ? updated : r))));
      setEditingId(null);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: RecordId) => {
    if (!window.confirm('Delete this record?')) return;
    setBusyId(id);
    setError(null);
    try {
      await repo.remove(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (petId == null) {
    return <p className="text-sm text-slate-500">Please select a pet to view grooming records.</p>;
  }

  return (
    <section className="space-y-6" aria-labelledby="grooming-heading">
      <h2 id="grooming-heading" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Scissors className="h-5 w-5 text-sky-500" aria-hidden />
        Grooming & Hygiene
      </h2>

      {/* Add form */}
      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[10rem_11rem_1fr_auto] sm:items-end"
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Procedure</span>
          <select
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className={inputCls}
          >
            {GROOMING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Date</span>
          <input
            type="date"
            required
            value={draft.event_date}
            onChange={(e) => setDraft({ ...draft, event_date: e.target.value })}
            className={inputCls}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Notes</span>
          <input
            type="text"
            maxLength={NOTES_MAX}
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            placeholder="e.g., trimmed front and back paws"
            className={inputCls}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Add Record
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {/* List */}
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading…
        </p>
      ) : records.length === 0 ? (
        <p className="text-sm text-slate-500">No records yet. Add the first one above.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {records.map((r) => {
            const isEditing = editingId === r.id;
            const isBusy = busyId === r.id;

            return (
              <li key={r.id} className="p-4">
                {isEditing ? (
                  <div className="grid gap-3 sm:grid-cols-[10rem_11rem_1fr_auto] sm:items-end">
                    <select
                      aria-label="Procedure"
                      value={editDraft.title}
                      onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                      className={inputCls}
                    >
                      {GROOMING_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      required
                      aria-label="Date"
                      value={editDraft.event_date}
                      onChange={(e) => setEditDraft({ ...editDraft, event_date: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="text"
                      maxLength={NOTES_MAX}
                      aria-label="Notes"
                      value={editDraft.notes}
                      onChange={(e) => setEditDraft({ ...editDraft, notes: e.target.value })}
                      className={inputCls}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(r.id)}
                        disabled={isBusy}
                        aria-label="Save changes"
                        className="rounded-md bg-sky-500 p-2 text-white hover:bg-sky-600 disabled:opacity-60"
                      >
                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={isBusy}
                        aria-label="Cancel editing"
                        className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {r.title} · {formatDate(r.event_date)}
                      </p>
                      {r.notes && <p className="mt-1 break-words text-sm text-slate-600">{r.notes}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        disabled={isBusy}
                        aria-label="Edit record"
                        className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={isBusy}
                        aria-label="Delete record"
                        className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}