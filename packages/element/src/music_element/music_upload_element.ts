import { Sha1Generator } from '@github-music-player/core';
import { IMusicUploadParams, IMusicUploadRawParams } from './interface';
import { EN_MUSIC_LOAD_STATUS } from './music_element';
import * as musicMetadata from 'music-metadata-browser';

export class MusicUploadElement {
    private _status: EN_MUSIC_LOAD_STATUS;

    private _blob: Blob;

    private _url?: string;

    private _blobUrl: string;

    private _duration: number;

    private _name: string;

    private _format: string;

    private _artist?: string;

    private _picBlob?: Blob;

    private _sha1: string;

    init(params: IMusicUploadRawParams): Promise<this> {
        const { name, blob, url, artist, picBlob } = params;

        const nameArr = name.split('.');
        this._format = nameArr[nameArr.length - 1];
        this._name = nameArr[0];

        this._picBlob = picBlob;
        this._blob = blob;

        this._url = url;

        return new Promise(async (resolve) => {
            const audio = new Audio(this._blobUrl);
            audio.onloadedmetadata = async () => {
                this._duration = audio.duration;
                this._sha1 = await Sha1Generator.blob2Sha1(this._blob);

                const metadata = await musicMetadata.parseBlob(blob);
                const pic = metadata.common.picture?.[0];
                if (pic) {
                    this._picBlob = new Blob([pic.data], { type: pic.format });
                }
                this._artist = artist || metadata.common.artist;

                this._status = EN_MUSIC_LOAD_STATUS.SUCCESS;
                resolve(this);
            };
            audio.onerror = () => {
                this._status = EN_MUSIC_LOAD_STATUS.ERROR;
                URL.revokeObjectURL(this._blobUrl);
                resolve(this);
            };
        });
    }

    public dump(): IMusicUploadParams & { status: EN_MUSIC_LOAD_STATUS } {
        return {
            name: this._name,
            format: this._format,
            url: this._url,
            duration: this._duration,
            artist: this._artist,
            picBlob: this._picBlob,
            blob: this._blob,
            sha1: this._sha1,
            status: this._status,
        };
    }
}
