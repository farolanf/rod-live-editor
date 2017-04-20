{
  name: 'block-include',
  output: `
    <div style="background: black; color: white; text-align: center;   
    padding: 50px; line-height: 1.4em">
      <small>%title%</small><br>
      content-id <%contentId%> instance-id <%instanceId%><br>
      <a href="?id=%contentId%&instanceId=%instanceId%" 
      target="_blank">
        Edit
      </a>
    </div>`,
  properties: {
    title: {
      type: 'text',
      default: 'External Content',
    },
    contentId: {
      type: 'property',
      default: '',
    },
    instanceId: {
      type: 'property',
      default: '',
    }
  }
}    
