/* eslint-disable @typescript-eslint/naming-convention */
export interface IGithubFile {
    name: string;
    type: string;
    size: number;
    sha: string;
    url: string;
    git_url: string;
    html_url: string;
    download_url: string;
}

export interface IMusic extends IPureMusic {
    id: number;
}

export interface IPureMusic {
    name: string;
    url: string;
    duration: string;
    artist?: string;
    thumbUrl?: string;
    blob: Blob;
}
