modules["document-html-email"] = {
    "output": `<!DOCTYPE html>
	<html lang="en">
	<head>
    <meta charset="utf-8"> 
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>%title%</title>


    <style>

        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / Margin and add a background color to the compose a reply window. */
        html,
        body {
            Margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
        }

        /* What it does: Stops email clients resizing small text. */
        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        /* What it does: Centers email on Android 4.4 */
        div[style*="Margin: 16px 0"] {
            Margin:0 !important;
        }

        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }

        /* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */
        table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            Margin: 0 auto !important;
        }
        table table table {
            table-layout: auto;
        }

        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
            -ms-interpolation-mode:bicubic;
        }

        /* What it does: A work-around for iOS meddling in triggered links. */
        *[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
        }

        /* What it does: A work-around for Gmail meddling in triggered links. */
        .x-gmail-data-detectors,
        .x-gmail-data-detectors *,
        .aBn {
            border-bottom: 0 !important;
            cursor: default !important;
        }

        /* What it does: Prevents Gmail from displaying an download button on large, non-linked images. */
        .a6S {
	        display: none !important;
	        opacity: 0.01 !important;
        }
        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img + div {
	        display:none !important;
	   	}

        /* What it does: Prevents underlining the button text in Windows 10 */
        .button-link {
            text-decoration: none !important;
        }

        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
        /* Create one of these media queries for each additional viewport size you'd like to fix */
        /* Thanks to Eric Lepetit @ericlepetitsf) for help troubleshooting */
        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) { /* iPhone 6 and 6+ */
            .email-container {
                min-width: 375px !important;
            }
        }

    </style>

    <style>
        /* Progressive Enhancements */
        /* What it does: Hover styles for buttons */
        .button-td,
        .button-a {
            transition: all 100ms ease-in;
        }
        .button-td:hover,
        .button-a:hover {
            background: %hoverColor% !important;
            border-color: %hoverColor% !important;
        }

        /* Media Queries */
        @media screen and (max-width: 480px) {

            /* What it does: Forces elements to resize to the full width of their container. Useful for resizing images beyond their max-width. */
            .fluid {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                Margin-left: auto !important;
                Margin-right: auto !important;
            }

            /* What it does: Forces table cells into full-width rows. */
            .stack-column,
            .stack-column-center {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                direction: ltr !important;
            }
            /* And center justify these ones. */
            .stack-column-center {
                text-align: center !important;
            }

            /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
            .center-on-narrow {
                text-align: center !important;
                display: block !important;
                Margin-left: auto !important;
                Margin-right: auto !important;
                float: none !important;
            }
            table.center-on-narrow {
                display: inline-block !important;
            }
        }

    </style>

</head>
<body width="100%" %_backgroundColorMain% style="Margin: 0; mso-line-height-rule: exactly;">
    
	<center style="width: 100%; text-align: left; %backgroundColorMain% ">
		%hiddenPreheader%
		<div style="max-width: 680px; Margin: auto;" class="email-container">
		   <table role="presentation" %_backgroundColorHeader% aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="display: table; max-width: 680px; %backgroundColorHeader%">
				<tbody>
                    %header%
				</tbody>
		   </table>
		   <table role="presentation" %_backgroundColorBody% aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="display: table; max-width: 680px; %backgroundColorBody%">
				<tbody>
                    %body%
				</tbody>
		   </table>
		    <table role="presentation" %_backgroundColorFooter% aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="display: table; max-width: 680px; %backgroundColorFooter%">
				<tbody>
    				%footer%
				</tbody>
		   </table>
		</div>
	</center>
</body>
</html>`,
    "properties": {
        "title": {
            "default": "Subject",
            "type": "text"
        },
		"body": {
            "default": "Place your body content here",
            "type": "container"
        },
        "header": {
            "default": "<tr><td>Place your header content here</td></tr>",
            "type": "container"
        },
        "footer": {
            "default": "<tr><td>Place your footer content here</td></tr>",
            "type": "container"
        },
        "backgroundColorHeader": {
            "default": "",
            "type": "color",
            "replace": {
                "condition": function(value) {
                    return value ? true : false;
                },
                "true": 'background: %value%;',
                "false": ""
            }
        },
        "_backgroundColorHeader": {
            "alias": "backgroundColorHeader",
            "replace": {
                "condition": function(value) {
                    return value ? true : false;
                },
                "true": 'bgcolor="%value%"',
                "false": ""
            }
        },
        "backgroundColorBody": {
            "default": "#eeeeee",
            "type": "color",
            "replace": {
                "condition": function(value) {
                    return value ? true : false;
                },
                "true": 'background: %value%;',
                "false": ""
            }
        },
        "_backgroundColorBody": {
            "alias": "backgroundColorBody",
            "replace": {
                "condition": function(value) {
                    return value ? true : false;
                },
                "true": 'bgcolor="%value%"',
                "false": ""
            }
        },
        "backgroundColorFooter": {
            "default": "",
            "type": "color",
            "replace": {
                "condition": function(value) {
                    return value ? true : false;
                },
                "true": 'background: %value%;',
                "false": ""
            }
        },
        "_backgroundColorFooter": {
            "alias": "backgroundColorBody",
            "replace": {
                "condition": function(value) {
                    return value ? true : false;
                },
                "true": 'bgcolor="%value%"',
                "false": ""
            }
        },
        "backgroundColorMain": {
            "default": "#eeeeee",
            "type": "color",
            "replace": {
                "condition": function(value) {
                    return value ? true : false;
                },
                "true": "background: %value%;",
                "false": ""
            }
        },
        "_backgroundColorMain": {
            "alias": "backgroundColorMain",
            "output": {
                "condition": function(value) {
                    return (value != "") ? true : false;
                },
                true: 'bgcolor="%value%"',
                false: ""
            }
        },
        "hoverColor": {
            "default": "#555555",
            "type": "color"
        },
        "hiddenPreheader": {
            "default": "",
            "type": "text",
            "replace": {
                "condition": function(value) {
                    return value ? true : false;
                },
                "true": '<div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;font-family: sans-serif;">%value%</div>',
                "false": ""
            }
        }
    }
}