import {environment} from "../environment.js";

export class AuthService {
    async login(plainObject){
        return await fetch(environment.backendUrl + "/TW_Dumitrascu_Ursache_war_exploded/api/login", {
                method : "POST",
                body : JSON.stringify(plainObject),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
    }
}