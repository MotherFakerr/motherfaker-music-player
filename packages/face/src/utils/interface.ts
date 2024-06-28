import { IMusicEntity } from '@github-music-player/element';

/* eslint-disable @typescript-eslint/naming-convention */
export interface IMusicFile {
    name: string;
    download_url: string;
}

export interface IMusic extends IMusicEntity {
    id: number;
    blobUrl?: string;
}

export interface IPureMusic {
    name: string;
    url: string;
    duration: string;
    artist?: string;
    thumbUrl?: string;
    blob: Blob;
    sha1: string;
}
