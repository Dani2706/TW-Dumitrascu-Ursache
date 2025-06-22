package dto;

import java.util.Date;

public class AdminUserDTO {
    String username;
    int userId;
    Date createdAt;
    int isAdmin;

    public AdminUserDTO() {}

    public AdminUserDTO(String username, int userId, Date createdAt, int isAdmin) {
        this.username = username;
        this.userId = userId;
        this.createdAt = createdAt;
        this.isAdmin = isAdmin;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public int getIsAdmin() {
        return isAdmin;
    }

    public void setIsAdmin(int isAdmin) {
        this.isAdmin = isAdmin;
    }
}
