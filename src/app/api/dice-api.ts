import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { Die } from "../dice";
import { RollResponse } from "../rolls/roll-response";
import { RollResult } from "../rolls/roll-result";

/**
 * Talks to the backend roll endpoint.
 */
@Injectable({ providedIn: "root" })
export class DiceApi {
    private readonly http = inject(HttpClient);

    async roll(dice: readonly Die[]): Promise<RollResult> {
        const params = new HttpParams({ fromObject: { dice: [...dice] } });

        try {
            const response = await firstValueFrom(this.http.get<RollResponse>("/api/roll", { params }));
            return new RollResult(response);
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                throw new Error(`Roll failed (${error.status})`);
            }
            throw error;
        }
    }
}
