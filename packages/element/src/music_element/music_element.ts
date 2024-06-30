import { TimeFormatter } from '@github-music-player/core';
import { Player } from '../player_element';
import { IMusicElement, IMusicEntity } from './interface';

export enum EN_MUSIC_LOAD_STATUS {
    SUCCESS,
    ERROR,
}

export class MusicElement implements IMusicElement {
    private _id: number;

    private _status: EN_MUSIC_LOAD_STATUS;

    private _blob: Blob;

    private _blobUrl: string;

    private _url?: string;

    private _duration: number;

    private _name: string;

    private _format: string;

    private _artist?: string;

    private _picBlob?: Blob;

    private _picBlobUrl?: string;

    private _sha1: string;

    init(params: IMusicEntity): this {
        const { id, name, format, blob, url, sha1, artist, picBlob, duration } = params;

        this._id = id;
        const nameArr = name.split('.');
        this._format = format || nameArr[nameArr.length - 1];
        this._name = nameArr[0];

        this._artist = artist;
        this._picBlob = picBlob;
        if (picBlob) {
            this._picBlobUrl = URL.createObjectURL(picBlob);
        }

        this._blob = blob;
        this._blobUrl = URL.createObjectURL(blob);

        this._url = url;
        this._duration = duration;
        this._sha1 = sha1;
        return this;
    }

    public get id(): number {
        return this._id;
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

    public get picBlob(): Blob | undefined {
        return this._picBlob;
    }

    public get picBlobUrl(): string | undefined {
        return this._picBlobUrl;
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
            id: this._id,
            name: this.name,
            format: this.format,
            url: this.url,
            duration: this.duration,
            artist: this.artist,
            picBlob: this.picBlob,
            blob: this._blob,
            sha1: this.sha1,
        };
    }
}
