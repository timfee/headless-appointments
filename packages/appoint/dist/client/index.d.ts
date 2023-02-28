import { PropsWithChildren, Dispatch } from 'react';

type DateInterval = {
    start: Date;
    end: Date;
};
type DateAsStringInterval = {
    start: string;
    end: string;
};

type State = {
    timeZone: string;
    date: Date;
    dialog: boolean;
    duration: number;
    availability: DateInterval[];
};
type Action = {
    type: "set_date";
    payload: Date;
} | {
    type: "set_timezone";
    payload: string;
} | {
    type: "set_dialog";
    payload: boolean;
} | {
    type: "set_duration";
    payload: number;
};
declare function AvailabilityProvider({ children, data, }: PropsWithChildren<{
    data: DateAsStringInterval[];
}>): JSX.Element;
declare function useAvailabilityContext(): {
    state: State;
    dispatch: Dispatch<Action>;
};

export { AvailabilityProvider, State, useAvailabilityContext };
