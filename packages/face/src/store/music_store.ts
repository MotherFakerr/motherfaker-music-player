/* eslint-disable @typescript-eslint/naming-convention */
import { action, computed, makeObservable, observable } from 'mobx';
import { AbstractStore } from './abstract_store';
import { registerStore } from '.';

export enum EN_PLAYING_STATUS {
    PLAYING = 'playing',
    PAUSED = 'paused',
    LOADING = 'loading',
}
interface IGithubFile {
    name: string;
    type: string;
    size: number;
    sha: string;
    url: string;
    git_url: string;
    html_url: string;
    download_url: string;
}

export interface IMusic {
    name: string;
    url: string;
    artist?: string;
    thumbUrl?: string;
}

export interface IMusicStore {
    audioElement: HTMLAudioElement;
    musicList: IMusic[];
    curMusicIndex: number;
    curMusic: IMusic | undefined;
    curProgress: number;
    bProgressDragging: boolean;
    playingStatus: EN_PLAYING_STATUS;
    initAudioElement: () => void;
    initMusicList: (url: string) => Promise<void>;
    setCurMusicIndex: (index: number) => void;
    setBProgressDragging: (bDragging: boolean) => void;
    // 更新进度显示
    updateCurProgress: (progress: number) => void;
    // 设置音频进度
    setAudioProgress: (progress: number) => void;
    playAudio: () => void;
    pauseAudio: () => void;
    prevAudio: () => void;
    nextAudio: () => void;
    loadAudio: () => void;
    isMusicPrepared: () => boolean;
}

@registerStore('musicStore')
export class MusicStore extends AbstractStore implements IMusicStore {
    audioElement: HTMLAudioElement = document.createElement('audio');

    musicList: IMusic[] = [];

    curMusicIndex = 0;

    curProgress = 0;

    bProgressDragging = false;

    playingStatus = EN_PLAYING_STATUS.PAUSED;

    get curMusic(): IMusic | undefined {
        return this.musicList[this.curMusicIndex];
    }

    constructor() {
        super();
        makeObservable(this, {
            audioElement: observable,
            musicList: observable,
            curMusicIndex: observable,
            curMusic: computed,
            curProgress: observable,
            bProgressDragging: observable,
            playingStatus: observable,

            initAudioElement: action.bound,
            initMusicList: action.bound,
            setCurMusicIndex: action.bound,
            updateCurProgress: action.bound,
            setBProgressDragging: action.bound,
            setAudioProgress: action.bound,
            playAudio: action.bound,
            pauseAudio: action.bound,
            prevAudio: action.bound,
            nextAudio: action.bound,
            loadAudio: action.bound,
            isMusicPrepared: action.bound,
        });
    }

    initAudioElement(): void {
        this.audioElement = document.getElementById('audio') as HTMLAudioElement;
    }

    async initMusicList(url: string): Promise<void> {
        const matchRes = url.match(/^https:\/\/github\.com/);
        if (matchRes) {
            await this._initGithubMusicList(url);
        } else {
            await this._initNormalMusicList(url);
        }
    }

    setCurMusicIndex(index: number): void {
        this.curMusicIndex = index;
    }

    updateCurProgress(progress: number): void {
        this.curProgress = progress;
    }

    setBProgressDragging(bDragging: boolean): void {
        this.bProgressDragging = bDragging;
    }

    setAudioProgress(progress: number): void {
        const time = (progress / 100) * this.audioElement.duration;
        if (time) {
            this.audioElement.currentTime = (progress / 100) * this.audioElement.duration;
        }
    }

    playAudio(): void {
        if (this.isMusicPrepared()) {
            this.audioElement.play();
            this.playingStatus = EN_PLAYING_STATUS.PLAYING;
        }
    }

    pauseAudio(): void {
        this.audioElement.pause();
        this.playingStatus = EN_PLAYING_STATUS.PAUSED;
    }

    prevAudio(): void {
        if (this.curMusicIndex > 0) {
            this.setCurMusicIndex(this.curMusicIndex - 1);
            this.playAudio();
        }
    }

    nextAudio(): void {
        if (this.curMusicIndex < this.musicList.length - 1) {
            this.setCurMusicIndex(this.curMusicIndex + 1);
            this.playAudio();
        }
    }

    loadAudio(): void {
        if (this.audioElement.src) {
            this.playingStatus = EN_PLAYING_STATUS.LOADING;
        } else {
            this.playingStatus = EN_PLAYING_STATUS.PAUSED;
        }
    }

    isMusicPrepared(): boolean {
        return this.audioElement.readyState >= 3;
    }

    private _initGithubMusicList = async (url: string): Promise<void> => {
        try {
            const urlParts = url.split('/');
            const repoParts = urlParts[urlParts.length - 1].split('.');
            const repoName = repoParts[0];
            const ownerName = urlParts[urlParts.length - 2];
            const response = await fetch(`https://api.github.com/repos/${ownerName}/${repoName}/contents/`);
            const data = (await response.json()) as IGithubFile[];
            if (response.ok) {
                const audioFiles = data.filter((file) => ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(file.name.split('.').pop() ?? ''));
                this.musicList = audioFiles.map((file) => ({ name: file.name, url: file.download_url }));
            } else {
                throw new Error();
            }
        } catch (error) {
            alert('输入的github地址不合法');
        }
    };

    private _initNormalMusicList = async (url: string): Promise<void> => {
        try {
            const matchRes = url.match(/\/([^/?]+)\.(\w+)(?:\?.*)?$/);
            if (!matchRes) {
                throw new Error();
            }
            const [_, name, type] = matchRes;
            if (!['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(type)) {
                throw new Error();
            }
            this.musicList = [{ name, url }];
        } catch (error) {
            alert('输入的音乐地址不合法');
        }
    };
}
