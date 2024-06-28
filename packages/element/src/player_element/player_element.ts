import { IMusicElement } from '../music_element/interface';
import { IPlayer } from './interface';

export class Player implements IPlayer {
    private static _instance: Player;

    public static getInstance() {
        if (!this._instance) {
            this._instance = new Player();
        }
        return this._instance;
    }

    private _player: HTMLAudioElement;

    constructor() {
        this._player = new HTMLAudioElement();
        // document.body.appendChild(this._player);
    }

    public play() {
        this._player.play();
    }

    public pause() {
        this._player.pause();
    }

    public playMusic(music: IMusicElement) {
        this._player.src = music.blobUrl;
        this.play();
    }
}
