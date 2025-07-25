// types/express/express.d.ts
import { IUser } from "../models/user.model.ts";

declare global {
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Request {
            user?: IUser;
        }
    }
}
export {};