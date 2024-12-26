export enum UserRole {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    DELIVERY = 'DELIVERY',
}

export type RequestUser = {
    clerkId: string;
};