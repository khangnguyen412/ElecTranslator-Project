/**
 * Ant Design
 */
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';

export const getStatusIcon = (status: string, size?: number) => {
  const style = { fontSize: size ?? 20 };

  switch (status) {
    case 'success':
      return <CheckCircleOutlined style={{ ...style, color: '#52c41a' }} />;
    case 'error':
      return <CloseCircleOutlined style={{ ...style, color: '#ff4d4f' }} />;
    case 'timeout':
      return <CloseCircleOutlined style={{ ...style, color: '#faad14' }} />;
    default:
      return <LoadingOutlined spin style={{ ...style, color: '#1890ff' }} />;
  }
};