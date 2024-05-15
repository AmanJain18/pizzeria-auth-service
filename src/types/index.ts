import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface LoginUserRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
        iss?: string;
    };
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface RevokedRefreshTokenPayload {
    id: string;
}

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}

export interface IUpdateUserByAdmin {
    firstName: string;
    lastName: string;
    email: string;
    tenantId?: string;
    role: string;
}
