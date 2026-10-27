export interface EventLogData {
  standard: string;
  version: string;
  event: string;
  data: unknown[];
}

// A receipt can contain logs from multiple standards and event kinds.
export function parseNftMintEvents(logs: string[]): EventLogData[] {
  return logs.flatMap((log) => {
    if (!log.startsWith('EVENT_JSON:')) return [];
    try {
      const event = JSON.parse(log.slice('EVENT_JSON:'.length));
      return event?.standard === 'nep171' && event.event === 'nft_mint' && Array.isArray(event.data)
        && event.data.every((item: unknown) => {
          if (!item || typeof item !== 'object') return false;
          const data = item as Record<string, unknown>;
          return typeof data.owner_id === 'string' && Array.isArray(data.token_ids)
            && data.token_ids.every((token: unknown) => typeof token === 'string');
        })
        ? [event as EventLogData]
        : [];
    } catch {
      return [];
    }
  });
}
