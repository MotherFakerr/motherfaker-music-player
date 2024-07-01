import React from 'react';
import { inject, observer } from 'mobx-react';
import './app.less';
import { IMusicStore } from '../store/music_store';
import { BottomBar } from './bottom_bar';
import { MusicIndexDBHelper } from '../utils/indexdb_utils/music_indexdb_helper';
import { Loading } from '../components/loading';
import { ConfigProvider, Progress } from 'antd';
import p5 from 'p5';

interface IProps {
    musicStore: IMusicStore;
}
@inject('musicStore')
@observer
export class App extends React.Component<Partial<IProps>> {
    constructor(props: IProps) {
        super(props);
    }

    async componentDidMount() {
        const { initMusicList } = this.props.musicStore!;
        await MusicIndexDBHelper.init();
        await initMusicList();
        this.test();
    }

    public render(): React.ReactElement {
        return (
            <div className='app'>
                <div className='main-component'>
                    <div id='p5-container' />
                    <BottomBar />
                </div>

                <div className='extra-component'>
                    <Loading />
                </div>
            </div>
        );
    }

    public test() {
        const container = document.getElementById('p5-container');
        if (!container) {
            return;
        }
        new p5((p: p5) => {
            p.setup = () => {
                p.createCanvas(container.clientWidth, container.clientHeight);
            };

            p.draw = () => {
                p.background(0);

                p.fill(80);
                p.stroke(50);

                const { player } = this.props.musicStore!;
                const { frequencyData } = player;

                const maxLength = Math.min(p.height, p.width);
                const sizeCoefficient = 0.7;
                const circleSizeCoefficient = 0.3;

                const circleDiameter = maxLength * circleSizeCoefficient;
                p.circle(p.width / 2, p.height / 2, circleDiameter);
                p.beginShape();
                p.noFill();
                p.stroke(0, 255, 0);
                const startX = p.width / 2;
                const startY = p.height / 2;
                const unitHeight = ((maxLength * sizeCoefficient) / 2 - circleDiameter / 2) / 256;
                const unitAngle = p.TWO_PI / frequencyData.length;
                for (let i = 0; i < frequencyData.length; i++) {
                    const value = frequencyData[i] * unitHeight + circleDiameter / 2;
                    const angle = i * unitAngle;
                    const x = startX + value * p.sin(angle);
                    const y = startY + value * p.cos(angle);
                    p.vertex(x, y);

                    // p.rect(i * unitWidth + unitWidth / 2, p.height - frequencyData[i] * unitHeight, unitWidth, p.height);
                    // const x = p.map(i, 0, frequencyData.length, 0, p.width);
                    // const y = p.map(frequencyData[i], 0, 255, 0, p.height);
                    // p.vertex(x, y);
                }

                p.endShape();
            };
        }, container);
    }
}
