/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Ant Design
 */
import { message,} from 'antd';


/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestHealthCheckThunk } from '@/redux/features/healthCheck';

/**
 * Style
 */
import "@/assets/scss/loading.scss";

const LoadingPage: React.FC = () => {
    /**
     * Hook
     */
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    /**
     * Handle health check
     */
    const handleHealthCheck = useCallback(async () => {
        try {
            setTimeout(() => {
                dispatch(requestHealthCheckThunk(null, {})).unwrap();
                message.success("Health Check Passed");
                navigate("/translate");
            }, 1000);
        } catch (error: any) {
            message.error(error?.errors || "Health Check Failed");
        }
    }, [dispatch, navigate]);

    useEffect(() => {
        handleHealthCheck();
    }, [handleHealthCheck]);

    return (
        <React.Fragment>
            <div className={"flex-loading flex-col flex-col-fixed"}>
                <div className="wrap-loader--background">
                    <div className="loader">
                        <div className="inner one"></div>
                        <div className="inner two"></div>
                        <div className="inner three"></div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default LoadingPage;
