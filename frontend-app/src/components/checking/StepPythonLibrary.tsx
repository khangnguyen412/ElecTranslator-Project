import React from 'react';
/**
 * Ant Design
 */
import { Tag, Space } from 'antd';
import { PythonOutlined, } from '@ant-design/icons';

/**
 * Utils
 */
import { getStatusIcon } from '@/utils/checking-icon';

/**
 * Type
 */
import type { pythonLibStatus } from '@/types/check.type'


export const getStepPythonLibrary = (status: pythonLibStatus) => ({
    title: (
        <Space>
            <PythonOutlined /> Python Library
        </Space>
    ),
    content: (
        <Space orientation="vertical" size={0}>
            {status?.status === 'idle' && (
                <Space wrap style={{ fontSize: 12, color: '#ffffffa6' }}>
                    <Tag color="blue" style={{ fontSize: 10 }}>Checking...</Tag>
                </Space>
            )}
            {status?.status === 'success' && (
                <Space wrap style={{ fontSize: 12, color: '#ffffffa6' }}>
                    Installed: {status?.installed?.map((item: string) => (<Tag key={item} color="green" style={{ fontSize: 10 }}>{item}</Tag>)) || 'None'}
                </Space>
            )}
            {status?.status === 'missing' && (
                <React.Fragment>
                    <Space wrap style={{ fontSize: 12, color: '#ffffffa6' }}>
                        Installed: {status?.installed?.map((item: string) => (<Tag key={item} color="green" style={{ fontSize: 10 }}>{item}</Tag>)) || 'None'}
                    </Space>
                    <Space wrap style={{ fontSize: 12, color: '#ffffffa6' }}>
                        Missing: {status?.missing?.map((item: string) => (<Tag key={item} color="red" style={{ fontSize: 10 }}>{item}</Tag>)) || 'None'}
                    </Space>
                </React.Fragment>
            )}
        </Space>
    ),
    icon: getStatusIcon(status?.status || 'loading'),
});