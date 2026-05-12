import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchStudentsFiltered, fetchStudentStats } from '../services/api';

/**
 * Custom hook for instant-updating student data.
 *
 * - Uses the advanced /filter endpoint for combined dynamic filtering
 * - keepPreviousData: keeps stale results visible while new ones load (no full spinner)
 * - Separate `loading` (first load) vs `isFetching` (background refetch) flags
 * - Debounces text search (200ms), dropdown filters trigger immediately
 */
export function useStudents(filters = {}, search = '') {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);       // true only on first load
  const [isFetching, setIsFetching] = useState(false); // true during any refetch
  const [error, setError] = useState(null);

  const isFirstLoad = useRef(true);
  const debounceTimer = useRef(null);
  const abortRef = useRef(null);
  const requestId = useRef(0); // prevents stale responses from overwriting newer ones

  const load = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Increment request counter to detect stale responses
    const currentRequest = ++requestId.current;

    // Only show full loading spinner on first load; use isFetching for subsequent
    if (isFirstLoad.current) {
      setLoading(true);
    }
    setIsFetching(true);
    setError(null);

    try {
      // Build params for the advanced /filter endpoint
      const params = { ...filters, search };

      const [result, statsData] = await Promise.all([
        fetchStudentsFiltered(params),
        fetchStudentStats(),
      ]);

      // Only update if this is still the latest request and not aborted
      if (currentRequest === requestId.current && !controller.signal.aborted) {
        setStudents(Array.isArray(result) ? result : (result.data || []));
        setStats(statsData || { total: 0, high: 0, medium: 0, low: 0 });
        isFirstLoad.current = false;
      }
    } catch (err) {
      if (controller.signal.aborted || currentRequest !== requestId.current) return;

      console.error('API error, falling back to mock data:', err);
      setError(err.message);

      // Fallback to mock data if API is down
      try {
        const { mockStudents } = await import('../data/mockData');
        let filtered = [...mockStudents];
        if (filters.program && filters.program !== 'Todos') {
          filtered = filtered.filter(s => s.program === filters.program);
        }
        if (filters.semester && filters.semester !== 'Todos') {
          filtered = filtered.filter(s => s.semester === filters.semester);
        }
        if (filters.riskLevel && filters.riskLevel !== 'Todos') {
          filtered = filtered.filter(s => s.riskLevel === filters.riskLevel);
        }
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.program.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
          );
        }
        setStudents(filtered);
        setStats({
          total: mockStudents.length,
          high: mockStudents.filter(s => s.riskLevel === 'high').length,
          medium: mockStudents.filter(s => s.riskLevel === 'medium').length,
          low: mockStudents.filter(s => s.riskLevel === 'low').length,
        });
        isFirstLoad.current = false;
      } catch {
        setStudents([]);
      }
    } finally {
      if (currentRequest === requestId.current && !controller.signal.aborted) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, [filters.program, filters.semester, filters.riskLevel, search]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Dropdown filters: instant (0ms), text search: fast debounce (200ms)
    const delay = search ? 200 : 0;
    debounceTimer.current = setTimeout(load, delay);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [load, search]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { students, stats, loading, isFetching, error, refetch: load };
}
