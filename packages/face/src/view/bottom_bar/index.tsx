import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from 'antd';
import './index.less';
import { ProgressBar } from './components/progress_bar';
import { EN_PLAYING_STATUS, IMusicStore } from '../../store/music_store';
import DEFAULT_ALBUM from '../../assets/img/default_album.jpg';
import { VolumnController } from './components/volume_controller';
import { PlayList } from './components/play_list';

interface IProps {
    musicStore: IMusicStore;
}

@inject('musicStore')
@observer
export class BottomBar extends React.Component<Partial<IProps>> {
    constructor(props: IProps) {
        super(props);
    }

    componentDidMount(): void {
        const { initAudioElement } = this.props.musicStore!;
        initAudioElement();
    }

    public render(): React.ReactElement {
        const {
            curMusic,
            curMusicIndex,
            bProgressDragging,
            playingStatus,
            audioElement,
            setCurMusicIndex,
            updateCurProgress,
            playAudio,
            pauseAudio,
            prevAudio,
            nextAudio,
            loadAudio,
        } = this.props.musicStore!;

        return (
            <div className='bottom-bar'>
                <div className='bottom-bar-content'>
                    <div className='controller-content'>
                        <Button ghost className='prev' onClick={() => prevAudio()}>
                            <span className='iconfont icon-step-backward' />
                        </Button>
                        <Button
                            ghost
                            className='play-pause'
                            onClick={() => {
                                if (playingStatus === 'playing') {
                                    pauseAudio();
                                } else if (playingStatus === 'paused') {
                                    playAudio();
                                }
                            }}>
                            {this._renderControllerButtons()}
                        </Button>
                        <Button ghost className='next' onClick={() => nextAudio()}>
                            <span className='iconfont icon-step-forward' />
                        </Button>
                    </div>
                    <div className='audio-thumb'>
                        <img src={curMusic?.thumbUrl ?? DEFAULT_ALBUM} alt='' />
                        <div className='mask' />
                    </div>
                    <div className='main-content'>
                        <div className='audio-info'>
                            <div className='audio-name hidden-text'>{curMusic?.name}</div>
                            <div className='artist-name hidden-text'>{curMusic?.artist ?? '未知艺术家'}</div>
                        </div>
                        <ProgressBar />
                    </div>
                    <div className='extra-content'>
                        <VolumnController />
                        <PlayList />
                    </div>
                </div>
                <audio
                    id='audio'
                    onLoadStart={() => loadAudio()}
                    onLoadedData={() => {
                        audioElement.click();
                        playAudio();
                    }}
                    onEnded={() => setCurMusicIndex(curMusicIndex + 1)}
                    onTimeUpdate={(e) => {
                        if (bProgressDragging) {
                            return;
                        }
                        updateCurProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100);
                    }}
                    src={curMusic?.blobUrl ?? curMusic?.url}>
                    <track kind='captions' />
                </audio>
            </div>
        );
    }

    private _renderControllerButtons(): React.ReactNode {
        const { playingStatus } = this.props.musicStore!;
        if (playingStatus === EN_PLAYING_STATUS.PLAYING) {
            return <span className='pause iconfont icon-pause' />;
        }
        if (playingStatus === EN_PLAYING_STATUS.PAUSED) {
            return <span className='play iconfont icon-caret-right' />;
        }
        return <span className='loading iconfont icon-loading' />;
    }
}
