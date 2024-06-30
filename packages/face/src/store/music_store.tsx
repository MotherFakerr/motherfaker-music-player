/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import { action, makeAutoObservable, makeObservable } from 'mobx';
import { message } from 'antd';
import React from 'react';
import { AbstractStore } from './abstract_store';
import { registerStore } from '.';
import { MusicIndexDBHelper } from '../utils/indexdb_utils/music_indexdb_helper';
import { MusicFetchHelper } from '../utils/music_load_utils.ts/music_fetch_helper';
import { EN_PLAYER_REPEAT_MODE, EN_PLAYER_STATUS, IMusicUploadParams, IPlayer, MusicElement, Player } from '@github-music-player/element';

export interface IMusicStore {
    player: IPlayer;

    initMusicList: () => Promise<void>;
    fetchMusicByUrl: (url: string) => Promise<void>;
    uploadLocalMusic: (files: File[]) => Promise<void>;
    deleteMusic: (id: number) => Promise<void>;
    clearMusicList: () => Promise<void>;
}

@registerStore('musicStore')
export class MusicStore extends AbstractStore implements IMusicStore {
    _musicHashSet = new Set<string>();

    player: IPlayer = Player.getInstance();

    bProgressDragging = false;

    constructor() {
        super();
        makeAutoObservable(this.player, {}, { autoBind: true });
        makeObservable(this, {
            initMusicList: action.bound,
            fetchMusicByUrl: action.bound,
            uploadLocalMusic: action.bound,
            deleteMusic: action.bound,
            clearMusicList: action.bound,
        });
    }

    async initMusicList(): Promise<void> {
        const musics = await MusicIndexDBHelper.getMusics();
        const musicList = [];
        for (const m of musics) {
            const music = new MusicElement().init(m);
            musicList.push(music);
        }

        this._musicHashSet = new Set<string>([...musicList.map((m) => m.sha1)]);
        this.player.init({
            musicList,
            playingIndex: 0,
            repeatMode: EN_PLAYER_REPEAT_MODE.REPEAT,
            progress: 0,
            status: EN_PLAYER_STATUS.PAUSED,
            volume: 1,
        });
        this.player.playMusic(this.player.playingMusic);
    }

    async fetchMusicByUrl(url: string): Promise<void> {
        const { musics, errorMsgs: uploadErrorMsgs } = await MusicFetchHelper.fetchMusicByUrl(url);
        const { errorMsgs: postFetchErrorMsgs } = await this._postFetchMusic(musics);
        this._displayErrorMsgs([...uploadErrorMsgs, ...postFetchErrorMsgs]);
    }

    async uploadLocalMusic(files: File[]): Promise<void> {
        const { musics, errorMsgs: uploadErrorMsgs } = await MusicFetchHelper.uploadLocalMusic(files);
        const { errorMsgs: postFetchErrorMsgs } = await this._postFetchMusic(musics);
        this._displayErrorMsgs([...uploadErrorMsgs, ...postFetchErrorMsgs]);
    }

    async deleteMusic(id: number): Promise<void> {
        const musicList = this.player.musicList;
        const { sha1 } = musicList.find((m) => m.id === id)!;
        await MusicIndexDBHelper.deleteMusics([id]);
        const newMusicList = musicList.filter((m) => m.id !== id);
        this.player.setMusicList(newMusicList);
        this._musicHashSet.delete(sha1);
        if (newMusicList.length === 0) {
            this.player.pause();
            this.player.playMusic();
        }
    }

    async clearMusicList(): Promise<void> {
        await MusicIndexDBHelper.deleteMusics(this.player.musicList.map((m) => m.id));
        this.player.setMusicList([]);
        this._musicHashSet = new Set<string>();
        this.player.pause();
        this.player.playMusic();
    }

    private _postFetchMusic = async (musics: IMusicUploadParams[]): Promise<{ errorMsgs: string[] }> => {
        const errorMsgs = [];
        const musicEntities = [];
        const musicHashSet = new Set<string>([...this._musicHashSet]);
        for (const music of musics) {
            if (!musicHashSet.has(music.sha1)) {
                musicEntities.push(music);
                musicHashSet.add(music.sha1);
            } else {
                errorMsgs.push(`文件已存在，跳过加载，错误文件：${music.name}`);
            }
        }

        const newMusics = await MusicIndexDBHelper.addMusics(musicEntities);

        const newMusicElements = [];
        for (const m of newMusics) {
            const music = new MusicElement().init(m);
            this._musicHashSet.add(music.sha1);
            newMusicElements.push(music);
        }
        this.player.setMusicList([...this.player.musicList, ...newMusicElements]);

        return { errorMsgs };
    };

    private _displayErrorMsgs(errorMsgs: string[]): void {
        if (errorMsgs.length) {
            message.error({
                content: (
                    <ul>
                        {errorMsgs.map((msg) => (
                            <li>{msg}</li>
                        ))}
                    </ul>
                ),
                duration: 5,
            });
        }
    }
}
