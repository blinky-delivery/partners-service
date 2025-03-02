export interface CreateCustomerDto {
    extAuthId: string
    username: string
    email: string
    phoneNumber: string | null
    avatar: string | null
    fcmToken: string | null
}

export interface UpdateCustomerDto {
    username: string
    phoneNumber: string | null
    avatar: string | null
    fcmToken: string | null
}
