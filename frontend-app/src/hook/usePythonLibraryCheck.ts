import { useState, useCallback } from 'react';

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestPythonLibraryCheckThunk } from '@/redux/features/check';

/**
 * Type
 */
import type { pythonLibStatus } from '@/types/check.type'

export const usePythonLibraryCheck = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [status, setStatus] = useState<pythonLibStatus>({ status: 'idle' });

    const pythonLibraryCheck = useCallback(async () => {
        try {
            const response = await dispatch(requestPythonLibraryCheckThunk(null)).unwrap();
            setStatus({
                status: response.pythonLibraryStatus.status,
            });
        } catch {
            setStatus({
                status: 'error'
            });
            return false;
        }
    }, [dispatch]);

    return { status, pythonLibraryCheck }
}