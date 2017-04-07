{
    "name": "1-column-spacer",
    "output": `
				<tr>
                    <td %backgroundColor% height="%height%" style="font-size: 0; line-height: 0;">
                        &nbsp;
                    </td>
                </tr>
			   `,
    "properties": {
        "height": {
            "default": "20",
            "type": "property"
        },
		"backgroundColor": {
              "default": "#eeeeee",
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