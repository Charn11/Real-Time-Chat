package chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class RestChatController {

    @Autowired
    Messages messages = new Messages();

    @PostMapping("/messages")
    public ResponseEntity<?> returnMessages(@RequestBody Map<String, String> json){
        String sender = json.get("sender");
        String currentUser = json.get("currentUser");
        if(sender.equals("Public chat")){
            return ResponseEntity.ok().body(messages.getOldPublicMessages(sender, currentUser));
        }else if(!sender.isEmpty()) {
            return ResponseEntity.ok().body(messages.getOldMessages(sender, currentUser));
        }else {
            return ResponseEntity.notFound().build();
        }
    }
}
