import { createHash } from 'crypto';

export function sha256(text: string): string {
    const hash = createHash('sha256');
    return hash.update(text).digest('hex');
}
