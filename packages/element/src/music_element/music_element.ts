import { TimeFormatter } from '@github-music-player/core';
import { Sha1Generator } from '@github-music-player/core/src/utils/sha1_generator';
import { Player } from '../player_element';
import { IMusicElement, IMusicEntity } from './interface';

export interface IMusicInitParams {
    name: string;
    format?: string;
    blob: Blob;
    url?: string;
    sha1?: string;
    artist?: string;
    thumbUrl?: string;
    duration?: number;
}

export enum EN_MUSIC_LOAD_STATUS {
    SUCCESS,
    ERROR,
}

export class MusicElement implements IMusicElement {
    private _status: EN_MUSIC_LOAD_STATUS;

    private _blob: Blob;

    private _url?: string;

    private _blobUrl: string;

    private _duration: number;

    private _name: string;

    private _format: string;

    private _artist?: string;

    private _thumbUrl?: string;

    private _sha1: string;

    init(params: IMusicInitParams): Promise<this> {
        const { name, format, blob, url, sha1, artist, thumbUrl, duration } = params;

        const nameArr = name.split('.');
        this._format = format || nameArr[nameArr.length - 1];
        this._name = nameArr[0];

        this._artist = artist;
        this._thumbUrl = thumbUrl;
        if (blob) {
            this._blob = blob;
            this._blobUrl = URL.createObjectURL(blob);
        }
        this._url = url;

        return new Promise((resolve) => {
            const audio = new Audio(this._blobUrl);
            audio.onloadedmetadata = async () => {
                this._duration = duration || audio.duration;
                this._sha1 = sha1 || (await Sha1Generator.blob2Sha1(this._blob));
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

    public get status(): EN_MUSIC_LOAD_STATUS {
        return this._status;
    }

    public get name(): string {
        return this._name;
    }

    public get format(): string {
        return this._format;
    }

    public get url(): string | undefined {
        return this._url;
    }

    public get blobUrl(): string {
        return this._blobUrl;
    }

    public get duration(): number {
        return this._duration;
    }

    public get artist(): string | undefined {
        return this._artist;
    }

    public get thumbUrl(): string | undefined {
        return this._thumbUrl;
    }

    public get sha1(): string {
        return this._sha1;
    }

    public getDurationString(): string {
        return TimeFormatter.format(this._duration);
    }

    public play(): void {
        Player.getInstance().playMusic(this);
    }

    public dump(): IMusicEntity {
        return {
            name: this.name,
            url: this.url,
            duration: this.duration,
            artist: this.artist,
            thumbUrl: this.thumbUrl,
            blob: this._blob,
            sha1: this.sha1,
        };
    }
}
