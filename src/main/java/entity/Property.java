package entity;

import java.sql.Date;

public class Property {
    private int propertyId;
    private String title;
    private String description;
    private String propertyType;
    private String transactionType;
    private int price;
    private int surface;
    private int rooms;
    private int bathrooms;
    private int floor;
    private int totalFloors;
    private int yearBuilt;
    private Date createdAt;
    private String address;
    private String city;
    private String state;
    private String contactName;
    private String contactPhone;
    private String contactEmail;

    public Property(int propertyId, String title, String description, String propertyType, String transactionType,
                    int price, int surface, int rooms, int bathrooms, int floor, int totalFloors,
                    int yearBuilt, Date createdAt, String address, String city, String state,
                    String contactName, String contactPhone, String contactEmail) {
        this.propertyId = propertyId;
        this.title = title;
        this.description = description;
        this.propertyType = propertyType;
        this.transactionType = transactionType;
        this.price = price;
        this.surface = surface;
        this.rooms = rooms;
        this.bathrooms = bathrooms;
        this.floor = floor;
        this.totalFloors = totalFloors;
        this.yearBuilt = yearBuilt;
        this.createdAt = createdAt;
        this.address = address;
        this.city = city;
        this.state = state;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
    }

    public int getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(int propertyId) {
        this.propertyId = propertyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public int getSurface() {
        return surface;
    }

    public void setSurface(int surface) {
        this.surface = surface;
    }

    public int getRooms() {
        return rooms;
    }

    public void setRooms(int rooms) {
        this.rooms = rooms;
    }

    public int getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(int bathrooms) {
        this.bathrooms = bathrooms;
    }

    public int getFloor() {
        return floor;
    }

    public void setFloor(int floor) {
        this.floor = floor;
    }

    public int getTotalFloors() {
        return totalFloors;
    }

    public void setTotalFloors(int totalFloors) {
        this.totalFloors = totalFloors;
    }

    public int getYearBuilt() {
        return yearBuilt;
    }

    public void setYearBuilt(int yearBuilt) {
        this.yearBuilt = yearBuilt;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
}
