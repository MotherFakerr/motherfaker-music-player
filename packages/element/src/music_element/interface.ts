import { EN_MUSIC_LOAD_STATUS } from './music_element';

export interface IMusicElement {
    play(): void;
    getDurationString(): string;
    dump(): IMusicEntity;
    id: number;
    status: EN_MUSIC_LOAD_STATUS;
    name: string;
    format: string;
    url?: string;
    blobUrl: string;
    duration: number;
    artist?: string;
    picBlob?: Blob;
    picBlobUrl?: string;
    sha1: string;
}

export interface IMusicEntity extends IMusicUploadParams {
    id: number;
}

export interface IMusicUploadParams extends IMusicUploadRawParams {
    format?: string;
    duration: number;
    sha1: string;
}

export interface IMusicUploadRawParams {
    name: string;
    url?: string;
    artist?: string;
    picBlob?: Blob;
    blob: Blob;
}
