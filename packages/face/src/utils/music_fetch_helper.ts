/* eslint-disable no-await-in-loop */
import { message } from 'antd';
import { IMusicFile, IPureMusic } from './interface';
import { MusicMetadataHelper } from './music_metadata_helper';
import { LoadingHelper } from './loading_helper';
import { sleep } from './common_util';
import { EN_TASK_STATUS, Task } from '../../../core/src';

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
        // await sleep(1000);

        const runTask = (file: File) => {
            return new Promise<IPureMusic>((resolve, reject) => {
                let blob: Blob;
                let audio: HTMLAudioElement;
                const task = new Task<IPureMusic>({
                    onPending: async (task) => {
                        if (!MusicMetadataHelper.checkMusicType(file.name.split('.').pop() ?? '')) {
                            reject(new Error('music type not support'));
                            return;
                        }

                        blob = new Blob([file], { type: file.type });
                        audio = new Audio(URL.createObjectURL(blob));

                        audio.addEventListener('error', () => {
                            reject(new Error('music load error'));
                        });

                        audio.addEventListener('loadedmetadata', () => {
                            task.setStatus(EN_TASK_STATUS.RUNNING);
                        });
                    },
                    onRunning: async (task) => {
                        const duration = await MusicMetadataHelper.getMusicDuration(blob);
                        const sha1 = await MusicMetadataHelper.getMusicSha1(blob);
                        const pureMusic = { name: file.name.split('.')[0], author: 'unknown', url: '', duration, blob, sha1 };
                        task.setUserData(pureMusic);
                        task.setStatus(EN_TASK_STATUS.SUCCESS);
                    },
                    onSuccess: async (task) => {
                        console.log('2');

                        resolve(task.getUserData());
                    },
                    onFailed: async (task) => {
                        reject(new Error('music load failed'));
                    },
                });
            });
        };

        const normalizeProgress = 1 / files.length;
        let curProgress = 0;
        const res = [];
        for (const file of files) {
            try {
                // const taskRes = await runTask(file);
                let blob: Blob;
                let audio: HTMLAudioElement;
                const task = new Task<IPureMusic, IPureMusic>({
                    onPending: async (task) => {
                        if (!MusicMetadataHelper.checkMusicType(file.name.split('.').pop() ?? '')) {
                            task.setStatus(EN_TASK_STATUS.FAILED);
                            return;
                        }

                        blob = new Blob([file], { type: file.type });
                        audio = new Audio(URL.createObjectURL(blob));

                        audio.addEventListener('error', () => {
                            task.setStatus(EN_TASK_STATUS.FAILED);
                        });

                        audio.addEventListener('loadedmetadata', () => {
                            task.setStatus(EN_TASK_STATUS.RUNNING);
                        });
                    },
                    onRunning: async (task) => {
                        const duration = await MusicMetadataHelper.getMusicDuration(blob);
                        const sha1 = await MusicMetadataHelper.getMusicSha1(blob);
                        const pureMusic = { name: file.name.split('.')[0], author: 'unknown', url: '', duration, blob, sha1 };
                        task.setUserData(pureMusic);
                        task.setResponse(pureMusic);
                        task.setStatus(EN_TASK_STATUS.SUCCESS);
                    },
                    onSuccess: async (task) => {
                        console.log('2');

                        // resolve(task.getUserData());
                    },
                    onFailed: async (task) => {
                        // reject(new Error('music load failed'));
                    },
                });

                const taskRes = await task.start();

                res.push(taskRes);
            } catch {
                // DO NOTHING
            } finally {
                LoadingHelper.setLoadingProgress((curProgress += normalizeProgress));
                LoadingHelper.setLoadingMessage(file.name);
                await sleep(0);
            }
        }

        console.log('finish');

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
