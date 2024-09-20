import { User } from "next-auth";

// Extend the JWT interface to include a userId property
declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
  }
}

// Extend the Session interface to include a user id property
declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
    };
  }
}
