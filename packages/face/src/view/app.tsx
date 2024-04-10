import React from 'react';
import { inject, observer } from 'mobx-react';
import './app.less';
import { IMusicStore } from '../store/music_store';

interface IProps {
    musicStore: IMusicStore;
}
interface IState {
    url: string;
}
@inject('musicStore')
@observer
export class App extends React.Component<Partial<IProps>, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            url: '',
        };
    }

    public render(): React.ReactElement {
        const { musicList, curMusic, curMusicIndex, setCurMusicIndex, initMusicList } = this.props.musicStore!;

        return (
            <div className='App'>
                <input type='text' onChange={(e) => this.setState({ url: e.target.value })} />
                <button type='button' onClick={() => initMusicList(this.state.url)}>
                    加载
                </button>
                <audio autoPlay controls src={curMusic?.url} onEnded={() => setCurMusicIndex(curMusicIndex + 1)} />
                {musicList.map((music, index) => (
                    <button type='button' onClick={() => setCurMusicIndex(index)}>
                        {music.name}
                    </button>
                ))}
            </div>
        );
    }
}
