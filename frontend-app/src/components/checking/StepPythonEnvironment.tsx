/**
 * Ant Design
 */
import { Tag, Typography, Space } from 'antd';
import { PythonOutlined, } from '@ant-design/icons';

/**
 * Utils
 */
import { getStatusIcon } from '@/utils/checking-icon';

/**
 * Type
 */
import type { pythonStatus } from '@/types/check.type'

const { Text } = Typography;

export const getStepPythonEnvironment = (status: pythonStatus) => ({
    title: (
        <Space>
            <PythonOutlined /> Python Environment <Tag color="blue">version 3.11</Tag>
        </Space>
    ),
    content: (
        <Text type="secondary" style={{ fontSize: 12, color: '#ffffffa6' }}>
            {status?.message}
        </Text>
    ),
    icon: getStatusIcon(status?.status || 'idle'),
});