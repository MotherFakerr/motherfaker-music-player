import React from 'react';
import './progress_bar.less';
import { inject, observer } from 'mobx-react';
import { IMusicStore } from '../../../store/music_store';
import { MySlider } from '../../../components/slider';
import { TimeFormatter } from '@github-music-player/core';

interface IProps {
    musicStore: IMusicStore;
}
interface IState {
    draggingProgress: number;
}
@inject('musicStore')
@observer
export class ProgressBar extends React.Component<Partial<IProps>, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            draggingProgress: 0,
        };
    }

    public render(): React.ReactElement {
        const { player } = this.props.musicStore!;
        const { progress, playingMusic, setProgressUpdatable, jumpToProgress } = player;
        const { draggingProgress } = this.state;
        return (
            <div className='progress-bar'>
                <MySlider
                    value={(this._onDragging() ? draggingProgress : progress) * 100}
                    min={0}
                    max={100}
                    step={0.1}
                    onChange={(e) => {
                        setProgressUpdatable(false);
                        this.setState({ draggingProgress: e / 100 });
                    }}
                    onChangeComplete={(e) => {
                        setProgressUpdatable(true);
                        jumpToProgress(e / 100);
                    }}
                />
                <div className='time'>
                    <span>{`${TimeFormatter.format(
                        (this._onDragging() ? draggingProgress : progress) * (playingMusic?.duration || 0),
                    )}`}</span>
                    {` / ${TimeFormatter.format(playingMusic?.duration || 0)}`}
                </div>
            </div>
        );
    }

    private _onDragging(): boolean {
        const { player } = this.props.musicStore!;
        return !player.progressUpdatable;
    }
}
