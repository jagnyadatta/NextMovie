import { useState, useEffect } from 'react';

/**
 * Custom React hook that debounces a fast-changing value.
 * Delays updating the returned value until after the specified delay
 * in milliseconds has elapsed since the last time the input value changed.
 *
 * Whenever the input value changes before the delay elapses, the previous
 * timeout is cleared and a new one is set.
 *
 * @template T
 * @param {T} value - The input value to debounce (e.g. search keyword).
 * @param {number} delay - Debounce delay in milliseconds (default: 450ms).
 * @returns {T} - The debounced value.
 */
export const useDebounce = (value, delay = 450) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;

