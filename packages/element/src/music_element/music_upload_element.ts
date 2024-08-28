import { IMusicUploadParams, IMusicUploadRawParams } from './interface';
import { EN_MUSIC_LOAD_STATUS } from './music_element';
import * as musicMetadata from 'music-metadata-browser';

export class MusicUploadElement {
    private _status: EN_MUSIC_LOAD_STATUS;

    private _blob: Blob;

    private _url?: string;

    private _duration: number;

    private _name: string;

    private _format: string;

    private _artist?: string;

    private _picBlob?: Blob;

    private _etag?: string;

    init(params: IMusicUploadRawParams): Promise<this> {
        const { name, blob, url, artist, picBlob, etag } = params;

        const nameArr = name.split('.');
        this._format = nameArr[nameArr.length - 1];
        this._name = nameArr[0];

        this._picBlob = picBlob;
        this._blob = blob;
        const blobUrl = URL.createObjectURL(blob);

        this._url = url;
        this._etag = etag;

        return new Promise(async (resolve) => {
            const audio = new Audio(blobUrl);
            audio.onloadeddata = async () => {
                this._duration = audio.duration;
                const metadata = await musicMetadata.parseBlob(blob);
                const pic = metadata.common.picture?.[0];
                if (pic) {
                    this._picBlob = new Blob([pic.data], { type: pic.format });
                }
                this._artist = artist || metadata.common.artist || 'Unknown';

                this._status = EN_MUSIC_LOAD_STATUS.SUCCESS;
                resolve(this);
            };
            audio.onerror = () => {
                this._status = EN_MUSIC_LOAD_STATUS.ERROR;
                URL.revokeObjectURL(blobUrl);
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
            status: this._status,
            etag: this._etag,
        };
    }
}
