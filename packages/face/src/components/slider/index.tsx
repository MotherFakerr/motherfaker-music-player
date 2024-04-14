import React from 'react';
import { Slider } from 'antd';
import './index.less';
import { observer } from 'mobx-react';

interface IProps {
    value: number;
    onChange: (value: number) => void;
    onChangeComplete: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    vertical?: boolean;
}
@observer
export class MySlider extends React.Component<Partial<IProps>> {
    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactElement {
        const { min, max, step, value, vertical, onChangeComplete, onChange } = this.props;

        return (
            <div className='my-slider' style={vertical ? { justifyContent: 'center' } : { alignItems: 'center' }}>
                <Slider
                    style={{
                        width: vertical ? 'auto' : '100%',
                        height: vertical ? '100%' : 'auto',
                        justifyContent: vertical ? 'center' : undefined,
                        alignItems: vertical ? undefined : 'center',
                    }}
                    vertical={vertical}
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    tooltip={{ open: false }}
                    onChange={onChange}
                    onChangeComplete={onChangeComplete}
                />
            </div>
        );
    }
}
