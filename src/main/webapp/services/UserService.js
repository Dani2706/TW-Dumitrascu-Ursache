import { environment } from "../environment.js";

export class UserService {
    async getUserProfile() {
        return await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/user/profile", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        }
        );
    }

}