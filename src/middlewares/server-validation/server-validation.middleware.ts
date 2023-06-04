import { Injectable, NestMiddleware } from "@nestjs/common";
import { base } from "../../config";

@Injectable()
export class ServerValidationMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const allowedOrigins = [base.frontend_url];
    const origin = req.headers.origin;
    if (base.mode == "development") {
      next();
    } else {
      if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({
          success: false,
          message: "This API server can only be used by ezinstaling.lol.",
        });
      }
      res.setHeader("Access-Control-Allow-Origin", origin);
      next();
    }
  }
}
