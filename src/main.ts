import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupMongo } from "./mongo";
import { AppClusterService } from "./services/app-cluster/app-cluster.service";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { base } from "./config";
import { initJobs } from "./notifications/main";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await setupMongo();
  const corsOptions: CorsOptions = {
    origin: base.frontend_url,
  };
  app.enableCors(corsOptions);

  await app.listen(base.port);
}

if (base.clusters) {
  AppClusterService.clusterize(bootstrap);
} else {
  bootstrap();
}

initJobs();
