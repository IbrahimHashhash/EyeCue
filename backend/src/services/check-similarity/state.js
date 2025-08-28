import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 100,              // number of entries
  ttl: 1000 * 60 * 10,   // 10 minutes
});

export function getPrev(clientId) {
  return cache.get(clientId) ?? null;
}

export function setPrev(clientId, data /* { chip, rect, timestamp } */) {
  cache.set(clientId, data);
}
