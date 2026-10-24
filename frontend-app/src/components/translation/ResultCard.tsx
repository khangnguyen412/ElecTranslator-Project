import React from 'react';

/**
 * Ant Design
 */
import { Input, Button, Space, Typography, Row, Col, Card, Tag } from 'antd';
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
            <Col span={24}>
                <Card title="Translation Result" extra={<Tag color="blue">{targetLangName}</Tag>}            >
                    <Input.TextArea rows={8} value={translatedText} placeholder={translating ? "Translating..." : "Translation will appear here"} className="result-card__textarea" readOnly />
                    <Typography.Text type="secondary" className="result-card__char-count">
                        {translatedText.length} Characters
                    </Typography.Text>

                    <Row justify="start" align="middle">
                        <Space wrap={true}>
                            <Button icon={<CopyOutlined />} onClick={() => onCopy()} disabled={!translatedText}>
                                Copy
                            </Button>
                        </Space>
                    </Row>
                </Card>
            </Col>
        </React.Fragment>
    )
}