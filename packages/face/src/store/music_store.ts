/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import { action, computed, makeObservable, observable } from 'mobx';
import { message } from 'antd';
import { AbstractStore } from './abstract_store';
import { registerStore } from '.';
import { getMusicMetadata, saveMusics } from '../utils/music_metadata_helper';
import { IMusic, IMusicFile, IPureMusic } from '../utils/interface';
import { MusicIndexDBHelper } from '../utils/music_indexdb_helper';

export enum EN_PLAYING_STATUS {
    PLAYING = 'playing',
    PAUSED = 'paused',
    LOADING = 'loading',
}

export interface IMusicStore {
    audioElement: HTMLAudioElement;
    musicList: IMusic[];
    curMusicIndex: number;
    curMusic: IMusic | undefined;
    curProgress: number;
    bProgressDragging: boolean;
    playingStatus: EN_PLAYING_STATUS;
    curVolume: number;
    initAudioElement: () => void;
    initMusicList: () => Promise<void>;
    fetchMusicList: (url: string) => Promise<void>;
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
    updateVolume: (volume: number) => void;
    deleteMusic: (id: number) => Promise<void>;
    clearMusicList: () => Promise<void>;
}

@registerStore('musicStore')
export class MusicStore extends AbstractStore implements IMusicStore {
    _musicHashSet = new Set<string>();

    audioElement: HTMLAudioElement = document.createElement('audio');

    musicList: IMusic[] = [];

    curMusicIndex = 0;

    curProgress = 0;

    bProgressDragging = false;

    playingStatus = EN_PLAYING_STATUS.PAUSED;

    curVolume = 100;

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
            curVolume: observable,

            initAudioElement: action.bound,
            initMusicList: action.bound,
            fetchMusicList: action.bound,
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
            updateVolume: action.bound,
            deleteMusic: action.bound,
            clearMusicList: action.bound,
        });
    }

    initAudioElement(): void {
        this.audioElement = document.getElementById('audio') as HTMLAudioElement;
    }

    async initMusicList(): Promise<void> {
        const musicList = await MusicIndexDBHelper.getMusics();
        this.musicList = musicList.map((m) => ({ ...m, blobUrl: URL.createObjectURL(m.blob) }));
        this._musicHashSet = new Set<string>([...this.musicList.map((m) => m.sha1)]);
    }

    async fetchMusicList(url: string): Promise<void> {
        if (!MusicIndexDBHelper.isOk) {
            message.warning('请先等待indexdb初始化完成');
            return;
        }
        const matchRes = url.match(/^https:\/\/github\.com/);
        if (matchRes) {
            await this._fetchGithubMusicList(url);
        } else {
            await this._fetchNormalMusicList(url);
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
            this.audioElement.play().then(() => {
                this.playingStatus = EN_PLAYING_STATUS.PLAYING;
            });
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

    updateVolume(volume: number): void {
        this.curVolume = volume;
        this.audioElement.volume = volume / 100;
    }

    async deleteMusic(id: number): Promise<void> {
        const { sha1 } = this.musicList.find((m) => m.id === id)!;
        await MusicIndexDBHelper.deleteMusics([id]);
        this.musicList = this.musicList.filter((m) => m.id !== id);
        this._musicHashSet.delete(sha1);
        if (this.musicList.length === 0) {
            this.pauseAudio();
            this.audioElement.load();
        }
    }

    async clearMusicList(): Promise<void> {
        await MusicIndexDBHelper.deleteMusics(this.musicList.map((m) => m.id));
        this.musicList = [];
        this._musicHashSet = new Set<string>();
        this.pauseAudio();
        this.audioElement.load();
    }

    private _fetchGithubMusicList = async (url: string): Promise<void> => {
        try {
            const urlParts = url.split('/');
            const repoParts = urlParts[urlParts.length - 1].split('.');
            const repoName = repoParts[0];
            const ownerName = urlParts[urlParts.length - 2];
            const response = await fetch(`https://api.github.com/repos/${ownerName}/${repoName}/contents/`);
            if (response.ok) {
                const data = (await response.json()) as IMusicFile[];
                const audioFiles = data.filter((file) => ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(file.name.split('.').pop() ?? ''));
                const pureMusics = await getMusicMetadata(audioFiles);
                this._postFetchMusic(pureMusics);
            } else {
                throw new Error();
            }
        } catch (error) {
            message.warning('输入的github地址不合法');
        }
    };

    private _fetchNormalMusicList = async (url: string): Promise<void> => {
        try {
            const matchRes = url.match(/\/([^/?]+)\.(\w+)(?:\?.*)?$/);
            if (!matchRes) {
                throw new Error();
            }
            const [_, name, type] = matchRes;
            if (!['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(type)) {
                throw new Error();
            }
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error();
            }
            const pureMusics = await getMusicMetadata([{ name, download_url: url }]);
            this._postFetchMusic(pureMusics);
        } catch (error) {
            message.warning('输入的音乐地址不合法');
        }
    };

    private _postFetchMusic = async (pureMusics: IPureMusic[]): Promise<void> => {
        const newPureMusics = [];
        const musicHashSet = new Set<string>([...this._musicHashSet]);
        for (const music of pureMusics) {
            if (!musicHashSet.has(music.sha1)) {
                newPureMusics.push(music);
                musicHashSet.add(music.sha1);
            } else {
                message.warning(`${music.name}已加载`);
            }
        }

        const newMusics = await saveMusics(newPureMusics);

        for (const music of newMusics) {
            this._musicHashSet.add(music.sha1);
            this.musicList.push({ ...music, blobUrl: URL.createObjectURL(music.blob) });
        }
    };
}
