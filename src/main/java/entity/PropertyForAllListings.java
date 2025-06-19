package entity;

public class PropertyForAllListings {
    private int propertyId;
    private String title;
    private int rooms;
    private int floor;
    private int yearBuilt;
    private int bathrooms;
    private int surfaceArea;
    private String city;
    private String state;
    private String country;
    private double latitude;
    private double longitude;
    private double price;
    private String transactionType;

    public PropertyForAllListings() {}

    public PropertyForAllListings(int propertyId, String title, int rooms, int floor, int yearBuilt, int bathrooms, int surfaceArea, String city, String state, String country, double latitude, double longitude, double price, String transactionType) {
        this.propertyId = propertyId;
        this.title = title;
        this.rooms = rooms;
        this.bathrooms = bathrooms;
        this.floor = floor;
        this.yearBuilt = yearBuilt;
        this.surfaceArea = surfaceArea;
        this.city = city;
        this.state = state;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.price = price;
        this.transactionType = transactionType;
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

    public int getFloor() {
        return floor;
    }

    public int getYearBuilt() {
        return yearBuilt;
    }

    public int getSurfaceArea() {
        return surfaceArea;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getCountry() {
        return country;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public double getPrice() {
        return price;
    }

    public String getTransactionType() {
        return transactionType;
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

    public void setFloor(int floor) {
        this.floor = floor;
    }

    public void setYearBuilt(int yearBuilt) {
        this.yearBuilt = yearBuilt;
    }

    public void setSurfaceArea(int surfaceArea) {
        this.surfaceArea = surfaceArea;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }
}
