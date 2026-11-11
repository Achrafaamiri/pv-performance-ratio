import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { LogDataResponse } from './higeco.types';

export interface AuthResponse { token: string; }

const PLANT_ID = 365;
const DEVICE_ID = '1560UMGGI9F3';
const LOG_ID = 1042127;
const FROM = 1789689600;
const TO = 1790377200;

@Injectable({ providedIn: 'root' })
export class HigecoService {
    private http = inject(HttpClient);
    private base = 'https://testing.higeco.com/api/v2';

    authenticate(apiToken: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.base}/authenticate`, { apiToken });
    }

    loadLogData(apiToken: string, from = FROM, to = TO): Observable<LogDataResponse> {
        return this.authenticate(apiToken).pipe(
            switchMap(auth =>
                this.http.get<LogDataResponse>(
                    `${this.base}/getLogData/${PLANT_ID}/${DEVICE_ID}/${LOG_ID}/`,
                    {
                        headers: { authorization: auth.token },
                        params: { from, to, samplingTime: 3600 },
                    },
                ),
            ),
        );
    }
}