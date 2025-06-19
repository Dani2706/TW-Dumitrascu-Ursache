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
        else if (response.status == 401){
            throw new Error("Unable to upload your profile information. \n Please login first!");
        }
        else {
            throw new Error("There was an error uploading your profile information. \n Please retry or try again later!");
        }
    }

}