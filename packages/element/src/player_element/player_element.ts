import { IMusicElement } from '../music_element/interface';
import { EN_PLAYER_REPEAT_MODE, EN_PLAYER_STATUS, IPlayer, IPlayerInitParams } from './interface';

export class Player implements IPlayer {
    private static _instance: Player;

    public static getInstance() {
        if (!this._instance) {
            this._instance = new Player();
        }
        return this._instance;
    }

    private _player: HTMLAudioElement;

    public musicList: IMusicElement[] = [];

    public repeatMode: EN_PLAYER_REPEAT_MODE = EN_PLAYER_REPEAT_MODE.REPEAT;

    public playingIndex: number = 0;

    public progress: number = 0;

    public status: EN_PLAYER_STATUS = EN_PLAYER_STATUS.PAUSED;

    public volume: number = 1;

    public progressUpdatable = true;

    constructor() {
        this._player = document.createElement('audio');
        this._player.onloadstart = () => {
            if (this._player.src) {
                this.setStatus(EN_PLAYER_STATUS.LOADING);
            } else {
                this.setStatus(EN_PLAYER_STATUS.PAUSED);
            }
        };
        this._player.onloadeddata = () => {
            this._player.click();
            this.play();
        };
        this._player.onended = () => {
            if (this.repeatMode === EN_PLAYER_REPEAT_MODE.REPEAT_ONCE) {
                this.play();
            } else if (this.repeatMode === EN_PLAYER_REPEAT_MODE.REPEAT) {
                if (this.playingIndex < this.musicList.length - 1) {
                    this.setPlayingIndex(this.playingIndex + 1);
                } else {
                    this.setPlayingIndex(0);
                }
            } else if (this.repeatMode === EN_PLAYER_REPEAT_MODE.SHUFFLE) {
                const randomIndex = Math.floor(Math.random() * this.musicList.length);
                this.setPlayingIndex(randomIndex);
            }
        };
        this._player.ontimeupdate = () => {
            this.setProgress(this._player.currentTime / this._player.duration);
        };

        // document.body.appendChild(this._player);
    }

    public get playingMusic(): IMusicElement | undefined {
        return this.musicList[this.playingIndex];
    }

    public init(params: IPlayerInitParams): this {
        const { musicList, volume, repeatMode, playingIndex, progress, status, progressUpdatable } = params;
        this.musicList = musicList;
        this.repeatMode = repeatMode;
        this.playingIndex = playingIndex;
        this.progress = progress;
        this._player.volume = volume;
        this.status = status;
        this.progressUpdatable = progressUpdatable ?? true;
        return this;
    }

    public play(): this {
        if (this._isMusicPrepared()) {
            this._player
                .play()
                .then(() => {
                    this.setStatus(EN_PLAYER_STATUS.PLAYING);
                })
                .catch(() => {
                    this.setStatus(EN_PLAYER_STATUS.PAUSED);
                });
        }
        return this;
    }

    public pause(): this {
        this._player.pause();
        this.setStatus(EN_PLAYER_STATUS.PAUSED);
        return this;
    }

    public prev(): this {
        if (this.playingIndex > 0) {
            this.setPlayingIndex(this.playingIndex - 1);
            this.playMusic(this.playingMusic);
        }
        return this;
    }

    public next(): this {
        if (this.playingIndex < this.musicList.length - 1) {
            this.setPlayingIndex(this.playingIndex + 1);
            this.playMusic(this.playingMusic);
        }
        return this;
    }

    public playMusic(music?: IMusicElement): this {
        this._player.src = music?.blobUrl ?? '';
        this.play();
        return this;
    }

    public setMusicList(musicList: IMusicElement[]): this {
        this.musicList = musicList;
        return this;
    }

    public setStatus(status: EN_PLAYER_STATUS): this {
        this.status = status;
        return this;
    }
    public setPlayingIndex(index: number): this {
        this.playingIndex = index;
        this.playMusic(this.playingMusic);
        return this;
    }

    public setProgress(progress: number): this {
        if (this.progressUpdatable) {
            this.progress = progress || 0;
        }

        return this;
    }

    public jumpToProgress(progress: number): this {
        if (this.progressUpdatable) {
            this._player.currentTime = progress * this._player.duration;
            this.progress = progress;
        }

        return this;
    }

    public setVolume(volume: number): this {
        this._player.volume = volume;
        this.volume = volume;
        return this;
    }

    public setRepeatMode(repeatMode: EN_PLAYER_REPEAT_MODE): this {
        this.repeatMode = repeatMode;
        return this;
    }

    public setProgressUpdatable(progressUpdatable: boolean): this {
        this.progressUpdatable = progressUpdatable;
        return this;
    }

    private _isMusicPrepared(): boolean {
        return this._player.readyState >= 3;
    }
}
