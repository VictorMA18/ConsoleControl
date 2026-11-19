import { FakeRemoteStore } from '../../src/sync/fakeRemoteStore';
import { retryDelayMs, runSync, type SyncSource } from '../../src/sync/syncEngine';
import type { SyncedRef, SyncRecord, SyncTable } from '../../src/sync/types';

// Base local simulada: registros con su sync_status, como en SQLite.
function localDb(rows: Partial<Record<SyncTable, SyncRecord[]>>) {
  const data = new Map<SyncTable, (SyncRecord & { sync_status: string })[]>();
  for (const [table, records] of Object.entries(rows) as [SyncTable, SyncRecord[]][]) {
    data.set(
      table,
      records.map((r) => ({ ...r, sync_status: 'pendiente' })),
    );
  }
  const source: SyncSource = {
    async listPending(table) {
      return (data.get(table) ?? [])
        .filter((r) => r.sync_status === 'pendiente')
        .sort((a, b) => a.updated_at - b.updated_at);
    },
    async markSynced(table, refs: readonly SyncedRef[]) {
      for (const ref of refs) {
        const row = data.get(table)?.find((r) => r.id === ref.id && r.updated_at === ref.updatedAt);
        if (row) {
          row.sync_status = 'sincronizado';
        }
      }
    },
  };
  const statusOf = (table: SyncTable, id: string) =>
    data.get(table)?.find((r) => r.id === id)?.sync_status;
  return { source, statusOf };
}

const payment = (id: string, updatedAt: number): SyncRecord => ({
  id,
  updated_at: updatedAt,
  amount_cents: 500,
});

describe('HU-008 · motor de sincronización', () => {
  it('con conexión envía en orden cronológico y marca sincronizado', async () => {
    const { source, statusOf } = localDb({
      payments: [payment('p3', 300), payment('p1', 100), payment('p2', 200)],
    });
    const remote = new FakeRemoteStore();

    const result = await runSync(source, remote, { batchSize: 2 });

    expect(result).toEqual({ ok: true, sent: 3 });
    expect(remote.calls.map((c) => c.ids)).toEqual([['p1', 'p2'], ['p3']]);
    expect(['p1', 'p2', 'p3'].map((id) => statusOf('payments', id))).toEqual([
      'sincronizado',
      'sincronizado',
      'sincronizado',
    ]);
  });

  it('si se corta a mitad, lo no confirmado sigue pendiente y reintentar no duplica', async () => {
    const { source, statusOf } = localDb({
      payments: [payment('p1', 100), payment('p2', 200), payment('p3', 300)],
    });
    const remote = new FakeRemoteStore();
    remote.failAfterBatches = 1;

    const first = await runSync(source, remote, { batchSize: 2 });

    expect(first).toMatchObject({ ok: false, sent: 2, table: 'payments' });
    expect(statusOf('payments', 'p3')).toBe('pendiente');

    remote.failAfterBatches = null;
    const retry = await runSync(source, remote, { batchSize: 2 });

    expect(retry).toEqual({ ok: true, sent: 1 });
    expect(remote.count('payments')).toBe(3);
    expect(statusOf('payments', 'p3')).toBe('sincronizado');
  });

  it('sin conexión no lanza errores ni marca nada como sincronizado', async () => {
    const { source, statusOf } = localDb({ sessions: [{ id: 's1', updated_at: 100 }] });
    const remote = new FakeRemoteStore();
    remote.online = false;

    await expect(runSync(source, remote)).resolves.toMatchObject({ ok: false, sent: 0 });
    expect(statusOf('sessions', 's1')).toBe('pendiente');
    expect(remote.count('sessions')).toBe(0);
  });

  it('reintenta a los 5 s, 15 s y luego cada 60 s', () => {
    expect([1, 2, 3, 4, 10].map(retryDelayMs)).toEqual([5_000, 15_000, 60_000, 60_000, 60_000]);
  });
});
