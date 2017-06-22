{
    "name": "block-headline",
    "output": `
	<table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0"  width="100%">
        <tr>
            <td style="font-family: %fontFamily%;  padding: %padding%; text-align: %textAlign%; font-size: %fontSize%; line-height: %lineHeight%; color: %color%;" class="center-on-narrow">
               <span style="color: %color%;">%text%</span>
            </td>
        </tr>
    </table>
			   `,
    "properties": {
        "text": {
            "default": "Headline",
            "type": "text"
        },
        "fontFamily": {
            "default": "sans-serif",
            "type": "property"
        },
         "padding": {
              "default": "10px 0",
              "type": "property"
          },
          "textAlign": {
              "default": "center",
              "type": "property"
          },
          "fontSize": {
              "default": "23px",
              "type": "property"
          },
          "lineHeight": {
              "default": "25px",
              "type": "property"
          },
          "color": {
              "default": "#555555",
              "type": "color"
          },
          "inlineEditing": {
              "default": "true",
              "type": "property"
          },
    }
}