import { useRef, useCallback } from 'react';

interface RateLimiterOptions {
  maxAttempts: number;
  windowMs: number;
}

export function useRateLimiter({ maxAttempts = 5, windowMs = 60_000 }: RateLimiterOptions) {
  const attemptsRef = useRef<number[]>([]);

  const isBlocked = useCallback(() => {
    const now = Date.now();
    attemptsRef.current = attemptsRef.current.filter((t) => now - t < windowMs);
    return attemptsRef.current.length >= maxAttempts;
  }, [maxAttempts, windowMs]);

  const recordAttempt = useCallback(() => {
    attemptsRef.current.push(Date.now());
  }, []);

  const getSecondsUntilReset = useCallback(() => {
    if (attemptsRef.current.length === 0) return 0;
    const oldest = attemptsRef.current[0];
    const remaining = Math.ceil((oldest + windowMs - Date.now()) / 1000);
    return Math.max(remaining, 0);
  }, [windowMs]);

  return { isBlocked, recordAttempt, getSecondsUntilReset };
}
