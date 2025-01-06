export interface StoreApplication {
    id: string;
    user_id: string;
    store_type_id: number;
    city_id: number;
    name: string;
    contact_phone: string;
    number_of_sites: number;
    address: string;
    id_card_front: string;
    id_card_back: string;
    store_image: string;
    under_review: boolean;
    approved: boolean;
}

export interface DirectusSchema {
    store_applications: StoreApplication[];
}