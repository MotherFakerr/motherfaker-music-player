import React from 'react';
import { observer } from 'mobx-react';

interface IProps {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stopColor1: string;
    stopColor2: string;
    offset1: number;
    offset2: number;
}

@observer
export class SvgPathLinearGradient extends React.Component<Partial<IProps>> {
    public render(): React.ReactElement {
        const { id, x1, y1, x2, y2, stopColor1, stopColor2, offset1, offset2 } = this.props;
        return (
            <svg width='0' height='0' style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
                        <stop offset={offset1} stopColor={stopColor1} />
                        <stop offset={offset2} stopColor={stopColor2} />
                    </linearGradient>
                </defs>
            </svg>
        );
    }
}
