import { useState, useCallback } from 'react';

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestPythonCheckThunk } from '@/redux/features/check';

/**
 * Type
 */
import type { pythonStatus } from '@/types/check.type'

export const usePythonCheck = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [status, setStatus] = useState<pythonStatus>({ status: 'idle' });

    const pythonCheck = useCallback(async () => {
        try {
            const response = await dispatch(requestPythonCheckThunk(null)).unwrap();
            setStatus({
                status: response.pythonStatus.status,
            });
        } catch {
            setStatus({
                status: 'error'
            });
            return false;
        }
    }, [dispatch]);

    return { status, pythonCheck }
}