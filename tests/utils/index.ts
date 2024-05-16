// import { DataSource } from 'typeorm';

// export const truncateTables = async (connection: DataSource) => {
//     const entities = connection.entityMetadatas;

//     for (const entity of entities) {
//         const repository = connection.getRepository(entity.name);
//         await repository.clear();
//     }
// };

export function extractTokenFromCookie(
    cookies: string[],
    tokenName: string,
): string | null {
    const tokenCookie = cookies.find((cookie) =>
        cookie.startsWith(`${tokenName}=`),
    );
    if (tokenCookie) {
        const tokenValue = tokenCookie.split(';')[0].split('=')[1];
        return tokenValue;
    }
    return null;
}

export const isValidJwt = (token: string | null): boolean => {
    if (token === null) {
        return false;
    }
    const cookieParts = token.split('.');
    if (cookieParts.length !== 3) {
        return false;
    }
    try {
        cookieParts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8');
        });
        return true;
    } catch (err) {
        return false;
    }
};
