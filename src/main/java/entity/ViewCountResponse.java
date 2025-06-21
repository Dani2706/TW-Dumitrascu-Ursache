package entity;

public class ViewCountResponse {
    private int totalViewCount;

    public ViewCountResponse(int totalViewCount) {
        this.totalViewCount = totalViewCount;
    }

    public int getTotalViewCount() {
        return totalViewCount;
    }

    public void setTotalViewCount(int totalViewCount) {
        this.totalViewCount = totalViewCount;
    }
}