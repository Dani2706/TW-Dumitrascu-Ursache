package dto;

public class DataForJwtCreationDTO {
    String username;
    int userId;
    int adminStatus;

    public DataForJwtCreationDTO(String username, int userId, int adminStatus) {
        this.username = username;
        this.userId = userId;
        this.adminStatus = adminStatus;
    }

    public String getUsername() {
        return username;
    }

    public int getUserId() {
        return userId;
    }

    public int getAdminStatus() {
        return adminStatus;
    }
}
