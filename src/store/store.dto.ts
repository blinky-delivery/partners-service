import { SigupUserDto } from "src/users/users.dto"

export class SignupStoreDto {
    user: SigupUserDto
    name: string
    contactPhone: string
    numberOfSites: number
    storeType: number
    city: number
    address: string
}