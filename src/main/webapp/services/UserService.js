import { environment } from "../environment.js";

export class UserService {
    async getUserProfile() {
        const response = await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/user/profile", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        }
        );

        if (response.status == 200) {
            const userData = await response.json();
            return userData;
        }
        else {
            throw new Error("Failed to fecth user profile: " + response.status);
        }
    }

}