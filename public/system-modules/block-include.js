{
  name: 'block-include',
  output: `
    <div style="background: black; color: white; text-align: center;   
    padding: 50px; line-height: 1.4em">
      <small>%title%</small><br>
      %info%
      %button%
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
    },
    info: {
      alias: 'contentId',
      replace: {
        condition: function(value, instance) {
          const contentId = value;
          const instanceId = instance.getPropertyValue('instanceId');
          return contentId && instanceId ? 'show' : 'hide';
        },
        show: function(value, instance) {
          const contentId = value;
          const instanceId = instance.getPropertyValue('instanceId');
          return `content-id <${contentId}> instance-id <${instanceId}><br>`;
        },
        hide: '',
      }
    },
    button: {
      alias: 'contentId',
      replace: {
        condition: function(value, instance) {
          const contentId = value;
          const instanceId = instance.getPropertyValue('instanceId');
          return contentId && instanceId ? 'show' : 'hide';          
        },
        show: function(value, instance) {
          const contentId = value;
          const instanceId = instance.getPropertyValue('instanceId');
          return `
            <a href="?id=${contentId}&instanceId=${instanceId}" target="_blank">
              Edit
            </a>`;
        },
        hide: function(value, instance) {
          const contentId = value;
          const instanceId = instance.getPropertyValue('instanceId');
          return `Missing ${!contentId ? 'contentId' : ''}${!contentId && !instanceId ? ' and instanceId.' : !instanceId ? 'instanceId.' : '.'}`;
        },
      },
    }
  }
}    
