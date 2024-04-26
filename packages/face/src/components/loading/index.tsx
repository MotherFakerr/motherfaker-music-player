import React from 'react';
import { Progress, Spin } from 'antd';
import './index.less';
import { inject, observer } from 'mobx-react';
import { ILoadingStore } from '../../store/loading_store';

interface IProps {
    loadingStore: ILoadingStore;
}

@inject('loadingStore')
@observer
export class Loading extends React.Component<Partial<IProps>> {
    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactElement {
        const { isLoading, message, progress, setLoading } = this.props.loadingStore!;

        return (
            <>
                {isLoading && (
                    <div className='loading'>
                        <Spin
                            delay={500}
                            tip={
                                <div className='loading-content'>
                                    {progress !== undefined && (
                                        <Progress
                                            percent={Number((progress * 100).toFixed(2))}
                                            width={80}
                                            style={{ marginLeft: 16 }}
                                            strokeColor={{
                                                '0%': '#FBB03B',
                                                '100%': '#D4145A',
                                            }}
                                        />
                                    )}
                                    <div className='loading-message'>{message}</div>
                                </div>
                            }
                            fullscreen
                        />
                    </div>
                )}
            </>
        );
    }
}
