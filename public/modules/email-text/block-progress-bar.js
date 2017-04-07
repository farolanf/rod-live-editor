modules["block-progress-bar"] = {
    "output": `
<table cellpadding="0" cellspacing="0" width="100%">
<tr>
  <td style="background-color:#27a9e3;padding:%padding%; font-family: sans-serif; text-align: right; font-size: %fontSize%; line-height: %lineHeight%; color: %color%;" width="%__progress%">
    %progress%% Complete&nbsp;&nbsp;
  </td>
  <td style="background-color:#0e3f55;padding:%padding%;color:#333333; font-family: sans-serif; text-align: right; font-size: %fontSize%; line-height: %lineHeight%; color: %color%;" width="%_progress%">
    &nbsp;
  </td>
</tr>
</table>
        `,
    "properties": {
	    "progress": {
              "default": "40",
              "type": "property"
          }, 
		"_progress": {
		     "alias": "progress",
             "replace": {
                  "condition": function(value) {
                      return "always";
                  },
                  "always": function(value){
					//Round to the nearest 10th with a minimum of 16(to make text fit) and maximum of 99
				    value = Math.min(Math.max( Math.ceil(value * 10) / 10, 16 ),99);
					return (100-value);
				  }
              }
          }, 
		  "__progress": {
		     "alias": "progress",
			 "replace": {
                  "condition": function(value) {
                      return "always";
                  },
                  "always": function(value){
					//Round to the nearest 10th with a minimum of 16 (to make text fit) and maximum of 99
				    value = Math.min(Math.max( Math.ceil(value * 10) / 10, 16 ),99);
					return (value);
				  }
              }
          }, 
        "padding": {
              "default": "10px",
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
              "default": "#ffffff",
              "type": "color"
          },
    }
}
