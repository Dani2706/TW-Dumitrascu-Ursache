import { environment } from "../environment.js";

export class UserService {
    async getUserProfile() {
        return await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/user", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        }
        );
    }

    async updateUserProfile(userData){
        return await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/user", {
                method: "PUT",
                body: JSON.stringify(userData),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                }
            }
        );
    }

    async registerUser(userData){
        return await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/register", {
                method: "POST",
                body: JSON.stringify(userData),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    async deleteUser(){
        return await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/user", {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                },
            }
        );
    }
}