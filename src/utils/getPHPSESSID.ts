import { User } from '../interfaces';

export async function getPHPSESSID(user: User): Promise<string> {
    try {
        const response = await fetch("https://campus.kpi.ua/auth.php", {
            method: 'GET',
            redirect: 'manual',
            headers: {
                'Cookie': `token=${user.token};SID=${user.SID};`,
            },
        });

        if (response.status !== 302) {
            throw new Error('Не вдалося отримати ідентифікатор сеансу');
        }

        const cookies = response.headers.get('set-cookie');
        if (!cookies) throw new Error('Не вдалося отримати ідентифікатор сеансу');

        const phpSessIdMatch = cookies.split(', ');
        if (!phpSessIdMatch) throw new Error('Не вдалося отримати ідентифікатор сеансу');

        return phpSessIdMatch[1].substring(10, 36);
    } catch (error) {
        throw error;
    }
}
