modules["1-column-hero-image"] = {
    "output": `<tr>
                    <td bgcolor="%backgroundColor%">
                        <img src="%url%" aria-hidden="true" width="680" height="" alt="%alt%" border="0" align="center" class="fluid" style="width: 100%; max-width: 680px; height: auto; background: %backgroundColor%; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;" class="g-img">
                    </td>
                </tr>`,
    "properties": {
        "url": {
            "default": "http://placehold.it/1360x600",
            "type": "image-url"
        },
        "alt": {
            "default": "alt text",
            "type": "text"
        },
        "backgroundColor": {
            "default": "#dddddd",
            "type": "color"
        }
    }
}