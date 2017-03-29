modules["block-button"] = {
    "output": `
<br><br>

    <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0"  align="center" style="Margin: auto">
        <tr>
            <td style="border-radius: 3px; background: %backgroundColor%; text-align: center;" class="button-td">
                <a href="%url%" style="background: %backgroundColor%; border: 15px solid %backgroundColor%; font-family: sans-serif; font-size: 13px; line-height: 1.1; text-align: center; text-decoration: none; display: block; border-radius: 3px; font-weight: bold;" class="button-a">
                    <span style="color:%textColor%;" class="-link">&nbsp;&nbsp;&nbsp;&nbsp;%text%&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </a>
            </td>
        </tr>
    </table>`,
    "properties": {
        "text": {
            "default": "Place your text here",
            "type": "text"
        },
        "backgroundColor": {
            "default": "#333333",
            "type": "color"
            },
        "textColor": {
            "default": "#ffffff",
            "type": "color"
            },
        "text": {
            "default": "Download Now",
            "type": "text"
            },
        "url": {
            "default": "http:://pianoencyclopedia.com",
            "type": "url"
            }
    }
}