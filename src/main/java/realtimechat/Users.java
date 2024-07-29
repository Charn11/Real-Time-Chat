package chat;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class Users {

    private List<User> users = new ArrayList<>();

    public Users(){
    }

    public List<User> getUsers() {
        return users;
    }

    public void addUsers(User user){
        users.add(user);
    }

    public void  removeUsers(int index){
        users.remove(index);
    }
}
