type DateInterval = {
    start: Date;
    end: Date;
};
type DateAsStringInterval = {
    start: string;
    end: string;
};
declare function mapStringsToDates(slots: DateAsStringInterval[]): DateInterval[];
declare function mapDatesToStrings(slots: DateInterval[]): DateAsStringInterval[];

export { DateAsStringInterval, DateInterval, mapDatesToStrings, mapStringsToDates };
