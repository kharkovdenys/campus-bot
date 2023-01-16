import { createHash } from 'crypto';

export default function sha256(text: string): string {
    return createHash('sha256').update(text).digest('hex');
}