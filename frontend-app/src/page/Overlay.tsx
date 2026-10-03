import React, { useEffect, useState } from 'react';

/**
 * antd
 */
import { Card, Typography, Button, Space, message } from 'antd';
import { CopyOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Overlay: React.FC = () => {
    const [data, setData] = useState<{ title: string; body: Array<{ text: string; type?: 'source' | 'translated' | 'error' }> } | null>(null);

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
            navigator.clipboard.writeText(data.body.map(item => item.text).join('\n'));
            message.success('Copy result to clipboard!');
        }
    };

    const handleClose = () => {
        window.electronAPI.hideOverlay();
    };

    if (!data?.body?.length) return null;
    const isError = Array.isArray(data.body) && data.body.some(b => b.type === 'error');

    return (
        <React.Fragment>
            <div style={{ padding: '16px', pointerEvents: 'auto', }}>
                <Card style={{ background: 'rgba(20, 20, 20, 0.9)', border: '1px solid #444', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} styles={{ body: { padding: '20px' } }}            >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Title level={4} style={{ color: isError ? '#ff4d4f' : '#1890ff', margin: 0 }}>
                            {isError ? 'Error' : 'Result'}: {data.title}
                        </Title>
                        <Button type="text" icon={<CloseOutlined />} onClick={handleClose} style={{ color: '#fff' }} />
                    </div>

                    {data.body.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: item.type === 'source' ? 8 : 0 }}>
                            {item.type === 'source' && (<div style={{ color: '#888', fontSize: '12px', marginBottom: 4 }}>Source:</div>)}
                            {item.type === 'translated' && (<div style={{ color: '#1890ff', fontSize: '12px', marginBottom: 4 }}>Translated:</div>)}
                            <Paragraph style={{ 
                                color: item.type === 'error' ? '#ff4d4f' : item.type === 'source' ? '#ccc' : '#fff', 
                                fontSize: item.type === 'error' ? '14px' : '16px', textOverflow: 'ellipsis',
                                lineHeight: '1.6', maxHeight: '5em', overflowY: 'auto', whiteSpace: 'pre-wrap',  
                                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', }}>
                                {item.text}
                            </Paragraph>
                        </div>
                    ))}

                    <Space style={{ marginTop: 16 }}>
                        <Button type="primary" icon={<CopyOutlined />} onClick={handleCopy}>
                            Copy
                        </Button>
                    </Space>
                </Card>
            </div>
        </React.Fragment>
    );
};

export default Overlay;