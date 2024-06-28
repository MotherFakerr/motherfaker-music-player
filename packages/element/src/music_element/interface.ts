import { EN_MUSIC_LOAD_STATUS } from './music_element';

export interface IMusicElement {
    play(): void;
    getDurationString(): string;
    status: EN_MUSIC_LOAD_STATUS;
    name: string;
    format: string;
    url: string | undefined;
    blobUrl: string;
    duration: number;
    artist: string | undefined;
    thumbUrl: string | undefined;
    sha1: string;
}

export interface IMusicEntity {
    name: string;
    url?: string;
    duration: number;
    artist?: string;
    thumbUrl?: string;
    blob: Blob;
    sha1: string;
}
