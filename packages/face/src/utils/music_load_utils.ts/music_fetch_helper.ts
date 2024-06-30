/* eslint-disable no-await-in-loop */
import { IMusicFile } from '../interface';
import { LoadingHelper } from '../loading_helper';
import { EN_TASK_QUEUE_TYPE, EN_TASK_STATUS, ITaskError, Task, TaskQueue } from '@github-music-player/core';
import { EN_MUSIC_LOAD_STATUS, IMusicUploadParams, MusicUploadElement } from '@github-music-player/element';

export class MusicFetchHelperImpl {
    checkMusicFormat(type: string): boolean {
        const types = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
        return types.includes(type);
    }

    fetchMusicByUrl = async (url: string): Promise<{ musics: IMusicUploadParams[]; errorMsgs: string[] }> => {
        const matchRes = url.match(/^https:\/\/github\.com/);

        let res;
        if (matchRes) {
            res = await this._fetchGithubMusicList(url);
        } else {
            res = await this._fetchNormalMusicList(url);
        }
        return res;
    };

    uploadLocalMusic = async (files: File[]): Promise<{ musics: IMusicUploadParams[]; errorMsgs: string[] }> => {
        const normalizeProgress = 1 / files.length;
        let curProgress = 0;
        const musics: IMusicUploadParams[] = [];
        const errorMsgs: string[] = [];

        const taskQueue = new TaskQueue(
            files.map((file) => {
                const nameArr = file.name.split('.');
                const name = nameArr.slice(0, nameArr.length - 1).join('.');
                const format = nameArr[nameArr.length - 1];

                const task = new Task<IMusicUploadParams>({
                    onPending: async (task) => {
                        LoadingHelper.setLoadingMessage(name);
                        if (!this.checkMusicFormat(format)) {
                            task.markFailed(new Error(`${format}格式不支持，错误文件：${file.name}`));
                            return;
                        }

                        task.setStatus(EN_TASK_STATUS.RUNNING);
                    },
                    onRunning: async (task) => {
                        const blob = new Blob([file], { type: file.type });
                        const music = await new MusicUploadElement().init({
                            name,
                            blob,
                        });
                        const uploadParams = music.dump();

                        if (uploadParams.status === EN_MUSIC_LOAD_STATUS.SUCCESS) {
                            task.markSuccess(uploadParams);
                        } else {
                            task.markFailed(new Error(`文件加载失败，错误文件：${file.name}`));
                        }
                    },
                    onSuccess: async (_, res: IMusicUploadParams) => {
                        musics.push(res);
                        await LoadingHelper.setLoadingProgress((curProgress += normalizeProgress));
                    },
                    onFailed: async (_, errros: ITaskError[]) => {
                        errorMsgs.push(...errros.map((error: ITaskError) => error.msg));
                        await LoadingHelper.setLoadingProgress((curProgress += normalizeProgress));
                    },
                });

                return task;
            }),
        );
        await taskQueue.start();

        return {
            musics,
            errorMsgs,
        };
    };

    private _fetchGithubMusicList = async (url: string): Promise<{ musics: IMusicUploadParams[]; errorMsgs: string[] }> => {
        try {
            const urlParts = url.split('/');
            const repoParts = urlParts[urlParts.length - 1].split('.');
            const repoName = repoParts[0];
            const ownerName = urlParts[urlParts.length - 2];
            const response = await fetch(`https://api.github.com/repos/${ownerName}/${repoName}/contents/`);
            if (response.ok) {
                const files = (await response.json()) as IMusicFile[];
                const musicRes = await this._downloadMusics(
                    files.filter((file) => this.checkMusicFormat(file.name.split('.').at(-1) ?? '')),
                );
                return musicRes;
            }

            return {
                musics: [],
                errorMsgs: ['音乐列表获取失败'],
            };
        } catch (error) {
            return {
                musics: [],
                errorMsgs: ['输入的github地址不合法'],
            };
        }
    };

    private _fetchNormalMusicList = async (url: string): Promise<{ musics: IMusicUploadParams[]; errorMsgs: string[] }> => {
        try {
            const matchRes = url.match(/\/([^/?]+)\.(\w+)(?:\?.*)?$/);
            if (!matchRes) {
                return {
                    musics: [],
                    errorMsgs: ['输入的地址不合法'],
                };
            }
            const [_, name, type] = matchRes;

            const res = await fetch(url);
            if (!res.ok) {
                return {
                    musics: [],
                    errorMsgs: ['音乐获取失败'],
                };
            }

            const musicRes = await this._downloadMusics([{ name: name + '.' + type, download_url: url }]);
            return musicRes;
        } catch (error) {
            return {
                musics: [],
                errorMsgs: ['输入的地址不合法'],
            };
        }
    };

    private _downloadMusics = async (musicFiles: IMusicFile[]): Promise<{ musics: IMusicUploadParams[]; errorMsgs: string[] }> => {
        const normalizeProgress = 1 / musicFiles.length;
        let curProgress = 0;
        const musics: IMusicUploadParams[] = [];
        const errorMsgs: string[] = [];

        const taskQueue = new TaskQueue(
            musicFiles.map((file) => {
                const nameArr = file.name.split('.');
                const name = nameArr.slice(0, nameArr.length - 1).join('.');
                const format = nameArr[nameArr.length - 1];

                let res: Response;

                const task = new Task<IMusicUploadParams>({
                    onPending: async (task) => {
                        if (!this.checkMusicFormat(format)) {
                            task.markFailed(new Error(`${format}格式不支持，错误文件：${file.name}`));
                            return;
                        }

                        const filePath = file.download_url;
                        res = await fetch(filePath);

                        // 检查响应状态码，如果不是200则抛出异常
                        if (!res.ok) {
                            task.markFailed(new Error(`Fetch failed with status ${res.status}`));
                        }

                        task.setStatus(EN_TASK_STATUS.RUNNING);
                    },
                    onRunning: async (task) => {
                        const blob = await res.blob();
                        const music = await new MusicUploadElement().init({
                            name: file.name.split('.')[0],
                            url: file.download_url,
                            blob,
                        });
                        const uploadParams = music.dump();
                        if (uploadParams.status === EN_MUSIC_LOAD_STATUS.SUCCESS) {
                            task.markSuccess(uploadParams);
                        } else {
                            task.markFailed(new Error(`文件加载失败，错误文件：${file.name}`));
                        }
                    },
                    onSuccess: async (_, res: IMusicUploadParams) => {
                        musics.push(res);
                        await LoadingHelper.setLoadingMessage(name);
                        await LoadingHelper.setLoadingProgress((curProgress += normalizeProgress));
                    },
                    onFailed: async (_, errros: ITaskError[]) => {
                        errorMsgs.push(...errros.map((error: ITaskError) => error.msg));
                        await LoadingHelper.setLoadingMessage(name);
                        await LoadingHelper.setLoadingProgress((curProgress += normalizeProgress));
                    },
                });

                return task;
            }),
            { type: EN_TASK_QUEUE_TYPE.PARALLEL },
        );

        await taskQueue.start();

        return {
            musics,
            errorMsgs,
        };
    };
}

export const MusicFetchHelper = new MusicFetchHelperImpl();
