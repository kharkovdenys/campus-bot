import { createHash } from 'crypto';

export default function hash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
}