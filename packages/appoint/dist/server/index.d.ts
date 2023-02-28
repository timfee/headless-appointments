import { Auth } from 'googleapis';

type DateInterval = {
    start: Date;
    end: Date;
};

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
/** Options for {@link createAvailability} */
type CreateAvailabilityProps = {
    /**
     * The start date to begin looking for availability.
     *
     * Dates in the past are automatically excluded.
     */
    start: Date;
    /**
     * The end date to stop looking for availability.
     */
    end: Date;
    /**
     * A {@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones tz database name}
     * for the timezone of the start and end dates.
     *
     * @example "America/Los_Angeles"
     */
    timeZoneOfStartAndEndTimes: string;
    /**
     * Boking criteria is relevant to computing availability.
     * In this case, we're just looking at `duration`.
     */
    bookingCriteria: {
        duration: number;
    };
    /**
     * Options that determine what availability we offer
     */
    availability?: {
        /**
         * A map of days of the week to availability slots.
         * The keys are numbers from 0-6, where 0 is Sunday and 6 is Saturday.
         *
         * The values are arrays of {@link AvailabilitySlot}
         *
         * If there's no availability provided for a given
         * day of the week, {@link fallback} will be used.
         *
         * @example { 1: [ { start: { hour: 9, minute: 0 },
         *    end: { hour: 12, minute: 0 },
         *  }, { start: { hour: 14, minute: 30 },
         *    end: { hour: 17, minute: 0 } }
         * ]
         */
        dailySlots: AvailabilityType;
        /**
         * A list of availability slots to use for any day of the week
         * that doesn't have a value in {@link dailySlots}.
         *
         * @defaultValue 09:00 - 17:00 (5 PM)
         */
        fallback?: AvailabilitySlot[];
        /**
         * If true, availability will not be offered on weekends,
         * even if {@link dailySlots} or {@link fallback} are provided.
         */
        forceExcludeWeekends?: boolean;
    };
};

type GetFreeBusyProps = {
    start: Date;
    end: Date;
} & FreeBusyProviders;
type FreeBusyProviders = {
    provider: {
        name: "google";
        OAuthClient: Auth.OAuth2ClientOptions;
        OAuthCredentials: Auth.Credentials;
    };
};

type Head<T> = T extends [infer I, ...infer _Rest] ? I : never;
type Tail<T> = T extends [infer _I, ...infer Rest] ? Rest : never;
type Zip_DeepMergeTwoTypes<T, U> = T extends [] ? U : U extends [] ? T : [
    DeepMergeTwoTypes<Head<T>, Head<U>>,
    ...Zip_DeepMergeTwoTypes<Tail<T>, Tail<U>>
];
/**
 * Take two objects T and U and create the new one with uniq keys for T a U objectI
 * helper generic for `DeepMergeTwoTypes`
 */
type GetObjDifferentKeys<T, U, T0 = Omit<T, keyof U> & Omit<U, keyof T>, T1 = {
    [K in keyof T0]: T0[K];
}> = T1;
/**
 * Take two objects T and U and create the new one with the same objects keys
 * helper generic for `DeepMergeTwoTypes`
 */
type GetObjSameKeys<T, U> = Omit<T | U, keyof GetObjDifferentKeys<T, U>>;
type MergeTwoObjects<T, U, T0 = Partial<GetObjDifferentKeys<T, U>> & {
    [K in keyof GetObjSameKeys<T, U>]: DeepMergeTwoTypes<T[K], U[K]>;
}, T1 = {
    [K in keyof T0]: T0[K];
}> = T1;
type DeepMergeTwoTypes<T, U> = [
    T,
    U
] extends [any[], any[]] ? Zip_DeepMergeTwoTypes<T, U> : [
    T,
    U
] extends [{
    [key: string]: unknown;
}, {
    [key: string]: unknown;
}] ? MergeTwoObjects<T, U> : T | U;

type AppointParams = GetFreeBusyProps & DeepMergeTwoTypes<CreateAvailabilityProps, {
    bookingCriteria: {
        padding: number;
    };
}>;
declare function getAvailability(params?: AppointParams): Promise<DateInterval[]>;

export { getAvailability as default };
