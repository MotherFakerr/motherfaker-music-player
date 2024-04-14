import React from 'react';
import './progress_bar.less';
import { inject, observer } from 'mobx-react';
import { IMusicStore } from '../../../store/music_store';
import { MySlider } from '../../../components/slider';

interface IProps {
    musicStore: IMusicStore;
}
@inject('musicStore')
@observer
export class ProgressBar extends React.Component<Partial<IProps>> {
    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactElement {
        const { curProgress, audioElement, updateCurProgress, setBProgressDragging, setAudioProgress } = this.props.musicStore!;

        return (
            <div className='progress-bar'>
                <MySlider
                    value={curProgress}
                    min={0}
                    max={100}
                    step={0.1}
                    onChange={(e) => {
                        updateCurProgress(e);
                        setBProgressDragging(true);
                    }}
                    onChangeComplete={(e) => {
                        setBProgressDragging(false);
                        setAudioProgress(e);
                    }}
                />
                <div className='time'>
                    <span>{`${this._formatTime(audioElement.currentTime || 0)}`}</span>
                    {` / ${this._formatTime(audioElement.duration || 0)}`}
                </div>
            </div>
        );
    }

    private _formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    }
}
