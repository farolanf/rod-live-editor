  modules["1-column"] = {
      "output": `<tr>
                    <td %backgroundColor%>
                        <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="font-family: sans-serif;  padding: %padding%; text-align: %textAlign%; font-size: %fontSize%; line-height: %lineHeight%; color: %color%;">%content%</td> 
                            </tr>
                        </table>
                    </td>
                </tr>`,
      "properties": {
          "content": { 
              "default": "Place your content in here!",
              "type": "container"
          },
          "padding": {
              "default": "10px 40px",
              "type": "property"
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
          }

      }
  }