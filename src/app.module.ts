import { MiddlewareConsumer, Module } from "@nestjs/common";

import { AppClusterService } from "./services/app-cluster/app-cluster.service";
import { MainController } from "./controllers/main/main.controller";
import { ApiStatusService } from "./services/api-status/api-status.service";
import { InstalingModule } from "./modules/instaling/instaling.module";
import { LoggerMiddleware } from "./middlewares/logger/logger.middleware";
import { ServerValidationMiddleware } from "./middlewares/server-validation/server-validation.middleware";

@Module({
  imports: [InstalingModule],
  controllers: [MainController],
  providers: [AppClusterService, ApiStatusService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
    consumer.apply(ServerValidationMiddleware).forRoutes("*");
  }
}
