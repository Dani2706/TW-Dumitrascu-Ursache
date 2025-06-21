package entity;

public class PropertyMainImage {
    int propertyId;
    String data;

    public PropertyMainImage(){}

    public PropertyMainImage(int propertyId, String data) {
        this.propertyId = propertyId;
        this.data = data;
    }

    public int getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(int propertyId) {
        this.propertyId = propertyId;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }
}
