import React from 'react';
import './play_list.less';
import { inject, observer } from 'mobx-react';
import { Avatar, List, Popover } from 'antd';
import DEFAULT_ALBUM from '../../../assets/img/default_album.jpg';
import { IMusic, IMusicStore } from '../../../store/music_store';

interface IProps {
    musicStore: IMusicStore;
}
@inject('musicStore')
@observer
export class PlayList extends React.Component<Partial<IProps>> {
    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactElement {
        const { musicList, curMusicIndex, setCurMusicIndex } = this.props.musicStore!;

        return (
            <div className='play-list'>
                <Popover
                    content={
                        <List
                            className='play-list-list'
                            header={<div className='title'>{`播放列表(${musicList.length})`}</div>}
                            dataSource={musicList}
                            renderItem={(item: IMusic, index: number) => (
                                <div
                                    className='list-item'
                                    aria-hidden
                                    style={{ backgroundColor: curMusicIndex === index ? '#15161a' : undefined }}
                                    onClick={() => setCurMusicIndex(index)}>
                                    <div>{curMusicIndex === index && <span className='iconfont icon-caret-right' />}</div>
                                    <div>{item.name}</div>
                                    <div>{item.artist ?? '未知艺术家'}</div>
                                    <div>{item.duration}</div>
                                </div>
                            )}
                        />
                    }
                    trigger='click'
                    color='#292929'
                    getPopupContainer={(trigger) => trigger.parentElement!}>
                    <span className='icon-button iconfont icon-playlist-play' />
                </Popover>
            </div>
        );
    }
}
