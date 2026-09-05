import React from 'react';

/**
 * Ant Design
 */
import { Input, Button, Space, Typography, Row, Col } from 'antd';
import { CopyOutlined } from '@ant-design/icons';


/**
 * Type
 */
export interface ResultCardProps {
    translatedText: string;
    targetLangName?: string;
    translating: boolean;
    onCopy: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = (props: ResultCardProps) => {
    const { translatedText, targetLangName, translating, onCopy } = props;

    return (
        <React.Fragment>
            <Col span={24} style={{ background: '#A3A6D8', padding: 16, borderRadius: 20, backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                <Typography.Text strong style={{ color: '#fff' }}>Translation Result - {targetLangName}</Typography.Text>
                <Input.TextArea readOnly rows={8} value={translatedText}
                    placeholder={translating ? "Translating..." : "Translation will appear here"}
                    style={{ fontFamily: 'monospace', marginTop: 8, background: '#fafafa', fontSize: 18, cursor: 'not-allowed' }} />
                <Row justify="start" align="middle" style={{ marginTop: 8 }}>
                    <Space wrap={true}>
                        <Button icon={<CopyOutlined />} onClick={() => onCopy()} disabled={!translatedText} style={{ marginTop: 8 }}>
                            Copy
                        </Button>
                    </Space>
                </Row>
            </Col>
        </React.Fragment>
    )
}