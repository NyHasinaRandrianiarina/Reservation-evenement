/**
 * Simulates an async API fetch with a realistic delay.
 * Returns a deep clone of the data to prevent mutation.
 */
export function simulateFetch<T>(data: T, delayMs = 600): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(data)), delayMs)
  );
}

/**
 * Simulates an async API fetch that can randomly fail.
 * Useful for testing error states in the UI.
 */
export function simulateFetchFallible<T>(
  data: T,
  { delayMs = 600, failRate = 0 } = {}
): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() < failRate) reject(new Error('Simulated network error'));
      else resolve(structuredClone(data));
    }, delayMs)
  );
}
