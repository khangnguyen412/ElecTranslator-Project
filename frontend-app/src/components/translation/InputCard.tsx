import React from 'react';

/**
 * Ant Design
 */
import { Input, Button, Typography, Space, Col, Row } from 'antd';
import { CopyOutlined, CameraOutlined, TranslationOutlined } from '@ant-design/icons';



/**
 * Type
 */
export interface InputCardProps {
    sourceText: string;
    sourceLangName?: string;
    translating: boolean;
    translatingOCR: boolean;
    onSourceTextChange: (text: string) => void;
    onCopy: () => void;
    onClear: () => void;
    onTranslate: () => void;
    onCapture: () => void;
}

export const InputCard: React.FC<InputCardProps> = (props: InputCardProps) => {
    const { sourceText, sourceLangName, translating, translatingOCR, onSourceTextChange, onCopy, onClear, onTranslate, onCapture } = props;

    return (
        <React.Fragment>
            <Col span={24} style={{ background: '#A3A6D8', padding: 20, borderRadius: 20, backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                {/* Input OCR */}
                <Typography.Text strong style={{ color: '#fff' }}>Input Text - {sourceLangName}</Typography.Text>
                <Input.TextArea rows={8} value={sourceText} onChange={(e) => onSourceTextChange(e.target.value)} placeholder="Captured text will appear here..." style={{ fontFamily: 'monospace', marginTop: 8, fontSize: 18 }} />
                <Row justify="start" align="middle" style={{ marginTop: 8 }}>
                    <Space wrap={true}>
                        <Button icon={<CopyOutlined />} onClick={() => onCopy()} disabled={!sourceText}>
                            Copy
                        </Button>
                        <Button onClick={() => onClear()} disabled={!sourceText}>
                            Clear
                        </Button>
                        <Button type="primary" htmlType="button" icon={<TranslationOutlined />} onClick={() => onTranslate()} loading={translating} disabled={translatingOCR}>
                            Translate
                        </Button>
                        <Button type="primary" htmlType="button" icon={<CameraOutlined />} onClick={() => onCapture()} loading={translatingOCR} disabled={translating}>
                            Capture
                        </Button>
                    </Space>
                </Row>
            </Col>
        </React.Fragment>
    )
}