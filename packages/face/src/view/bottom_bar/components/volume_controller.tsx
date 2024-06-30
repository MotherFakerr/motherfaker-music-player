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
        const { player } = this.props.musicStore!;
        const { volume, setVolume } = player;
        return (
            <div className='volume-controller' title='音量'>
                <Popover
                    content={
                        <MySlider
                            value={volume * 100}
                            min={0}
                            max={100}
                            step={0.1}
                            onChange={(e) => {
                                setVolume(e / 100);
                            }}
                            vertical
                        />
                    }
                    trigger='click'
                    color='#292929'
                    getPopupContainer={(trigger) => trigger.parentElement!}>
                    {volume > 0 ? (
                        <span className='icon-button iconfont icon-volume-high' />
                    ) : (
                        <span className='icon-button iconfont icon-volume-off' />
                    )}
                </Popover>
            </div>
        );
    }
}
