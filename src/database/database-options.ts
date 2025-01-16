
export interface DatabaseInstanceOptions {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export interface DatabaseOptions {
    partnersDatabase: DatabaseInstanceOptions
    customersDatabase: DatabaseInstanceOptions
}