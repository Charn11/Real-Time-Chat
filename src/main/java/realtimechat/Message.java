package chat;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Message {

    @JsonProperty
    private String text;
    @JsonProperty
    private String name;
    @JsonProperty
    private String date;
    @JsonProperty
    private String type;
    @JsonProperty
    private String sendTo;

    public Message(){
    }

    public Message(String text, String name, String date, String type, String sendTo){
        this.text = text;
        this.name = name;
        this.date = date;
        this.type = type;
        this.sendTo= sendTo;
    }

    public String getText() {
        return text;
    }

    public String getName() {
        return name;
    }

    public String getDate() {
        return date;
    }

    public String getType() {
        return type;
    }

    public String getSendTo() {
        return sendTo;
    }
}

