import javax.sql.DataSource;

public class PropertyService {
    private PropertyRepository propertyRepository;

    public PropertyService(DataSource dataSource) {
        this.propertyRepository = new PropertyRepository(dataSource);
    }

    public Property getPropertyById(int id) {
        if (id <= 0) {
            throw new IllegalArgumentException("Property ID must be positive");
        }

        Property property = propertyRepository.findById(id);

        if (property == null) {
            throw new RuntimeException("Property with ID " + id + " not found");
        }

        return property;
    }
}