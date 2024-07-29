package chat;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class Messages {

    private List<Message> messages = new ArrayList<Message>();

    public Messages(){
    }

    public List<Message> getMessages() {
        return messages;
    }

    public void addMessages(Message msg){
        messages.add(msg);
    }

    public List<Map<String, String>> getOldPublicMessages(String sender, String currentUser){
        List<Map<String, String>> sendOld = new ArrayList<>();
        for (int i=0; i<this.messages.size(); i++){
            if(messages.get(i).getType().equals("public")){
                Map<String, String> oldMap = new HashMap<>();
                oldMap.put("text", messages.get(i).getText());
                oldMap.put("name", messages.get(i).getName());
                oldMap.put("date", messages.get(i).getDate());
                oldMap.put("type", messages.get(i).getType());
                sendOld.add(oldMap);
            }
        }
        return sendOld;
    }

    public List<Map<String, String>> getOldMessages(String sender, String currentUser){
        List<Map<String, String>> sendOld = new ArrayList<>();
        for (int i=0; i<this.messages.size(); i++){
            if(messages.get(i).getType().equals("private")){
                if((messages.get(i).getName().equals(sender)&&messages.get(i).getSendTo().equals(currentUser))||(
                        messages.get(i).getName().equals(currentUser)&&messages.get(i).getSendTo().equals(sender)
                        )) {
                    Map<String, String> oldMap = new HashMap<>();
                    oldMap.put("text", messages.get(i).getText());
                    oldMap.put("name", messages.get(i).getName());
                    oldMap.put("date", messages.get(i).getDate());
                    oldMap.put("type", messages.get(i).getType());
                    sendOld.add(oldMap);
                }
            }
        }
        return sendOld;
    }
}
