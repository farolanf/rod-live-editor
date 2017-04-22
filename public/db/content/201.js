{
    globalProperties: {
        // "color1": { type: 'color', value: "#eeeeee" },
        // "color2": { type: 'color', value: "green" },
        "backgroundColorBody": { type: 'color', value: "white" },
        "backgroundColorFooter": { type: 'color', value: "blue" },
        "backgroundColor": { type: 'color', value: "#fff" },
        "hiddenPreheader": { type: 'text', value: "test" },
        "gift": { type: 'text', value: 'mac' },
        "color1": {
            "type": "color",
            "value": "#00ff00"
        },
        "_color2": {
            "alias": "color1",
            "replace": {
                "condition": function(value) {
                    return "always";
                },
                "always":  function(value) {

                    // color is a hex color like #aaaaaa 
                    // and percent is a float, 1.00=100%
                    // increasing a color by 50% means 
                    //a percent value of 1.5
                    function brighten(color, percent) {
                        var r = parseInt(color.substr(1, 2), 16);
                        var g = parseInt(color.substr(3, 2), 16);
                        var b = parseInt(color.substr(5, 2), 16);

                        r = Math.min(255, Math.floor(r * percent)).toString(16);
                        g = Math.min(255, Math.floor(g * percent)).toString(16);
                        b = Math.min(255, Math.floor(b * percent)).toString(16);
                        return '#' + r.padStart(2, '0') + g.padStart(2, '0') +
                            b.padStart(2, '0');
                    }
                    const color = brighten(value, 0.65);
                    return color;
                }
            }
        }
    },
    data: [
        {
            "name": "document-html-email",
            "backgroundColorHeader": "green",
            "backgroundColorBody": "white",
            "backgroundColorFooter": "blue",
            "backgroundColorMain": "%color1%",
            "hiddenPreheader": "test",
            "body": [
                {
                    name: 'block-include',
                    contentId: 202,
                    instanceId: 2,
                    title: 'Example of invalid placement (&lt;div&gt; in &lt;tbody&gt;)',
                },
                {
                    name: '1-column',
                    content: [
                        {
                            "name": "block-text",
                            "text": 'i18n example: '
                        },
                        {
                            "name": "block-text",
                            "text": {
                                "en": "Headline<br>",
                                "es": "Titular<br>",
                                "pt": "Manchete<br>" 
                            }
                        },
                    ]
                },
                {
                "name": "1-column",
                "textAlign": "left",
                "padding": "30px 40px 0",
                "backgroundColor": "%_color2%",
                "content": [
                    {
                        "name": "block-text",
                        "text": "Hi Rod, thanks for joining us, we have prepared your %gift% on your desk. <br><br> How is it going? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make<br><br>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make"
                    },
                    {
                        "name": "block-text",
                        "text": " your friends "
                    },
                    {
                        "name": "block-text",
                        "text": " are here!"
                    },
                    {
                        name: 'block-include',
                        contentId: 202,
                        instanceId: 2,
                        title: 'Example of valid placement (&lt;div&gt; in &lt;td&gt;)',
                    },
                ]
            },
            {
                "name": "block-image",
                "visible": false
            },
            {
                "name": "block-image"
            },
            {
                "name": "1-column",
                "padding": "0 40px 40px",
                "textAlign": "justify",
                "content": [{
                    "name": "block-text",
                    "text": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing "
                },
                {
                    "name": "block-text",
                    "text": " The Hidden Patterns of Music "
                },
                {
                    "name": "block-text",
                    "text": " is ready!"
                },
                {
                    "name": "block-button"
                },
                {
                    "name": "block-text",
                    "text": "<b>You missed learning:</b>",
                    "visible": "false"
                },


                ]
            },
            {
                "name": "1-column-spacer"
            },
            {
                "name": "1-column",
                "textAlign": "justify",
                "content": [{
                    "name": "block-headline",
                    "padding": "40px 0 0 ",
                    "text": "Finish watching the previous lessons"
                }]
            },
            {
                "name": "2-column-image-image",
                "textAlign": "justify",
                "contentLeft": [{
                    "name": "block-headline"
                },
                {
                    "name": "block-text",
                    "text": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. "
                },
                {
                    "name": "block-button"
                }]
            },

            {
                "name": "3-column-image-image-image",
                "textAlign": "justify",
                "contentLeft": [{
                    "name": "block-headline"
                },
                {
                    "name": "block-text",
                    "text": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. "
                },
                {
                    "name": "block-button"
                }]
            },
            {
                "name": "1-column",
                "padding": "0 22px ",
                "textAlign": "justify",
                "content": [
                    {
                        "name": "block-headline",
                        "text": "John, you missed the most important parts of Lesson 1...",
                        "textAlign": "left"
                    }, {
                        "name": "block-progress-bar",
                        "padding": "1px ",
                        "progress": "14"
                    }]
            },
            {
                "name": "2-column-image-content",
                "textAlign": "justify",
                "content": [

                    {
                        "name": "block-text",
                        "text": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. <br><br>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, <br><br>when an unknown printer took a galley of type and scrambled it to make a type specimen book. "
                    },
                    {
                        "name": "block-button",
                        "text": "Resume Lesson"
                    }
                ]
            },
            ]
        }
    ]
}
