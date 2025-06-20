import { environment } from "../environment.js";

export class AdminService {
    API_PATH = environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/admin/user";
    async addUser (userData){
        return await fetch(this.API_PATH, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                },
                body: JSON.stringify(userData)
            }
        );
    }

    async getUser (userId){
        return await fetch(`${this.API_PATH}?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                },
            }
        );
    }

    async updateUser (userData){
        return await fetch(this.API_PATH, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                },
                body: JSON.stringify(userData)
            }
        );
    }

    async deleteUser (userId) {
        return await fetch(this.API_PATH, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("jwt")
                },
                body: JSON.stringify({userId : userId})
            }
        );
    }
}