'use strict';

var globalProperties = {
    "color1": "#eeeeee",
    "color2": "green",
    "backgroundColorBody": "white",
    "backgroundColorFooter": "blue",
    "backgroundColor": "#fff",
    "hiddenPreheader": "test",

};

var content = [{
    "name": "document-html-email",
    "backgroundColorHeader": "green",
    "backgroundColorBody": "white",
    "backgroundColorFooter": "blue",
    "backgroundColorMain": "%color1%",
    "hiddenPreheader": "test",
    "body": [{
            "name": "1-column",
            "textAlign": "left",
            "padding": "30px 40px 0",
            "content": [{
                "name": "block-text",
                "text": "Hi Rod, <br><br> How is it going? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make<br><br>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make"
            },
            {
                "name": "block-text",
                "text": " The Hidden Patterns of Music "
            },
            {
                "name": "block-text",
                "text": " is ready!"
            }]
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
                    "text": "<b>You missed learning:</b>"
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
            },{
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
}];