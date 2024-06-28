import { IMusicElement } from '../music_element/interface';

export interface IPlayer {
    play(): void;
    pause(): void;
    playMusic(music: IMusicElement): void;
}
