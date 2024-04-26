/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import { action, makeObservable, observable } from 'mobx';
import { AbstractStore } from './abstract_store';
import { registerStore } from '.';

export interface ILoadingStore {
    isLoading: boolean;
    progress: number;
    message: string;
    setLoading: (loading: boolean) => void;
    setProgress: (progress: number) => void;
    setMessage: (message: string) => void;
}

@registerStore('loadingStore')
export class LoadingStore extends AbstractStore implements ILoadingStore {
    isLoading = false;

    progress = 0;

    message = '';

    constructor() {
        super();
        makeObservable(this, {
            isLoading: observable,
            progress: observable,
            message: observable,
            setLoading: action,
            setProgress: action,
            setMessage: action,
        });
    }

    setLoading(loading: boolean) {
        this.isLoading = loading;
    }

    setProgress(progress: number) {
        this.progress = progress;
    }

    setMessage(message: string) {
        this.message = message;
    }
}
