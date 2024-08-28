/* eslint-disable no-await-in-loop */
import { MusicIndexDBHelper } from './indexdb_utils/music_indexdb_helper';
import { IMusicFetchParams } from './interface';
import { EN_TASK_QUEUE_TYPE, EN_TASK_STATUS, ITaskError, Task, TaskQueue } from '@github-music-player/core';
import { EN_MUSIC_LOAD_STATUS, IMusicUploadParams, MusicUploadElement } from '@github-music-player/element';
import { NetServiceUtil } from './net_service_util';

export class MusicFetchHelperImpl {
    checkMusicFormat(type: string): boolean {
        const types = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
        return types.includes(type);
    }

    fetchMusicByUrl = async (
        url: string,
        updateProgressCB?: (progress: number) => Promise<void>,
        updateMessageCB?: (message: string) => Promise<void>,
    ): Promise<{ musics: IMusicUploadParams[]; errorMsgs: string[] }> => {
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

            const musicRes = await this._downloadMusics([{ name: name + '.' + type, url }], updateProgressCB, updateMessageCB);
            return musicRes;
        } catch (error) {
            return {
                musics: [],
                errorMsgs: ['输入的地址不合法'],
            };
        }
    };

    fetchAIMusics = async (
        updateProgressCB?: (progress: number) => Promise<void>,
        updateMessageCB?: (message: string) => Promise<void>,
    ): Promise<{ musics: IMusicUploadParams[]; errorMsgs: string[] }> => {
        try {
            const url = '/fetchMusics';
            const res = await fetch(`${NetServiceUtil.backendPrefix}${url}`);
            if (!res.ok) {
                return {
                    musics: [],
                    errorMsgs: [res.statusText],
                };
            }

            const allMusics = await MusicIndexDBHelper.getMusics();
            const etagSet = new Set(allMusics.map((music) => music.etag));

            const fetchMusics = (await res.json()) as IMusicFetchParams[];
            const filteredFetchMusics = fetchMusics
                .filter(({ etag }) => etag && !etagSet.has(etag))
                .map((music) => ({ ...music, url: `${NetServiceUtil.ossPrefix}${music.url}` }));

            const { musics, errorMsgs } = await this._downloadMusics(filteredFetchMusics, updateProgressCB, updateMessageCB);
            return {
                musics,
                errorMsgs,
            };
        } catch (error) {
            return {
                musics: [],
                errorMsgs: ['获取音乐列表失败'],
            };
        }
    };

    uploadLocalMusic = async (
        files: File[],
        updateProgressCB?: (progress: number) => Promise<void>,
        updateMessageCB?: (message: string) => Promise<void>,
    ): Promise<{ musics: IMusicUploadParams[]; errorMsgs: string[] }> => {
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
                        updateMessageCB && (await updateMessageCB(name));
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
                        updateProgressCB && (await updateProgressCB((curProgress += normalizeProgress)));
                    },
                    onFailed: async (_, errros: ITaskError[]) => {
                        errorMsgs.push(...errros.map((error: ITaskError) => error.msg));
                        updateProgressCB && (await updateProgressCB((curProgress += normalizeProgress)));
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

    private _downloadMusics = async (
        fetchMusics: IMusicFetchParams[],
        updateProgressCB?: (progress: number) => Promise<void>,
        updateMessageCB?: (message: string) => Promise<void>,
    ): Promise<{ musics: IMusicUploadParams[]; errorMsgs: string[] }> => {
        const normalizeProgress = 1 / fetchMusics.length;
        let curProgress = 0;
        const musics: IMusicUploadParams[] = [];
        const errorMsgs: string[] = [];

        const taskQueue = new TaskQueue(
            fetchMusics.map((fetchMusic) => {
                const nameArr = fetchMusic.name.split('.');
                const name = nameArr.slice(0, nameArr.length - 1).join('.');
                const format = nameArr[nameArr.length - 1];

                let res: Response;

                const task = new Task<IMusicUploadParams>({
                    onPending: async (task) => {
                        if (!this.checkMusicFormat(format)) {
                            task.markFailed(new Error(`${format}格式不支持，错误文件：${fetchMusic.name}`));
                            return;
                        }

                        const filePath = fetchMusic.url;
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
                            name: fetchMusic.name.split('.')[0],
                            url: fetchMusic.url,
                            blob,
                            etag: fetchMusic.etag,
                        });
                        const uploadParams = music.dump();
                        if (uploadParams.status === EN_MUSIC_LOAD_STATUS.SUCCESS) {
                            task.markSuccess(uploadParams);
                        } else {
                            task.markFailed(new Error(`文件加载失败，错误文件：${fetchMusic.name}`));
                        }
                    },
                    onSuccess: async (_, res: IMusicUploadParams) => {
                        musics.push(res);
                        updateMessageCB && (await updateMessageCB(name));
                        updateProgressCB && (await updateProgressCB((curProgress += normalizeProgress)));
                    },
                    onFailed: async (_, errros: ITaskError[]) => {
                        errorMsgs.push(...errros.map((error: ITaskError) => error.msg));
                        updateMessageCB && (await updateMessageCB(name));
                        updateProgressCB && (await updateProgressCB((curProgress += normalizeProgress)));
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
