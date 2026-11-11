import { LogDataResponse, LogDataRow, Sample } from './higeco.types';

export const P_NOM = 4;
export const IRR_STD = 1000;

export interface DailyPR {
    day: string;
    eReal: number | null;
    eModule: number | null;
    pr: number | null;
}
// qui cerco di capire se e un numero usabile non "NAN o infinity ecc"
function toNumber(v: number | string | null | undefined): number | null {
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
// invece qui controlla il nome se lo trova vede se ha l'indice altrimenti null
function indexOfItem(res: LogDataResponse, name: string): number | null {
    const item = res.items.find(i => i.name === name);
    return item ? item.index : null;
}
// qui vediamo il punto data nel json e in base agli indici formattiamo i campi
export function normalize(res: LogDataResponse): Sample[] {
    const iEnergy = indexOfItem(res, 'Energia');
    const iIrr = indexOfItem(res, 'Irraggiamento');
    if (iEnergy === null || iIrr === null) return [];

    return res.data.map((row: LogDataRow) => ({
        t: new Date(row[0] * 1000),
        energy: toNumber(row[iEnergy]),
        irradiation: toNumber(row[iIrr]),
    }));
}
// qui diamo il formato iso alla data
function dayKey(t: Date): string {
    return t.toISOString().slice(0, 10);
}
// qui invece mettiamo il cassetto dove andranno i res della giornata
export function groupByDay(samples: Sample[]): Map<string, Sample[]> {
    const byDay = new Map<string, Sample[]>();

    for (const s of samples) {
        const day = dayKey(s.t);
        let bucket = byDay.get(day);
        if (!bucket) {
            bucket = [];
            byDay.set(day, bucket);
        }
        bucket.push(s);
    }
    return byDay;
}

export function eReal(samples: Sample[]): number | null {
    const values = samples
        .map(s => s.energy)
        .filter((v): v is number => v !== null);

    if (values.length < 2) return null;

    return Math.max(...values) - Math.min(...values);
}
//qui prendo tutti gli irr diversi da null > 2 poi ciclo negli elementi 
//trovo la diff di tempo attuale e successivo 
export function eModule(samples: Sample[], maxGapHours = 2): number | null {
    const usable = samples.filter(s => s.irradiation !== null);
    if (usable.length < 2) return null;

    let equivalentHours = 0;
    for (let j = 0; j < usable.length - 1; j++) {
        const dt = (usable [j + 1].t.getTime() - usable[j].t.getTime()) / 3_600_000;
        if (dt <= 0 || dt > maxGapHours) continue;
        equivalentHours += (usable[j].irradiation! / IRR_STD) * dt;
    }

    return P_NOM * equivalentHours;
}

export function prPercent(real: number | null, expected: number | null): number | null {
    if (real === null || expected === null || expected === 0) return null;
    return (real / expected) * 100;
}

export function dailyPR(samples: Sample[]): DailyPR[] {
    const out: DailyPR[] = [];
    for (const [day, daySamples] of groupByDay(samples)) {
        const real = eReal(daySamples);
        const expected = eModule(daySamples);
        out.push({ day, eReal: real, eModule: expected, pr:prPercent(real, expected), })
    }
    return out;
}

export function totalPR(samples: Sample[]): number | null {
    return prPercent(eReal(samples), eModule(samples));
}