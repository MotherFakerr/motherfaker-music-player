import { store } from '../store';
import { ILoadingStore } from '../store/loading_store';

class LoadingHelperImpl {
    private get _store(): ILoadingStore {
        return store.loadingStore as ILoadingStore;
    }

    setLoading(isLoading: boolean): void {
        this._store.setLoading(isLoading);
        if (!isLoading) {
            this.setLoadingProgress(0);
            this.setLoadingMessage('');
        }
    }

    setLoadingProgress(progress: number): void {
        this._store.setProgress(progress);
    }

    setLoadingMessage(message: string): void {
        this._store.setMessage(message);
    }
}

export const LoadingHelper = new LoadingHelperImpl();
