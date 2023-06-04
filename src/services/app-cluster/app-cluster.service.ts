import cluster from "node:cluster";
import { cpus } from "os";
import { Injectable, Logger } from "@nestjs/common";

const numCPUs = cpus().length;
const logger = new Logger("Cluster");
@Injectable()
export class AppClusterService {
  static clusterize(callback): void {
    if (cluster.isPrimary) {
      logger.log(`Master server started on #${process.pid}`);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on("exit", (worker) => {
        logger.warn(`Worker #${worker.process.pid} died. Restarting`);
        cluster.fork();
      });
    } else {
      logger.log(`Cluster server started on #${process.pid}`);
      callback();
    }
  }
}
