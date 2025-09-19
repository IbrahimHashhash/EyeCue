import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 10,
});

export function getPrev(clientId) {
  return cache.get(clientId) ?? null;
}

export function setPrev(clientId, data) {
  cache.set(clientId, data);
}
