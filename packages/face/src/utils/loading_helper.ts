import { store } from '../store';
import { ILoadingStore } from '../store/loading_store';
import { sleep } from './common_util';

class LoadingHelperImpl {
    private get _store(): ILoadingStore {
        return store.loadingStore as ILoadingStore;
    }

    async setLoading(isLoading: boolean): Promise<void> {
        this._store.setLoading(isLoading);
        if (!isLoading) {
            this.setLoadingProgress(0);
            this.setLoadingMessage('');
        }
        await sleep(0);
    }

    async setLoadingProgress(progress: number): Promise<void> {
        this._store.setProgress(progress);
        await sleep(0);
    }

    async setLoadingMessage(message: string): Promise<void> {
        this._store.setMessage(message);
        await sleep(0);
    }
}

export const LoadingHelper = new LoadingHelperImpl();
