import React from 'react';
import './play_list_adder.less';
import { inject, observer } from 'mobx-react';
import { IMusicStore } from '../../../store/music_store';
import { ILoadingStore } from '../../../store/loading_store';
import { EN_PLAYER_REPEAT_MODE } from '@github-music-player/element';

interface IProps {
    musicStore: IMusicStore;
    loadingStore: ILoadingStore;
}

@inject('musicStore', 'loadingStore')
@observer
export class PlayListRepeat extends React.Component<Partial<IProps>> {
    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactElement {
        const { player } = this.props.musicStore!;
        const { repeatMode, setRepeatMode } = player;
        return (
            <div
                className='play-list-repeat'
                title={
                    repeatMode === EN_PLAYER_REPEAT_MODE.REPEAT
                        ? '重复播放'
                        : repeatMode === EN_PLAYER_REPEAT_MODE.REPEAT_ONCE
                        ? '单次播放'
                        : '随机播放'
                }>
                <span
                    className={`icon-button iconfont ${
                        repeatMode === EN_PLAYER_REPEAT_MODE.REPEAT
                            ? 'icon-repeat'
                            : repeatMode === EN_PLAYER_REPEAT_MODE.REPEAT_ONCE
                            ? 'icon-repeat-once'
                            : 'icon-shuffle-variant'
                    }`}
                    aria-hidden
                    onClick={() => setRepeatMode((repeatMode + 1) % 3)}
                />
            </div>
        );
    }
}
