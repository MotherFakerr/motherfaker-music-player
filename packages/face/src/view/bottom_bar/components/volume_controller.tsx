import React from 'react';
import './volume_controller.less';
import { inject, observer } from 'mobx-react';
import { Popover } from 'antd';
import { IMusicStore } from '../../../store/music_store';
import { MySlider } from '../../../components/slider';

interface IProps {
    musicStore: IMusicStore;
}
@inject('musicStore')
@observer
export class VolumnController extends React.Component<Partial<IProps>> {
    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactElement {
        const { audioElement, curVolume, updateVolume } = this.props.musicStore!;

        return (
            <div className='volume-controller'>
                <Popover
                    content={
                        <MySlider
                            value={curVolume}
                            min={0}
                            max={100}
                            step={0.1}
                            onChange={(e) => {
                                updateVolume(e);
                            }}
                            vertical
                        />
                    }
                    trigger='click'
                    color='#292929'
                    getPopupContainer={(trigger) => trigger.parentElement!}>
                    {audioElement.volume > 0 ? (
                        <span className='icon-button iconfont icon-volume-high' />
                    ) : (
                        <span className='icon-button iconfont icon-volume-off' />
                    )}
                </Popover>
            </div>
        );
    }
}
