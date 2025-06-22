package dto;

import java.util.Date;

public class AdminPropertyDTO {
    String title;
    Date creationDate;
    int id;
    String mainPhoto;

    public AdminPropertyDTO() {}

    public AdminPropertyDTO(String title, Date createdAt, int id, String mainPhoto) {
        this.title = title;
        this.creationDate = createdAt;
        this.id = id;
        this.mainPhoto = mainPhoto;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getMainPhoto() {
        return mainPhoto;
    }

    public void setMainPhoto(String mainPhoto) {
        this.mainPhoto = mainPhoto;
    }
}
