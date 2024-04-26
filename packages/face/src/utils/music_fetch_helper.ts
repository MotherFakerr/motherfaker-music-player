/* eslint-disable no-await-in-loop */
import { message } from 'antd';
import { IMusicFile, IPureMusic } from './interface';
import { MusicMetadataHelper } from './music_metadata_helper';

export class MusicFetchHelperImpl {
    fetchMusicByUrl = async (url: string): Promise<IPureMusic[]> => {
        const matchRes = url.match(/^https:\/\/github\.com/);

        let res;
        if (matchRes) {
            res = await this._fetchGithubMusicList(url);
        } else {
            res = await this._fetchNormalMusicList(url);
        }
        return res;
    };

    uploadLocalMusic = async (files: File[]): Promise<IPureMusic[]> => {
        const res = [];
        for (const file of files) {
            if (!MusicMetadataHelper.checkMusicType(file.name.split('.').pop() ?? '')) {
                continue;
            }
            const blob = new Blob([file], { type: file.type });
            const duration = await MusicMetadataHelper.getMusicDuration(blob);
            const sha1 = await MusicMetadataHelper.getMusicSha1(blob);
            res.push({ name: file.name.split('.')[0], author: 'unknown', url: '', duration, blob, sha1 });
        }
        return res;
    };

    private _fetchGithubMusicList = async (url: string): Promise<IPureMusic[]> => {
        try {
            const urlParts = url.split('/');
            const repoParts = urlParts[urlParts.length - 1].split('.');
            const repoName = repoParts[0];
            const ownerName = urlParts[urlParts.length - 2];
            const response = await fetch(`https://api.github.com/repos/${ownerName}/${repoName}/contents/`);
            if (response.ok) {
                const data = (await response.json()) as IMusicFile[];
                const audioFiles = data.filter((file) => MusicMetadataHelper.checkMusicType(file.name.split('.').pop() ?? ''));
                const pureMusics = await MusicMetadataHelper.getMusicMetadata(audioFiles);
                return pureMusics;
            }
            throw new Error();
        } catch (error) {
            message.warning('输入的github地址不合法');
            return [];
        }
    };

    private _fetchNormalMusicList = async (url: string): Promise<IPureMusic[]> => {
        try {
            const matchRes = url.match(/\/([^/?]+)\.(\w+)(?:\?.*)?$/);
            if (!matchRes) {
                throw new Error();
            }
            const [_, name, type] = matchRes;
            if (!MusicMetadataHelper.checkMusicType(type)) {
                throw new Error();
            }
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error();
            }
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const pureMusics = await MusicMetadataHelper.getMusicMetadata([{ name, download_url: url }]);
            return pureMusics;
        } catch (error) {
            message.warning('输入的音乐地址不合法');
            return [];
        }
    };
}

export const MusicFetchHelper = new MusicFetchHelperImpl();
