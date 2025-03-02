import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { FirebaseService } from "./firebase/firebase.service";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(private firebaseService: FirebaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request);
    }

    async validateRequest(req: any): Promise<boolean> {
        const token = req.headers.authorization;
        console.log(req.headers.authorization);

        if (token != null && token != '') {
            try {
                const decodedToken = await this.firebaseService.defaultApp
                    .auth()
                    .verifyIdToken(token.replace('Bearer ', ''));

                console.log(decodedToken);

                const user = {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                };
                req.user = user;
            } catch (_) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    }
}