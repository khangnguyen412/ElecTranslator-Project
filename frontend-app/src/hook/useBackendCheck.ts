import { useState, useCallback } from 'react';

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestStartBackendThunk } from '@/redux/features/check';

/**
 * Type
 */
import type { startBackend } from '@/types/check.type'

export const useBankendCheck = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [status, setStatus] = useState<startBackend>({ status: 'idle' });

    const backendCheck = useCallback(async () => {
        try {
            const response = await dispatch(requestStartBackendThunk(null)).unwrap();
            setStatus({
                status: response.startBackendStatus.status,
            });
        } catch {
            setStatus({
                status: 'error'
            });
            return false;
        }
    }, [dispatch]);

    return { status, backendCheck }
}