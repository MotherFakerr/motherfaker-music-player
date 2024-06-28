class Sha1GeneratorImpl {
    public async blob2Sha1(blob: Blob): Promise<string> {
        const arrayBuffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const sha1 = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return sha1;
    }
}

export const Sha1Generator = new Sha1GeneratorImpl();
