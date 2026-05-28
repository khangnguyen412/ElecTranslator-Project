import { Modal, Button, Typography, message, Space } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

interface PopupProps {
    visible: boolean;
    originalText: string;
    translatedText: string;
    onClose: () => void;
    onRetry?: () => void;
}

export const PopupDich: React.FC<PopupProps> = ({ visible, originalText, translatedText, onClose, onRetry, }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(translatedText);
        message.success('Đã sao chép bản dịch');
    };

    return (
        <Modal
            title="Kết quả dịch"
            open={visible}
            onCancel={onClose}
            footer={
                <Space>
                    <Button icon={<CopyOutlined />} onClick={handleCopy}> Sao chép </Button>
                    {onRetry && (<Button icon={<ReloadOutlined />} onClick={onRetry}> Dịch lại </Button>)}
                    <Button type="primary" onClick={onClose}> Đóng
                    </Button>
                </Space>
            }
            width={500}
        >
            <Paragraph strong>Text OCR:</Paragraph>
            <Paragraph copyable={{ text: originalText }} style={{ background: '#f5f5f5', padding: 8 }}>
                {originalText || 'Chưa có dữ liệu'}
            </Paragraph>
            <Paragraph strong>Bản dịch:</Paragraph>
            <Paragraph style={{ background: '#e6f7ff', padding: 8 }}>
                {translatedText || 'Đang xử lý...'}
            </Paragraph>
        </Modal>
    );
};