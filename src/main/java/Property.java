public class Property {
    private int id;
    private String title;
    private int price;
    private int surface;
    private int rooms;
    private int floor;
    private int yearBuilt;
    private String type;
    private String description;
    private String address;
    private String city;
    private String state;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String imageUrl;

    public Property(int id, String title, int price, int surface, int rooms, int floor, int yearBuilt, String type, String description, String address, String city, String state, String contactName, String contactPhone, String contactEmail, String imageUrl) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.surface = surface;
        this.rooms = rooms;
        this.floor = floor;
        this.yearBuilt = yearBuilt;
        this.type = type;
        this.description = description;
        this.address = address;
        this.city = city;
        this.state = state;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.imageUrl = imageUrl;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public int getPrice() {
        return price;
    }

    public int getSurface() {
        return surface;
    }

    public int getRooms() {
        return rooms;
    }

    public int getFloor() {
        return floor;
    }

    public int getYearBuilt() {
        return yearBuilt;
    }

    public String getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getContactName() {
        return contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public void setSurface(int surface) {
        this.surface = surface;
    }

    public void setRooms(int rooms) {
        this.rooms = rooms;
    }

    public void setFloor(int floor) {
        this.floor = floor;
    }

    public void setYearBuilt(int yearBuilt) {
        this.yearBuilt = yearBuilt;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
