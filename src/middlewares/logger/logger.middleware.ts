import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl } = request;

    response.on("finish", () => {
      const { statusCode } = response;
      const ip =
        request.headers["x-forwarded-for"] || request.socket.remoteAddress;
      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${ip}`);
    });

    next();
  }
}
