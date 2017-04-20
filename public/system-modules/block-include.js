{
  "name": "block-include",
  "output": `
    <div style="background: black; color: white; text-align: center;   
    padding: 50px;">
      content-id %contentId%<br>
      instance-id %instanceId%<br>
      <a href="?id=%contentId%&instanceId=%instanceId%" 
      target="_blank">Edit</a>
    </div>`,
  "properties": {
    "contentId": {
      "default": "",
      "type": "property"
    },
    "instanceId": {
      "default": "",
      "type": "property"
    }
  }
}    
