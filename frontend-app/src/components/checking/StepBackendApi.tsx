/**
 * Ant Design
 */
import { Tag, Space, Typography, Row, Col } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

/**
 * Utils
 */
import { getStatusIcon } from '@/utils/checking-icon';

/**
 * Type
 */
import type { startBackend } from '@/types/check.type'

const { Text } = Typography;

export const getStepBackendApi = (status: startBackend) => ({
    title: (
        <Space>
            <ApiOutlined /> Backend API
        </Space>
    ),
    content: (
        <Row gutter={8}>
            <Col>
                <Text type="secondary" style={{ fontSize: 12, color: '#ffffffa6' }}>
                    Status:
                </Text>
            </Col>
            <Col>
                {status?.status === 'idle' && <Tag color="blue" style={{ fontSize: 10 }}>Waiting For Backend...</Tag>}
                {status?.status === 'success' && <Tag color="green" style={{ fontSize: 10 }}>Ready</Tag>}
                {status?.status === 'error' && <Tag color="red" style={{ fontSize: 10 }}>Unavailable</Tag>}
            </Col>
        </Row>
    ),
    icon: getStatusIcon(status?.status || 'loading'),
});