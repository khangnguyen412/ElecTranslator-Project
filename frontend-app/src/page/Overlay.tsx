import React, { useEffect, useState } from 'react';

/**
 * antd
 */
import { Card, Typography, Button, Space, message } from 'antd';
import { CopyOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Overlay: React.FC = () => {
    const [data, setData] = useState<{ title: string; body: string } | null>(null);

    useEffect(() => {
        /**
         * Listen for overlay display event from Main Process
         */
        window.electronAPI.onDisplayOverlay((newData) => {
            setData(newData);
        });
    }, []);

    const handleCopy = () => {
        if (data?.body) {
            navigator.clipboard.writeText(data.body);
            message.success('Copy result to clipboard!');
        }
    };

    const handleClose = () => {
        window.electronAPI.hideOverlay();
    };

    if (!data) return null;

    return (
        <React.Fragment>
            <div style={{ padding: '16px', pointerEvents: 'auto', }}>
                <Card style={{ background: 'rgba(20, 20, 20, 0.9)', border: '1px solid #444', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} styles={{ body: { padding: '20px' } }}            >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Title level={4} style={{ color: '#1890ff', margin: 0 }}>{data.title}</Title>
                        <Button type="text" icon={<CloseOutlined />} onClick={handleClose} style={{ color: '#fff' }} />
                    </div>

                    <Paragraph style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6', maxHeight: '180px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {data.body}
                    </Paragraph>

                    <Space style={{ marginTop: 16 }}>
                        <Button type="primary" icon={<CopyOutlined />} onClick={handleCopy}>
                            Copy kết quả
                        </Button>
                    </Space>
                </Card>
            </div>
        </React.Fragment>
    );
};

export default Overlay;