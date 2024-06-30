import { IMusicElement } from '../music_element/interface';

export enum EN_PLAYER_REPEAT_MODE {
    REPEAT_ONCE,
    REPEAT,
    SHUFFLE,
}

export enum EN_PLAYER_STATUS {
    PLAYING = 'playing',
    PAUSED = 'paused',
    LOADING = 'loading',
}
export interface IPlayer {
    playingMusic: IMusicElement | undefined;
    musicList: IMusicElement[];
    playingIndex: number;
    progress: number;
    volume: number;
    repeatMode: EN_PLAYER_REPEAT_MODE;
    status: EN_PLAYER_STATUS;
    progressUpdatable: boolean;
    init(params: IPlayerInitParams): void;
    play(): this;
    pause(): this;
    prev(): this;
    next(): this;
    setMusicList(musicList: IMusicElement[]): this;
    playMusic(music?: IMusicElement): this;
    setPlayingIndex(index: number): this;
    setProgress(progress: number): this;
    jumpToProgress(progress: number): this;
    setVolume(volume: number): this;
    setRepeatMode(mode: EN_PLAYER_REPEAT_MODE): this;
    setProgressUpdatable(progressUpdatable: boolean): this;
}

export interface IPlayerInitParams {
    musicList: IMusicElement[];
    // playerElement: HTMLAudioElement;
    volume: number;
    repeatMode: EN_PLAYER_REPEAT_MODE;
    playingIndex: number;
    progress: number;
    status: EN_PLAYER_STATUS;
    progressUpdatable?: boolean;
}
