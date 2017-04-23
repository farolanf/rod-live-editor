{
    "name": "3-column-image-image-image",
    "output": `<tr>
                    <td %backgroundColor% align="center" height="100%" valign="top" width="100%" style="padding: 10px 0;">
                        <!--[if mso]>
                        <table role="presentation" aria-hidden="true" border="0" cellspacing="0" cellpadding="0" align="center" width="660">
                        <tr>
                        <td align="center" valign="top" width="660">
                        <![endif]-->
                        <table role="presentation" aria-hidden="true" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="max-width:660px;">
                            <tr>
                                <td align="center" valign="top" style="font-size:0;">
                                    <!--[if mso]>
                                    <table role="presentation" aria-hidden="true" border="0" cellspacing="0" cellpadding="0" align="center" width="660">
                                    <tr>
                                    <td align="left" valign="top" width="220">
                                    <![endif]-->
                                    <div style="display:inline-block; Margin: 0 -2px; max-width:33.33%; min-width:220px; vertical-align:top; width:100%;" class="stack-column">
                                        <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 10px 10px;">
                                                    <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size: %fontSize%;text-align: left;">
                                                        <tr>
                                                            <td>
                                                                <img src="%imageUrlLeft%" aria-hidden="true" width="200" height="" border="0" alt="%imageAltLeft%" class="center-on-narrow" style="width: 100%; max-width: 200px; height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-family: sans-serif; padding-top: 10px; text-align: %textAlign%; font-size: %fontSize%; line-height: %lineHeight%; color: %color%;" class="stack-column-center">
                                                                %contentLeft%
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <!--[if mso]>
                                    </td>
                                    <td align="left" valign="top" width="220">
                                    <![endif]-->
                                    <div style="display:inline-block; Margin: 0 -2px; max-width:33.33%; min-width:220px; vertical-align:top; width:100%;" class="stack-column">
                                        <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 10px 10px;">
                                                    <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size: %fontSize%;text-align: left;">
                                                        <tr>
                                                            <td>
                                                                <img src="%imageUrlCenter%" aria-hidden="true" width="200" height="" border="0" alt="%imageAltCenter%" class="center-on-narrow" style="width: 100%; max-width: 200px; height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-family: sans-serif; padding-top: 10px; text-align: %textAlign%; font-size: %fontSize%; line-height: %lineHeight%; color: %color%;" class="stack-column-center">
                                                                %contentCenter%
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <!--[if mso]>
                                    </td>
                                    <td align="left" valign="top" width="220">
                                    <![endif]-->
                                    <div style="display:inline-block; Margin: 0 -2px; max-width:33.33%; min-width:220px; vertical-align:top; width:100%;" class="stack-column">
                                        <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 10px 10px;">
                                                    <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size: 14px;text-align: left;">
                                                        <tr>
                                                            <td>
                                                                <img src="%imageUrlRight%" aria-hidden="true" width="200" height="" border="0" alt="%imageAltRight%" class="center-on-narrow" style="width: 100%; max-width: 200px; height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-family: sans-serif; padding-top: 10px; text-align: %textAlign%; font-size: %fontSize%; line-height: %lineHeight%; color: %color%;" class="stack-column-center">
                                                                %contentRight%
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <!--[if mso]>
                                    </td>
                                    </tr>
                                    </table>
                                    <![endif]-->
                                </td>
                            </tr>
                        </table>
                        <!--[if mso]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                    </td>
                </tr> 
`,
    "properties": {
        "contentLeft": {
            "default": "Content Left",
            "type": "container"
        },
		"contentCenter": {
            "default": "Content Center",
            "type": "container"
        },
        "contentRight": {
            "default": "Content Right",
            "type": "container"
        },
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
		  "imageUrlLeft": {
            "default": "img/200.png",
            "type": "image-url"
        },
         "imageUrlCenter": {
            "default": "img/200.png",
            "type": "image-url"
        },
		 "imageUrlRight": {
            "default": "img/200.png",
            "type": "image-url"
        },
        "imageAltLeft": {
            "default": "alt left text",
            "type": "text"
        },
		"imageAltCenter": {
            "default": "alt center text",
            "type": "text"
        },
        "imageAltRight": {
            "default": "alt right text",
            "type": "text"
        }, 
		 "textAlign": {
              "default": "center",
              "type": "property"
          },
          "fontSize": {
              "default": "15px",
              "type": "property"
          },
          "lineHeight": {
              "default": "20px",
              "type": "property"
          },
          "color": {
              "default": "#555555",
              "type": "color"
          },
    }
}
