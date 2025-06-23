import { environment } from "../environment.js";

export class PropertyService{
    async addProperty(propertyData){
        return await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/add-property', {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            },
            body: JSON.stringify(propertyData)
        });
    }

    async getProperty(propertyId){
        return await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/property?id=${propertyId}`);
    }

    async updateProperty(propertyData){
        return await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/update-property', {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            },
            body: JSON.stringify(propertyData)
        });
    }

    async getFavoriteProperties(){
        return await fetch("/TW_Dumitrascu_Ursache_war_exploded/api/favorites", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        });
    }

    async deleteFavoriteProperty(propertyId){
        return await fetch(`${environment.backendUrl}/TW_Dumitrascu_Ursache_war_exploded/api/favorites/${propertyId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        });
    }

    async getTopProperties(){
        return await fetch('/TW_Dumitrascu_Ursache_war_exploded/api/properties/top');
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

    async getUserProperties(){
        return await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/user-properties`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        });
    }

    async getUserListingsViewCount(){
        return await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/user-listings-view-count`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        });
    }

    async getUserListingsFavoriteCount(){
        return await fetch(`/TW_Dumitrascu_Ursache_war_exploded/api/user-listings-favorited-count`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + sessionStorage.getItem("jwt")
            }
        });
    }

}