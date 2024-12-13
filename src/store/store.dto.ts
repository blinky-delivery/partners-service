import { CreateStoreUserDto } from "src/store-users/store-users.dto"

export class SignupStoreDto {
    user: CreateStoreUserDto
    name: string
    contactPhone: string
    numberOfSites: number
    storeType: number
    city: number
    address: string
}