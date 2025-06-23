import { environment } from "../environment.js";

export class AdminService {
    API_PATH = environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/user";

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

    async registerUser(userData){
        const response = await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/register", {
                method: "POST",
                body: JSON.stringify(userData),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    async changeAdminStatus(userId, adminStatus){
        return await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            },
            body: JSON.stringify({userId: userId, adminStatus: (parseInt(adminStatus) === 1) ? 0 : 1})
        });
    }

    async getAllUsers(){
        return await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/all-users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        });
    }

    async deleteProperty(propertyId){
        return await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/delete-property', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            },
            body: JSON.stringify({propertyId: propertyId})
        });
    }

    async getAllPropertiesWOI(){
        await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/all-propertieswoi`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        });
    }
}