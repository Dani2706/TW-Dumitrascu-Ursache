package entity;

import java.util.List;

public class PropertyExtraImages {
    int propertyId;
    List<String> data;

    public PropertyExtraImages() {}

    public PropertyExtraImages(int propertyId, List<String> data) {
        this.propertyId = propertyId;
        this.data = data;
    }

    public List<String> getData() {
        return data;
    }
}
