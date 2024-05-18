export interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        type: 'accessToken' | 'refreshToken';
        iat: number;
        exp: number;
    };
}
