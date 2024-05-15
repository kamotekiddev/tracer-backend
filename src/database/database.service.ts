import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }

    excludeProperties<Obj, Key extends keyof Obj>(
        obj: Obj,
        keys: Key[],
    ): Omit<Obj, Key> {
        return Object.fromEntries(
            Object.entries(obj).filter(([key]) => !keys.includes(key as Key)),
        ) as Omit<Obj, Key>;
    }
}
