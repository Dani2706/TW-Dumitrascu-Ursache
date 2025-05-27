import javax.sql.DataSource;
import java.sql.SQLException;

public class UserService {
    private UserRepository userRepository;

    public UserService() {
        this.userRepository = new UserRepository();
    }

    public String addUser(DataSource dataSource, int id, String username, String email, String password) throws SQLException {
        return userRepository.addUser(dataSource, id, username, email, password);
    }
}
