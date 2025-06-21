package dto;

import entity.Property;
import entity.PropertyMainImage;


public class GetUserPropertyDTO {
    Property propertyData;
    PropertyMainImage propertyMainImage;

    public GetUserPropertyDTO(Property propertyData, PropertyMainImage propertyMainImage) {
        this.propertyData = propertyData;
        this.propertyMainImage = propertyMainImage;
    }

    public Property getPropertyData() {
        return propertyData;
    }

    public void setPropertyData(Property properties) {
        this.propertyData = properties;
    }

    public PropertyMainImage getPropertyMainImage() {
        return propertyMainImage;
    }

    public void setPropertyMainImage(PropertyMainImage propertyMainImage) {
        this.propertyMainImage = propertyMainImage;
    }
}
