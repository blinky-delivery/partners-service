import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateStoreUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    fullName: string;

    @IsString()
    phoneNumber: string;
}