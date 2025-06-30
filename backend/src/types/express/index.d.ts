// types/express/index.d.ts
import { UserDocument } from "../../src/models/user.model"; // adjust path as needed

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
        }
    }
}
