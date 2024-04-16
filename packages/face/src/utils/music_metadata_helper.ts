import { IGithubFile, IMusic, IPureMusic } from './interface';
import { MusicIndexDBHelper } from './music_indexdb_helper';

export async function getMusicMetadata(githubFiles: IGithubFile[]): Promise<IMusic[]> {
    const res = await Promise.all(
        githubFiles.map(async (file) => {
            try {
                const filePath = file.download_url;
                const res = await fetch(filePath);

                // 检查响应状态码，如果不是200则抛出异常
                if (!res.ok) {
                    throw new Error(`Fetch failed with status ${res.status}`);
                }

                const blob = await res.blob();
                const duration = await getMusicDuration(blob);
                return { bSuccess: true, data: { name: file.name, url: file.download_url, duration, blob } };
            } catch (error: ANY) {
                // 处理fetch错误
                console.error('Fetch error:', error);
                // 返回一个包含错误信息的对象，或者根据需要返回其他值
                return { bSuccess: false };
            }
        }),
    );
    return res.filter((item) => item.bSuccess).map((item) => item.data) as IMusic[];
}

export async function getMusicDuration(music: Blob): Promise<string> {
    return new Promise((resolve) => {
        const audio = new Audio(URL.createObjectURL(music));
        audio.addEventListener('loadedmetadata', () => {
            resolve(formatTime(audio.duration));
        });
    });
}

export async function saveMusics(musics: IPureMusic[]): Promise<IMusic[]> {
    // TODO: 保存音乐到本地
    const res = await MusicIndexDBHelper.addMusics(musics);
    return res;
}

export function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
