package chat;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.ArrayList;
import java.util.List;

@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    Users users = new Users();
    @Autowired
    ChatController chatController = new ChatController(users);

    public WebSocketEventListener(Users users){
        this.users = users;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        logger.info("Received a new web socket connection");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event){
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        List<User> connList = new ArrayList<>(users.getUsers());
        for(int i=0; i<connList.size(); i++){
            if(connList.get(i).getUserName().equals(username)){
                users.removeUsers(i);
            }
        }
        chatController.updateUsers();
        logger.info("User disconnected");
    }
}
