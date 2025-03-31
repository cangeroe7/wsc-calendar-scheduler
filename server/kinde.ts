import {
    createKindeServerClient,
    GrantType,
} from "@kinde-oss/kinde-typescript-sdk";
import type { SessionManager, UserType } from "@kinde-oss/kinde-typescript-sdk";
import { z } from "zod";
import { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

const KindeEnv = z.object({
    KINDE_DOMAIN: z.string(),
    KINDE_CLIENT_ID: z.string(),
    KINDE_CLIENT_SECRET: z.string(),
    KINDE_REDIRECT_URI: z.string().url(),
    KINDE_LOGOUT_REDIRECT_URI: z.string().url(),
});

const ProcessEnv = KindeEnv.parse(process.env);

// Client for authorization code flow
export const kindeClient = createKindeServerClient(
    GrantType.AUTHORIZATION_CODE,
    {
        authDomain: ProcessEnv.KINDE_DOMAIN,
        clientId: ProcessEnv.KINDE_CLIENT_ID,
        clientSecret: ProcessEnv.KINDE_CLIENT_SECRET,
        redirectURL: ProcessEnv.KINDE_REDIRECT_URI,
        logoutRedirectURL: ProcessEnv.KINDE_LOGOUT_REDIRECT_URI,
    },
);

export const sessionManager = (c: Context): SessionManager => ({
    async getSessionItem(key: string) {
        const result = getCookie(c, key);
        return result;
    },
    async setSessionItem(key: string, value: unknown) {
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
        } as const;
        if (typeof value === "string") {
            setCookie(c, key, value, cookieOptions);
        } else {
            setCookie(c, key, JSON.stringify(value), cookieOptions);
        }
    },
    async removeSessionItem(key) {
        deleteCookie(c, key);
    },
    async destroySession() {
        ["id_token", "access_token", "user", "refresh_token"].forEach((key) => {
            deleteCookie(c, key);
        });
    },
});

type Env = {
    Variables: {
        user: UserType;
    };
};

export const getUser = createMiddleware<Env>(async (c, next) => {
    try {
        const manager = sessionManager(c);
        const isAuthenticated = await kindeClient.isAuthenticated(manager);
        if (!isAuthenticated) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        const user = await kindeClient.getUserProfile(manager);
        if (!user.email.endsWith("@wsc.edu")) {
            return c.json({ error: "Unauthorizedd email domain" }, 401);
        }
        c.set("user", user);
        await next();
    } catch (error) {
        console.error(error);
        return c.json({ error: "Unauthorized" }, 401);
    }
});

export const validateEmailDomain = createMiddleware<Env>(async (c, next) => {
    try {
        const manager = sessionManager(c);
        const user = await kindeClient.getUserProfile(manager);

        if (!user.email?.endsWith("@wsc.edu")) {
            return c.json({ error: "Only wayne state college emails register" }, 403);
        }
        await next();
    } catch (error) {
        console.error(error);
        return c.json({ error: "Unauthorized" }, 401);
    }
});
