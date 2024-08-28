import { IMusicEntity } from '@github-music-player/element';

/* eslint-disable @typescript-eslint/naming-convention */
export interface IMusicFetchParams {
    name: string;
    url: string;
    etag?: string;
}

export interface IMusic extends IMusicEntity {
    id: number;
    blobUrl?: string;
}
