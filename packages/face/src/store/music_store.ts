/* eslint-disable @typescript-eslint/naming-convention */
import { action, computed, makeObservable, observable } from 'mobx';
import { AbstractStore } from './abstract_store';
import { registerStore } from '.';

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
}

export interface IMusicStore {
    musicList: IMusic[];
    curMusicIndex: number;
    curMusic: IMusic | undefined;
    initMusicList: (url: string) => Promise<void>;
    setCurMusicIndex: (index: number) => void;
}

@registerStore('musicStore')
export class MusicStore extends AbstractStore implements IMusicStore {
    musicList: IMusic[] = [];

    curMusicIndex = 0;

    public get curMusic(): IMusic | undefined {
        return this.musicList[this.curMusicIndex];
    }

    constructor() {
        super();
        makeObservable(this, {
            musicList: observable,
            curMusicIndex: observable,
            curMusic: computed,

            initMusicList: action.bound,
            setCurMusicIndex: action.bound,
        });
    }

    async initMusicList(url: string): Promise<void> {
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
    }

    setCurMusicIndex(index: number): void {
        this.curMusicIndex = index;
    }
}
