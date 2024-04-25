import { sleep } from './common_util';
import { IMusicFile, IPureMusic } from './interface';
import { LoadingHelper } from './loading_helper';

class MusicMetadataHelperImpl {
    checkMusicType(type: string): boolean {
        const types = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
        return types.includes(type);
    }

    async getMusicMetadata(
        files: IMusicFile[],
        onLoadSuccess?: (data: IPureMusic) => void,
        onLoadError?: (error: Error, data: IMusicFile) => void,
    ): Promise<IPureMusic[]> {
        const count = files.length;
        let finishedCount = 0;
        const res = await Promise.all(
            files.map(async (file) => {
                try {
                    const filePath = file.download_url;
                    const res = await fetch(filePath);

                    // 检查响应状态码，如果不是200则抛出异常
                    if (!res.ok) {
                        throw new Error(`Fetch failed with status ${res.status}`);
                    }

                    const blob = await res.blob();
                    const duration = await this.getMusicDuration(blob);
                    const sha1 = await this.getMusicSha1(blob);
                    return {
                        bSuccess: true,
                        data: { name: file.name.split('.')[0], author: 'unknown', url: file.download_url, duration, blob, sha1 },
                    };
                } catch (error: ANY) {
                    // 处理fetch错误
                    console.error('Fetch error:', error);
                    // 返回一个包含错误信息的对象，或者根据需要返回其他值
                    return { bSuccess: false };
                } finally {
                    finishedCount++;
                    LoadingHelper.setLoadingProgress(finishedCount / count);
                    LoadingHelper.setLoadingMessage(file.name);
                    await sleep(100);
                }
            }),
        );
        return res.filter((item) => item.bSuccess).map((item) => item.data) as IPureMusic[];
    }

    async getMusicSha1(music: Blob): Promise<string> {
        const arrayBuffer = await music.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const sha1 = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return sha1;
    }

    async getMusicDuration(music: Blob): Promise<string> {
        return new Promise((resolve) => {
            const audio = new Audio(URL.createObjectURL(music));
            audio.addEventListener('loadedmetadata', () => {
                resolve(this.formatTime(audio.duration));
            });
        });
    }

    formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    }
}

export const MusicMetadataHelper = new MusicMetadataHelperImpl();
