import { Auth } from 'googleapis';

type AppointParams = {
    from?: Date;
    to?: Date;
    duration?: number;
    padding?: number;
    limits?: {
        daysAllowed: number[];
        calendarAllowList: string[];
        fromHour: number;
        toHour: number;
    };
    timeZone?: string;
    OAuthClient: Auth.OAuth2ClientOptions;
    OAuthCredentials: Auth.Credentials;
};
declare function Appoint(params: AppointParams): void;

export { Appoint as default };
