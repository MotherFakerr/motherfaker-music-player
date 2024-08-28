/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import { action, makeAutoObservable, makeObservable } from 'mobx';
import { message } from 'antd';
import React from 'react';
import { AbstractStore } from './abstract_store';
import { registerStore } from '.';
import { MusicIndexDBHelper } from '../utils/indexdb_utils/music_indexdb_helper';
import { MusicFetchHelper } from '../utils/music_fetch_helper';
import { EN_PLAYER_REPEAT_MODE, EN_PLAYER_STATUS, IMusicUploadParams, IPlayer, MusicElement, Player } from '@github-music-player/element';
import { LoadingHelper } from '../utils/loading_helper';

export interface IMusicStore {
    player: IPlayer;

    initMusicList: () => Promise<void>;
    fetchMusicByUrl: (url: string) => Promise<void>;
    fetchAIMusics: () => Promise<void>;
    uploadLocalMusic: (files: File[]) => Promise<void>;
    deleteMusic: (id: number) => Promise<void>;
    clearMusicList: () => Promise<void>;
}

@registerStore('musicStore')
export class MusicStore extends AbstractStore implements IMusicStore {
    player: IPlayer = Player.getInstance();

    bProgressDragging = false;

    constructor() {
        super();
        makeAutoObservable(this.player, {}, { autoBind: true });
        makeObservable(this, {
            initMusicList: action.bound,
            fetchMusicByUrl: action.bound,
            fetchAIMusics: action.bound,
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
        await LoadingHelper.setLoading(true);
        await LoadingHelper.setLoadingMessage('正在拉取音乐中');
        const { musics, errorMsgs: uploadErrorMsgs } = await MusicFetchHelper.fetchMusicByUrl(
            url,
            async (progress) => await LoadingHelper.setLoadingProgress(progress),
            async (name) => await LoadingHelper.setLoadingMessage(name),
        );
        const { errorMsgs: postFetchErrorMsgs } = await this._postFetchMusic(musics);
        this._displayErrorMsgs([...uploadErrorMsgs, ...postFetchErrorMsgs]);
        this.player.playMusic(this.player.playingMusic);
        await LoadingHelper.setLoading(false);
    }

    async fetchAIMusics(): Promise<void> {
        await LoadingHelper.setLoading(true);
        await LoadingHelper.setLoadingMessage('正在拉取音乐列表');
        const { musics, errorMsgs: uploadErrorMsgs } = await MusicFetchHelper.fetchAIMusics(
            async (progress) => await LoadingHelper.setLoadingProgress(progress),
            async (name) => await LoadingHelper.setLoadingMessage(name),
        );
        const { errorMsgs: postFetchErrorMsgs } = await this._postFetchMusic(musics);
        this._displayErrorMsgs([...uploadErrorMsgs, ...postFetchErrorMsgs]);
        this.player.playMusic(this.player.playingMusic);
        await LoadingHelper.setLoading(false);
    }

    async uploadLocalMusic(files: File[]): Promise<void> {
        await LoadingHelper.setLoading(true);
        const { musics, errorMsgs: uploadErrorMsgs } = await MusicFetchHelper.uploadLocalMusic(
            files,
            async (progress) => await LoadingHelper.setLoadingProgress(progress),
            async (name) => await LoadingHelper.setLoadingMessage(name),
        );
        const { errorMsgs: postFetchErrorMsgs } = await this._postFetchMusic(musics);
        this._displayErrorMsgs([...uploadErrorMsgs, ...postFetchErrorMsgs]);
        this.player.playMusic(this.player.playingMusic);
        await LoadingHelper.setLoading(false);
    }

    async deleteMusic(id: number): Promise<void> {
        const musicList = this.player.musicList;
        await MusicIndexDBHelper.deleteMusics([id]);
        const newMusicList = musicList.filter((m) => m.id !== id);
        this.player.setMusicList(newMusicList);
        if (newMusicList.length === 0) {
            this.player.pause();
            this.player.playMusic();
        }
    }

    async clearMusicList(): Promise<void> {
        await MusicIndexDBHelper.deleteMusics(this.player.musicList.map((m) => m.id));
        this.player.setMusicList([]);
        this.player.pause();
        this.player.playMusic();
    }

    private _postFetchMusic = async (musics: IMusicUploadParams[]): Promise<{ errorMsgs: string[] }> => {
        const newMusics = await MusicIndexDBHelper.addMusics(musics);

        const newMusicElements = [];
        for (const m of newMusics) {
            const music = new MusicElement().init(m);
            newMusicElements.push(music);
        }
        this.player.setMusicList([...this.player.musicList, ...newMusicElements]);

        return { errorMsgs: [] };
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
