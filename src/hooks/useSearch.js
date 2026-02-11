import { useState, useCallback } from 'react';
import { debounce } from '../utils/helpers';

/**
 * Search hook with debounced query
 */
const useSearch = (searchFn, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await searchFn(searchQuery);
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, delay),
    [searchFn, delay]
  );

  const search = useCallback(
    (value) => {
      setQuery(value);
      setLoading(true);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return { query, results, loading, error, search, clear };
};

export default useSearch;
