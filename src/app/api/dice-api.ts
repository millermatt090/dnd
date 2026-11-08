import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { Die, RollMode } from "../dice";
import { RollResponse } from "../rolls/roll-response";
import { RollResult } from "../rolls/roll-result";

/**
 * Talks to the backend roll endpoint.
 */
@Injectable({ providedIn: "root" })
export class DiceApi {
    private readonly http = inject(HttpClient);

    async roll(dice: readonly Die[], mode: RollMode = "normal"): Promise<RollResult> {
        let params = new HttpParams({ fromObject: { dice: [...dice] } });
        if (mode !== "normal") {
            params = params.set("mode", mode);
        }

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
