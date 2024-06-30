import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from 'antd';
import './index.less';
import { ProgressBar } from './components/progress_bar';
import { IMusicStore } from '../../store/music_store';
import DEFAULT_ALBUM from '../../assets/img/default_album.jpg';
import { VolumnController } from './components/volume_controller';
import { PlayList } from './components/play_list';
import { PlayListAdder } from './components/play_list_adder';
import { PlayListRepeat } from './components/play_list_repeat';
import { EN_PLAYER_STATUS } from '@github-music-player/element';

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
        // const { initAudioElement } = this.props.musicStore!;
        // initAudioElement();
    }

    public render(): React.ReactElement {
        const { player } = this.props.musicStore!;
        const { play, pause, prev, next, status, playingMusic } = player;
        return (
            <div className='bottom-bar'>
                <div className='bottom-bar-content'>
                    <div className='controller-content'>
                        <Button ghost className='prev' onClick={() => prev()}>
                            <span className='iconfont icon-step-backward' />
                        </Button>
                        <Button
                            ghost
                            className='play-pause'
                            onClick={() => {
                                if (status === 'playing') {
                                    pause();
                                } else if (status === 'paused') {
                                    play();
                                }
                            }}>
                            {this._renderControllerButtons()}
                        </Button>
                        <Button ghost className='next' onClick={() => next()}>
                            <span className='iconfont icon-step-forward' />
                        </Button>
                    </div>
                    <div className='audio-pic'>
                        <img src={playingMusic?.picBlobUrl ?? DEFAULT_ALBUM} alt='' />
                        <div className='mask' />
                    </div>
                    <div className='main-content'>
                        <div className='audio-info'>
                            <div className='audio-name hidden-text'>{playingMusic?.name}</div>
                            <div className='artist-name hidden-text'>{playingMusic?.artist ?? '未知艺术家'}</div>
                        </div>
                        <ProgressBar />
                    </div>
                    <div className='extra-content'>
                        <VolumnController />
                        <PlayList />
                        <PlayListAdder />
                        <PlayListRepeat />
                    </div>
                </div>
                {/* <audio
                    id='audio'
                    onLoadStart={() => loadAudio()}
                    onLoadedData={() => {
                        audioElement.click();
                        playAudio();
                    }}
                    onEnded={() => handleAudioEnded()}
                    // onTimeUpdate={(e) => {
                    //     if (bProgressDragging) {
                    //         return;
                    //     }
                    //     updateCurProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100);
                    // }}
                    src={curMusic?.blobUrl ?? curMusic?.url}>
                    <track kind='captions' />
                </audio> */}
            </div>
        );
    }

    private _renderControllerButtons(): React.ReactNode {
        const { player } = this.props.musicStore!;
        const { status } = player;
        if (status === EN_PLAYER_STATUS.PLAYING) {
            return <span className='pause iconfont icon-pause' />;
        }
        if (status === EN_PLAYER_STATUS.PAUSED) {
            return <span className='play iconfont icon-caret-right' />;
        }
        return <span className='loading iconfont icon-loading' />;
    }
}
