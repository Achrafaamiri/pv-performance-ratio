export interface Plant { id: number; name: string; }
export type LogDataRow = [number, ...(number | string | null)[]];

export interface LogItem {
    name: string;
    unit: string;
    id: number;
    index: number;
}

export interface LogDataResponse {
    log: { id: number; name: string };
    items: LogItem[];
    data: LogDataRow[];
}

export interface Sample {
    t: Date;
    energy: number | null;
    irradiation: number | null;
}