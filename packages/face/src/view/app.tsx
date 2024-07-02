import React from 'react';
import { inject, observer } from 'mobx-react';
import './app.less';
import { IMusicStore } from '../store/music_store';
import { BottomBar } from './bottom_bar';
import { MusicIndexDBHelper } from '../utils/indexdb_utils/music_indexdb_helper';
import { Loading } from '../components/loading';
import p5 from 'p5';
import DEFAULT_ALBUM from '../assets/img/default_album.jpg';
import { IP5Store } from '../store/p5_store';

interface IProps {
    musicStore: IMusicStore;
    p5Store: IP5Store;
}
@inject('musicStore', 'p5Store')
@observer
export class App extends React.Component<Partial<IProps>> {
    constructor(props: IProps) {
        super(props);
    }

    async componentDidMount() {
        const { initMusicList } = this.props.musicStore!;
        const { init } = this.props.p5Store!;
        await MusicIndexDBHelper.init();
        await initMusicList();
        init();
    }

    public render(): React.ReactElement {
        const { containerId } = this.props.p5Store!;
        return (
            <div className='app'>
                <div className='main-component'>
                    <div id={containerId} />
                    <BottomBar />
                </div>

                <div className='extra-component'>
                    <Loading />
                </div>
            </div>
        );
    }
}
