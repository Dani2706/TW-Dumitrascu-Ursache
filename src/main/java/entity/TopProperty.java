package entity;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TopProperty {
    private static final Logger logger = LoggerFactory.getLogger(TopProperty.class);

    private int propertyId;
    private String title;
    private int price;
    //private String imageUrl;

    public TopProperty(int propertyId, String title, int price /*, String imageUrl */) {
        this.setPropertyId(propertyId);
        this.setTitle(title);
        this.setPrice(price);
        //this.setImageUrl(imageUrl);
        logger.debug("Created TopProperty with ID: {}, Title: {}", propertyId, title);
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

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    /* public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        // Optional validation if needed
        // if (imageUrl == null || imageUrl.trim().isEmpty()) {
        //     logger.warn("Attempt to set empty image URL");
        //     throw new PropertyValidationException("Image URL cannot be empty");
        // }
        this.imageUrl = imageUrl;
    } */
}