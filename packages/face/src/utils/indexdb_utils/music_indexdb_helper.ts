import { IndexDBHelper } from './indexdb_helper';
import { IMusic } from '../interface';
import { IMusicUploadParams } from '@github-music-player/element';

class MusicIndexDBHelperImpl {
    #dbName = 'github-music-player-db';

    #storeName = 'music';

    private _db: IDBDatabase;

    public get isOk(): boolean {
        return this._db !== undefined;
    }

    public async init(): Promise<void> {
        const db = await IndexDBHelper.createDB(this.#dbName, (event: ANY) => {
            const db = event.target.result as IDBDatabase;
            db.createObjectStore(this.#storeName, { keyPath: 'id', autoIncrement: true });
        });
        this._db = db;
    }

    public addMusics(musics: IMusicUploadParams[]): Promise<IMusic[]> {
        return new Promise<IMusic[]>((resolve, reject) => {
            const res: IMusic[] = [];
            const transaction = this._db.transaction([this.#storeName], 'readwrite');
            transaction.oncomplete = (event) => {
                console.log('全部完成了！');
                resolve(res);
            };

            transaction.onerror = (event: ANY) => {
                // 不要忘记错误处理！
                reject(event.target.error);
            };

            const objectStore = transaction.objectStore(this.#storeName);
            musics.forEach((music) => {
                const request = objectStore.add(music);
                request.onsuccess = (event: ANY) => {
                    res.push({ ...music, id: event.target.result });
                };
            });
        });
    }

    public deleteMusics(ids: number[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const transaction = this._db.transaction([this.#storeName], 'readwrite');
            transaction.oncomplete = (event) => {
                console.log('全部完成了！');
                resolve();
            };

            transaction.onerror = (event: ANY) => {
                // 不要忘记错误处理！
                reject(event.target.error);
            };

            const objectStore = transaction.objectStore(this.#storeName);
            ids.forEach((id) => {
                objectStore.delete(id);
            });
        });
    }

    public getMusics(): Promise<IMusic[]> {
        return new Promise<IMusic[]>((resolve, reject) => {
            const res: IMusic[] = [];
            const transaction = this._db.transaction([this.#storeName], 'readonly');
            transaction.oncomplete = (event) => {
                console.log('全部完成了！');
                resolve(res);
            };

            transaction.onerror = (event: ANY) => {
                // 不要忘记错误处理！
                reject(event.target.error);
            };

            const objectStore = transaction.objectStore(this.#storeName);
            objectStore.openCursor().onsuccess = (event: ANY) => {
                const cursor = event.target.result;
                if (cursor) {
                    const music = cursor.value as IMusic;
                    res.push(music);
                    cursor.continue();
                }
            };
        });
    }
}

export const MusicIndexDBHelper = new MusicIndexDBHelperImpl();
