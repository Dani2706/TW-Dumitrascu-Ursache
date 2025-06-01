package entity;

import java.sql.Date;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import exceptions.PropertyValidationException;

public class Property {
    private static final Logger logger = LoggerFactory.getLogger(Property.class);

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

        this.setPropertyId(propertyId);
        this.setTitle(title);
        this.setDescription(description);
        this.setPropertyType(propertyType);
        this.setTransactionType(transactionType);
        this.setPrice(price);
        this.setSurface(surface);
        this.setRooms(rooms);
        this.setBathrooms(bathrooms);
        this.setFloor(floor);
        this.setTotalFloors(totalFloors);
        this.setYearBuilt(yearBuilt);
        this.setCreatedAt(createdAt);
        this.setAddress(address);
        this.setCity(city);
        this.setState(state);
        this.setContactName(contactName);
        this.setContactPhone(contactPhone);
        this.setContactEmail(contactEmail);

        logger.debug("Created Property with ID: {}, Title: {}", propertyId, title);
    }

    public int getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(int propertyId) {
        if (propertyId <= 0) {
            logger.warn("Attempt to set invalid property ID: {}", propertyId);
            throw new PropertyValidationException("Property ID must be a positive number");
        }
        this.propertyId = propertyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            logger.warn("Attempt to set empty title for property");
            throw new PropertyValidationException("Property title cannot be empty");
        }
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
        if (propertyType == null || propertyType.trim().isEmpty()) {
            logger.warn("Attempt to set empty property type");
            throw new PropertyValidationException("Property type cannot be empty");
        }
        this.propertyType = propertyType;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        if (transactionType == null || transactionType.trim().isEmpty()) {
            logger.warn("Attempt to set empty transaction type");
            throw new PropertyValidationException("Transaction type cannot be empty");
        }
        this.transactionType = transactionType;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        if (price < 0) {
            logger.warn("Attempt to set negative price: {}", price);
            throw new PropertyValidationException("Price cannot be negative");
        }
        this.price = price;
    }

    public int getSurface() {
        return surface;
    }

    public void setSurface(int surface) {
        if (surface <= 0) {
            logger.warn("Attempt to set invalid surface area: {}", surface);
            throw new PropertyValidationException("Surface area must be positive");
        }
        this.surface = surface;
    }

    public int getRooms() {
        return rooms;
    }

    public void setRooms(int rooms) {
        if (rooms < 0) {
            logger.warn("Attempt to set negative number of rooms: {}", rooms);
            throw new PropertyValidationException("Number of rooms cannot be negative");
        }
        this.rooms = rooms;
    }

    public int getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(int bathrooms) {
        if (bathrooms < 0) {
            logger.warn("Attempt to set negative number of bathrooms: {}", bathrooms);
            throw new PropertyValidationException("Number of bathrooms cannot be negative");
        }
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
        if (totalFloors < 0) {
            logger.warn("Attempt to set negative total floors: {}", totalFloors);
            throw new PropertyValidationException("Total floors cannot be negative");
        }
        this.totalFloors = totalFloors;
    }

    public int getYearBuilt() {
        return yearBuilt;
    }

    public void setYearBuilt(int yearBuilt) {
        int currentYear = java.time.Year.now().getValue();
        if (yearBuilt < 1800 || yearBuilt > currentYear) {
            logger.warn("Attempt to set invalid year built: {}", yearBuilt);
            throw new PropertyValidationException("Year built must be between 1800 and current year");
        }
        this.yearBuilt = yearBuilt;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        if (createdAt == null) {
            logger.warn("Attempt to set null creation date");
            throw new PropertyValidationException("Creation date cannot be null");
        }
        this.createdAt = createdAt;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            logger.warn("Attempt to set empty address");
            throw new PropertyValidationException("Address cannot be empty");
        }
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        if (city == null || city.trim().isEmpty()) {
            logger.warn("Attempt to set empty city");
            throw new PropertyValidationException("City cannot be empty");
        }
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
        if (contactEmail != null && !contactEmail.isEmpty() && !isValidEmail(contactEmail)) {
            logger.warn("Invalid email format: {}", contactEmail);
            throw new PropertyValidationException("Invalid email format");
        }
        this.contactEmail = contactEmail;
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}
