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
            <Col span={24} className="result-card">
                <Typography.Text strong className="result-card__title">Translation Result - {targetLangName}</Typography.Text>
                <Input.TextArea rows={8} value={translatedText} placeholder={translating ? "Translating..." : "Translation will appear here"} className="result-card__textarea" disabled />
                <Row justify="start" align="middle" className="result-card__actions-row">
                    <Space wrap={true}>
                        <Button icon={<CopyOutlined />} onClick={() => onCopy()} disabled={!translatedText} className="result-card__copy-btn">
                            Copy
                        </Button>
                    </Space>
                </Row>
            </Col>
        </React.Fragment>
    )
}