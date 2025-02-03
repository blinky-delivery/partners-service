import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';

interface UpdateAvailabilityParams {
    siteId: string
    availabilities: {
        id?: string
        storeSiteId: string
        dayOfWeek: number
        timeRangeIndex: number
        openTime: string
        closTime: string

    }[]
}

@Injectable()
export class AvailabilityService {

    constructor(
        private readonly drizzleService: DrizzleService,
    ) { }


    async createDefaultSiteAvailability(siteId: string) {
        await this.drizzleService.partnersDb.transaction(async (tx) => {
            try {
                for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
                    await tx
                        .insert(partnersSchema.storeAvailability)
                        .values({
                            storeSiteId: siteId,
                            dayOfWeek: dayOfWeek,
                            timeRangeIndex: 1,
                        })
                }
            } catch (error) {
                tx.rollback()
            }
        })
    }

    //TODO: It better to group the result by the day of week
    async getStoreSiteAvailability(siteId: string) {
        try {
            const availabilities = await this.drizzleService.partnersDb
                .query
                .storeAvailability
                .findMany({
                    where: (fields, { eq }) => eq(fields.storeSiteId, siteId),
                    orderBy: (fields, { asc }) => asc(fields.dayOfWeek),
                })

            return availabilities
        } catch (error) {

        }
    }



}
