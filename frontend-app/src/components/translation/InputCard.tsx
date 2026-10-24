import React from 'react';

/**
 * Ant Design
 */
import { Input, Button, Typography, Space, Col, Card, Tag, } from 'antd';
import { CopyOutlined, CameraOutlined, TranslationOutlined, DeleteOutlined } from '@ant-design/icons';



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
            <Col span={24} >
                {/* Input OCR */}
                <Card title="Input Text" extra={<Tag color="blue">{sourceLangName}</Tag>} >
                    <Input.TextArea rows={8} value={sourceText} onChange={(e) => onSourceTextChange(e.target.value)} placeholder="Captured text will appear here..." className="result-card__textarea" />
                    <Typography.Text type="secondary" className="input-card__char-count">
                        {sourceText.length} Characters
                    </Typography.Text>

                    <Space wrap className="input-card__actions">
                        <Space wrap>
                            <Button icon={<CopyOutlined />} onClick={onCopy} disabled={!sourceText}>Copy</Button>
                            <Button danger icon={<DeleteOutlined />} onClick={onClear} disabled={!sourceText}>Clear</Button>
                        </Space>
                        <Space wrap>
                            <Typography.Text type="secondary" className="input-card__hotkey"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> To Capture</Typography.Text>
                            <Button icon={<CameraOutlined />} onClick={onCapture} loading={translatingOCR} disabled={translating}>Capture</Button>
                            <Button type="primary" icon={<TranslationOutlined />} onClick={onTranslate} loading={translating} disabled={translatingOCR}>Translate</Button>
                        </Space>
                    </Space>

                </Card>
            </Col>
        </React.Fragment>
    )
}