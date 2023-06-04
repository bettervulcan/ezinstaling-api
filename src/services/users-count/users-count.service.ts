import { Injectable } from "@nestjs/common";
import { countAllUsers } from "src/firebase";

@Injectable()
export class UsersCountService {
  async getUsersCount() {
    try {
      const totalUsers = await countAllUsers();
      return {
        success: true,
        totalUsers: totalUsers,
      };
    } catch (err) {
      throw err;
    }
  }
}
