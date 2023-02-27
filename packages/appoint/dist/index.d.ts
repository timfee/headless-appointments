import { Auth } from 'googleapis';

type AvailabilitySlot = {
    start: {
        hour: number;
        minute: number;
    };
    end: {
        hour: number;
        minute: number;
    };
};
type AvailabilityType = {
    [key: number]: AvailabilitySlot[];
};

type Event = {
    start: Date;
    end: Date;
};
type AppointParams = {
    start?: Date;
    end?: Date;
    duration?: number;
    padding?: number;
    availability?: {
        configuration?: {
            dailyAvailability: AvailabilityType;
            fallback: AvailabilitySlot[];
        };
    };
    ownerTimezone?: string;
    OAuthClient: Auth.OAuth2ClientOptions;
    OAuthCredentials: Auth.Credentials;
};
declare function Appoint(params?: AppointParams): Promise<Event[]>;

export { Appoint as default };
