import { types as t } from '@namcbugdb/common';
import { UserObj, DBReturnType } from '../types';
export declare function loggedInGate(user: UserObj): void;
export declare function limitOffsetCheck(limit: number, limitMax: number, offset: number): void;
export declare function createPagination<T>(data: DBReturnType, limit?: number, offset?: number): t.PaginatedRecords<T>;
export declare function checkExclusiveFilter(args: Partial<t.QueryFilter>, requireOne?: boolean): void;
