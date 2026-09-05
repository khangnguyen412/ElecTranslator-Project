/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestPythonCheckThunk, requestPythonLibraryCheckThunk, requestStartBackendThunk } from '@/redux/features/check';

/**
 * Ant Design
 */
import { Progress, Steps, Typography } from 'antd';


/**
 * Styles
 */
import "@/assets/scss/loading.scss";
import "@/assets/scss/page/checking.scss";

/**
 * Type
 */
import type { pythonStatus, pythonLibStatus, startBackend } from "@/types/check.type";

/**
 * Components
 */
import { getStepPythonEnvironment } from '@/components/checking/StepPythonEnvironment';
import { getStepPythonLibrary } from '@/components/checking/StepPythonLibrary';
import { getStepBackendApi } from '@/components/checking/StepBackendApi';

import { SESSION_KEY } from '@/utils/check-session';


const { Text } = Typography;

const CheckingPage: React.FC = () => {
    /**
    * Hook
    */
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    /**
     * State management
     */
    const [pythonStatus, setPythonStatus] = useState<pythonStatus>({ status: 'idle' });
    const [pythonLibraryStatus, setPythonLibraryStatus] = useState<pythonLibStatus>({ status: 'idle' });
    const [startBackendStatus, setStartBackendStatus] = useState<startBackend>({ status: 'idle' });
    const [scenario, setScenario] = useState<'idle' | 'success' | 'fallback' | 'error'>('idle');

    const isAllReady = useMemo(() =>
        pythonStatus?.status === 'success' &&
        pythonLibraryStatus?.status === 'success' &&
        startBackendStatus?.status === 'success',
        [pythonStatus, pythonLibraryStatus, startBackendStatus]);

    /**
     * Sequential checks
     */
    const runSequentialChecks = async () => {
        setScenario('idle');
        setPythonStatus({ status: 'idle' });
        setPythonLibraryStatus({ status: 'idle' });
        setStartBackendStatus({ status: 'idle' });

        let lastPythonStatus: pythonStatus = { status: 'idle' };
        let lastPythonLibraryStatus: pythonLibStatus = { status: 'idle' };
        let lastBackendStatus: startBackend = { status: 'idle' };

        // Step 1: Python Environment
        try {
            const response = await dispatch(requestPythonCheckThunk(null)).unwrap();
            if (response.pythonStatus?.status !== 'success') {
                const errorInfo = {
                    status: 'error' as const,
                    message: response.pythonStatus?.message || 'Python check failed'
                };
                setPythonStatus(errorInfo);
                throw errorInfo;
            }
            setPythonStatus({
                status: 'success',
                version: response.pythonStatus?.version || '',
                message: response.pythonStatus?.message || ''
            });
            lastPythonStatus = {
                status: 'success',
                version: response.pythonStatus?.version || '',
                message: response.pythonStatus?.message || ''
            };
        } catch (e) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                scenario: 'error',
                pythonStatus: e,
                pythonLibraryStatus: lastPythonLibraryStatus,
                backendStatus: lastBackendStatus,
            }));
            setTimeout(() => {
                navigate('/error', { replace: true });
            }, 3000);
            return;
        }

        // Step 2: Python Library
        try {
            const response = await dispatch(requestPythonLibraryCheckThunk(null)).unwrap();
            if (response.pythonLibraryStatus?.status !== 'success') {
                const errorInfo = {
                    status: 'error' as const,
                    installed: response.pythonLibraryStatus?.installed || [],
                    missing: response.pythonLibraryStatus?.missing || [],
                    message: response.pythonLibraryStatus?.message || 'Python library check failed'
                };
                setPythonLibraryStatus(errorInfo);
                throw errorInfo;
            }
            setPythonLibraryStatus({
                status: 'success',
                installed: response.pythonLibraryStatus?.installed || [],
                missing: response.pythonLibraryStatus?.missing || [],
                message: response.pythonLibraryStatus?.message || ''
            });
            lastPythonLibraryStatus = {
                status: 'success',
                installed: response.pythonLibraryStatus?.installed || [],
                missing: response.pythonLibraryStatus?.missing || [],
                message: response.pythonLibraryStatus?.message || ''
            };
        } catch (e) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                scenario: 'error',
                pythonStatus: lastPythonStatus,
                pythonLibraryStatus: e,
                backendStatus: lastBackendStatus,
            }));
            setTimeout(() => {
                navigate('/error', { replace: true });
            }, 3000);
            return;
        }

        await window.electronAPI.startBackend();
        let backendSuccess = false;
        for (let i = 0; i < 15; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
            try {
                const response = await dispatch(requestStartBackendThunk(null)).unwrap();
                if (response.startBackendStatus?.status === 'success') {
                    setStartBackendStatus(response.startBackendStatus);
                    lastBackendStatus = response.startBackendStatus;
                    backendSuccess = true;
                    break; // Exit loop if backend is ready
                } else {
                    setStartBackendStatus({
                        status: 'error',
                        message: response.startBackendStatus?.message || 'Backend not ready'
                    });
                }
            } catch (e) {
                if (i < 14) {
                    console.log(`Waiting for backend...`);
                }
            }
        }
        if (!backendSuccess) {
            const errorInfo = {
                status: 'error' as const,
                message: 'Backend not ready after 15 seconds'
            };
            setStartBackendStatus(errorInfo);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                scenario: 'error',
                pythonStatus: lastPythonStatus,
                pythonLibraryStatus: lastPythonLibraryStatus,
                backendStatus: errorInfo,
            }));
            setTimeout(() => {
                navigate('/error', { replace: true });
            }, 3000);
            return;
        }

        // Step 4: All checks passed
        setScenario('success');
        setTimeout(() => {
            navigate('/translate');
        }, 3000);
    };

    /**
     * Get completion step based on status
     */
    const getCompletionStep = () => {
        let step = 0;
        if (pythonStatus.status === 'success') step++;
        if (pythonLibraryStatus.status === 'success') step++;
        if (startBackendStatus.status === 'success') step++;
        return step;
    }

    /**
     * Step configuration
     */
    const stepConfig = {
        orientation: 'vertical' as const,
        current: getCompletionStep(),
        items: [
            getStepPythonEnvironment(pythonStatus),
            getStepPythonLibrary(pythonLibraryStatus),
            getStepBackendApi(startBackendStatus),
        ],
    }

    /**
     * Progress bar configuration
     */
    const progressConfig = {
        percent: scenario === 'idle' ? Math.min(getCompletionStep() * (100 / 4), 100) : 100,
        format: (percent: any) => {
            if (scenario === 'idle') return (<span className="progress-percent">{Math.round(percent || 0)}%</span>);
            return isAllReady && '✅ All Systems Ready';
        },
        strokeColor: { '0%': '#108ee9', '50%': '#00d4ff', '100%': isAllReady ? '#52c41a' : '#faad14' },
    }

    /**
     * Run sequential checks
     */
    useEffect(() => {
        runSequentialChecks();
    }, []);

    return (
        <div className="flex-loading flex-col flex-col-fixed">
            <div className="loading-container">
                {/* Header */}
                <div className="loading-header">
                    <div className="logo-animation">
                        <div className="loader">
                            <div className="inner one"></div>
                            <div className="inner two"></div>
                            <div className="inner three"></div>
                        </div>
                    </div>
                    <Typography.Title level={3}>
                        ElecTranslator
                    </Typography.Title>
                    <Text type="secondary">Checking translation engine...</Text>
                </div>

                {/* Progress Steps */}
                <div className="check-section">
                    <Steps {...stepConfig} />
                </div>

                {/* Overall Progress Bar */}
                <div className="progress-section">
                    <Progress {...progressConfig} />
                    <Text type="secondary" className="progress-status-text">
                        {scenario === 'idle' ? 'Please wait, checking system requirements...' : isAllReady ? '🚀 Ready to translate!' : '🔧 Some features limited - see details above'}
                    </Text>
                </div>

                {/* Auto-continue hint */}
                {scenario !== 'idle' && (
                    <div className="auto-continue-hint">
                        <Text type="secondary" className="auto-continue-text">
                            Auto-continuing in <strong>3</strong> seconds...
                        </Text>
                    </div>
                )}
            </div>

            {/* Background decoration */}
            <div className="loading-bg-decoration">
                <div className="pulse-ring"></div>
                <div className="pulse-ring delay-1"></div>
                <div className="pulse-ring delay-2"></div>
            </div>
        </div>
    );
};

export default CheckingPage;