import { JwtPayload } from "./lib/jwt";

// Augment Express's Request.user to match our JwtPayload
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
