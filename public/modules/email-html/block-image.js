{
    "name": "block-image",
    "output": `<tr>
                    <td %backgroundColor%>
                        <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="font-family: sans-serif;  padding: 23px;">
									<img src="%url%" aria-hidden="true" width="680" height="" alt="%alt%" border="0" align="center" class="fluid" style="width: 100%; max-width: 680px; height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
									</td> 
                            </tr>
                        </table>
                    </td>
                </tr>`,
    "properties": {
        "backgroundColor": {
            "default": "",
            "type": "color",
            "replace": {
                "condition": function(value) {
                    return value ? true : false;
                },
                "true": 'bgcolor="%value%"',
                "false": ""
            }
        },
        "url": {
            "default": "img/1360.png",
            "type": "image-url"
        },
        "alt": {
            "default": "alt text",
            "type": "text"
        },
    }
}