package chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    @Autowired
    Messages messages = new Messages();
    Users users = new Users();

    public ChatController(Users users){
        this.users = users;
    }

    @MessageMapping("/chat")
    @SendTo("/topic/public")
    public void sendMessage(Message message) throws Exception{
        Map<String, String> map = new HashMap<>();
        map.put("text", message.getText());
        map.put("name", message.getName());
        map.put("date", message.getDate());
        map.put("type", message.getType());
        map.put("sendTo", message.getSendTo());
        messages.addMessages(message);
        List<Map<String, String>> sendNew = new ArrayList<>();
        sendNew.add(map);
        simpMessagingTemplate.convertAndSend("/topic/public", sendNew);
    }

    @MessageMapping("/privateChat")
    @SendTo("/topic/private/{senderName}/{username}")
    public void sendPrivateMessage(Message message) throws Exception{
        Map<String, String> map = new HashMap<>();
        map.put("text", message.getText());
        map.put("name", message.getName());
        map.put("date", message.getDate());
        map.put("type", message.getType());
        map.put("sendTo", message.getSendTo());
        messages.addMessages(message);
        List<Map<String, String>> sendNew = new ArrayList<>();
        sendNew.add(map);
        String sender = "/topic/private/"+message.getName()+"/"+message.getSendTo();
        String receiver = "/topic/private/"+message.getSendTo()+"/"+message.getName();
        simpMessagingTemplate.convertAndSend(sender, sendNew);
        simpMessagingTemplate.convertAndSend(receiver, sendNew);
        messageCounter(message.getSendTo(), message.getName());
    }

    @MessageMapping("/oldChat")
    @SendTo("/topic/oldPublic")
    public void sendOldMessages() throws Exception{
        List<Message> oldMessages = new ArrayList<>(messages.getMessages());
        List<Map<String, String>> sendOld = new ArrayList<>();
        for (int i=0; i<oldMessages.size(); i++){
            if(oldMessages.get(i).getType().equals("public")) {
                Map<String, String> oldMap = new HashMap<>();
                oldMap.put("text", oldMessages.get(i).getText());
                oldMap.put("name", oldMessages.get(i).getName());
                oldMap.put("date", oldMessages.get(i).getDate());
                oldMap.put("type", oldMessages.get(i).getType());
                oldMap.put("sendTo", oldMessages.get(i).getSendTo());
                sendOld.add(oldMap);
            }
        }
        Map<String, String> oldMap = new HashMap<>();
        oldMap.put("key", "empty");
        sendOld.add(oldMap);
        simpMessagingTemplate.convertAndSend("/topic/oldPublic", sendOld);
    }

    @MessageMapping("/newUser")
    @SendTo("/topic/addUser")
    public void newUser(SimpMessageHeaderAccessor headerAccessor, User user) {
        Map<String, String> map = new HashMap<>();
        map.put("user", user.getUserName());
        users.addUsers(user);
        List<Map<String, String>> sendNew = new ArrayList<>();
        sendNew.add(map);
        headerAccessor.getSessionAttributes().put("username", user.getUserName());
        simpMessagingTemplate.convertAndSend("/topic/addUser", sendNew);
    }

    @MessageMapping("/oldUser")
    @SendTo("/topic/addOldUser")
    public void oldUser() throws Exception{
        List<User> connList = new ArrayList<>(users.getUsers());
        List<Map<String, String>> sendOldUsers = new ArrayList<>();
        for(int i=0; i<connList.size(); i++){
            Map<String, String> oldMap = new HashMap<>();
            oldMap.put("user", connList.get(i).getUserName());
            sendOldUsers.add(oldMap);
        }
        Map<String, String> unMap = new HashMap<>();
        unMap.put("key","empty");
        sendOldUsers.add(unMap);
        simpMessagingTemplate.convertAndSend("/topic/addOldUser", sendOldUsers);
    }

    @MessageMapping("/updateUsers")
    @SendTo("/topic/updateCurrentUsers")
    public void updateUsers(){
        List<User> current = new ArrayList<>(users.getUsers());
        List<Map<String, String>> sendCurrentUsers = new ArrayList<>();
        for(int i=0; i<current.size(); i++){
            Map<String, String> oldMap = new HashMap<>();
            oldMap.put("user", current.get(i).getUserName());
            sendCurrentUsers.add(oldMap);
        }
        simpMessagingTemplate.convertAndSend("/topic/updateCurrentUsers", sendCurrentUsers);
    }

    @MessageMapping("/counter")
    @SendTo("/topic/counter/{receiver}")
    public void messageCounter(String receiver, String sender){
        if(receiver.equals(".")&&sender.equals(".")){
            String counter = null;
        }else{
            String counter = "/topic/counter/"+receiver;
            simpMessagingTemplate.convertAndSend(counter, sender);
        }
    }
}
