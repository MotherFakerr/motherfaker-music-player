import React from 'react';
import { inject, observer } from 'mobx-react';
import './app.less';
import { IMusicStore } from '../store/music_store';
import { BottomBar } from './bottom_bar';
import { MusicIndexDBHelper } from '../utils/music_indexdb_helper';
import { Loading } from '../components/loading';

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

    async componentDidMount() {
        const { initMusicList } = this.props.musicStore!;
        await MusicIndexDBHelper.init();
        await initMusicList();
    }

    public render(): React.ReactElement {
        const { fetchMusicByUrl } = this.props.musicStore!;

        return (
            <div className='app'>
                <div className='main-component'>
                    <BottomBar />
                </div>

                <div className='extra-component'>
                    <Loading />
                </div>
                <input type='text' onChange={(e) => this.setState({ url: e.target.value })} />
                <button type='button' onClick={() => fetchMusicByUrl(this.state.url)}>
                    加载
                </button>
            </div>
        );
    }
}
