import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';

interface UpdateAvailabilityParams {
    siteId: string
    availabilities: {
        storeSiteId: string
        dayOfWeek: number
        timeRangeIndex: number
        openTime: string
        closTime: string

    }[]
}

@Injectable()
export class AvailabilityService {
    private readonly logger = new Logger(AvailabilityService.name)

    constructor(
        private readonly drizzleService: DrizzleService,
    ) { }


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


    async updateSiteAvailability(params: UpdateAvailabilityParams) {
        try {
            await this.drizzleService.partnersDb.transaction(async (tx) => {
                try {
                    await tx.delete(partnersSchema.storeAvailability)
                        .where(eq(partnersSchema.storeAvailability.storeSiteId, params.siteId))

                    for (const availability of params.availabilities) {
                        await tx.insert(partnersSchema.storeAvailability).values({
                            storeSiteId: params.siteId,
                            dayOfWeek: availability.dayOfWeek,
                            timeRangeIndex: availability.timeRangeIndex,
                            openTime: availability.openTime,
                            closTime: availability.closTime,
                        })
                    }

                } catch (error) {
                    tx.rollback()
                    throw error
                }
            })


        } catch (error) {
            this.logger.error(`Error updating site availability: ${error}`)
            throw new InternalServerErrorException(error)
        }
    }


}
