package entity;

public class PropertyForAllListings {
    private int propertyId;
    private String title;
    private int rooms;
    private int bathrooms;
    private int surfaceArea;
    private String city;
    private String country;

    public PropertyForAllListings() {}

    public PropertyForAllListings(int propertyId, String title, int rooms, int bathrooms, int surfaceArea, String city, String country) {
        this.propertyId = propertyId;
        this.title = title;
        this.rooms = rooms;
        this.bathrooms = bathrooms;
        this.surfaceArea = surfaceArea;
        this.city = city;
        this.country = country;
    }

    public int getPropertyId() {
        return propertyId;
    }

    public String getTitle() {
        return title;
    }

    public int getRooms() {
        return rooms;
    }

    public int getBathrooms() {
        return bathrooms;
    }

    public int getSurfaceArea() {
        return surfaceArea;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public void setPropertyId(int propertyId) {
        this.propertyId = propertyId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setRooms(int rooms) {
        this.rooms = rooms;
    }

    public void setBathrooms(int bathrooms) {
        this.bathrooms = bathrooms;
    }

    public void setSurfaceArea(int surfaceArea) {
        this.surfaceArea = surfaceArea;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}
